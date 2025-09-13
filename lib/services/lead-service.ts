import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  onSnapshot,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Lead,
  LeadCaptureForm,
  LeadStatus,
  LeadSource,
  LeadPriority,
  LeadScore,
  LeadActivity,
  LeadFollowUp,
  LeadCampaign,
  LeadAssignmentRule,
  LeadTemplate,
  LeadWorkflow,
  LeadAnalytics,
  LeadGenerationSettings,
  LeadListResponse,
  LeadDashboardData,
  LeadQualificationCriteria
} from '../types/lead-types';
import { UserRole } from '../permissions';
import { convertTimestampToDate } from '../crm-db';
import { AuditLogger, AuditEventType } from '../security/audit-logger';

// Collections
export const LEAD_COLLECTIONS = {
  LEADS: 'leads',
  LEAD_ACTIVITIES: 'lead_activities',
  LEAD_FOLLOW_UPS: 'lead_followups',
  LEAD_CAMPAIGNS: 'lead_campaigns',
  LEAD_ASSIGNMENT_RULES: 'lead_assignment_rules',
  LEAD_TEMPLATES: 'lead_templates',
  LEAD_WORKFLOWS: 'lead_workflows',
  LEAD_SETTINGS: 'lead_settings'
} as const;

export class LeadService {
  /**
   * Create a new lead from captured form data
   */
  static async createLead(
    formData: LeadCaptureForm,
    userId: string,
    userRole: UserRole,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    try {
      // Get current settings for auto-assignment and scoring
      const settings = await this.getSettings();
      
      // Calculate initial score
      const score = await this.calculateLeadScore(formData, settings);
      
      // Determine assignment based on rules
      const assignment = settings.autoAssignment 
        ? await this.determineAssignment(formData, score, settings)
        : undefined;

      // Create lead object
      const leadData: Omit<Lead, 'id'> = {
        // Basic Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        jobTitle: formData.jobTitle,
        website: formData.website,
        
        // Lead Details
        source: formData.source || 'website_form',
        status: 'new',
        priority: this.determinePriority(score.total),
        tags: [],
        
        // Qualification & Scoring
        score,
        qualificationNotes: '',
        budget: formData.budget,
        timeline: formData.timeline,
        decisionMaker: formData.decisionMaker,
        
        // Assignment & Ownership
        assignedTo: assignment?.userId,
        assignedToName: assignment?.userName,
        assignedAt: assignment ? new Date() : undefined,
        
        // Campaign & Attribution
        utmSource: formData.utmSource,
        utmMedium: formData.utmMedium,
        utmCampaign: formData.utmCampaign,
        utmContent: formData.utmContent,
        
        // Interaction History
        activities: [],
        followUps: [],
        
        // System Fields
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        
        // Additional Data
        notes: formData.notes || '',
        customFields: formData.customFields,
        ipAddress,
        userAgent
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, LEAD_COLLECTIONS.LEADS), {
        ...leadData,
        createdAt: Timestamp.fromDate(leadData.createdAt),
        updatedAt: Timestamp.fromDate(leadData.updatedAt),
        assignedAt: leadData.assignedAt ? Timestamp.fromDate(leadData.assignedAt) : null
      });

      // Create initial activity
      await this.addActivity(docRef.id, {
        type: 'note',
        title: 'Lead Created',
        description: `Lead captured from ${formData.source || 'website form'}`,
        userId,
        userName: 'System'
      });

      // Log audit event
      await AuditLogger.logDataAccess(
        AuditEventType.CLIENT_CREATED,
        userId,
        userRole,
        'lead',
        docRef.id,
        'Lead created from form submission',
        true,
        { source: formData.source, email: formData.email }
      );

      // Trigger workflows if enabled
      if (settings.autoFollowUp) {
        await this.triggerWorkflows('lead_created', docRef.id, leadData);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead');
    }
  }

  /**
   * Get lead by ID with permission checking
   */
  static async getLead(
    leadId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Lead | null> {
    try {
      const docRef = doc(db, LEAD_COLLECTIONS.LEADS, leadId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      const lead = this.convertFirestoreLead({ id: docSnap.id, ...data });

      // Permission check - agents can only see their assigned leads
      if (userRole === 'agent' && lead.assignedTo !== userId) {
        throw new Error('Insufficient permissions to view this lead');
      }

      // Load activities and follow-ups
      await this.loadLeadDetails(lead);

      return lead;
    } catch (error) {
      console.error('Error getting lead:', error);
      throw error;
    }
  }

  /**
   * Get leads list with filtering and pagination
   */
  static async getLeads(filters: {
    userId: string;
    userRole: UserRole;
    status?: LeadStatus;
    source?: LeadSource;
    assignedTo?: string;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<LeadListResponse> {
    try {
      const { userId, userRole, page = 1, limit: pageLimit = 20 } = filters;
      
      let q = query(collection(db, LEAD_COLLECTIONS.LEADS));

      // Permission-based filtering
      if (userRole === 'agent') {
        q = query(q, where('assignedTo', '==', userId));
      }

      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.source) {
        q = query(q, where('source', '==', filters.source));
      }
      if (filters.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo));
      }
      if (filters.tags && filters.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filters.tags));
      }

      // Sorting
      const sortField = filters.sortBy || 'createdAt';
      const sortDirection = filters.sortOrder || 'desc';
      q = query(q, orderBy(sortField, sortDirection));

      // Pagination
      q = query(q, limit(pageLimit + 1)); // Get one extra to check if there are more

      const querySnapshot = await getDocs(q);
      const leads = querySnapshot.docs
        .slice(0, pageLimit)
        .map(doc => this.convertFirestoreLead({ id: doc.id, ...doc.data() }));

      // Search filtering (client-side for now)
      let filteredLeads = leads;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredLeads = leads.filter(lead => 
          lead.firstName.toLowerCase().includes(searchTerm) ||
          lead.lastName.toLowerCase().includes(searchTerm) ||
          lead.email.toLowerCase().includes(searchTerm) ||
          (lead.company && lead.company.toLowerCase().includes(searchTerm))
        );
      }

      return {
        leads: filteredLeads,
        total: filteredLeads.length, // This would need a separate count query in production
        page,
        limit: pageLimit,
        hasMore: querySnapshot.docs.length > pageLimit
      };
    } catch (error) {
      console.error('Error getting leads:', error);
      throw new Error('Failed to get leads');
    }
  }

  /**
   * Update lead information
   */
  static async updateLead(
    leadId: string,
    updates: Partial<Lead>,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    try {
      // Get current lead for permission check
      const currentLead = await this.getLead(leadId, userId, userRole);
      if (!currentLead) {
        throw new Error('Lead not found');
      }

      // Prepare updates
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      // Handle date fields
      if (updates.assignedAt) {
        updateData.assignedAt = Timestamp.fromDate(updates.assignedAt);
      }
      if (updates.convertedAt) {
        updateData.convertedAt = Timestamp.fromDate(updates.convertedAt);
      }
      if (updates.lastContactedAt) {
        updateData.lastContactedAt = Timestamp.fromDate(updates.lastContactedAt);
      }

      // Remove computed fields
      delete updateData.activities;
      delete updateData.followUps;
      delete updateData.createdAt;
      delete updateData.id;

      const docRef = doc(db, LEAD_COLLECTIONS.LEADS, leadId);
      await updateDoc(docRef, updateData);

      // Log activity for status changes
      if (updates.status && updates.status !== currentLead.status) {
        await this.addActivity(leadId, {
          type: 'status_change',
          title: 'Status Changed',
          description: `Status changed from ${currentLead.status} to ${updates.status}`,
          userId,
          userName: 'User'
        });
      }

      // Log audit event
      await AuditLogger.logDataAccess(
        AuditEventType.CLIENT_UPDATED,
        userId,
        userRole,
        'lead',
        leadId,
        'Lead updated',
        true,
        { changes: Object.keys(updates) }
      );
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  /**
   * Delete lead
   */
  static async deleteLead(
    leadId: string,
    userId: string,
    userRole: UserRole
  ): Promise<void> {
    try {
      // Get lead for permission check
      const lead = await this.getLead(leadId, userId, userRole);
      if (!lead) {
        throw new Error('Lead not found');
      }

      // Use batch for atomicity
      const batch = writeBatch(db);

      // Delete lead
      const leadRef = doc(db, LEAD_COLLECTIONS.LEADS, leadId);
      batch.delete(leadRef);

      // Delete associated activities
      const activitiesQuery = query(
        collection(db, LEAD_COLLECTIONS.LEAD_ACTIVITIES),
        where('leadId', '==', leadId)
      );
      const activitiesSnap = await getDocs(activitiesQuery);
      activitiesSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete associated follow-ups
      const followUpsQuery = query(
        collection(db, LEAD_COLLECTIONS.LEAD_FOLLOW_UPS),
        where('leadId', '==', leadId)
      );
      const followUpsSnap = await getDocs(followUpsQuery);
      followUpsSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // Log audit event
      await AuditLogger.logDataAccess(
        AuditEventType.CLIENT_DELETED,
        userId,
        userRole,
        'lead',
        leadId,
        'Lead deleted',
        true,
        { email: lead.email, status: lead.status }
      );
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  /**
   * Convert lead to client
   */
  static async convertToClient(
    leadId: string,
    userId: string,
    userRole: UserRole,
    conversionValue?: number
  ): Promise<string> {
    try {
      const lead = await this.getLead(leadId, userId, userRole);
      if (!lead) {
        throw new Error('Lead not found');
      }

      if (lead.status === 'converted') {
        throw new Error('Lead is already converted');
      }

      // Create client from lead data (using existing ClientService)
      const { ClientService } = await import('../crm-db');
      
      const clientId = await ClientService.createClient({
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        acquisitionSource: this.mapLeadSourceToClientSource(lead.source),
        status: 'lead',
        notes: `Converted from lead. Original notes: ${lead.notes}`,
        assignedTo: lead.assignedTo
      });

      // Update lead as converted
      await this.updateLead(leadId, {
        status: 'converted',
        convertedToClientId: clientId,
        convertedAt: new Date(),
        conversionValue
      }, userId, userRole);

      // Add conversion activity
      await this.addActivity(leadId, {
        type: 'note',
        title: 'Converted to Client',
        description: `Lead successfully converted to client (ID: ${clientId})`,
        userId,
        userName: 'User'
      });

      return clientId;
    } catch (error) {
      console.error('Error converting lead to client:', error);
      throw error;
    }
  }

  /**
   * Add activity to lead
   */
  static async addActivity(
    leadId: string,
    activityData: Omit<LeadActivity, 'id' | 'leadId' | 'createdAt'>
  ): Promise<string> {
    try {
      const activity: Omit<LeadActivity, 'id'> = {
        ...activityData,
        leadId,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, LEAD_COLLECTIONS.LEAD_ACTIVITIES), {
        ...activity,
        createdAt: Timestamp.fromDate(activity.createdAt)
      });

      // Update lead's lastContactedAt if it's a contact activity
      if (['call', 'email', 'meeting'].includes(activityData.type)) {
        const leadRef = doc(db, LEAD_COLLECTIONS.LEADS, leadId);
        await updateDoc(leadRef, {
          lastContactedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      return docRef.id;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw new Error('Failed to add activity');
    }
  }

  /**
   * Add follow-up task
   */
  static async addFollowUp(
    leadId: string,
    followUpData: Omit<LeadFollowUp, 'id' | 'leadId' | 'createdAt' | 'completed'>
  ): Promise<string> {
    try {
      const followUp: Omit<LeadFollowUp, 'id'> = {
        ...followUpData,
        leadId,
        completed: false,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, LEAD_COLLECTIONS.LEAD_FOLLOW_UPS), {
        ...followUp,
        dueDate: Timestamp.fromDate(followUp.dueDate),
        createdAt: Timestamp.fromDate(followUp.createdAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding follow-up:', error);
      throw new Error('Failed to add follow-up');
    }
  }

  /**
   * Complete follow-up task
   */
  static async completeFollowUp(
    followUpId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const docRef = doc(db, LEAD_COLLECTIONS.LEAD_FOLLOW_UPS, followUpId);
      await updateDoc(docRef, {
        completed: true,
        completedAt: Timestamp.now(),
        completedBy: userId
      });

      // Get follow-up details to add activity
      const followUpDoc = await getDoc(docRef);
      if (followUpDoc.exists()) {
        const followUpData = followUpDoc.data();
        await this.addActivity(followUpData.leadId, {
          type: 'note',
          title: 'Follow-up Completed',
          description: `Completed: ${followUpData.title}`,
          userId,
          userName
        });
      }
    } catch (error) {
      console.error('Error completing follow-up:', error);
      throw new Error('Failed to complete follow-up');
    }
  }

  /**
   * Calculate lead score based on qualification criteria
   */
  static async calculateLeadScore(
    leadData: LeadCaptureForm | Partial<Lead>,
    settings?: LeadGenerationSettings
  ): Promise<LeadScore> {
    try {
      if (!settings) {
        settings = await this.getSettings();
      }

      const breakdown = [];
      let companyScore = 0;
      let budgetScore = 0;
      let timelineScore = 0;
      let engagementScore = 0;

      // Simplified scoring system
      // Company Score (0-25)
      if (leadData.company) {
        companyScore = 20;
        if (leadData.jobTitle) companyScore += 5;
      }

      // Budget Score (0-25)
      if (leadData.budget) {
        const budgetValue = typeof leadData.budget === 'string' ? leadData.budget : leadData.budget.toString();
        if (budgetValue.includes('over_100k') || budgetValue.includes('100000')) {
          budgetScore = 25;
        } else if (budgetValue.includes('50k_100k') || budgetValue.includes('50000')) {
          budgetScore = 20;
        } else if (budgetValue.includes('15k_50k') || budgetValue.includes('15000')) {
          budgetScore = 15;
        } else if (budgetValue.includes('5k_15k') || budgetValue.includes('5000')) {
          budgetScore = 10;
        } else if (budgetValue.includes('under_5k')) {
          budgetScore = 5;
        }
      }

      // Timeline Score (0-25)
      if (leadData.timeline) {
        if (leadData.timeline.includes('immediate')) {
          timelineScore = 25;
        } else if (leadData.timeline.includes('1_3_months')) {
          timelineScore = 20;
        } else if (leadData.timeline.includes('3_6_months')) {
          timelineScore = 15;
        } else if (leadData.timeline.includes('6_12_months')) {
          timelineScore = 10;
        } else {
          timelineScore = 5;
        }
      }

      // Engagement Score (0-25)
      let baseEngagement = 10; // Base score for filling out form
      if (leadData.decisionMaker) baseEngagement += 10;
      if (leadData.notes && leadData.notes.length > 50) baseEngagement += 5;
      engagementScore = Math.min(25, baseEngagement);

      const totalScore = companyScore + budgetScore + timelineScore + engagementScore;

      // Legacy support for qualification criteria
      for (const criteria of settings.qualificationCriteria) {
        let value: any = null;
        let score = 0;

        // Get value based on field mapping
        switch (criteria.id) {
          case 'budget':
            value = leadData.budget || 0;
            if (criteria.type === 'number' && typeof value === 'number') {
              if (criteria.minValue && value >= criteria.minValue) {
                score = criteria.weight;
              }
            }
            break;
          case 'timeline':
            value = leadData.timeline || '';
            if (criteria.type === 'text' && value) {
              score = criteria.weight * 0.5; // Partial score for having timeline
            }
            break;
          case 'decision_maker':
            value = leadData.decisionMaker || false;
            if (criteria.type === 'boolean' && value === true) {
              score = criteria.weight;
            }
            break;
          case 'company_size':
            // This would need to be determined from company data
            value = leadData.company ? 1 : 0;
            if (value > 0) {
              score = criteria.weight * 0.3;
            }
            break;
          default:
            // Handle custom fields
            if (leadData.customFields && leadData.customFields[criteria.id]) {
              value = leadData.customFields[criteria.id];
              if (criteria.type === 'boolean' && value === true) {
                score = criteria.weight;
              } else if (criteria.type === 'text' && value) {
                score = criteria.weight * 0.5;
              }
            }
        }

        breakdown.push({
          criteriaId: criteria.id,
          criteriaName: criteria.name,
          value,
          score,
          weight: criteria.weight
        });

        totalScore += score;
      }

      const qualificationStatus = totalScore >= settings.passingScore ? 'qualified' : 'unqualified';

      return {
        total: totalScore,
        company: companyScore,
        budget: budgetScore,
        timeline: timelineScore,
        engagement: engagementScore,
        breakdown,
        qualificationStatus,
        lastCalculated: new Date()
      };
    } catch (error) {
      console.error('Error calculating lead score:', error);
      return {
        total: 0,
        breakdown: [],
        qualificationStatus: 'pending',
        lastCalculated: new Date()
      };
    }
  }

  /**
   * Determine lead assignment based on rules
   */
  static async determineAssignment(
    leadData: LeadCaptureForm | Partial<Lead>,
    score: LeadScore,
    settings: LeadGenerationSettings
  ): Promise<{ userId: string; userName: string } | undefined> {
    try {
      const rules = settings.assignmentRules
        .filter(rule => rule.active)
        .sort((a, b) => b.priority - a.priority); // Highest priority first

      for (const rule of rules) {
        if (this.leadMatchesRule(leadData, score, rule)) {
          return this.assignBasedOnRule(rule);
        }
      }

      // Fallback to default assignee
      if (settings.defaultAssignee) {
        // Get user name (would need user service)
        return { userId: settings.defaultAssignee, userName: 'Default User' };
      }

      return undefined;
    } catch (error) {
      console.error('Error determining assignment:', error);
      return undefined;
    }
  }

  /**
   * Get lead generation dashboard data
   */
  static async getDashboardData(
    userId: string,
    userRole: UserRole
  ): Promise<LeadDashboardData> {
    try {
      // Get leads based on user role
      const leadsResponse = await this.getLeads({
        userId,
        userRole,
        limit: 100 // Get enough for analysis
      });

      const leads = leadsResponse.leads;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate overview metrics
      const newLeads = leads.filter(lead => lead.createdAt >= startOfMonth).length;
      const qualifiedLeads = leads.filter(lead => lead.score.qualificationStatus === 'qualified').length;
      const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
      const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;

      // Get recent leads (last 10)
      const recentLeads = leads
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);

      // Calculate top sources
      const sourceMap = new Map<string, number>();
      leads.forEach(lead => {
        sourceMap.set(lead.source, (sourceMap.get(lead.source) || 0) + 1);
      });
      const topSources = Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source: source as LeadSource, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get upcoming follow-ups
      const upcomingFollowUps = await this.getUpcomingFollowUps(userId, userRole);

      return {
        overview: {
          totalLeads: leads.length,
          newLeads,
          qualifiedLeads,
          convertedLeads,
          conversionRate: Math.round(conversionRate * 100) / 100
        },
        recentLeads,
        topSources,
        upcomingFollowUps,
        performanceMetrics: {
          thisMonth: await this.getAnalytics(startOfMonth, now, userId, userRole),
          lastMonth: await this.getAnalytics(
            new Date(now.getFullYear(), now.getMonth() - 1, 1),
            startOfMonth,
            userId,
            userRole
          )
        }
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw new Error('Failed to get dashboard data');
    }
  }

  /**
   * Get upcoming follow-ups for user
   */
  static async getUpcomingFollowUps(
    userId: string,
    userRole: UserRole,
    limit: number = 10
  ): Promise<LeadFollowUp[]> {
    try {
      let q = query(
        collection(db, LEAD_COLLECTIONS.LEAD_FOLLOW_UPS),
        where('completed', '==', false),
        orderBy('dueDate', 'asc'),
        limit(limit)
      );

      // Filter by assignment for agents
      if (userRole === 'agent') {
        q = query(
          collection(db, LEAD_COLLECTIONS.LEAD_FOLLOW_UPS),
          where('assignedTo', '==', userId),
          where('completed', '==', false),
          orderBy('dueDate', 'asc'),
          limit(limit)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: convertTimestampToDate(doc.data().dueDate),
        createdAt: convertTimestampToDate(doc.data().createdAt),
        completedAt: doc.data().completedAt ? convertTimestampToDate(doc.data().completedAt) : undefined
      } as LeadFollowUp));
    } catch (error) {
      console.error('Error getting follow-ups:', error);
      return [];
    }
  }

  /**
   * Get lead generation analytics
   */
  static async getAnalytics(
    startDate: Date,
    endDate: Date,
    userId: string,
    userRole: UserRole
  ): Promise<LeadAnalytics> {
    try {
      // This is a simplified version - in production you'd want more efficient queries
      const leads = (await this.getLeads({
        userId,
        userRole,
        limit: 1000
      })).leads.filter(lead => 
        lead.createdAt >= startDate && lead.createdAt <= endDate
      );

      const totalLeads = leads.length;
      const qualifiedLeads = leads.filter(l => l.score.qualificationStatus === 'qualified').length;
      const convertedLeads = leads.filter(l => l.status === 'converted').length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

      // Source breakdown
      const sourceMap = new Map<LeadSource, any>();
      leads.forEach(lead => {
        if (!sourceMap.has(lead.source)) {
          sourceMap.set(lead.source, { count: 0, qualified: 0, converted: 0, totalScore: 0 });
        }
        const stats = sourceMap.get(lead.source)!;
        stats.count++;
        stats.totalScore += lead.score.total;
        if (lead.score.qualificationStatus === 'qualified') stats.qualified++;
        if (lead.status === 'converted') stats.converted++;
      });

      const sourceBreakdown = Array.from(sourceMap.entries()).map(([source, stats]) => ({
        source,
        count: stats.count,
        qualified: stats.qualified,
        converted: stats.converted,
        conversionRate: stats.count > 0 ? (stats.converted / stats.count) * 100 : 0,
        averageScore: stats.count > 0 ? stats.totalScore / stats.count : 0
      }));

      return {
        period: { start: startDate, end: endDate },
        totalLeads,
        qualifiedLeads,
        convertedLeads,
        conversionRate,
        qualificationRate,
        sourceBreakdown,
        campaignBreakdown: [], // Would need campaign data
        userPerformance: [], // Would need user performance calculation
        dailyMetrics: [], // Would need daily breakdown
        revenue: { total: 0, average: 0, median: 0, pipeline: 0 },
        responseTime: { average: 0, median: 0, under1Hour: 0, under24Hours: 0 }
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }

  /**
   * Get lead generation settings
   */
  static async getSettings(): Promise<LeadGenerationSettings> {
    try {
      const docRef = doc(db, LEAD_COLLECTIONS.LEAD_SETTINGS, 'default');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          updatedAt: convertTimestampToDate(data.updatedAt)
        } as LeadGenerationSettings;
      } else {
        // Return default settings if none exist
        return this.getDefaultSettings();
      }
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Update lead generation settings
   */
  static async updateSettings(
    settings: Partial<LeadGenerationSettings>,
    userId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, LEAD_COLLECTIONS.LEAD_SETTINGS, 'default');
      await updateDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  // Private helper methods
  private static convertFirestoreLead(data: any): Lead {
    return {
      ...data,
      createdAt: convertTimestampToDate(data.createdAt),
      updatedAt: convertTimestampToDate(data.updatedAt),
      assignedAt: data.assignedAt ? convertTimestampToDate(data.assignedAt) : undefined,
      convertedAt: data.convertedAt ? convertTimestampToDate(data.convertedAt) : undefined,
      lastContactedAt: data.lastContactedAt ? convertTimestampToDate(data.lastContactedAt) : undefined,
      score: {
        ...data.score,
        lastCalculated: convertTimestampToDate(data.score.lastCalculated)
      }
    };
  }

  private static async loadLeadDetails(lead: Lead): Promise<void> {
    try {
      // Load activities
      const activitiesQuery = query(
        collection(db, LEAD_COLLECTIONS.LEAD_ACTIVITIES),
        where('leadId', '==', lead.id),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const activitiesSnap = await getDocs(activitiesQuery);
      lead.activities = activitiesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestampToDate(doc.data().createdAt)
      } as LeadActivity));

      // Load follow-ups
      const followUpsQuery = query(
        collection(db, LEAD_COLLECTIONS.LEAD_FOLLOW_UPS),
        where('leadId', '==', lead.id),
        orderBy('dueDate', 'asc')
      );
      const followUpsSnap = await getDocs(followUpsQuery);
      lead.followUps = followUpsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: convertTimestampToDate(doc.data().dueDate),
        createdAt: convertTimestampToDate(doc.data().createdAt),
        completedAt: doc.data().completedAt ? convertTimestampToDate(doc.data().completedAt) : undefined
      } as LeadFollowUp));
    } catch (error) {
      console.error('Error loading lead details:', error);
      // Don't throw - just leave arrays empty
      lead.activities = [];
      lead.followUps = [];
    }
  }

  private static determinePriority(score: number): LeadPriority {
    if (score >= 80) return 'urgent';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private static leadMatchesRule(
    leadData: LeadCaptureForm | Partial<Lead>,
    score: LeadScore,
    rule: LeadAssignmentRule
  ): boolean {
    const conditions = rule.conditions;

    // Check source
    if (conditions.sources && conditions.sources.length > 0) {
      if (!leadData.source || !conditions.sources.includes(leadData.source)) {
        return false;
      }
    }

    // Check score range
    if (conditions.scoreMin !== undefined && score.total < conditions.scoreMin) {
      return false;
    }
    if (conditions.scoreMax !== undefined && score.total > conditions.scoreMax) {
      return false;
    }

    // Check tags (for existing leads)
    if (conditions.tags && conditions.tags.length > 0) {
      const leadTags = (leadData as Lead).tags || [];
      if (!conditions.tags.some(tag => leadTags.includes(tag))) {
        return false;
      }
    }

    return true;
  }

  private static assignBasedOnRule(rule: LeadAssignmentRule): { userId: string; userName: string } | undefined {
    if (rule.assignees.length === 0) return undefined;

    switch (rule.assignmentType) {
      case 'round_robin':
        // Simple round-robin (would need state tracking in production)
        const randomIndex = Math.floor(Math.random() * rule.assignees.length);
        return rule.assignees[randomIndex];
      
      case 'weighted':
        // Weighted random selection
        const totalWeight = rule.assignees.reduce((sum, assignee) => sum + (assignee.weight || 1), 0);
        let random = Math.random() * totalWeight;
        for (const assignee of rule.assignees) {
          random -= (assignee.weight || 1);
          if (random <= 0) {
            return assignee;
          }
        }
        return rule.assignees[0];
      
      case 'specific_user':
        return rule.assignees[0];
      
      default:
        return rule.assignees[0];
    }
  }

  private static mapLeadSourceToClientSource(leadSource: LeadSource): string {
    const mapping: Record<LeadSource, string> = {
      'website_form': 'website',
      'landing_page': 'website',
      'social_media': 'social_media',
      'google_ads': 'google_ads',
      'facebook_ads': 'social_media',
      'linkedin': 'social_media',
      'referral': 'referral',
      'cold_outreach': 'cold_outreach',
      'event': 'event',
      'webinar': 'event',
      'content_download': 'website',
      'demo_request': 'website',
      'pricing_inquiry': 'website',
      'contact_form': 'website',
      'phone_call': 'phone_call',
      'walk_in': 'walk_in',
      'partner_referral': 'referral',
      'existing_client': 'existing_client',
      'other': 'other'
    };
    return mapping[leadSource] || 'other';
  }

  private static getDefaultSettings(): LeadGenerationSettings {
    return {
      qualificationCriteria: [
        {
          id: 'budget',
          name: 'Budget',
          description: 'Lead has sufficient budget',
          weight: 8,
          type: 'number',
          required: false,
          minValue: 1000
        },
        {
          id: 'decision_maker',
          name: 'Decision Maker',
          description: 'Lead is a decision maker',
          weight: 7,
          type: 'boolean',
          required: false
        },
        {
          id: 'timeline',
          name: 'Timeline',
          description: 'Lead has defined timeline',
          weight: 5,
          type: 'text',
          required: false
        }
      ],
      passingScore: 15,
      assignmentRules: [],
      notifications: {
        newLead: true,
        leadAssigned: true,
        leadQualified: true,
        leadConverted: true,
        followUpDue: true,
        inactiveLeads: true
      },
      autoAssignment: true,
      autoQualification: true,
      autoFollowUp: true,
      integrations: {
        googleAds: false,
        facebookAds: false,
        linkedinAds: false,
        emailMarketing: false,
        webAnalytics: false
      },
      retentionPeriod: 365,
      archiveConverted: false,
      archiveOld: true,
      updatedAt: new Date(),
      updatedBy: 'system'
    };
  }

  private static async triggerWorkflows(
    triggerType: string,
    leadId: string,
    leadData: Partial<Lead>
  ): Promise<void> {
    // Workflow execution would be implemented here
    // For now, just log that it would trigger
    console.log(`Would trigger ${triggerType} workflows for lead ${leadId}`);
  }
}