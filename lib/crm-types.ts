export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'employee';
  permissions: Permission[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  acquisitionSource: AcquisitionSource;
  status: ClientStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string; // User ID
  interactions: Interaction[];
  followUps: FollowUp[];
  profileViews: ProfileView[];
}

export interface Interaction {
  id: string;
  clientId: string;
  userId: string;
  type: InteractionType;
  description: string;
  date: Date;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface FollowUp {
  id: string;
  clientId: string;
  userId: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface ProfileView {
  id: string;
  clientId: string;
  userId: string;
  viewedAt: Date;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: 'contact_form' | 'phone' | 'email' | 'other';
  status: 'new' | 'contacted' | 'converted' | 'closed';
  submittedAt: Date;
  assignedTo?: string;
  convertedToClientId?: string;
}

export type AcquisitionSource = 
  | 'google_search'
  | 'instagram_search'
  | 'facebook'
  | 'linkedin'
  | 'referral'
  | 'website'
  | 'cold_outreach'
  | 'networking'
  | 'advertising'
  | 'other';

export type ClientStatus = 
  | 'lead'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiating'
  | 'won'
  | 'lost'
  | 'on_hold';

export type InteractionType = 
  | 'call'
  | 'email'
  | 'meeting'
  | 'proposal'
  | 'follow_up'
  | 'note'
  | 'task_completed'
  | 'other';

export const PERMISSIONS = {
  VIEW_CLIENTS: { id: 'view_clients', name: 'View Clients', description: 'Can view client profiles' },
  EDIT_CLIENTS: { id: 'edit_clients', name: 'Edit Clients', description: 'Can edit client information' },
  DELETE_CLIENTS: { id: 'delete_clients', name: 'Delete Clients', description: 'Can delete clients' },
  VIEW_INQUIRIES: { id: 'view_inquiries', name: 'View Inquiries', description: 'Can view new inquiries' },
  ASSIGN_CLIENTS: { id: 'assign_clients', name: 'Assign Clients', description: 'Can assign clients to users' },
  MANAGE_USERS: { id: 'manage_users', name: 'Manage Users', description: 'Can manage user accounts' },
  ADMIN_ACCESS: { id: 'admin_access', name: 'Admin Access', description: 'Full administrative access' },
  WEBSITE_MANAGEMENT: { id: 'website_management', name: 'Website Management', description: 'Can manage website content' },
} as const;

export const ACQUISITION_SOURCES = [
  { value: 'google_search', label: 'Google Search' },
  { value: 'instagram_search', label: 'Instagram Search' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'networking', label: 'Networking' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'other', label: 'Other' },
] as const;

export const CLIENT_STATUSES = [
  { value: 'lead', label: 'Lead', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'qualified', label: 'Qualified', color: 'green' },
  { value: 'proposal_sent', label: 'Proposal Sent', color: 'purple' },
  { value: 'negotiating', label: 'Negotiating', color: 'orange' },
  { value: 'won', label: 'Won', color: 'green' },
  { value: 'lost', label: 'Lost', color: 'red' },
  { value: 'on_hold', label: 'On Hold', color: 'gray' },
] as const;