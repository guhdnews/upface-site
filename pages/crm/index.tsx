import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { InquiryService, ClientService, FollowUpService } from '../../lib/crm-db';
import { Inquiry, Client, FollowUp } from '../../lib/crm-types';
import Link from 'next/link';
import { Users, UserPlus, Calendar, AlertCircle, TrendingUp, Mail } from 'lucide-react';

export default function CRMDashboard() {
  const { user, loading } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    newInquiries: 0,
    pendingFollowUps: 0,
    thisWeekConversions: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [inquiriesData, clientsData, followUpsData] = await Promise.all([
        InquiryService.getNewInquiries(),
        ClientService.getAllClients(),
        user ? FollowUpService.getFollowUpsByUser(user.uid) : Promise.resolve([])
      ]);

      setInquiries(inquiriesData);
      setClients(clientsData);
      setFollowUps(followUpsData);

      // Calculate stats
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      
      const thisWeekConversions = clientsData.filter(client => 
        client.createdAt > thisWeek
      ).length;

      setStats({
        totalClients: clientsData.length,
        newInquiries: inquiriesData.length,
        pendingFollowUps: followUpsData.length,
        thisWeekConversions
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
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
            <p className="text-large mb-6">Please log in to access the CRM dashboard.</p>
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="CRM Dashboard - Upface">
      <div className="section section--black min-h-screen">
        <div className="section-container">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1>CRM Dashboard</h1>
              <p className="text-large text-gray-400">Welcome back, {user.displayName || user.email}</p>
            </div>
            <div className="flex gap-4">
              <Link href="/crm/clients/new" className="btn btn-primary">
                <UserPlus size={20} className="mr-2" />
                Add Client
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 p-6 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Clients</p>
                  <p className="text-3xl font-light text-white">{stats.totalClients}</p>
                </div>
                <Users className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-gray-900 p-6 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">New Inquiries</p>
                  <p className="text-3xl font-light text-white">{stats.newInquiries}</p>
                </div>
                <Mail className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-gray-900 p-6 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Follow-ups</p>
                  <p className="text-3xl font-light text-white">{stats.pendingFollowUps}</p>
                </div>
                <Calendar className="text-yellow-500" size={32} />
              </div>
            </div>

            <div className="bg-gray-900 p-6 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">This Week Conversions</p>
                  <p className="text-3xl font-light text-white">{stats.thisWeekConversions}</p>
                </div>
                <TrendingUp className="text-purple-500" size={32} />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Inquiries */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2>Recent Inquiries</h2>
                  <Link href="/crm/inquiries" className="text-blue-400 hover:text-blue-300">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {inquiries.length === 0 ? (
                  <p className="text-gray-400">No new inquiries</p>
                ) : (
                  <div className="space-y-4">
                    {inquiries.slice(0, 5).map((inquiry) => (
                      <div key={inquiry.id} className="flex items-start justify-between p-4 bg-black border border-gray-800 rounded-lg">
                        <div>
                          <h3 className="text-white mb-1">{inquiry.name}</h3>
                          <p className="text-gray-400 text-sm">{inquiry.email}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {inquiry.submittedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <Link 
                          href={`/crm/inquiries/${inquiry.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Follow-ups */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2>Upcoming Follow-ups</h2>
                  <Link href="/crm/follow-ups" className="text-blue-400 hover:text-blue-300">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {followUps.length === 0 ? (
                  <p className="text-gray-400">No pending follow-ups</p>
                ) : (
                  <div className="space-y-4">
                    {followUps.slice(0, 5).map((followUp) => (
                      <div key={followUp.id} className="flex items-start justify-between p-4 bg-black border border-gray-800 rounded-lg">
                        <div>
                          <h3 className="text-white mb-1">{followUp.title}</h3>
                          <p className="text-gray-400 text-sm">{followUp.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar size={14} className="text-gray-500" />
                            <p className="text-gray-500 text-xs">
                              {followUp.dueDate.toLocaleDateString()}
                            </p>
                            {followUp.priority === 'high' && (
                              <AlertCircle size={14} className="text-red-500" />
                            )}
                          </div>
                        </div>
                        <Link 
                          href={`/crm/clients/${followUp.clientId}`}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Client
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Clients */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg lg:col-span-2">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2>Recent Clients</h2>
                  <Link href="/crm/clients" className="text-blue-400 hover:text-blue-300">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {clients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto mb-4 text-gray-600" size={48} />
                    <p className="text-gray-400 mb-4">No clients yet</p>
                    <Link href="/crm/clients/new" className="btn btn-primary">
                      Add Your First Client
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.slice(0, 6).map((client) => (
                      <Link 
                        key={client.id} 
                        href={`/crm/clients/${client.id}`}
                        className="block p-4 bg-black border border-gray-800 rounded-lg hover:border-gray-600 transition-colors"
                      >
                        <h3 className="text-white mb-1">{client.name}</h3>
                        <p className="text-gray-400 text-sm">{client.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full bg-${
                            client.status === 'won' ? 'green' : 
                            client.status === 'lost' ? 'red' : 
                            client.status === 'qualified' ? 'blue' : 'yellow'
                          }-600`}>
                            {client.status}
                          </span>
                          {client.company && (
                            <span className="text-gray-500 text-xs">{client.company}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/crm/clients" className="p-6 bg-gray-900 border border-gray-700 rounded-lg text-center hover:bg-gray-800 transition-colors">
              <Users className="mx-auto mb-2 text-blue-400" size={32} />
              <p className="text-white">Manage Clients</p>
            </Link>
            <Link href="/crm/inquiries" className="p-6 bg-gray-900 border border-gray-700 rounded-lg text-center hover:bg-gray-800 transition-colors">
              <Mail className="mx-auto mb-2 text-green-400" size={32} />
              <p className="text-white">View Inquiries</p>
            </Link>
            <Link href="/crm/follow-ups" className="p-6 bg-gray-900 border border-gray-700 rounded-lg text-center hover:bg-gray-800 transition-colors">
              <Calendar className="mx-auto mb-2 text-yellow-400" size={32} />
              <p className="text-white">Follow-ups</p>
            </Link>
            <Link href="/admin" className="p-6 bg-gray-900 border border-gray-700 rounded-lg text-center hover:bg-gray-800 transition-colors">
              <AlertCircle className="mx-auto mb-2 text-purple-400" size={32} />
              <p className="text-white">Admin Panel</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}