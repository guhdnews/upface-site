import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Star,
  Calendar,
  Tag,
  Edit,
  Trash2,
  MessageSquare,
  UserCheck,
  TrendingUp,
  Clock,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { Lead, LeadStatus, LeadPriority } from '../../lib/types/lead-types';
import { formatDistanceToNow } from 'date-fns';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onStatusChange?: (leadId: string, status: LeadStatus) => void;
  onConvert?: (leadId: string) => void;
  onViewDetails?: (leadId: string) => void;
  compact?: boolean;
  showActions?: boolean;
}

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Star },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
  qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800', icon: UserCheck },
  unqualified: { label: 'Unqualified', color: 'bg-gray-100 text-gray-800', icon: Clock },
  nurturing: { label: 'Nurturing', color: 'bg-orange-100 text-orange-800', icon: TrendingUp },
  hot: { label: 'Hot', color: 'bg-red-100 text-red-800', icon: TrendingUp },
  proposal: { label: 'Proposal', color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-800', icon: UserCheck },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-800', icon: Clock },
  invalid: { label: 'Invalid', color: 'bg-gray-100 text-gray-800', icon: Clock }
} as const;

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' }
} as const;

export default function LeadCard({
  lead,
  onEdit,
  onDelete,
  onStatusChange,
  onConvert,
  onViewDetails,
  compact = false,
  showActions = true
}: LeadCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const statusConfig = STATUS_CONFIG[lead.status];
  const priorityConfig = PRIORITY_CONFIG[lead.priority];
  const StatusIcon = statusConfig.icon;

  const formatBudget = (budget: string) => {
    const budgetMap: Record<string, string> = {
      'under_5k': '<$5K',
      '5k_15k': '$5K-$15K',
      '15k_50k': '$15K-$50K',
      '50k_100k': '$50K-$100K',
      'over_100k': '$100K+'
    };
    return budgetMap[budget] || budget;
  };

  const formatTimeline = (timeline: string) => {
    const timelineMap: Record<string, string> = {
      'immediate': 'Immediate',
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      '6_12_months': '6-12 months',
      'over_12_months': '12+ months',
      'not_sure': 'Not sure'
    };
    return timelineMap[timeline] || timeline;
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (onStatusChange) {
      onStatusChange(lead.id, newStatus);
    }
    setShowDropdown(false);
  };

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 
                className="text-sm font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                onClick={() => onViewDetails?.(lead.id)}
              >
                {lead.firstName} {lead.lastName}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
              {lead.email}
            </p>
            
            {lead.company && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {lead.company}
              </p>
            )}
            
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {lead.score.total}
                </span>
              </div>
              
              {lead.budget && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatBudget(lead.budget)}
                  </span>
                </div>
              )}
              
              <span className={`px-2 py-0.5 text-xs rounded ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                {priorityConfig.label}
              </span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              {lead.status !== 'converted' && lead.status !== 'lost' && (
                <button
                  onClick={() => onConvert?.(lead.id)}
                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                  title="Convert to Client"
                >
                  <UserCheck className="w-3 h-3" />
                </button>
              )}
              
              <button
                onClick={() => onEdit?.(lead)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                title="Edit Lead"
              >
                <Edit className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 
              className="text-lg font-medium text-white cursor-pointer hover:text-blue-400"
              onClick={() => onViewDetails?.(lead.id)}
            >
              {lead.firstName} {lead.lastName}
            </h3>
            <span className={`px-2 py-1 text-sm rounded-full ${statusConfig.color}`}>
              <StatusIcon className="inline w-3 h-3 mr-1" />
              {statusConfig.label}
            </span>
            <span className={`px-2 py-1 text-sm rounded ${priorityConfig.bgColor} ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(lead.createdAt, { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Score: {lead.score.total}</span>
            </div>
            
            {lead.assignedToName && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Assigned to {lead.assignedToName}</span>
              </div>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-2">
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="btn btn-secondary text-sm"
              >
                Change Status
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as LeadStatus)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      disabled={status === lead.status}
                    >
                      <config.icon className="w-4 h-4" />
                      {config.label}
                      {status === lead.status && (
                        <span className="ml-auto text-blue-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {lead.status !== 'converted' && lead.status !== 'lost' && (
              <button
                onClick={() => onConvert?.(lead.id)}
                className="btn btn-primary text-sm flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Convert
              </button>
            )}
            
            <button
              onClick={() => onEdit?.(lead)}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded"
              title="Edit Lead"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onDelete?.(lead.id)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded"
              title="Delete Lead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-300">
            <Mail className="w-4 h-4 text-blue-400" />
            <a 
              href={`mailto:${lead.email}`}
              className="hover:text-blue-400 transition-colors"
            >
              {lead.email}
            </a>
          </div>
          
          {lead.phone && (
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-4 h-4 text-green-400" />
              <a 
                href={`tel:${lead.phone}`}
                className="hover:text-green-400 transition-colors"
              >
                {lead.phone}
              </a>
            </div>
          )}
          
          {lead.company && (
            <div className="flex items-center gap-2 text-gray-300">
              <Building className="w-4 h-4 text-purple-400" />
              <span>{lead.company}</span>
              {lead.jobTitle && <span className="text-gray-500">• {lead.jobTitle}</span>}
            </div>
          )}
          
          {lead.website && (
            <div className="flex items-center gap-2 text-gray-300">
              <ExternalLink className="w-4 h-4 text-orange-400" />
              <a 
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-400 transition-colors"
              >
                {lead.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {lead.budget && (
            <div className="flex items-center gap-2 text-gray-300">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span>Budget: {formatBudget(lead.budget)}</span>
            </div>
          )}
          
          {lead.timeline && (
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Timeline: {formatTimeline(lead.timeline)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-300">
            <Tag className="w-4 h-4 text-yellow-400" />
            <span>Source: {lead.source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
          
          {lead.decisionMaker && (
            <div className="flex items-center gap-2 text-green-400">
              <UserCheck className="w-4 h-4" />
              <span>Decision Maker</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-400">Tags:</span>
          <div className="flex flex-wrap gap-1">
            {lead.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Notes */}
      {lead.notes && (
        <div className="mt-4 p-4 bg-black border border-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Notes:</h4>
          <p className="text-gray-300 text-sm">{lead.notes}</p>
        </div>
      )}
      
      {/* Score Breakdown */}
      <div className="mt-4 p-4 bg-black border border-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Lead Score Breakdown:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Company:</span>
            <span className="ml-2 text-white">{lead.score.company}/25</span>
          </div>
          <div>
            <span className="text-gray-500">Budget:</span>
            <span className="ml-2 text-white">{lead.score.budget}/25</span>
          </div>
          <div>
            <span className="text-gray-500">Timeline:</span>
            <span className="ml-2 text-white">{lead.score.timeline}/25</span>
          </div>
          <div>
            <span className="text-gray-500">Engagement:</span>
            <span className="ml-2 text-white">{lead.score.engagement}/25</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-800">
          <span className="text-gray-400">Total Score:</span>
          <span className="ml-2 text-white font-medium">{lead.score.total}/100</span>
        </div>
      </div>
    </div>
  );
}