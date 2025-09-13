import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { UserRole, hasPermission, ROLE_PERMISSIONS } from './permissions';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  avatar?: string;
  department?: string;
  phoneNumber?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  phoneNumber?: string;
}

export interface UpdateUserData {
  name?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
  department?: string;
  phoneNumber?: string;
  avatar?: string;
}

const USERS_COLLECTION = 'users';

export class UserService {
  /**
   * Create a new user profile
   */
  static async createUser(uid: string, userData: CreateUserData): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    const userProfile: Omit<UserProfile, 'id'> = {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      department: userData.department,
      phoneNumber: userData.phoneNumber,
    };

    await setDoc(userRef, {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Get user profile by UID
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();
      return {
        id: userSnap.id,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status || 'active',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate(),
        avatar: data.avatar,
        department: data.department,
        phoneNumber: data.phoneNumber,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(uid: string, updates: UpdateUserData): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update user's last login time
   */
  static async updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Get all users (admin/owner only)
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const usersQuery = query(
        collection(db, USERS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          avatar: data.avatar,
          department: data.department,
          phoneNumber: data.phoneNumber,
        };
      });
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    try {
      const usersQuery = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', role),
        where('status', '==', 'active'),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          avatar: data.avatar,
          department: data.department,
          phoneNumber: data.phoneNumber,
        };
      });
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  }

  /**
   * Delete user (soft delete by setting status to inactive)
   */
  static async deactivateUser(uid: string): Promise<void> {
    await this.updateUser(uid, { status: 'inactive' });
  }

  /**
   * Hard delete user profile
   */
  static async deleteUser(uid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
  }

  /**
   * Check if user exists
   */
  static async userExists(uid: string): Promise<boolean> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(uid: string): Promise<string[]> {
    const userProfile = await this.getUserProfile(uid);
    if (!userProfile || userProfile.status !== 'active') {
      return [];
    }

    return ROLE_PERMISSIONS[userProfile.role]?.permissions || [];
  }

  /**
   * Check if user has specific permission
   */
  static async userHasPermission(uid: string, permission: string): Promise<boolean> {
    const userProfile = await this.getUserProfile(uid);
    if (!userProfile || userProfile.status !== 'active') {
      return false;
    }

    return hasPermission(userProfile.role, permission);
  }

  /**
   * Create default owner user (for initial setup)
   */
  static async createOwnerUser(uid: string, email: string, name: string): Promise<void> {
    // Check if user already exists
    const existingUser = await this.getUserProfile(uid);
    if (existingUser) {
      // Update existing user to owner role if they're not already
      if (existingUser.role !== 'owner') {
        await this.updateUser(uid, { role: 'owner' });
      }
      return;
    }

    // Create new owner user
    await this.createUser(uid, {
      email,
      name,
      role: 'owner',
      department: 'Executive',
    });
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<UserRole, number>;
  }> {
    try {
      const users = await this.getAllUsers();
      
      const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        byRole: {
          agent: users.filter(u => u.role === 'agent').length,
          manager: users.filter(u => u.role === 'manager').length,
          admin: users.filter(u => u.role === 'admin').length,
          owner: users.filter(u => u.role === 'owner').length,
        }
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: { agent: 0, manager: 0, admin: 0, owner: 0 }
      };
    }
  }
}