import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { UserService } from './user-service';
import { UserRole } from './permissions';

export interface SetupUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
}

/**
 * Setup initial owner/admin user for the system
 */
export class UserSetupService {
  
  /**
   * Create the first owner user (typically during initial setup)
   */
  static async createInitialOwner(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      // Double-check if any owner users already exist to prevent race conditions
      const existingOwners = await UserService.getUsersByRole('owner');
      if (existingOwners.length > 0) {
        return {
          success: false,
          message: 'An owner user already exists in the system. Only one owner can be created.'
        };
      }

      // Check if email is already in use
      const allUsers = await UserService.getAllUsers();
      const existingUser = allUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        return {
          success: false,
          message: 'A user with this email already exists.'
        };
      }

      // Store current auth state
      const currentUser = auth.currentUser;

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;

      // Create user profile in Firestore with atomic write to prevent duplicates
      await UserService.createUser(user.uid, {
        email: userData.email,
        name: userData.name,
        role: 'owner',
        department: 'Executive',
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // Sign out the newly created user to prevent auth conflicts
      await auth.signOut();

      // Restore previous auth state if there was one
      if (currentUser && currentUser.email !== userData.email) {
        // Don't try to restore if it's the same user
        try {
          // The user will need to sign in again
        } catch (restoreError) {
          console.warn('Could not restore previous auth state:', restoreError);
        }
      }

      return {
        success: true,
        message: 'Owner account created successfully! You can now sign in with the new credentials.',
        userId: user.uid
      };

    } catch (error: any) {
      console.error('Error creating initial owner:', error);
      
      let message = 'Failed to create owner user.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email address is already in use.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/password sign-up is not enabled.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please try again later.';
      }

      return {
        success: false,
        message
      };
    }
  }

  /**
   * Create multiple users from a setup array (for initial seeding)
   */
  static async createMultipleUsers(users: SetupUserData[]): Promise<{
    success: boolean;
    message: string;
    results: Array<{ email: string; success: boolean; error?: string; userId?: string }>;
  }> {
    const results: Array<{ email: string; success: boolean; error?: string; userId?: string }> = [];
    
    for (const userData of users) {
      try {
        // Check if user already exists by email
        const existingUsers = await UserService.getAllUsers();
        const userExists = existingUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
        
        if (userExists) {
          results.push({
            email: userData.email,
            success: false,
            error: 'User already exists'
          });
          continue;
        }

        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        
        const user = userCredential.user;

        // Create user profile in Firestore
        await UserService.createUser(user.uid, {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          department: userData.department
        });

        results.push({
          email: userData.email,
          success: true,
          userId: user.uid
        });

      } catch (error: any) {
        console.error(`Error creating user ${userData.email}:`, error);
        
        let errorMessage = 'Failed to create user';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Email already in use';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password too weak';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email';
        }

        results.push({
          email: userData.email,
          success: false,
          error: errorMessage
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount > 0,
      message: `Created ${successCount} out of ${totalCount} users successfully.`,
      results
    };
  }

  /**
   * Check if the system needs initial setup
   */
  static async needsInitialSetup(): Promise<boolean> {
    try {
      const allUsers = await UserService.getAllUsers();
      const ownerUsers = allUsers.filter(u => u.role === 'owner');
      return ownerUsers.length === 0;
    } catch (error) {
      console.error('Error checking setup status:', error);
      return true; // Assume setup needed if we can't check
    }
  }

  /**
   * Get setup status and statistics
   */
  static async getSetupStatus(): Promise<{
    needsSetup: boolean;
    totalUsers: number;
    usersByRole: Record<UserRole, number>;
    hasOwner: boolean;
  }> {
    try {
      const allUsers = await UserService.getAllUsers();
      const usersByRole = {
        agent: allUsers.filter(u => u.role === 'agent').length,
        manager: allUsers.filter(u => u.role === 'manager').length,
        admin: allUsers.filter(u => u.role === 'admin').length,
        owner: allUsers.filter(u => u.role === 'owner').length,
      };

      return {
        needsSetup: usersByRole.owner === 0,
        totalUsers: allUsers.length,
        usersByRole,
        hasOwner: usersByRole.owner > 0
      };
    } catch (error) {
      console.error('Error getting setup status:', error);
      return {
        needsSetup: true,
        totalUsers: 0,
        usersByRole: { agent: 0, manager: 0, admin: 0, owner: 0 },
        hasOwner: false
      };
    }
  }

  /**
   * Convert existing authenticated user to owner (if they're the first user)
   */
  static async promoteToOwner(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Check if any owners exist
      const existingOwners = await UserService.getUsersByRole('owner');
      if (existingOwners.length > 0) {
        return {
          success: false,
          message: 'An owner already exists in the system.'
        };
      }

      // Check if user exists
      const userProfile = await UserService.getUserProfile(userId);
      if (!userProfile) {
        return {
          success: false,
          message: 'User profile not found.'
        };
      }

      // Update user to owner role
      await UserService.updateUser(userId, { 
        role: 'owner',
        department: 'Executive'
      });

      return {
        success: true,
        message: `User ${userProfile.name} has been promoted to owner.`
      };

    } catch (error) {
      console.error('Error promoting user to owner:', error);
      return {
        success: false,
        message: 'Failed to promote user to owner.'
      };
    }
  }

  /**
   * Seed the system with default demo users (for development/testing)
   */
  static async seedDemoUsers(): Promise<{
    success: boolean;
    message: string;
    results: any[];
  }> {
    const demoUsers: SetupUserData[] = [
      {
        email: 'agent@upface.dev',
        password: 'upface123',
        name: 'Demo Agent',
        role: 'agent',
        department: 'Sales'
      },
      {
        email: 'manager@upface.dev',
        password: 'upface123',
        name: 'Demo Manager',
        role: 'manager',
        department: 'Account Management'
      },
      {
        email: 'admin@upface.dev',
        password: 'upface123',
        name: 'Demo Admin',
        role: 'admin',
        department: 'Operations'
      }
    ];

    return await this.createMultipleUsers(demoUsers);
  }

  /**
   * Auto-promote first user to owner if system is empty
   */
  static async autoPromoteFirstUser(userId: string, userEmail: string, userName: string): Promise<{
    success: boolean;
    message: string;
    wasPromoted: boolean;
  }> {
    try {
      const setupStatus = await this.getSetupStatus();
      
      if (setupStatus.needsSetup && setupStatus.totalUsers === 0) {
        // This is the first user, create owner profile
        await UserService.createOwnerUser(userId, userEmail, userName);
        
        return {
          success: true,
          message: 'You have been automatically set as the system owner.',
          wasPromoted: true
        };
      } else {
        // System already has users, create as regular agent
        const userExists = await UserService.userExists(userId);
        if (!userExists) {
          await UserService.createUser(userId, {
            email: userEmail,
            name: userName,
            role: 'agent',
            department: 'Sales'
          });
        }
        
        return {
          success: true,
          message: 'User profile created successfully.',
          wasPromoted: false
        };
      }
    } catch (error) {
      console.error('Error in auto-promote first user:', error);
      return {
        success: false,
        message: 'Failed to create user profile.',
        wasPromoted: false
      };
    }
  }
}