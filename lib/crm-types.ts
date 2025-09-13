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

// Enhanced Task Management System
export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string; // User ID
  assignedBy: string; // User ID who created the task
  clientId?: string; // Optional client association
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  subtasks: SubTask[];
  dependencies: string[]; // Task IDs that must be completed first
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
  assignedTo?: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
  edited?: boolean;
  editedAt?: Date;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // mime type
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ClientAssignment {
  id: string;
  clientId: string;
  userId: string;
  assignedBy: string;
  assignedAt: Date;
  role: AssignmentRole;
  isActive: boolean;
  notes?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  avatar?: string;
  department?: string;
  position?: string;
  phoneNumber?: string;
  timezone?: string;
  workingHours?: WorkingHours;
  skills: string[];
  bio?: string;
  socialLinks?: SocialLinks;
}

export interface WorkingHours {
  monday: { start: string; end: string; active: boolean };
  tuesday: { start: string; end: string; active: boolean };
  wednesday: { start: string; end: string; active: boolean };
  thursday: { start: string; end: string; active: boolean };
  friday: { start: string; end: string; active: boolean };
  saturday: { start: string; end: string; active: boolean };
  sunday: { start: string; end: string; active: boolean };
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tasks: Omit<Task, 'id' | 'assignedTo' | 'assignedBy' | 'clientId' | 'createdAt' | 'updatedAt'>[];
  estimatedDuration: number; // in days
  createdBy: string;
  createdAt: Date;
}

// Enhanced Analytics
export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number; // in hours
  tasksByPriority: Record<TaskPriority, number>;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByType: Record<TaskType, number>;
  productivityScore: number;
}

export interface UserPerformance {
  userId: string;
  period: { start: Date; end: Date };
  tasksCompleted: number;
  tasksOverdue: number;
  averageCompletionTime: number;
  clientsSatisfaction: number;
  revenueGenerated: number;
  efficiency: number; // estimated vs actual hours
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

export type TaskType = 
  | 'client_outreach'
  | 'project_work'
  | 'admin'
  | 'meeting'
  | 'research'
  | 'proposal'
  | 'follow_up'
  | 'bug_fix'
  | 'feature_development'
  | 'testing'
  | 'deployment'
  | 'training'
  | 'documentation'
  | 'other';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'blocked'
  | 'completed'
  | 'cancelled';

export type AssignmentRole = 
  | 'primary'
  | 'secondary'
  | 'collaborator'
  | 'observer';

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

export const TASK_TYPES = [
  { value: 'client_outreach', label: 'Client Outreach', icon: '📞', color: 'blue' },
  { value: 'project_work', label: 'Project Work', icon: '🔨', color: 'green' },
  { value: 'admin', label: 'Administrative', icon: '📋', color: 'gray' },
  { value: 'meeting', label: 'Meeting', icon: '👥', color: 'purple' },
  { value: 'research', label: 'Research', icon: '🔍', color: 'yellow' },
  { value: 'proposal', label: 'Proposal', icon: '📄', color: 'orange' },
  { value: 'follow_up', label: 'Follow Up', icon: '⏰', color: 'cyan' },
  { value: 'bug_fix', label: 'Bug Fix', icon: '🐛', color: 'red' },
  { value: 'feature_development', label: 'Feature Development', icon: '✨', color: 'indigo' },
  { value: 'testing', label: 'Testing', icon: '🧪', color: 'pink' },
  { value: 'deployment', label: 'Deployment', icon: '🚀', color: 'emerald' },
  { value: 'training', label: 'Training', icon: '📚', color: 'amber' },
  { value: 'documentation', label: 'Documentation', icon: '📝', color: 'slate' },
  { value: 'other', label: 'Other', icon: '📌', color: 'gray' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray', icon: '🔵' },
  { value: 'medium', label: 'Medium', color: 'yellow', icon: '🟡' },
  { value: 'high', label: 'High', color: 'orange', icon: '🟠' },
  { value: 'urgent', label: 'Urgent', color: 'red', icon: '🔴' },
] as const;

export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do', color: 'gray', icon: '⚪' },
  { value: 'in_progress', label: 'In Progress', color: 'blue', icon: '🔵' },
  { value: 'in_review', label: 'In Review', color: 'yellow', icon: '🟡' },
  { value: 'blocked', label: 'Blocked', color: 'red', icon: '🔴' },
  { value: 'completed', label: 'Completed', color: 'green', icon: '🟢' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray', icon: '⚫' },
] as const;

export const ASSIGNMENT_ROLES = [
  { value: 'primary', label: 'Primary Owner', color: 'blue', description: 'Main responsible person' },
  { value: 'secondary', label: 'Secondary Owner', color: 'green', description: 'Backup responsible person' },
  { value: 'collaborator', label: 'Collaborator', color: 'purple', description: 'Contributing team member' },
  { value: 'observer', label: 'Observer', color: 'gray', description: 'View-only access' },
] as const;

export const USER_DEPARTMENTS = [
  'Sales',
  'Marketing',
  'Development',
  'Design',
  'Project Management',
  'Quality Assurance',
  'Customer Support',
  'Administration',
] as const;

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { start: '09:00', end: '17:00', active: true },
  tuesday: { start: '09:00', end: '17:00', active: true },
  wednesday: { start: '09:00', end: '17:00', active: true },
  thursday: { start: '09:00', end: '17:00', active: true },
  friday: { start: '09:00', end: '17:00', active: true },
  saturday: { start: '09:00', end: '17:00', active: false },
  sunday: { start: '09:00', end: '17:00', active: false },
};
