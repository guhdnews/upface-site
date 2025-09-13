import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  MessageSquare,
  UserCheck,
  Grid3X3,
  List,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Lead, LeadStatus, LeadSource, LeadPriority, LeadListResponse } from '../../lib/types/lead-types';
import { LeadService } from '../../lib/services/lead-service';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPermissions, UserRole } from '../../lib/permissions';
import LeadCard from './LeadCard';
import LeadCaptureForm from './LeadCaptureForm';

interface LeadDashboardProps {
  embedded?: boolean;
  className?: string;
}

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  averageScore: number;
  conversionRate: number;
}

const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'text-blue-600' },
  { value: 'contacted', label: 'Contacted', color: 'text-yellow-600' },
  { value: 'qualified', label: 'Qualified', color: 'text-green-600' },
  { value: 'unqualified', label: 'Unqualified', color: 'text-gray-600' },
  { value: 'nurturing', label: 'Nurturing', color: 'text-orange-600' },
  { value: 'hot', label: 'Hot', color: 'text-red-600' },
  { value: 'converted', label: 'Converted', color: 'text-emerald-600' },
  { value: 'lost', label: 'Lost', color: 'text-red-600' },
  { value: 'invalid', label: 'Invalid', color: 'text-gray-600' }
];

const LEAD_SOURCES = [
  { value: 'website_form', label: 'Website Form' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'paid_ads', label: 'Paid Ads' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'other', label: 'Other' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export default function LeadDashboard({ embedded = false, className = '' }: LeadDashboardProps) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('agent');
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    averageScore: 0,
    conversionRate: 0
  });

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | ''>('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPermissions();
    }
  }, [user]);

  useEffect(() => {
    if (user && userRole) {
      loadLeads();
    }
  }, [user, userRole, searchQuery, statusFilter, sourceFilter, priorityFilter, assignedToFilter, currentPage]);

  const loadUserPermissions = async () => {
    if (!user) return;
    
    try {
      const permissions = await getUserPermissions(user.uid);
      setUserRole(permissions.role);
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  };

  const loadLeads = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const response: LeadListResponse = await LeadService.getLeads({
        userId: user.uid,
        userRole,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
        search: searchQuery || undefined,
        assignedTo: assignedToFilter || undefined,
        page: currentPage,
        limit: pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      setLeads(response.leads);
      setHasMore(response.hasMore);
      
      // Calculate stats
      calculateStats(response.leads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leadList: Lead[]) => {
    const total = leadList.length;
    const newCount = leadList.filter(l => l.status === 'new').length;
    const qualified = leadList.filter(l => l.status === 'qualified').length;
    const converted = leadList.filter(l => l.status === 'converted').length;
    const avgScore = total > 0 ? Math.round(leadList.reduce((sum, l) => sum + l.score.total, 0) / total) : 0;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    setStats({
      totalLeads: total,
      newLeads: newCount,
      qualifiedLeads: qualified,
      convertedLeads: converted,
      averageScore: avgScore,
      conversionRate
    });
  };

  const handleLeadCreated = (leadId: string) => {
    setShowCreateForm(false);
    loadLeads(); // Refresh the list
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    try {
      await LeadService.updateLead(leadId, { status }, user!.uid, userRole);
      loadLeads(); // Refresh the list
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      await LeadService.deleteLead(leadId, user!.uid, userRole);
      loadLeads(); // Refresh the list
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      const clientId = await LeadService.convertToClient(leadId, user!.uid, userRole);
      alert(`Lead successfully converted to client! Client ID: ${clientId}`);
      loadLeads(); // Refresh the list
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead to client');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setSourceFilter('');
    setPriorityFilter('');
    setAssignedToFilter('');
    setCurrentPage(1);
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in to view leads</p>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <LeadCaptureForm
          onSuccess={handleLeadCreated}
          onCancel={() => setShowCreateForm(false)}
          source="crm_manual"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white">Lead Management</h1>
          <p className="text-gray-400 mt-1">Track and manage your sales pipeline</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadLeads()}
            className="btn btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Leads</p>
              <p className="text-2xl font-light text-white">{stats.totalLeads}</p>
            </div>
            <Users className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">New Leads</p>
              <p className="text-2xl font-light text-white">{stats.newLeads}</p>
            </div>
            <Star className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Qualified</p>
              <p className="text-2xl font-light text-white">{stats.qualifiedLeads}</p>
            </div>
            <UserCheck className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Converted</p>
              <p className="text-2xl font-light text-white">{stats.convertedLeads}</p>
            </div>
            <TrendingUp className="text-emerald-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Score</p>
              <p className="text-2xl font-light text-white">{stats.averageScore}</p>
            </div>
            <DollarSign className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-900 p-4 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-light text-white">{stats.conversionRate}%</p>
            </div>
            <Clock className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {LEAD_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Sources</option>
                  {LEAD_SOURCES.map(source => (
                    <option key={source.value} value={source.value}>{source.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as LeadPriority)}
                  className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  {PRIORITY_LEVELS.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leads Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 border border-gray-700 rounded-lg">
          <Users className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No leads found</h3>
          <p className="text-gray-400 mb-4">
            {searchQuery || statusFilter || sourceFilter || priorityFilter
              ? 'Try adjusting your search criteria or filters'
              : 'Get started by creating your first lead'
            }
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create Lead
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={(lead) => {
                // Handle edit - would open edit form
                console.log('Edit lead:', lead);
              }}
              onDelete={handleDeleteLead}
              onStatusChange={handleStatusChange}
              onConvert={handleConvertLead}
              onViewDetails={(leadId) => {
                // Handle view details - would navigate to detail page
                console.log('View lead details:', leadId);
              }}
              compact={viewMode === 'grid'}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="btn btn-secondary"
            disabled={loading}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}