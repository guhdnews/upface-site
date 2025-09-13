import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserService, UserProfile } from '../lib/user-service';
import { UserRole, hasPermission } from '../lib/permissions';
import { UserSetupService } from '../lib/setup-users';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          let profile = await UserService.getUserProfile(user.uid);
          
          // If profile doesn't exist, create one (and potentially promote to owner)
          if (!profile) {
            const setupResult = await UserSetupService.autoPromoteFirstUser(
              user.uid,
              user.email || '',
              user.displayName || 'New User'
            );
            
            if (setupResult.success) {
              // Fetch the newly created profile
              profile = await UserService.getUserProfile(user.uid);
              
              // Show notification if user was promoted to owner
              if (setupResult.wasPromoted) {
                console.log('🎉 You have been set as the system owner!');
                // You could show a toast notification here
              }
            } else {
              console.error('Failed to create user profile:', setupResult.message);
            }
          }
          
          setUserProfile(profile);
          
          // Update last login time
          if (profile) {
            await UserService.updateLastLogin(user.uid);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  const checkPermission = (permission: string): boolean => {
    if (!userProfile || userProfile.status !== 'active') return false;
    return hasPermission(userProfile.role, permission);
  };

  const checkRole = (role: UserRole): boolean => {
    if (!userProfile || userProfile.status !== 'active') return false;
    return userProfile.role === role;
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const profile = await UserService.getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission: checkPermission,
    isRole: checkRole,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
