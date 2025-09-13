import { NextRequest, NextResponse } from 'next/server';
import { 
  InputValidator, 
  SecurityHeaders, 
  SecureSession 
} from './input-validation';
import { 
  AuditLogger, 
  AuditEventType, 
  AuditSeverity,
  AuditMiddleware 
} from './audit-logger';
import { 
  UserRole, 
  hasPermission, 
  canAccessRoleContent,
  ROLE_HIERARCHY 
} from '../permissions';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security middleware configuration
export interface SecurityMiddlewareConfig {
  rateLimit?: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests?: boolean;
  };
  authentication?: {
    required: boolean;
    allowAnonymous?: string[]; // List of paths that don't require authentication
  };
  authorization?: {
    requiredRole?: UserRole;
    requiredPermission?: string;
    resourceCheck?: (req: NextRequest, user: any) => Promise<boolean>;
  };
  csrf?: {
    enabled: boolean;
    exemptMethods?: string[];
  };
  cors?: {
    enabled: boolean;
    allowedOrigins?: string[];
    allowedMethods?: string[];
  };
  logging?: {
    enabled: boolean;
    logLevel: 'minimal' | 'standard' | 'detailed';
  };
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityMiddlewareConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  authentication: {
    required: true,
    allowAnonymous: ['/api/public', '/api/health', '/api/contact']
  },
  authorization: {
    requiredRole: 'agent' // minimum role required
  },
  csrf: {
    enabled: true,
    exemptMethods: ['GET', 'HEAD', 'OPTIONS']
  },
  cors: {
    enabled: true,
    allowedOrigins: ['https://upface.dev', 'https://www.upface.dev'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  logging: {
    enabled: true,
    logLevel: 'standard'
  }
};

// Main security middleware class
export class SecurityMiddleware {
  private config: SecurityMiddlewareConfig;

  constructor(config: Partial<SecurityMiddlewareConfig> = {}) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  /**
   * Main middleware function
   */
  async handle(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    const clientInfo = this.getClientInfo(request);
    
    try {
      // 1. Security Headers
      const response = NextResponse.next();
      this.applySecurityHeaders(response);

      // 2. CORS handling
      if (this.config.cors?.enabled) {
        const corsResult = this.handleCORS(request, response);
        if (corsResult.blocked) {
          return corsResult.response!;
        }
      }

      // 3. Rate limiting
      if (this.config.rateLimit) {
        const rateLimitResult = this.checkRateLimit(clientInfo.ipAddress, request.url);
        if (rateLimitResult.blocked) {
          await this.logSecurityEvent(
            AuditEventType.RATE_LIMIT_EXCEEDED,
            'Rate limit exceeded',
            clientInfo,
            { url: request.url, limit: this.config.rateLimit.max }
          );
          return this.createErrorResponse(429, 'Rate limit exceeded', response);
        }
      }

      // 4. Input validation for request body
      const validationResult = await this.validateRequestInput(request);
      if (!validationResult.valid) {
        await this.logSecurityEvent(
          AuditEventType.INPUT_VALIDATION_FAILED,
          'Input validation failed',
          clientInfo,
          { errors: validationResult.errors, url: request.url }
        );
        return this.createErrorResponse(400, 'Invalid input', response);
      }

      // 5. Authentication check
      const authResult = await this.checkAuthentication(request);
      if (!authResult.authenticated) {
        if (this.config.authentication?.required && 
            !this.isExemptFromAuth(request.url)) {
          await this.logSecurityEvent(
            AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
            'Authentication required',
            clientInfo,
            { url: request.url }
          );
          return this.createErrorResponse(401, 'Authentication required', response);
        }
      }

      // 6. CSRF protection
      if (this.config.csrf?.enabled && 
          !this.config.csrf.exemptMethods?.includes(request.method)) {
        const csrfResult = this.validateCSRF(request);
        if (!csrfResult.valid) {
          await this.logSecurityEvent(
            AuditEventType.CSRF_TOKEN_INVALID,
            'CSRF token validation failed',
            clientInfo,
            { url: request.url }
          );
          return this.createErrorResponse(403, 'CSRF token invalid', response);
        }
      }

      // 7. Authorization check
      if (authResult.authenticated && this.config.authorization) {
        const authzResult = await this.checkAuthorization(request, authResult.user);
        if (!authzResult.authorized) {
          await this.logSecurityEvent(
            AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
            'Insufficient permissions',
            clientInfo,
            { 
              url: request.url, 
              userRole: authResult.user?.role,
              requiredRole: this.config.authorization.requiredRole,
              requiredPermission: this.config.authorization.requiredPermission
            },
            authResult.user?.uid
          );
          return this.createErrorResponse(403, 'Insufficient permissions', response);
        }
      }

      // 8. Log successful request if logging is enabled
      if (this.config.logging?.enabled) {
        await this.logRequestSuccess(request, authResult.user, clientInfo, startTime);
      }

      return response;

    } catch (error) {
      console.error('Security middleware error:', error);
      
      await this.logSecurityEvent(
        AuditEventType.SYSTEM_ERROR,
        'Security middleware error',
        clientInfo,
        { error: error instanceof Error ? error.message : 'Unknown error', url: request.url }
      );

      return this.createErrorResponse(500, 'Internal server error', NextResponse.next());
    }
  }

  /**
   * Apply security headers to response
   */
  private applySecurityHeaders(response: NextResponse): void {
    const securityHeaders = SecurityHeaders.getSecurityHeaders();
    
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Additional headers for API responses
    response.headers.set('X-Robots-Tag', 'noindex');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  /**
   * Handle CORS requests
   */
  private handleCORS(
    request: NextRequest, 
    response: NextResponse
  ): { blocked: boolean; response?: NextResponse } {
    const origin = request.headers.get('origin');
    const allowedOrigins = this.config.cors?.allowedOrigins || [];

    // Check if origin is allowed
    if (origin && !allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
      return {
        blocked: true,
        response: this.createErrorResponse(403, 'CORS: Origin not allowed', response)
      };
    }

    // Set CORS headers
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods', 
      this.config.cors?.allowedMethods?.join(', ') || 'GET, POST, PUT, DELETE, PATCH'
    );
    response.headers.set(
      'Access-Control-Allow-Headers', 
      'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
    );

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return { blocked: true, response: new NextResponse(null, { status: 200, headers: response.headers }) };
    }

    return { blocked: false };
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(
    ipAddress: string, 
    url: string
  ): { blocked: boolean; remaining: number; resetTime: number } {
    const key = `${ipAddress}:${url}`;
    const now = Date.now();
    const windowMs = this.config.rateLimit!.windowMs;
    const maxRequests = this.config.rateLimit!.max;

    let bucket = rateLimitStore.get(key);
    if (!bucket || now > bucket.resetTime) {
      bucket = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, bucket);
    }

    bucket.count++;

    const blocked = bucket.count > maxRequests;
    const remaining = Math.max(0, maxRequests - bucket.count);

    return { blocked, remaining, resetTime: bucket.resetTime };
  }

  /**
   * Validate request input for common attack patterns
   */
  private async validateRequestInput(request: NextRequest): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    const errors: string[] = [];

    try {
      // Check URL for attack patterns
      if (InputValidator.containsAttackPatterns(request.url)) {
        errors.push('URL contains suspicious patterns');
      }

      // Check headers for attack patterns
      const suspiciousHeaders = ['user-agent', 'referer', 'x-forwarded-for'];
      for (const header of suspiciousHeaders) {
        const value = request.headers.get(header);
        if (value && InputValidator.containsAttackPatterns(value)) {
          errors.push(`Header ${header} contains suspicious patterns`);
        }
      }

      // Validate request body if present
      if (request.body && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        try {
          const body = await request.clone().text();
          if (body && InputValidator.containsAttackPatterns(body)) {
            errors.push('Request body contains suspicious patterns');
          }
        } catch (error) {
          // If we can't parse the body, continue (it might be binary data)
        }
      }

      return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
    } catch (error) {
      return { valid: false, errors: ['Failed to validate request input'] };
    }
  }

  /**
   * Check authentication
   */
  private async checkAuthentication(request: NextRequest): Promise<{
    authenticated: boolean;
    user?: any;
  }> {
    try {
      // Get authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false };
      }

      const token = authHeader.substring(7);
      
      // Validate token (implement your token validation logic here)
      // This is a placeholder - you would integrate with Firebase Auth or your auth system
      const user = await this.validateAuthToken(token);
      
      return { 
        authenticated: !!user, 
        user: user ? { uid: user.uid, email: user.email, role: user.role } : undefined 
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return { authenticated: false };
    }
  }

  /**
   * Validate authentication token (placeholder)
   */
  private async validateAuthToken(token: string): Promise<any> {
    // Placeholder for token validation
    // In a real implementation, this would verify the JWT token with Firebase Auth
    // or your authentication provider
    
    // For now, return null to indicate invalid token
    return null;
  }

  /**
   * Check authorization
   */
  private async checkAuthorization(request: NextRequest, user: any): Promise<{
    authorized: boolean;
    reason?: string;
  }> {
    try {
      const config = this.config.authorization!;
      
      // Check minimum role requirement
      if (config.requiredRole) {
        const userRoleLevel = ROLE_HIERARCHY[user.role as UserRole] || 0;
        const requiredRoleLevel = ROLE_HIERARCHY[config.requiredRole] || 0;
        
        if (userRoleLevel < requiredRoleLevel) {
          return { 
            authorized: false, 
            reason: `Role ${user.role} insufficient, requires ${config.requiredRole} or higher` 
          };
        }
      }

      // Check specific permission requirement
      if (config.requiredPermission) {
        if (!hasPermission(user.role, config.requiredPermission)) {
          return { 
            authorized: false, 
            reason: `Missing required permission: ${config.requiredPermission}` 
          };
        }
      }

      // Check resource-specific authorization
      if (config.resourceCheck) {
        const resourceAllowed = await config.resourceCheck(request, user);
        if (!resourceAllowed) {
          return { 
            authorized: false, 
            reason: 'Resource access denied' 
          };
        }
      }

      return { authorized: true };
    } catch (error) {
      console.error('Authorization error:', error);
      return { authorized: false, reason: 'Authorization check failed' };
    }
  }

  /**
   * Validate CSRF token
   */
  private validateCSRF(request: NextRequest): { valid: boolean } {
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionCsrf = request.headers.get('x-session-csrf'); // From cookie or session
    
    if (!csrfToken || !sessionCsrf) {
      return { valid: false };
    }

    return { valid: SecurityHeaders.validateCsrfToken(csrfToken, sessionCsrf) };
  }

  /**
   * Check if URL is exempt from authentication
   */
  private isExemptFromAuth(url: string): boolean {
    const exemptPaths = this.config.authentication?.allowAnonymous || [];
    return exemptPaths.some(path => url.startsWith(path));
  }

  /**
   * Get client information from request
   */
  private getClientInfo(request: NextRequest): { ipAddress: string; userAgent?: string } {
    return {
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                request.ip || 
                'unknown',
      userAgent: request.headers.get('user-agent') || undefined
    };
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(
    eventType: AuditEventType,
    action: string,
    clientInfo: { ipAddress: string; userAgent?: string },
    details: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await AuditLogger.logSecurityEvent(
      eventType,
      AuditSeverity.HIGH,
      action,
      details,
      userId,
      clientInfo.ipAddress,
      clientInfo.userAgent
    );
  }

  /**
   * Log successful request
   */
  private async logRequestSuccess(
    request: NextRequest,
    user: any,
    clientInfo: { ipAddress: string; userAgent?: string },
    startTime: number
  ): Promise<void> {
    if (this.config.logging?.logLevel === 'minimal') return;

    const duration = Date.now() - startTime;
    
    await AuditLogger.log({
      eventType: AuditEventType.SYSTEM_ERROR, // Use appropriate event type
      severity: AuditSeverity.LOW,
      userId: user?.uid,
      userRole: user?.role,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      action: `${request.method} ${request.url}`,
      success: true,
      details: {
        method: request.method,
        url: request.url,
        duration
      }
    });
  }

  /**
   * Create error response
   */
  private createErrorResponse(status: number, message: string, baseResponse: NextResponse): NextResponse {
    const response = NextResponse.json(
      { error: message, status },
      { status, headers: baseResponse.headers }
    );
    
    this.applySecurityHeaders(response);
    return response;
  }
}

// Convenience functions for common middleware configurations
export const createAuthMiddleware = (requiredRole?: UserRole, requiredPermission?: string) => {
  return new SecurityMiddleware({
    authentication: { required: true },
    authorization: { requiredRole, requiredPermission },
    logging: { enabled: true, logLevel: 'standard' }
  });
};

export const createPublicMiddleware = () => {
  return new SecurityMiddleware({
    authentication: { required: false },
    rateLimit: { windowMs: 15 * 60 * 1000, max: 200 }, // Higher limit for public endpoints
    logging: { enabled: true, logLevel: 'minimal' }
  });
};

export const createAdminMiddleware = () => {
  return new SecurityMiddleware({
    authentication: { required: true },
    authorization: { requiredRole: 'admin' },
    rateLimit: { windowMs: 15 * 60 * 1000, max: 50 }, // Lower limit for admin endpoints
    logging: { enabled: true, logLevel: 'detailed' }
  });
};

// Export the main middleware for Next.js
export default function securityMiddleware(config?: Partial<SecurityMiddlewareConfig>) {
  const middleware = new SecurityMiddleware(config);
  
  return async (request: NextRequest) => {
    return await middleware.handle(request);
  };
}

// Cleanup function for rate limiting store (should be called periodically)
export const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now > bucket.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};