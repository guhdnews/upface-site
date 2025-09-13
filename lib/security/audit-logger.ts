import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserRole } from '../permissions';

// Audit log event types
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  
  // Permission and role events
  ROLE_CHANGED = 'role_changed',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',
  USER_ACTIVATED = 'user_activated',
  USER_DEACTIVATED = 'user_deactivated',
  
  // Data access events
  CLIENT_VIEWED = 'client_viewed',
  CLIENT_CREATED = 'client_created',
  CLIENT_UPDATED = 'client_updated',
  CLIENT_DELETED = 'client_deleted',
  
  // Task events
  TASK_VIEWED = 'task_viewed',
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  
  // Training access events
  TRAINING_ACCESSED = 'training_accessed',
  TRAINING_COMPLETED = 'training_completed',
  
  // Admin panel events
  ADMIN_PANEL_ACCESS = 'admin_panel_access',
  USER_MANAGEMENT_ACCESS = 'user_management_access',
  PERMISSIONS_VIEWED = 'permissions_viewed',
  
  // Security events
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  CSRF_TOKEN_INVALID = 'csrf_token_invalid',
  INPUT_VALIDATION_FAILED = 'input_validation_failed',
  
  // System events
  SYSTEM_ERROR = 'system_error',
  DATA_EXPORT = 'data_export',
  BULK_OPERATION = 'bulk_operation'
}

// Severity levels for audit events
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Audit log entry interface
export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRole?: UserRole;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  action: string;
  details: Record<string, any>;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Audit logger class
export class AuditLogger {
  private static readonly COLLECTION_NAME = 'audit_logs';
  private static readonly MAX_DETAILS_SIZE = 10000; // Limit details field size
  
  /**
   * Log an audit event
   */
  static async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string> {
    try {
      // Sanitize and limit the size of details
      const sanitizedDetails = this.sanitizeDetails(entry.details);
      
      const auditEntry: Omit<AuditLogEntry, 'id'> = {
        timestamp: new Date(),
        ...entry,
        details: sanitizedDetails,
        // Ensure user agent is limited in size
        userAgent: entry.userAgent ? entry.userAgent.substring(0, 500) : undefined
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...auditEntry,
        timestamp: Timestamp.fromDate(auditEntry.timestamp)
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Don't throw error to prevent audit logging from breaking application
      return '';
    }
  }

  /**
   * Log authentication events
   */
  static async logAuth(
    eventType: AuditEventType.LOGIN_SUCCESS | AuditEventType.LOGIN_FAILED | AuditEventType.LOGOUT,
    userId?: string,
    userEmail?: string,
    userRole?: UserRole,
    ipAddress?: string,
    userAgent?: string,
    details: Record<string, any> = {}
  ): Promise<string> {
    return this.log({
      eventType,
      severity: eventType === AuditEventType.LOGIN_FAILED ? AuditSeverity.MEDIUM : AuditSeverity.LOW,
      userId,
      userEmail,
      userRole,
      ipAddress,
      userAgent,
      action: eventType.replace('_', ' ').toUpperCase(),
      success: eventType !== AuditEventType.LOGIN_FAILED,
      details
    });
  }

  /**
   * Log permission changes
   */
  static async logPermissionChange(
    eventType: AuditEventType,
    targetUserId: string,
    targetUserEmail?: string,
    adminUserId?: string,
    adminUserRole?: UserRole,
    oldValue?: any,
    newValue?: any,
    ipAddress?: string
  ): Promise<string> {
    return this.log({
      eventType,
      severity: AuditSeverity.HIGH,
      userId: adminUserId,
      userRole: adminUserRole,
      ipAddress,
      resource: 'user_permissions',
      resourceId: targetUserId,
      action: `Changed ${eventType.replace('_', ' ')} for user ${targetUserEmail}`,
      success: true,
      details: {
        targetUserId,
        targetUserEmail,
        oldValue,
        newValue,
        changedBy: adminUserId
      }
    });
  }

  /**
   * Log data access events
   */
  static async logDataAccess(
    eventType: AuditEventType,
    userId: string,
    userRole: UserRole,
    resource: string,
    resourceId: string,
    action: string,
    success: boolean = true,
    details: Record<string, any> = {},
    ipAddress?: string
  ): Promise<string> {
    const severity = this.getSeverityForDataAccess(eventType, success);
    
    return this.log({
      eventType,
      severity,
      userId,
      userRole,
      ipAddress,
      resource,
      resourceId,
      action,
      success,
      details: {
        ...details,
        dataType: resource
      }
    });
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
    action: string,
    details: Record<string, any> = {},
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    return this.log({
      eventType,
      severity,
      userId,
      ipAddress,
      userAgent,
      action,
      success: false,
      details
    });
  }

  /**
   * Log system events
   */
  static async logSystemEvent(
    eventType: AuditEventType,
    action: string,
    success: boolean,
    details: Record<string, any> = {},
    userId?: string,
    errorMessage?: string
  ): Promise<string> {
    return this.log({
      eventType,
      severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      userId,
      action,
      success,
      details,
      errorMessage
    });
  }

  /**
   * Query audit logs with filters
   */
  static async queryLogs(filters: {
    userId?: string;
    eventType?: AuditEventType;
    severity?: AuditSeverity;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
    limit?: number;
  } = {}): Promise<AuditLogEntry[]> {
    try {
      let q = query(collection(db, this.COLLECTION_NAME));
      
      // Apply filters
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters.eventType) {
        q = query(q, where('eventType', '==', filters.eventType));
      }
      if (filters.severity) {
        q = query(q, where('severity', '==', filters.severity));
      }
      if (filters.resource) {
        q = query(q, where('resource', '==', filters.resource));
      }
      if (filters.success !== undefined) {
        q = query(q, where('success', '==', filters.success));
      }
      if (filters.startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters.endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
      }

      // Order by timestamp desc and apply limit
      q = query(q, orderBy('timestamp', 'desc'), limit(filters.limit || 100));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      } as AuditLogEntry));
    } catch (error) {
      console.error('Failed to query audit logs:', error);
      return [];
    }
  }

  /**
   * Get security alerts (high severity events)
   */
  static async getSecurityAlerts(limit: number = 50): Promise<AuditLogEntry[]> {
    return this.queryLogs({
      severity: AuditSeverity.HIGH,
      success: false,
      limit
    });
  }

  /**
   * Get user activity summary
   */
  static async getUserActivity(userId: string, days: number = 30): Promise<{
    totalEvents: number;
    loginCount: number;
    failedLogins: number;
    dataAccess: number;
    securityEvents: number;
    lastActivity?: Date;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await this.queryLogs({
      userId,
      startDate,
      limit: 1000
    });

    const summary = {
      totalEvents: logs.length,
      loginCount: 0,
      failedLogins: 0,
      dataAccess: 0,
      securityEvents: 0,
      lastActivity: logs.length > 0 ? logs[0].timestamp : undefined
    };

    for (const log of logs) {
      if (log.eventType === AuditEventType.LOGIN_SUCCESS) {
        summary.loginCount++;
      } else if (log.eventType === AuditEventType.LOGIN_FAILED) {
        summary.failedLogins++;
      } else if (log.eventType.includes('_VIEWED') || log.eventType.includes('_ACCESSED')) {
        summary.dataAccess++;
      } else if ([
        AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
        AuditEventType.RATE_LIMIT_EXCEEDED,
        AuditEventType.SUSPICIOUS_ACTIVITY,
        AuditEventType.CSRF_TOKEN_INVALID
      ].includes(log.eventType)) {
        summary.securityEvents++;
      }
    }

    return summary;
  }

  /**
   * Generate security report
   */
  static async generateSecurityReport(days: number = 30): Promise<{
    period: { start: Date; end: Date };
    totalEvents: number;
    failedLogins: number;
    unauthorizedAccess: number;
    suspiciousActivity: number;
    rateLimitViolations: number;
    topRiskyUsers: Array<{ userId: string; riskScore: number; events: number }>;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await this.queryLogs({
      startDate,
      limit: 10000
    });

    const report = {
      period: { start: startDate, end: endDate },
      totalEvents: logs.length,
      failedLogins: 0,
      unauthorizedAccess: 0,
      suspiciousActivity: 0,
      rateLimitViolations: 0,
      topRiskyUsers: [] as Array<{ userId: string; riskScore: number; events: number }>,
      eventsByType: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>
    };

    const userRiskScores = new Map<string, { score: number; events: number }>();

    for (const log of logs) {
      // Count by event type
      report.eventsByType[log.eventType] = (report.eventsByType[log.eventType] || 0) + 1;
      
      // Count by severity
      report.eventsBySeverity[log.severity] = (report.eventsBySeverity[log.severity] || 0) + 1;
      
      // Count specific security events
      if (log.eventType === AuditEventType.LOGIN_FAILED) {
        report.failedLogins++;
      } else if (log.eventType === AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT) {
        report.unauthorizedAccess++;
      } else if (log.eventType === AuditEventType.SUSPICIOUS_ACTIVITY) {
        report.suspiciousActivity++;
      } else if (log.eventType === AuditEventType.RATE_LIMIT_EXCEEDED) {
        report.rateLimitViolations++;
      }

      // Calculate user risk scores
      if (log.userId) {
        const current = userRiskScores.get(log.userId) || { score: 0, events: 0 };
        let riskIncrement = 0;
        
        if (log.severity === AuditSeverity.CRITICAL) riskIncrement = 10;
        else if (log.severity === AuditSeverity.HIGH) riskIncrement = 5;
        else if (log.severity === AuditSeverity.MEDIUM) riskIncrement = 2;
        else riskIncrement = 1;
        
        if (!log.success) riskIncrement *= 2;
        
        userRiskScores.set(log.userId, {
          score: current.score + riskIncrement,
          events: current.events + 1
        });
      }
    }

    // Get top risky users
    report.topRiskyUsers = Array.from(userRiskScores.entries())
      .map(([userId, data]) => ({ userId, riskScore: data.score, events: data.events }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    return report;
  }

  /**
   * Private helper methods
   */
  private static sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(details)) {
      // Skip sensitive fields
      if (['password', 'token', 'secret', 'key'].some(sensitive => 
        key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }
      
      // Truncate long strings
      if (typeof value === 'string' && value.length > 500) {
        sanitized[key] = value.substring(0, 500) + '...[TRUNCATED]';
      } else {
        sanitized[key] = value;
      }
    }
    
    // Ensure total size doesn't exceed limit
    const serialized = JSON.stringify(sanitized);
    if (serialized.length > this.MAX_DETAILS_SIZE) {
      return { note: 'Details truncated due to size limit', originalSize: serialized.length };
    }
    
    return sanitized;
  }

  private static getSeverityForDataAccess(eventType: AuditEventType, success: boolean): AuditSeverity {
    if (!success) return AuditSeverity.HIGH;
    
    if (eventType.includes('DELETED')) return AuditSeverity.MEDIUM;
    if (eventType.includes('CREATED') || eventType.includes('UPDATED')) return AuditSeverity.LOW;
    return AuditSeverity.LOW;
  }
}

// Audit middleware helpers
export class AuditMiddleware {
  /**
   * Extract client information from request
   */
  static getClientInfo(req: any): { ipAddress?: string; userAgent?: string } {
    return {
      ipAddress: req.headers['x-forwarded-for'] || 
                req.headers['x-real-ip'] || 
                req.connection?.remoteAddress ||
                req.socket?.remoteAddress ||
                req.ip,
      userAgent: req.headers['user-agent']
    };
  }

  /**
   * Middleware wrapper for automatic audit logging
   */
  static createAuditWrapper(
    eventType: AuditEventType,
    action: string,
    resourceExtractor?: (req: any, res: any) => { resource?: string; resourceId?: string }
  ) {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const clientInfo = this.getClientInfo(req);
      
      // Capture original end method
      const originalEnd = res.end;
      
      res.end = function(chunk: any, encoding: any) {
        const success = res.statusCode < 400;
        const duration = Date.now() - startTime;
        
        let resource, resourceId;
        if (resourceExtractor) {
          const extracted = resourceExtractor(req, res);
          resource = extracted.resource;
          resourceId = extracted.resourceId;
        }
        
        // Log the audit event
        AuditLogger.log({
          eventType,
          severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
          userId: req.user?.uid,
          userEmail: req.user?.email,
          userRole: req.user?.role,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          resource,
          resourceId,
          action,
          success,
          details: {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration
          },
          sessionId: req.session?.id
        }).catch(error => {
          console.error('Failed to log audit event:', error);
        });
        
        // Call original end method
        originalEnd.call(this, chunk, encoding);
      };
      
      next();
    };
  }
}

export default AuditLogger;