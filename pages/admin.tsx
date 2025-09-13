import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { ClientService, InquiryService } from '../lib/crm-db';
import { Client, Inquiry } from '../lib/crm-types';
import EnhancedUserCard from '../components/crm/EnhancedUserCard';
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
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'agent' as 'agent' | 'manager' | 'admin'
  });
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'agent' as 'agent' | 'manager' | 'admin',
    status: 'active' as 'active' | 'inactive'
  });
  const [stats, setStats] = useState({
    totalClients: 0,
    totalInquiries: 0,
    activeProjects: 0,
    revenue: 0
  });
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any>(null);
  const [showClientAssignment, setShowClientAssignment] = useState(false);
  const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<any>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedUserForDeletion, setSelectedUserForDeletion] = useState<any>(null);
  
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

  // Removed unused helper functions - now handled in EnhancedUserCard

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
      setEditUser({
        name: user.name,
        email: user.email,
        role: user.role as 'agent' | 'manager' | 'admin',
        status: user.status as 'active' | 'inactive'
      });
      setEditingUserId(userId);
      setShowEditUser(true);
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating user:', editingUserId, editUser);
    
    if (!editUser.name || !editUser.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    // TODO: Implement actual user update with Firebase Admin SDK
    alert(`User update functionality will be implemented with Firebase Admin SDK.\n\nUpdated details:\nName: ${editUser.name}\nEmail: ${editUser.email}\nRole: ${editUser.role}\nStatus: ${editUser.status}`);
    
    setShowEditUser(false);
    setEditingUserId(null);
    setEditUser({ name: '', email: '', role: 'agent', status: 'active' });
  };

  const handleCancelEditUser = () => {
    console.log('Cancel edit user');
    setShowEditUser(false);
    setEditingUserId(null);
    setEditUser({ name: '', email: '', role: 'agent', status: 'active' });
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setShowDeleteConfirmation(true);
      setSelectedUserForDeletion(user);
      console.log('Delete user:', userId);
    }
  };

  const handleViewUserDetails = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setShowUserDetails(true);
      setSelectedUserForDetails(user);
      console.log('View user details:', userId);
    }
  };

  const handleAssignClient = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setShowClientAssignment(true);
      setSelectedUserForAssignment(user);
      console.log('Assign client to user:', userId);
    }
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
        
        {/* Edit User Form */}
        {showEditUser && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
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
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="form-input"
                    placeholder="user@upface.dev"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Role
                  </label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value as 'agent' | 'manager' | 'admin' })}
                    className="form-select"
                  >
                    <option value="agent">Agent - Can manage assigned clients</option>
                    <option value="manager">Manager - Can manage team and all clients</option>
                    <option value="admin">Admin - Full system access</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={editUser.status}
                    onChange={(e) => setEditUser({ ...editUser, status: e.target.value as 'active' | 'inactive' })}
                    className="form-select"
                  >
                    <option value="active">Active - User can access the system</option>
                    <option value="inactive">Inactive - User access suspended</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  Update User
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelEditUser}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Users List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {users.map((user) => (
            <EnhancedUserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onViewDetails={handleViewUserDetails}
              onAssignClient={handleAssignClient}
            />
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

  const handleConfirmDeleteUser = () => {
    if (selectedUserForDeletion) {
      // TODO: Implement actual user deletion with Firebase Admin SDK
      console.log('Confirming deletion of user:', selectedUserForDeletion.id);
      // For now, just close the modal and show success message
      alert(`User ${selectedUserForDeletion.name} would be deleted. (Firebase integration needed)`);
      setShowDeleteConfirmation(false);
      setSelectedUserForDeletion(null);
    }
  };

  const handleAssignClientToUser = (clientId: string) => {
    if (selectedUserForAssignment) {
      // TODO: Implement actual client assignment with Firebase
      console.log('Assigning client', clientId, 'to user', selectedUserForAssignment.id);
      alert(`Client would be assigned to ${selectedUserForAssignment.name}. (Firebase integration needed)`);
      setShowClientAssignment(false);
      setSelectedUserForAssignment(null);
    }
  };

  const renderUserDetailsModal = () => {
    if (!showUserDetails || !selectedUserForDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">User Details</h2>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUserForDetails(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xl">
                {selectedUserForDetails.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedUserForDetails.name}</h3>
                <p className="text-gray-400">{selectedUserForDetails.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedUserForDetails.role === 'admin' ? 'bg-red-100 text-red-700' :
                    selectedUserForDetails.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {selectedUserForDetails.role}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedUserForDetails.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedUserForDetails.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{selectedUserForDetails.tasksAssigned || 0}</p>
                <p className="text-gray-400 text-sm">Tasks Assigned</p>
              </div>
              <div className="bg-black p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-400">{selectedUserForDetails.tasksCompleted || 0}</p>
                <p className="text-gray-400 text-sm">Tasks Completed</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-white font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-black rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Completed 2 tasks this week</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-black rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Assigned to 3 active projects</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-black rounded-lg">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Last active: Today</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-700 flex justify-end">
            <button
              onClick={() => {
                setShowUserDetails(false);
                setSelectedUserForDetails(null);
              }}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderClientAssignmentModal = () => {
    if (!showClientAssignment || !selectedUserForAssignment) return null;

    const availableClients = clients.filter(client => !client.assignedTo || client.assignedTo === '');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Assign Client to {selectedUserForAssignment.name}
              </h2>
              <button
                onClick={() => {
                  setShowClientAssignment(false);
                  setSelectedUserForAssignment(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {availableClients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto mb-4 text-gray-600" size={48} />
                <p className="text-gray-400 mb-4">No unassigned clients available</p>
                <p className="text-gray-500 text-sm">All clients are currently assigned to team members</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-300 mb-4">
                  Select a client to assign to {selectedUserForAssignment.name}:
                </p>
                {availableClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div>
                      <h4 className="text-white font-medium">{client.name}</h4>
                      <p className="text-gray-400 text-sm">{client.email}</p>
                      {client.company && (
                        <p className="text-gray-500 text-sm">{client.company}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAssignClientToUser(client.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowClientAssignment(false);
                setSelectedUserForAssignment(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmationModal = () => {
    if (!showDeleteConfirmation || !selectedUserForDeletion) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-md w-full">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Delete User</h2>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete <strong>{selectedUserForDeletion.name}</strong>?
            </p>
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-red-400 text-sm">
                <strong>Warning:</strong> This will permanently remove the user and all associated data.
                Any clients assigned to this user will become unassigned.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteConfirmation(false);
                setSelectedUserForDeletion(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeleteUser}
              className="btn btn-primary bg-red-600 hover:bg-red-700 border-red-600"
            >
              <Trash2 size={16} />
              Delete User
            </button>
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
        
        {/* Modals */}
        {renderUserDetailsModal()}
        {renderClientAssignmentModal()}
        {renderDeleteConfirmationModal()}
      </div>
    </Layout>
  );
}
