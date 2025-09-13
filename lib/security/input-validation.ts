import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Regex patterns for common validations
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  slug: /^[a-z0-9-]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  name: /^[a-zA-Z\s\-\'\.]{2,50}$/,
  company: /^[a-zA-Z0-9\s\-\&\.,\']{2,100}$/,
  // Prevent common injection attacks
  noSqlInjection: /^(?!.*(\$|\{|\}|\\)).*$/,
  noXss: /^(?!.*(<script|javascript:|vbscript:|onload|onerror)).*$/i
};

// Input sanitization functions
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    if (!input) return '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false
    });
  }

  /**
   * Sanitize plain text to remove potentially dangerous characters
   */
  static sanitizeText(input: string): string {
    if (!input) return '';
    return input
      .replace(/[<>'"&]/g, (char) => {
        const entityMap: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '&': '&amp;'
        };
        return entityMap[char] || char;
      })
      .trim();
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(input: string): string {
    if (!input) return '';
    return input.toLowerCase().trim().replace(/[^\w@.-]/g, '');
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhone(input: string): string {
    if (!input) return '';
    return input.replace(/[^\d\+\-\s\(\)]/g, '').trim();
  }

  /**
   * Sanitize URL input
   */
  static sanitizeUrl(input: string): string {
    if (!input) return '';
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.toString();
    } catch {
      return '';
    }
  }

  /**
   * Remove SQL injection patterns
   */
  static sanitizeForDatabase(input: string): string {
    if (!input) return '';
    return input
      .replace(/[;'"\\]|--|\/\*|\*\//g, '')
      .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|UNION|SELECT)\b/gi, '')
      .trim();
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(input: string): string {
    if (!input) return '';
    return input
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }
}

// Validation schemas using Zod
export const ValidationSchemas = {
  // User input schemas
  userRegistration: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(VALIDATION_PATTERNS.name, 'Invalid name format'),
    email: z.string()
      .email('Invalid email format')
      .max(100, 'Email must be less than 100 characters'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
  }),

  userProfile: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(VALIDATION_PATTERNS.name, 'Invalid name format'),
    email: z.string()
      .email('Invalid email format')
      .max(100, 'Email must be less than 100 characters'),
    phone: z.string()
      .regex(VALIDATION_PATTERNS.phone, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    bio: z.string()
      .max(500, 'Bio must be less than 500 characters')
      .optional()
  }),

  // Client data schemas
  clientData: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .regex(VALIDATION_PATTERNS.name, 'Invalid name format'),
    email: z.string()
      .email('Invalid email format')
      .max(100, 'Email must be less than 100 characters'),
    phone: z.string()
      .regex(VALIDATION_PATTERNS.phone, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    company: z.string()
      .max(100, 'Company name must be less than 100 characters')
      .regex(VALIDATION_PATTERNS.company, 'Invalid company name format')
      .optional()
      .or(z.literal('')),
    website: z.string()
      .regex(VALIDATION_PATTERNS.url, 'Invalid URL format')
      .optional()
      .or(z.literal('')),
    notes: z.string()
      .max(2000, 'Notes must be less than 2000 characters')
      .optional()
  }),

  // Task schemas
  taskData: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(200, 'Title must be less than 200 characters'),
    description: z.string()
      .max(2000, 'Description must be less than 2000 characters')
      .optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    dueDate: z.date(),
    estimatedHours: z.number()
      .min(0.1, 'Estimated hours must be at least 0.1')
      .max(1000, 'Estimated hours must be less than 1000')
      .optional()
  }),

  // Inquiry/Contact form schemas  
  inquiryData: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .regex(VALIDATION_PATTERNS.name, 'Invalid name format'),
    email: z.string()
      .email('Invalid email format')
      .max(100, 'Email must be less than 100 characters'),
    phone: z.string()
      .regex(VALIDATION_PATTERNS.phone, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    company: z.string()
      .max(100, 'Company name must be less than 100 characters')
      .optional()
      .or(z.literal('')),
    message: z.string()
      .min(10, 'Message must be at least 10 characters')
      .max(2000, 'Message must be less than 2000 characters'),
    budget: z.string()
      .max(50, 'Budget must be less than 50 characters')
      .optional(),
    timeline: z.string()
      .max(100, 'Timeline must be less than 100 characters')
      .optional()
  }),

  // Comment/interaction schemas
  commentData: z.object({
    content: z.string()
      .min(1, 'Content cannot be empty')
      .max(1000, 'Content must be less than 1000 characters'),
    isPrivate: z.boolean().optional()
  })
};

// Input validation utilities
export class InputValidator {
  /**
   * Validate and sanitize user input based on schema
   */
  static async validateInput<T>(
    schema: z.ZodSchema<T>,
    input: unknown,
    sanitize = true
  ): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
    try {
      let processedInput = input;
      
      if (sanitize && typeof input === 'object' && input !== null) {
        processedInput = this.sanitizeObjectValues(input);
      }

      const data = schema.parse(processedInput);
      return { success: true, data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  /**
   * Recursively sanitize object values
   */
  private static sanitizeObjectValues(obj: any): any {
    if (typeof obj === 'string') {
      return InputSanitizer.sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObjectValues(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObjectValues(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Check for common attack patterns
   */
  static containsAttackPatterns(input: string): boolean {
    if (!input) return false;
    
    const attackPatterns = [
      // XSS patterns
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      
      // SQL injection patterns
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b)/gi,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
      /['";][\s\S]*?(--|\#|\/\*)/gi,
      
      // NoSQL injection patterns
      /\$where/gi,
      /\$ne/gi,
      /\$gt/gi,
      /\$lt/gi,
      
      // Path traversal
      /\.\.\//gi,
      /\.\.\\/gi,
      
      // Command injection
      /[;&|`$]/gi
    ];

    return attackPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): { valid: boolean; error?: string } {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt']
    } = options;

    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext.toLowerCase()));
    if (!hasValidExtension) {
      return { valid: false, error: 'File extension not allowed' };
    }

    // Check for dangerous file names
    if (InputValidator.containsAttackPatterns(file.name)) {
      return { valid: false, error: 'File name contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Rate limiting validation
   */
  static createRateLimiter(windowMs: number, maxRequests: number) {
    const requests = new Map<string, number[]>();
    
    return {
      isAllowed: (identifier: string): boolean => {
        const now = Date.now();
        const userRequests = requests.get(identifier) || [];
        
        // Remove old requests outside the window
        const validRequests = userRequests.filter(time => now - time < windowMs);
        
        if (validRequests.length >= maxRequests) {
          return false;
        }
        
        validRequests.push(now);
        requests.set(identifier, validRequests);
        return true;
      },
      
      cleanup: () => {
        const now = Date.now();
        for (const [identifier, times] of requests.entries()) {
          const validTimes = times.filter(time => now - time < windowMs);
          if (validTimes.length === 0) {
            requests.delete(identifier);
          } else {
            requests.set(identifier, validTimes);
          }
        }
      }
    };
  }
}

// Security headers and CSRF protection
export class SecurityHeaders {
  /**
   * Generate secure headers for responses
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.upface.dev",
        "frame-ancestors 'none'"
      ].join('; '),
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }

  /**
   * Generate CSRF token
   */
  static generateCsrfToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for server-side
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate CSRF token
   */
  static validateCsrfToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) return false;
    return token === expectedToken;
  }
}

// Secure session management
export class SecureSession {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly MAX_SESSIONS = 3; // Max concurrent sessions per user

  /**
   * Create secure session data
   */
  static createSession(userId: string, role: string): {
    sessionId: string;
    expiresAt: Date;
    csrfToken: string;
  } {
    const sessionId = SecurityHeaders.generateCsrfToken();
    const csrfToken = SecurityHeaders.generateCsrfToken();
    const expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

    return {
      sessionId,
      expiresAt,
      csrfToken
    };
  }

  /**
   * Validate session
   */
  static isValidSession(session: {
    expiresAt: Date;
    lastActivity?: Date;
  }): boolean {
    const now = new Date();
    
    // Check expiration
    if (session.expiresAt < now) {
      return false;
    }

    // Check for session timeout due to inactivity
    if (session.lastActivity && 
        (now.getTime() - session.lastActivity.getTime()) > this.SESSION_TIMEOUT) {
      return false;
    }

    return true;
  }

  /**
   * Generate secure password hash (for documentation - actual hashing done by Firebase Auth)
   */
  static getPasswordRequirements(): {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  } {
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    };
  }
}

export default {
  InputSanitizer,
  InputValidator,
  ValidationSchemas,
  SecurityHeaders,
  SecureSession,
  VALIDATION_PATTERNS
};