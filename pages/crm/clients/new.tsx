import Layout from '../../../components/Layout';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ClientService } from '../../../lib/crm-db';
import { ACQUISITION_SOURCES, CLIENT_STATUSES } from '../../../lib/crm-types';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

export default function NewClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    acquisitionSource: 'website' as const,
    status: 'lead' as const,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const clientId = await ClientService.createClient({
        ...formData,
        assignedTo: user.uid
      });
      
      router.push(`/crm/clients/${clientId}`);
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <Layout><div className="section section--black"><div className="section-container"><p>Loading...</p></div></div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <div className="section section--black">
          <div className="section-container text-center">
            <h1>Access Denied</h1>
            <p className="text-large mb-6">Please log in to add clients.</p>
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Add New Client - CRM">
      <div className="section section--black min-h-screen">
        <div className="section-container">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/crm/clients" 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1>Add New Client</h1>
              <p className="text-large text-gray-400">Create a new client profile</p>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-lg p-8">
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
                
                <div className="form-grid form-grid--two mb-4">
                  <div className="form-group">
                    <label htmlFor="name" className="block text-gray-300 text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="form-input"
                      placeholder="Enter client's full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address *
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
                      placeholder="client@example.com"
                    />
                  </div>
                </div>

                <div className="form-grid form-grid--two mb-4">
                  <div className="form-group">
                    <label htmlFor="phone" className="block text-gray-300 text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="company" className="block text-gray-300 text-sm font-medium mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="form-input"
                      placeholder="Company name"
                    />
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-6">Client Details</h2>
                
                <div className="form-grid form-grid--two mb-4">
                  <div className="form-group">
                    <label htmlFor="acquisitionSource" className="block text-gray-300 text-sm font-medium mb-2">
                      How did they find us? *
                    </label>
                    <select
                      id="acquisitionSource"
                      name="acquisitionSource"
                      value={formData.acquisitionSource}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="form-select"
                    >
                      {ACQUISITION_SOURCES.map(source => (
                        <option key={source.value} value={source.value}>
                          {source.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="status" className="block text-gray-300 text-sm font-medium mb-2">
                      Initial Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="form-select"
                    >
                      {CLIENT_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-8">
                <label htmlFor="notes" className="block text-gray-300 text-sm font-medium mb-2">
                  Initial Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="form-textarea"
                  rows={4}
                  placeholder="Add any relevant notes about this client, their requirements, or initial conversation..."
                />
                <p className="text-gray-500 text-xs mt-2">
                  These notes will help you and your team remember important details about this client.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-700">
                <Link 
                  href="/crm/clients" 
                  className="btn btn-secondary"
                  tabIndex={isSubmitting ? -1 : 0}
                >
                  Cancel
                </Link>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.name || !formData.email}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Create Client
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Help Text */}
            <div className="mt-8 p-6 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <UserPlus size={20} />
                Quick Tips
              </h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Fill in as much information as possible for better client management</li>
                <li>• The acquisition source helps track your most effective marketing channels</li>
                <li>• Start with &quot;Lead&quot; status and update as you progress through the sales process</li>
                <li>• Add detailed notes to help your team understand the client&apos;s needs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}