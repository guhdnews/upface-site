import Layout from '../../../components/Layout';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ClientService } from '../../../lib/crm-db';
import { Client, CLIENT_STATUSES } from '../../../lib/crm-types';
import Link from 'next/link';
import { Users, UserPlus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

export default function ClientsPage() {
  const { user, loading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  useEffect(() => {
    filterClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, searchTerm, statusFilter]);

  const loadClients = async () => {
    try {
      const clientsData = await ClientService.getAllClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await ClientService.deleteClient(clientId);
        setClients(clients.filter(client => client.id !== clientId));
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = CLIENT_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'gray';
  };

  if (loading || isLoading) {
    return <Layout><div className="section section--black"><div className="section-container"><p>Loading...</p></div></div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <div className="section section--black">
          <div className="section-container text-center">
            <h1>Access Denied</h1>
            <p className="text-large mb-6">Please log in to access client management.</p>
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Clients - CRM">
      <div className="section section--black min-h-screen">
        <div className="section-container">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1>Manage Clients</h1>
              <p className="text-large text-gray-400">{clients.length} total clients</p>
            </div>
            <div className="flex gap-4">
              <Link href="/crm" className="btn btn-secondary">
                Back to Dashboard
              </Link>
              <Link href="/crm/clients/new" className="btn btn-primary">
                <UserPlus size={20} className="mr-2" />
                Add Client
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-900 p-6 border border-gray-700 rounded-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select pl-10"
                >
                  <option value="">All statuses</option>
                  {CLIENT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {setSearchTerm(''); setStatusFilter('');}}
                  className="btn btn-secondary flex-1"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Clients List */}
          {filteredClients.length === 0 ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
              {clients.length === 0 ? (
                <>
                  <Users className="mx-auto mb-6 text-gray-600" size={64} />
                  <h2 className="mb-4">No clients yet</h2>
                  <p className="text-gray-400 mb-6">Start building your client base by adding your first client.</p>
                  <Link href="/crm/clients/new" className="btn btn-primary">
                    <UserPlus size={20} className="mr-2" />
                    Add Your First Client
                  </Link>
                </>
              ) : (
                <>
                  <Search className="mx-auto mb-6 text-gray-600" size={64} />
                  <h2 className="mb-4">No clients found</h2>
                  <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria.</p>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black border-b border-gray-700">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">Client</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Company</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Source</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Created</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client, index) => (
                      <tr 
                        key={client.id} 
                        className={`border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                          index % 2 === 0 ? 'bg-gray-900' : 'bg-black'
                        }`}
                      >
                        <td className="p-4">
                          <div>
                            <h3 className="text-white font-medium">{client.name}</h3>
                            <p className="text-gray-400 text-sm">{client.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300">
                            {client.company || '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full bg-${getStatusColor(client.status)}-600 text-white`}>
                            {CLIENT_STATUSES.find(s => s.value === client.status)?.label || client.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300 text-sm capitalize">
                            {client.acquisitionSource.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-400 text-sm">
                            {client.createdAt.toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/crm/clients/${client.id}`}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                              title="View client"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/crm/clients/${client.id}/edit`}
                              className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition-colors"
                              title="Edit client"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Delete client"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {clients.length > 0 && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {CLIENT_STATUSES.map(status => {
                const count = clients.filter(client => client.status === status.value).length;
                if (count === 0) return null;
                return (
                  <div key={status.value} className="bg-gray-900 p-4 border border-gray-700 rounded-lg text-center">
                    <p className="text-2xl font-light text-white">{count}</p>
                    <p className={`text-sm text-${status.color}-400`}>{status.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}