import Layout from '../components/Layout';
import { useState } from 'react';
import Link from 'next/link';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { Settings, User, Check, AlertTriangle } from 'lucide-react';

export default function Setup() {
  const [formData, setFormData] = useState({
    email: 'admin@upface.dev',
    password: 'upface2025',
    fullName: 'Upface Admin'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; uid?: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      const createAdminUser = httpsCallable(functions, 'createAdminUser');
      const response = await createAdminUser(formData);
      
      const data = response.data as { success: boolean; message: string; uid?: string };
      setResult(data);
    } catch (error: unknown) {
      const errorObj = error as { code?: string; message?: string };
      console.error('Error creating admin user:', error);
      
      if (errorObj?.code === 'functions/unauthenticated') {
        setError('Authentication not configured. Please enable Firebase Auth first.');
      } else if (errorObj?.code === 'functions/already-exists') {
        setError('A user with this email already exists.');
      } else if (errorObj?.message?.includes('EMAIL_EXISTS')) {
        setError('A user with this email already exists.');
      } else {
        setError(errorObj?.message || 'Failed to create admin user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout title="Firebase Setup - Upface">
      <div className="section section--black min-h-screen">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Settings className="text-white" size={32} />
              </div>
              <h1>Firebase Authentication Setup</h1>
              <p className="text-large text-gray-400">Create your first admin user for the CRM system</p>
            </div>

            {/* Prerequisites */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-yellow-400" size={20} />
                Prerequisites
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1">1.</span>
                  <div>
                    <p className="text-gray-300">Enable Firebase Authentication:</p>
                    <p className="text-gray-400">Go to <a href="https://console.firebase.google.com/project/upface-site/authentication" target="_blank" className="text-blue-400 underline">Firebase Console → Authentication</a></p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1">2.</span>
                  <div>
                    <p className="text-gray-300">Click &quot;Get started&quot; to enable Authentication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1">3.</span>
                  <div>
                    <p className="text-gray-300">Enable Email/Password sign-in method:</p>
                    <p className="text-gray-400">Authentication → Sign-in method → Email/Password → Enable</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1">4.</span>
                  <div>
                    <p className="text-gray-300">Then use this form to create your admin user</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div className={`mb-6 p-6 rounded-lg border ${
                result.success 
                  ? 'bg-green-600/20 border-green-600/30' 
                  : 'bg-red-600/20 border-red-600/30'
              }`}>
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <Check className="text-green-400" size={24} />
                  ) : (
                    <AlertTriangle className="text-red-400" size={24} />
                  )}
                  <div>
                    <p className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? 'Success!' : 'Error'}
                    </p>
                    <p className={`text-sm ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                      {result.message}
                    </p>
                    {result.uid && (
                      <p className="text-xs text-gray-400 mt-2">User ID: {result.uid}</p>
                    )}
                  </div>
                </div>
                
                {result.success && (
                  <div className="mt-4 p-4 bg-black rounded-lg">
                    <p className="text-green-400 font-semibold mb-2">Next Steps:</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>✅ Your admin user has been created successfully</p>
                      <p>✅ You can now log in at <Link href="/login" className="text-blue-400 underline">/login</Link></p>
                      <p>✅ Use the email and password you specified above</p>
                      <p>✅ You&apos;ll have full admin access to the CRM and admin panel</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Form */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
              <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                <User className="text-blue-400" size={20} />
                Create Admin User
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="form-input"
                    placeholder="admin@yourdomain.com"
                  />
                  <p className="text-gray-500 text-xs mt-1">This will be your login email</p>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="form-input"
                    placeholder="Choose a secure password"
                    minLength={6}
                  />
                  <p className="text-gray-500 text-xs mt-1">Minimum 6 characters</p>
                </div>

                <div className="form-group">
                  <label htmlFor="fullName" className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="form-input"
                    placeholder="Your full name"
                  />
                  <p className="text-gray-500 text-xs mt-1">This will be displayed in the admin panel</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !!result?.success}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Admin User...
                    </>
                  ) : result?.success ? (
                    'Admin User Created Successfully!'
                  ) : (
                    'Create Admin User'
                  )}
                </button>
              </form>

              {!result?.success && (
                <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                  <p className="text-blue-400 text-sm font-medium mb-2">🔒 Security Note:</p>
                  <p className="text-blue-300 text-xs">
                    This setup page creates an admin user with full permissions. 
                    After creating your admin user, you can manage additional users through the admin panel.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-8 btn-group">
              <Link href="/" className="btn btn-secondary">
                Back to Home
              </Link>
              {result?.success && (
                <Link href="/login" className="btn btn-primary">
                  Go to Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}