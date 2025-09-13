import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/admin');
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      
      const errorObj = error as { code?: string; message?: string };
      if (errorObj?.code === 'auth/configuration-not-found' || errorObj?.message?.includes('CONFIGURATION_NOT_FOUND')) {
        setError('Firebase Authentication is not set up yet. Please follow the setup instructions below.');
      } else if (errorObj?.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else if (errorObj?.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (errorObj?.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (errorObj?.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to sign in. Please check your credentials or complete Firebase setup.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Login - Upface">
      <section className="min-h-screen flex items-center justify-center py-24">
        <div className="max-w-md w-full mx-4">
          <div className="glass rounded-2xl p-8 border border-white/10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
              <p className="text-gray-400">Access your Upface dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Setup Instructions */}
            <div className="mb-6 p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-400 text-sm font-medium mb-2">🔧 Firebase Auth Setup Required:</p>
              <div className="text-yellow-300 text-xs space-y-1">
                <p>1. Go to <a href="https://console.firebase.google.com/project/upface-site/authentication" target="_blank" className="underline">Firebase Console → Authentication</a></p>
                <p>2. Click &quot;Get started&quot; to enable Authentication</p>
                <p>3. Go to &quot;Sign-in method&quot; → Enable &quot;Email/Password&quot;</p>
                <p>4. Go to &quot;Users&quot; → Add your admin user manually</p>
                <p className="text-gray-400 mt-2">Then you can log in with your created credentials</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <div className="mb-4">
                <Link href="/setup" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2">
                  First Time Setup
                </Link>
              </div>
              <p className="text-gray-400 text-sm">
                Need help?{' '}
                <a href="mailto:support@upface.dev" className="text-primary-400 hover:text-primary-300">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
