// Lead generation and management type definitions

export type LeadStatus = 
  | 'new'           // Just captured
  | 'contacted'     // Initial outreach made
  | 'qualified'     // Meets qualification criteria
  | 'unqualified'   // Doesn't meet criteria
  | 'nurturing'     // In nurture sequence
  | 'hot'           // Ready to close
  | 'converted'     // Became a client
  | 'lost'          // Lost to competitor or uninterested
  | 'invalid';      // Bad data/spam

export type LeadSource = 
  | 'website_form'
  | 'landing_page'
  | 'social_media'
  | 'google_ads'
  | 'facebook_ads'
  | 'linkedin'
  | 'referral'
  | 'cold_outreach'
  | 'event'
  | 'webinar'
  | 'content_download'
  | 'demo_request'
  | 'pricing_inquiry'
  | 'contact_form'
  | 'phone_call'
  | 'walk_in'
  | 'partner_referral'
  | 'existing_client'
  | 'other';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export type LeadTag = string;

export interface LeadQualificationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // 1-10 importance weight
  type: 'boolean' | 'number' | 'text' | 'select';
  required: boolean;
  options?: string[]; // For select types
  minValue?: number;  // For number types
  maxValue?: number;  // For number types
}

export interface LeadScore {
  total: number;
  company: number;    // Score for company quality (0-25)
  budget: number;     // Score for budget match (0-25)
  timeline: number;   // Score for timeline fit (0-25)
  engagement: number; // Score for engagement level (0-25)
  breakdown?: {
    criteriaId: string;
    criteriaName: string;
    value: any;
    score: number;
    weight: number;
  }[];
  qualificationStatus?: 'qualified' | 'unqualified' | 'pending';
  lastCalculated?: Date;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'note' | 'status_change' | 'assignment' | 'score_update';
  title: string;
  description: string;
  userId: string; // Who performed the activity
  userName: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface LeadFollowUp {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'follow_up';
  title: string;
  description: string;
  dueDate: Date;
  assignedTo: string;
  assignedToName: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  createdAt: Date;
  priority: LeadPriority;
}

// Form data for lead capture
export interface LeadCaptureForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  source?: LeadSource;
  budget?: string;
  timeline?: string;
  projectDescription?: string;
  currentSolution?: string;
  decisionMaker?: boolean;
  notes?: string;
  customFields?: Record<string, any>;
  
  // UTM tracking
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
}

export interface Lead {
  id: string;
  
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  
  // Lead Details
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  tags: LeadTag[];
  
  // Qualification & Scoring
  score: LeadScore;
  qualificationNotes: string;
  budget?: number;
  timeline?: string; // e.g., "3-6 months"
  decisionMaker?: boolean;
  
  // Assignment & Ownership
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: Date;
  
  // Campaign & Attribution
  campaignId?: string;
  campaignName?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  referrer?: string;
  
  // Interaction History
  activities: LeadActivity[];
  followUps: LeadFollowUp[];
  
  // Conversion
  convertedToClientId?: string;
  convertedAt?: Date;
  conversionValue?: number;
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastContactedAt?: Date;
  
  // Additional Data
  notes: string;
  customFields?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    timezone?: string;
  };
}

export interface LeadCampaign {
  id: string;
  name: string;
  description: string;
  type: 'paid_ads' | 'email' | 'social' | 'content' | 'event' | 'referral' | 'direct' | 'other';
  status: 'active' | 'paused' | 'completed' | 'draft';
  
  // Campaign Details
  startDate: Date;
  endDate?: Date;
  budget?: number;
  targetAudience?: string;
  
  // Goals & Tracking
  goals: {
    leads: number;
    conversions: number;
    revenue: number;
  };
  
  // Performance Metrics
  metrics: {
    leads: number;
    qualifiedLeads: number;
    conversions: number;
    revenue: number;
    cost: number;
    roi: number;
    conversionRate: number;
    costPerLead: number;
    costPerConversion: number;
  };
  
  // UTM Parameters
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface LeadAssignmentRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  priority: number; // Higher number = higher priority
  
  // Conditions
  conditions: {
    sources?: LeadSource[];
    tags?: LeadTag[];
    scoreMin?: number;
    scoreMax?: number;
    location?: string[];
    customFieldFilters?: Record<string, any>;
  };
  
  // Assignment Logic
  assignmentType: 'round_robin' | 'weighted' | 'specific_user' | 'based_on_load' | 'based_on_expertise';
  assignees: {
    userId: string;
    userName: string;
    weight?: number; // For weighted assignment
    maxLeads?: number; // Load limit
    expertise?: string[]; // Areas of expertise
  }[];
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface LeadTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'call_script';
  subject?: string; // For emails
  content: string;
  variables: string[]; // Available variables like {{firstName}}, {{company}}
  
  // Usage Context
  trigger: 'new_lead' | 'qualification' | 'follow_up' | 'nurture' | 'manual';
  delay?: number; // Minutes to wait before sending
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface LeadWorkflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  
  // Trigger Conditions
  trigger: {
    type: 'lead_created' | 'status_change' | 'score_change' | 'manual';
    conditions: Record<string, any>;
  };
  
  // Workflow Steps
  steps: {
    id: string;
    type: 'send_email' | 'send_sms' | 'create_task' | 'assign_lead' | 'update_status' | 'add_tag' | 'score_update' | 'wait';
    delay?: number; // Minutes to wait before executing
    templateId?: string; // For email/sms steps
    assignTo?: string; // For assignment steps
    status?: LeadStatus; // For status updates
    tags?: LeadTag[]; // For tag additions
    conditions?: Record<string, any>; // Conditional logic
  }[];
  
  // System Fields
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface LeadAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  
  // Lead Metrics
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  qualificationRate: number;
  
  // Source Performance
  sourceBreakdown: {
    source: LeadSource;
    count: number;
    qualified: number;
    converted: number;
    conversionRate: number;
    averageScore: number;
  }[];
  
  // Campaign Performance
  campaignBreakdown: {
    campaignId: string;
    campaignName: string;
    leads: number;
    qualified: number;
    converted: number;
    revenue: number;
    roi: number;
  }[];
  
  // User Performance
  userPerformance: {
    userId: string;
    userName: string;
    leadsAssigned: number;
    leadsContacted: number;
    leadsQualified: number;
    leadsConverted: number;
    conversionRate: number;
    averageResponseTime: number; // Hours
  }[];
  
  // Time-based Metrics
  dailyMetrics: {
    date: Date;
    leads: number;
    qualified: number;
    converted: number;
  }[];
  
  // Revenue Metrics
  revenue: {
    total: number;
    average: number;
    median: number;
    pipeline: number;
  };
  
  // Response Time Metrics
  responseTime: {
    average: number; // Hours
    median: number;
    under1Hour: number;
    under24Hours: number;
  };
}

export interface LeadGenerationSettings {
  // Qualification Criteria
  qualificationCriteria: LeadQualificationCriteria[];
  passingScore: number; // Minimum score to be qualified
  
  // Assignment Rules
  assignmentRules: LeadAssignmentRule[];
  defaultAssignee?: string;
  
  // Notification Settings
  notifications: {
    newLead: boolean;
    leadAssigned: boolean;
    leadQualified: boolean;
    leadConverted: boolean;
    followUpDue: boolean;
    inactiveLeads: boolean;
  };
  
  // Automation Settings
  autoAssignment: boolean;
  autoQualification: boolean;
  autoFollowUp: boolean;
  
  // Integration Settings
  integrations: {
    googleAds: boolean;
    facebookAds: boolean;
    linkedinAds: boolean;
    emailMarketing: boolean;
    webAnalytics: boolean;
  };
  
  // Data Retention
  retentionPeriod: number; // Days to keep leads
  archiveConverted: boolean;
  archiveOld: boolean;
  
  // System Fields
  updatedAt: Date;
  updatedBy: string;
}


// API Response interfaces
export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface LeadDashboardData {
  overview: {
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    convertedLeads: number;
    conversionRate: number;
  };
  recentLeads: Lead[];
  topSources: { source: LeadSource; count: number }[];
  upcomingFollowUps: LeadFollowUp[];
  performanceMetrics: {
    thisMonth: LeadAnalytics;
    lastMonth: LeadAnalytics;
  };
}

export default {
  Lead,
  LeadCampaign,
  LeadAssignmentRule,
  LeadTemplate,
  LeadWorkflow,
  LeadAnalytics,
  LeadGenerationSettings,
  LeadCaptureForm,
  LeadListResponse,
  LeadDashboardData
};