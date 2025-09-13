import Layout from '../../../components/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import { ClientService } from '../../../lib/crm-db';
import { Client, CLIENT_STATUSES } from '../../../lib/crm-types';
import Link from 'next/link';
import { ArrowLeft, Edit3, Mail, Phone, Building2, Calendar, User } from 'lucide-react';

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && id && typeof id === 'string') {
      loadClient(id);
    }
  }, [user, id]);

  const loadClient = async (clientId: string) => {
    try {
      const clientData = await ClientService.getClient(clientId);
      setClient(clientData);
    } catch (error) {
      console.error('Error loading client:', error);
      setError('Failed to load client details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = CLIENT_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'gray';
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="section section--black">
          <div className="section-container">
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="section section--black">
          <div className="section-container text-center">
            <h1>Access Denied</h1>
            <p className="text-large mb-6">Please log in to access client details.</p>
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout title="Client Not Found - CRM">
        <div className="section section--black">
          <div className="section-container text-center">
            <h1>Client Not Found</h1>
            <p className="text-large text-gray-400 mb-6">
              {error || 'The requested client could not be found.'}
            </p>
            <Link href="/crm/clients" className="btn btn-primary">
              Back to Clients
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${client.name} - Client Details`}>
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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1>{client.name}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${getStatusColor(client.status)}-600 text-white`}>
                  {CLIENT_STATUSES.find(s => s.value === client.status)?.label || client.status}
                </span>
              </div>
              <p className="text-large text-gray-400">Client Details</p>
            </div>
            <Link 
              href={`/crm/clients/${client.id}/edit`} 
              className="btn btn-primary"
            >
              <Edit3 size={20} />
              Edit Client
            </Link>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="text-blue-400" size={20} />
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <a 
                        href={`mailto:${client.email}`}
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="text-green-400" size={20} />
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <a 
                          href={`tel:${client.phone}`}
                          className="text-white hover:text-green-400 transition-colors"
                        >
                          {client.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {client.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="text-purple-400" size={20} />
                      <div>
                        <p className="text-gray-400 text-sm">Company</p>
                        <p className="text-white">{client.company}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="text-orange-400" size={20} />
                    <div>
                      <p className="text-gray-400 text-sm">Created</p>
                      <p className="text-white">{client.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {client.notes && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
                  <div className="bg-black p-4 rounded-lg">
                    <p className="text-gray-300 whitespace-pre-wrap">{client.notes}</p>
                  </div>
                </div>
              )}

              {/* Recent Activity Placeholder */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div className="text-center py-8">
                  <Calendar className="mx-auto mb-4 text-gray-600" size={48} />
                  <p className="text-gray-400">Activity tracking will be implemented soon</p>
                  <p className="text-gray-500 text-sm">Follow-ups, emails, and interactions will appear here</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Status */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Status</span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${getStatusColor(client.status)}-600 text-white`}>
                      {CLIENT_STATUSES.find(s => s.value === client.status)?.label || client.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Source</span>
                    <span className="text-white text-sm capitalize">
                      {client.acquisitionSource.replace('_', ' ')}
                    </span>
                  </div>
                  {client.assignedTo && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Assigned To</span>
                      <div className="flex items-center gap-2">
                        <User className="text-gray-400" size={16} />
                        <span className="text-white text-sm">Team Member</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a
                    href={`mailto:${client.email}`}
                    className="btn btn-secondary w-full justify-start"
                  >
                    <Mail size={16} />
                    Send Email
                  </a>
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="btn btn-secondary w-full justify-start"
                    >
                      <Phone size={16} />
                      Call Client
                    </a>
                  )}
                  <Link
                    href={`/crm/clients/${client.id}/edit`}
                    className="btn btn-primary w-full justify-start"
                  >
                    <Edit3 size={16} />
                    Edit Details
                  </Link>
                </div>
              </div>

              {/* Client Timeline Placeholder */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-black rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-white text-sm font-medium">Client Created</p>
                      <p className="text-gray-400 text-xs">{client.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">More timeline events will appear as you interact with this client</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}