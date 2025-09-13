import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { ClientService, InquiryService } from '../lib/crm-db';
import { Client, Inquiry } from '../lib/crm-types';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  UserCheck, 
  Plus, 
  Edit3, 
  Trash2,
  DollarSign,
  Calendar,
  BarChart3,
  LogOut,
  Shield,
  UserCog
} from 'lucide-react';

// Mock data for users - will be enhanced later
const mockUsers = [
  { id: 1, name: 'Sarah Wilson', email: 'sarah@upface.dev', role: 'agent', status: 'active', tasksAssigned: 25, tasksCompleted: 18 },
  { id: 2, name: 'Mike Johnson', email: 'mike@upface.dev', role: 'manager', status: 'active', tasksAssigned: 15, tasksCompleted: 12 },
  { id: 3, name: 'Admin User', email: 'admin@upface.dev', role: 'admin', status: 'active', tasksAssigned: 0, tasksCompleted: 0 },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('crm');
  const [clients, setClients] = useState<Client[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [users] = useState(mockUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'agent' as 'agent' | 'manager' | 'admin'
  });
  const [stats, setStats] = useState({
    totalClients: 0,
    totalInquiries: 0,
    activeProjects: 0,
    revenue: 0
  });
  
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Load admin data and redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      loadAdminData();
    }
  }, [user, router]);

  const loadAdminData = async () => {
    try {
      const [clientsData, inquiriesData] = await Promise.all([
        ClientService.getAllClients(),
        InquiryService.getNewInquiries()
      ]);

      setClients(clientsData);
      setInquiries(inquiriesData);

      // Calculate stats
      const revenue = clientsData
        .filter(c => c.status === 'won')
        .length * 2500; // Average project value

      setStats({
        totalClients: clientsData.length,
        totalInquiries: inquiriesData.length,
        activeProjects: clientsData.filter(c => 
          ['contacted', 'qualified', 'proposal_sent', 'negotiating'].includes(c.status)
        ).length,
        revenue
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Show loading or redirect if not authenticated
  if (!user) {
    return (
      <Layout title="Loading...">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
        </div>
      </Layout>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const tabs = [
    { id: 'crm', name: 'CRM', icon: <Users size={20} /> },
    { id: 'content', name: 'Content', icon: <FileText size={20} /> },
    { id: 'users', name: 'Users', icon: <UserCog size={20} /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 size={20} /> },
  ];

  const renderCRM = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Client Management</h2>
        <div className="flex gap-3">
          <Link href="/crm" className="btn btn-secondary">
            <Users size={16} />
            CRM Dashboard
          </Link>
          <Link href="/crm/clients/new" className="btn btn-primary">
            <Plus size={16} />
            Add Client
          </Link>
        </div>
      </div>
      
      {clients.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Users className="mx-auto mb-6 text-gray-600" size={64} />
          <h3 className="text-xl font-semibold text-white mb-4">No clients yet</h3>
          <p className="text-gray-400 mb-6">Start building your client base by adding your first client or checking recent inquiries.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/crm/clients/new" className="btn btn-primary">
              <Plus size={20} />
              Add First Client
            </Link>
            <Link href="/crm/inquiries" className="btn btn-secondary">
              <Users size={20} />
              View Inquiries
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Name</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Email</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Company</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Source</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 10).map((client) => (
                  <tr key={client.id} className="border-t border-gray-800">
                    <td className="p-4 text-white">{client.name}</td>
                    <td className="p-4 text-gray-400">{client.email}</td>
                    <td className="p-4 text-gray-400">{client.company || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        client.status === 'won' ? 'bg-green-600/20 text-green-400' : 
                        client.status === 'qualified' ? 'bg-blue-600/20 text-blue-400' :
                        client.status === 'lost' ? 'bg-red-600/20 text-red-400' :
                        'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm capitalize">{client.acquisitionSource.replace('_', ' ')}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/crm/clients/${client.id}`} className="p-1 text-gray-400 hover:text-blue-400">
                          <Users size={16} />
                        </Link>
                        <Link href={`/crm/clients/${client.id}/edit`} className="p-1 text-gray-400 hover:text-primary-400">
                          <Edit3 size={16} />
                        </Link>
                        <button className="p-1 text-gray-400 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {clients.length > 10 && (
            <div className="p-4 bg-gray-800/30 text-center">
              <Link href="/crm/clients" className="text-blue-400 hover:text-blue-300">
                View all {clients.length} clients →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Content Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Site Pages</h3>
          <div className="space-y-2">
            {['Home', 'Services', 'Pricing', 'About', 'Contact'].map((page) => (
              <div key={page} className="flex justify-between items-center p-2 rounded border border-gray-700">
                <span className="text-gray-300">{page}</span>
                <button className="text-primary-400 hover:text-primary-300">
                  <Edit3 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Demos</h3>
          <div className="space-y-2">
            {['Restaurant Demo', 'Construction Demo', 'Cleaning Demo'].map((demo) => (
              <div key={demo} className="flex justify-between items-center p-2 rounded border border-gray-700">
                <span className="text-gray-300">{demo}</span>
                <button className="text-primary-400 hover:text-primary-300">
                  <Edit3 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-600/20 text-red-400';
      case 'manager': return 'bg-blue-600/20 text-blue-400';
      case 'agent': return 'bg-green-600/20 text-green-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={16} />;
      case 'manager': return <UserCog size={16} />;
      case 'agent': return <UserCheck size={16} />;
      default: return <Users size={16} />;
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding user:', newUser);
    
    if (!newUser.name || !newUser.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    // TODO: Implement actual user creation with Firebase Admin SDK
    alert(`User creation functionality will be implemented with Firebase Admin SDK.\n\nUser details:\nName: ${newUser.name}\nEmail: ${newUser.email}\nRole: ${newUser.role}`);
    
    setShowAddUser(false);
    setNewUser({ name: '', email: '', role: 'agent' });
  };

  const handleToggleAddUser = () => {
    console.log('Toggle add user, current state:', showAddUser);
    setShowAddUser(!showAddUser);
  };

  const handleCancelAddUser = () => {
    console.log('Cancel add user');
    setShowAddUser(false);
    setNewUser({ name: '', email: '', role: 'agent' });
  };

  const handleEditUser = (userId: number) => {
    console.log('Edit user:', userId);
    const user = users.find(u => u.id === userId);
    if (user) {
      alert(`Edit user functionality will be implemented.\n\nUser: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.status}`);
    }
    // TODO: Implement user editing modal/form
  };

  const renderUsers = () => {

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <button 
            onClick={handleToggleAddUser}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        {/* Add User Form */}
        {showAddUser && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="form-input"
                    placeholder="user@upface.dev"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'agent' | 'manager' | 'admin' })}
                  className="form-select"
                >
                  <option value="agent">Agent - Can manage assigned clients</option>
                  <option value="manager">Manager - Can manage team and all clients</option>
                  <option value="admin">Admin - Full system access</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelAddUser}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getRoleIcon(user.role)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleEditUser(user.id)}
                  className="text-gray-400 hover:text-primary-400"
                  title={`Edit ${user.name}`}
                >
                  <Edit3 size={16} />
                </button>
              </div>
              
              {user.role !== 'admin' && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tasks Assigned:</span>
                    <span className="text-white">{user.tasksAssigned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-green-400">{user.tasksCompleted}</span>
                  </div>
                  {user.tasksAssigned > 0 && (
                    <>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ width: `${(user.tasksCompleted / user.tasksAssigned) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        {Math.round((user.tasksCompleted / user.tasksAssigned) * 100)}% Complete
                      </p>
                    </>
                  )}
                </div>
              )}
              
              {user.role === 'admin' && (
                <div className="text-center py-4">
                  <Shield className="mx-auto mb-2 text-red-400" size={32} />
                  <p className="text-gray-400 text-sm">System Administrator</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Role Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="text-green-400" size={20} />
              <h4 className="text-white font-medium">Agent</h4>
            </div>
            <p className="text-gray-400 text-sm">Can manage assigned clients and tasks</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCog className="text-blue-400" size={20} />
              <h4 className="text-white font-medium">Manager</h4>
            </div>
            <p className="text-gray-400 text-sm">Can manage team members and all clients</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-red-400" size={20} />
              <h4 className="text-white font-medium">Admin</h4>
            </div>
            <p className="text-gray-400 text-sm">Full system access and configuration</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-green-400">${stats.revenue.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">This month</p>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Clients</h3>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.totalClients}</p>
          <p className="text-gray-400 text-sm">Total clients</p>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-purple-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Projects</h3>
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.activeProjects}</p>
          <p className="text-gray-400 text-sm">Active projects</p>
        </div>
        
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="text-orange-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Team</h3>
          </div>
          <p className="text-2xl font-bold text-orange-400">{users.filter(u => u.status === 'active').length}</p>
          <p className="text-gray-400 text-sm">Active users</p>
        </div>
      </div>
      
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {inquiries.length > 0 ? (
            inquiries.slice(0, 5).map((inquiry) => (
              <div key={inquiry.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-gray-300">New inquiry: {inquiry.name}</span>
                <span className="text-gray-500 text-sm ml-auto">{inquiry.submittedAt.toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent_Tab = () => {
    switch (activeTab) {
      case 'crm': return renderCRM();
      case 'content': return renderContent();
      case 'users': return renderUsers();
      case 'analytics': return renderAnalytics();
      default: return renderCRM();
    }
  };

  return (
    <Layout title="Admin Dashboard - Upface">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gray-900/50 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 mt-2">Manage your business operations</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{user.email}</p>
                  <p className="text-gray-400 text-xs">Administrator</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-900/30 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-400 text-primary-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent_Tab()}
        </div>
      </div>
    </Layout>
  );
}
