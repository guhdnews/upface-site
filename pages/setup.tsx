import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { UserSetupService } from '../lib/setup-users';
import { UserService } from '../lib/user-service';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { 
  Crown, 
  Users, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  User,
  Settings,
  ArrowRight,
  Loader
} from 'lucide-react';

interface SetupStatus {
  needsSetup: boolean;
  totalUsers: number;
  usersByRole: Record<string, number>;
  hasOwner: boolean;
}

export default function Setup() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [ownerData, setOwnerData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [createResult, setCreateResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadSetupStatus();
  }, []);

  // Prevent setup if user is already authenticated and system doesn't need setup
  useEffect(() => {
    if (user && setupStatus && !setupStatus.needsSetup && (!userProfile || !['owner', 'admin'].includes(userProfile.role))) {
      router.push('/intranet');
    }
  }, [user, setupStatus, userProfile, router]);

  const loadSetupStatus = async () => {
    try {
      const status = await UserSetupService.getSetupStatus();
      setSetupStatus(status);
    } catch (error) {
      console.error('Error loading setup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Re-check setup status to prevent race conditions
    const currentStatus = await UserSetupService.getSetupStatus();
    if (!currentStatus.needsSetup) {
      setCreateResult({
        success: false,
        message: 'System setup has already been completed by another user.'
      });
      await loadSetupStatus();
      return;
    }
    
    if (ownerData.password !== ownerData.confirmPassword) {
      setCreateResult({
        success: false,
        message: 'Passwords do not match'
      });
      return;
    }

    if (ownerData.password.length < 6) {
      setCreateResult({
        success: false,
        message: 'Password must be at least 6 characters'
      });
      return;
    }

    setCreating(true);
    setCreateResult(null);

    try {
      const result = await UserSetupService.createInitialOwner({
        email: ownerData.email,
        password: ownerData.password,
        name: ownerData.name
      });

      setCreateResult(result);

      if (result.success) {
        // Refresh setup status
        await loadSetupStatus();
        
        // Clear form
        setOwnerData({
          email: '',
          password: '',
          confirmPassword: '',
          name: ''
        });
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating owner:', error);
      setCreateResult({
        success: false,
        message: 'An unexpected error occurred'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSeedDemoUsers = async () => {
    setCreating(true);
    try {
      const result = await UserSetupService.seedDemoUsers();
      setCreateResult({
        success: result.success,
        message: result.message
      });
      await loadSetupStatus();
    } catch (error) {
      console.error('Error seeding demo users:', error);
      setCreateResult({
        success: false,
        message: 'Failed to create demo users'
      });
    } finally {
      setCreating(false);
    }
  };

  const handlePromoteToOwner = async () => {
    if (!user) return;
    
    // Re-check setup status
    const currentStatus = await UserSetupService.getSetupStatus();
    if (!currentStatus.needsSetup) {
      setCreateResult({
        success: false,
        message: 'System setup has already been completed.'
      });
      await loadSetupStatus();
      return;
    }
    
    setCreating(true);
    try {
      const result = await UserSetupService.promoteToOwner(user.uid);
      setCreateResult(result);
      
      if (result.success) {
        await loadSetupStatus();
        // Refresh user profile
        setTimeout(() => {
          window.location.href = '/intranet';
        }, 2000);
      }
    } catch (error) {
      console.error('Error promoting to owner:', error);
      setCreateResult({
        success: false,
        message: 'Failed to promote user to owner'
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Layout title="System Setup - Upface">
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading setup status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If system doesn't need setup and user is not an owner/admin, redirect
  if (setupStatus && !setupStatus.needsSetup && userProfile && !['owner', 'admin'].includes(userProfile.role)) {
    router.push('/');
    return null;
  }

  return (
    <Layout title="System Setup - Upface">
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {setupStatus?.needsSetup ? 'System Setup' : 'System Administration'}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {setupStatus?.needsSetup 
                ? 'Welcome to Upface! Let\'s set up your system by creating the first owner account.'
                : 'Your system is configured. Manage users and permissions below.'}
            </p>
          </div>

          {/* Setup Status */}
          {setupStatus && (
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{setupStatus.totalUsers}</div>
                    <div className="text-gray-400 text-sm">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{setupStatus.usersByRole.agent || 0}</div>
                    <div className="text-gray-400 text-sm">Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{setupStatus.usersByRole.admin || 0}</div>
                    <div className="text-gray-400 text-sm">Admins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{setupStatus.usersByRole.owner || 0}</div>
                    <div className="text-gray-400 text-sm">Owners</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 rounded-lg bg-gray-800">
                  <div className="flex items-center space-x-2">
                    {setupStatus.hasOwner ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">System Configured</span>
                        <span className="text-gray-400">- Owner account exists</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">Setup Required</span>
                        <span className="text-gray-400">- No owner account found</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Setup Options */}
          <div className="max-w-4xl mx-auto">
            {setupStatus?.needsSetup ? (
              /* Initial Setup */
              <div className="space-y-8">
                {/* Create Owner Account */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-semibold text-white">Create Owner Account</h3>
                  </div>
                  
                  <form onSubmit={handleCreateOwner} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={ownerData.name}
                          onChange={(e) => setOwnerData({...ownerData, name: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={ownerData.email}
                          onChange={(e) => setOwnerData({...ownerData, email: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                          placeholder="owner@upface.dev"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={ownerData.password}
                          onChange={(e) => setOwnerData({...ownerData, password: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                          placeholder="Enter password (min 6 characters)"
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={ownerData.confirmPassword}
                          onChange={(e) => setOwnerData({...ownerData, confirmPassword: e.target.value})}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      {creating ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Creating Owner...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-5 h-5" />
                          <span>Create Owner Account</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Alternative: Promote Current User */}
                {user && userProfile && (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <User className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">Promote Current User</h3>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Currently logged in as <strong>{userProfile.name}</strong> ({userProfile.email}). 
                      You can promote yourself to owner if you&apos;re setting up the system.
                    </p>
                    <button
                      onClick={handlePromoteToOwner}
                      disabled={creating}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Promote to Owner
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* System Configured */
              <div className="space-y-8">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-white mb-2">System Ready!</h2>
                  <p className="text-gray-400 mb-6">
                    Your system is configured and ready to use.
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => router.push('/admin')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Go to Admin Panel</span>
                    </button>
                    
                    {setupStatus.usersByRole.agent === 0 && (
                      <button
                        onClick={handleSeedDemoUsers}
                        disabled={creating}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <Users className="w-5 h-5" />
                        <span>Create Demo Users</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Result Message */}
          {createResult && (
            <div className="max-w-2xl mx-auto mt-8">
              <div className={`p-4 rounded-lg border ${
                createResult.success 
                  ? 'bg-green-900/20 border-green-500 text-green-400' 
                  : 'bg-red-900/20 border-red-500 text-red-400'
              }`}>
                <div className="flex items-center space-x-2">
                  {createResult.success ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium">{createResult.message}</span>
                </div>
                {createResult.success && setupStatus?.needsSetup && (
                  <div className="mt-2 text-sm text-green-300">
                    Redirecting to login page...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}