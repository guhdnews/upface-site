import { 
  ClientService,
  UserService,
  InteractionService,
  InquiryService,
  TaskService,
  FollowUpService,
  ClientAssignmentService,
  UserProfileService
} from '../crm-db';
import { 
  InputValidator,
  InputSanitizer,
  ValidationSchemas,
  SecurityHeaders
} from './input-validation';
import { 
  Client, 
  User, 
  Interaction, 
  Inquiry, 
  Task, 
  FollowUp, 
  ClientAssignment,
  UserProfile 
} from '../crm-types';
import { UserRole } from '../permissions';

// Secure wrapper for CRM operations with input validation and sanitization
export class SecureCRMService {
  
  // Rate limiters for different operations
  private static clientCreationLimiter = InputValidator.createRateLimiter(60000, 5); // 5 per minute
  private static inquiryLimiter = InputValidator.createRateLimiter(300000, 3); // 3 per 5 minutes
  private static interactionLimiter = InputValidator.createRateLimiter(60000, 10); // 10 per minute
  
  /**
   * Security wrapper for client operations
   */
  static Client = class {
    static async create(
      clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'interactions' | 'followUps' | 'profileViews'>,
      userId: string,
      csrfToken?: string
    ): Promise<string> {
      // Rate limiting
      if (!this.clientCreationLimiter.isAllowed(userId)) {
        throw new Error('Rate limit exceeded for client creation');
      }

      // Input validation
      const validation = await InputValidator.validateInput(
        ValidationSchemas.clientData,
        clientData,
        true
      );
      
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.errors.issues.map(i => i.message).join(', ')}`);
      }

      // Additional security checks
      if (InputValidator.containsAttackPatterns(clientData.notes || '')) {
        throw new Error('Invalid characters detected in input');
      }

      // Sanitize data before storage
      const sanitizedData = {
        ...validation.data,
        name: InputSanitizer.sanitizeText(validation.data.name),
        email: InputSanitizer.sanitizeEmail(validation.data.email),
        phone: validation.data.phone ? InputSanitizer.sanitizePhone(validation.data.phone) : undefined,
        company: validation.data.company ? InputSanitizer.sanitizeText(validation.data.company) : undefined,
        website: validation.data.website ? InputSanitizer.sanitizeUrl(validation.data.website) : undefined,
        notes: validation.data.notes ? InputSanitizer.sanitizeHtml(validation.data.notes) : undefined
      };

      return await ClientService.createClient(sanitizedData);
    }

    static async update(
      clientId: string,
      updates: Partial<Client>,
      userId: string,
      userRole: UserRole
    ): Promise<void> {
      // Validate client ID format
      if (!clientId || clientId.length < 10) {
        throw new Error('Invalid client ID');
      }

      // Validate updates
      if (updates.name || updates.email || updates.phone || updates.company) {
        const validation = await InputValidator.validateInput(
          ValidationSchemas.clientData.partial(),
          updates,
          true
        );
        
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.errors.issues.map(i => i.message).join(', ')}`);
        }
      }

      // Security checks
      const sanitizedUpdates: Partial<Client> = {};
      
      if (updates.name) {
        sanitizedUpdates.name = InputSanitizer.sanitizeText(updates.name);
      }
      if (updates.email) {
        sanitizedUpdates.email = InputSanitizer.sanitizeEmail(updates.email);
      }
      if (updates.phone) {
        sanitizedUpdates.phone = InputSanitizer.sanitizePhone(updates.phone);
      }
      if (updates.company) {
        sanitizedUpdates.company = InputSanitizer.sanitizeText(updates.company);
      }
      if (updates.website) {
        sanitizedUpdates.website = InputSanitizer.sanitizeUrl(updates.website);
      }
      if (updates.notes) {
        if (InputValidator.containsAttackPatterns(updates.notes)) {
          throw new Error('Invalid characters detected in notes');
        }
        sanitizedUpdates.notes = InputSanitizer.sanitizeHtml(updates.notes);
      }

      return await ClientService.updateClient(clientId, sanitizedUpdates);
    }

    static async get(clientId: string, userId: string, userRole: UserRole): Promise<Client | null> {
      if (!clientId || clientId.length < 10) {
        throw new Error('Invalid client ID');
      }

      const client = await ClientService.getClient(clientId);
      
      // Check if user has permission to view this client
      if (client && client.assignedTo && client.assignedTo !== userId && userRole === 'agent') {
        throw new Error('Insufficient permissions to view this client');
      }

      return client;
    }

    static async getAll(userId: string, userRole: UserRole): Promise<Client[]> {
      if (userRole === 'agent') {
        // Agents can only see their assigned clients
        return await ClientService.getClientsByUser(userId);
      } else {
        // Managers and above can see all clients
        return await ClientService.getAllClients();
      }
    }

    static async delete(clientId: string, userId: string, userRole: UserRole): Promise<void> {
      if (!clientId || clientId.length < 10) {
        throw new Error('Invalid client ID');
      }

      // Only managers and above can delete clients
      if (!['manager', 'admin', 'owner'].includes(userRole)) {
        throw new Error('Insufficient permissions to delete clients');
      }

      // Additional check: get client to verify it exists and user has access
      const client = await this.get(clientId, userId, userRole);
      if (!client) {
        throw new Error('Client not found');
      }

      return await ClientService.deleteClient(clientId);
    }
  };

  /**
   * Security wrapper for inquiry operations
   */
  static Inquiry = class {
    static async create(
      inquiryData: Omit<Inquiry, 'id' | 'submittedAt' | 'status'>,
      clientIp?: string
    ): Promise<string> {
      // Rate limiting by IP address
      const rateLimitKey = clientIp || 'anonymous';
      if (!SecureCRMService.inquiryLimiter.isAllowed(rateLimitKey)) {
        throw new Error('Rate limit exceeded for inquiry submission');
      }

      // Input validation
      const validation = await InputValidator.validateInput(
        ValidationSchemas.inquiryData,
        inquiryData,
        true
      );
      
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.errors.issues.map(i => i.message).join(', ')}`);
      }

      // Security checks
      if (InputValidator.containsAttackPatterns(validation.data.message)) {
        throw new Error('Invalid characters detected in message');
      }

      // Sanitize data
      const sanitizedData = {
        ...validation.data,
        name: InputSanitizer.sanitizeText(validation.data.name),
        email: InputSanitizer.sanitizeEmail(validation.data.email),
        phone: validation.data.phone ? InputSanitizer.sanitizePhone(validation.data.phone) : undefined,
        company: validation.data.company ? InputSanitizer.sanitizeText(validation.data.company) : undefined,
        message: InputSanitizer.sanitizeHtml(validation.data.message),
        budget: validation.data.budget ? InputSanitizer.sanitizeText(validation.data.budget) : undefined,
        timeline: validation.data.timeline ? InputSanitizer.sanitizeText(validation.data.timeline) : undefined
      };

      return await InquiryService.createInquiry(sanitizedData);
    }

    static async getNew(userId: string, userRole: UserRole): Promise<Inquiry[]> {
      // Only staff can view inquiries
      if (userRole === 'agent' && !['manager', 'admin', 'owner'].includes(userRole)) {
        // Agents need manager+ permission to view inquiries
      }

      return await InquiryService.getNewInquiries();
    }

    static async convertToClient(
      inquiryId: string, 
      clientData: { acquisitionSource: any; assignedTo?: string },
      userId: string,
      userRole: UserRole
    ): Promise<string> {
      if (!inquiryId || inquiryId.length < 10) {
        throw new Error('Invalid inquiry ID');
      }

      // Only managers and above can convert inquiries
      if (!['manager', 'admin', 'owner'].includes(userRole)) {
        throw new Error('Insufficient permissions to convert inquiries');
      }

      return await InquiryService.convertInquiryToClient(inquiryId, clientData);
    }
  };

  /**
   * Security wrapper for task operations
   */
  static Task = class {
    static async create(
      taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'subtasks'>,
      userId: string,
      userRole: UserRole
    ): Promise<string> {
      // Input validation
      const validation = await InputValidator.validateInput(
        ValidationSchemas.taskData,
        taskData,
        true
      );
      
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.errors.issues.map(i => i.message).join(', ')}`);
      }

      // Security checks
      if (validation.data.description && InputValidator.containsAttackPatterns(validation.data.description)) {
        throw new Error('Invalid characters detected in description');
      }

      // Sanitize data
      const sanitizedData = {
        ...validation.data,
        title: InputSanitizer.sanitizeText(validation.data.title),
        description: validation.data.description ? InputSanitizer.sanitizeHtml(validation.data.description) : undefined
      };

      return await TaskService.createTask(sanitizedData);
    }

    static async update(
      taskId: string,
      updates: Partial<Task>,
      userId: string,
      userRole: UserRole
    ): Promise<void> {
      if (!taskId || taskId.length < 10) {
        throw new Error('Invalid task ID');
      }

      // Get current task to check permissions
      const currentTask = await TaskService.getTask(taskId);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      // Check permissions - users can only edit their own tasks unless they're managers+
      if (currentTask.assignedTo !== userId && !['manager', 'admin', 'owner'].includes(userRole)) {
        throw new Error('Insufficient permissions to edit this task');
      }

      // Validate and sanitize updates
      const sanitizedUpdates: Partial<Task> = {};
      
      if (updates.title) {
        sanitizedUpdates.title = InputSanitizer.sanitizeText(updates.title);
      }
      if (updates.description) {
        if (InputValidator.containsAttackPatterns(updates.description)) {
          throw new Error('Invalid characters detected in description');
        }
        sanitizedUpdates.description = InputSanitizer.sanitizeHtml(updates.description);
      }
      if (updates.status) {
        sanitizedUpdates.status = updates.status;
      }
      if (updates.priority) {
        sanitizedUpdates.priority = updates.priority;
      }
      if (updates.dueDate) {
        sanitizedUpdates.dueDate = updates.dueDate;
      }

      return await TaskService.updateTask(taskId, sanitizedUpdates);
    }

    static async get(taskId: string, userId: string, userRole: UserRole): Promise<Task | null> {
      if (!taskId || taskId.length < 10) {
        throw new Error('Invalid task ID');
      }

      const task = await TaskService.getTask(taskId);
      
      // Check permissions
      if (task && task.assignedTo !== userId && !['manager', 'admin', 'owner'].includes(userRole)) {
        throw new Error('Insufficient permissions to view this task');
      }

      return task;
    }

    static async getUserTasks(targetUserId: string, requestingUserId: string, userRole: UserRole): Promise<Task[]> {
      // Users can view their own tasks, managers+ can view anyone's tasks
      if (targetUserId !== requestingUserId && !['manager', 'admin', 'owner'].includes(userRole)) {
        throw new Error('Insufficient permissions to view these tasks');
      }

      return await TaskService.getTasksByUser(targetUserId);
    }

    static async addComment(
      taskId: string,
      commentData: { content: string; isPrivate?: boolean },
      userId: string,
      userRole: UserRole
    ): Promise<string> {
      if (!taskId || taskId.length < 10) {
        throw new Error('Invalid task ID');
      }

      // Validate comment
      const validation = await InputValidator.validateInput(
        ValidationSchemas.commentData,
        commentData,
        true
      );
      
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.errors.issues.map(i => i.message).join(', ')}`);
      }

      // Security check
      if (InputValidator.containsAttackPatterns(validation.data.content)) {
        throw new Error('Invalid characters detected in comment');
      }

      // Check task access permissions
      const task = await this.get(taskId, userId, userRole);
      if (!task) {
        throw new Error('Task not found or insufficient permissions');
      }

      const sanitizedComment = {
        content: InputSanitizer.sanitizeHtml(validation.data.content),
        userId,
        isPrivate: validation.data.isPrivate || false
      };

      return await TaskService.addTaskComment(taskId, sanitizedComment);
    }
  };

  /**
   * Security wrapper for interaction operations
   */
  static Interaction = class {
    static async create(
      interactionData: Omit<Interaction, 'id'>,
      userId: string,
      userRole: UserRole
    ): Promise<string> {
      // Rate limiting
      if (!SecureCRMService.interactionLimiter.isAllowed(userId)) {
        throw new Error('Rate limit exceeded for interaction creation');
      }

      if (!interactionData.clientId || interactionData.clientId.length < 10) {
        throw new Error('Invalid client ID');
      }

      // Check if user has access to the client
      const client = await SecureCRMService.Client.get(interactionData.clientId, userId, userRole);
      if (!client) {
        throw new Error('Client not found or insufficient permissions');
      }

      // Sanitize interaction data
      const sanitizedData = {
        ...interactionData,
        type: InputSanitizer.sanitizeText(interactionData.type),
        notes: InputSanitizer.sanitizeHtml(interactionData.notes || ''),
        outcome: interactionData.outcome ? InputSanitizer.sanitizeText(interactionData.outcome) : undefined
      };

      // Security check
      if (InputValidator.containsAttackPatterns(sanitizedData.notes)) {
        throw new Error('Invalid characters detected in notes');
      }

      return await InteractionService.createInteraction(sanitizedData);
    }

    static async getByClient(clientId: string, userId: string, userRole: UserRole): Promise<Interaction[]> {
      // First check if user has access to the client
      const client = await SecureCRMService.Client.get(clientId, userId, userRole);
      if (!client) {
        throw new Error('Client not found or insufficient permissions');
      }

      return await InteractionService.getInteractionsByClient(clientId);
    }
  };

  /**
   * Security wrapper for user operations
   */
  static User = class {
    static async get(userId: string, requestingUserId: string, userRole: UserRole): Promise<User | null> {
      if (!userId || userId.length < 10) {
        throw new Error('Invalid user ID');
      }

      // Users can view their own profile, managers+ can view anyone's
      if (userId !== requestingUserId && !['manager', 'admin', 'owner'].includes(userRole)) {
        throw new Error('Insufficient permissions to view this user');
      }

      return await UserService.getUser(userId);
    }

    static async getAll(requestingUserId: string, userRole: UserRole): Promise<User[]> {
      // Only managers and above can view all users
      if (!['manager', 'admin', 'owner'].includes(userRole)) {
        throw new Error('Insufficient permissions to view all users');
      }

      return await UserService.getAllUsers();
    }

    static async update(
      userId: string, 
      updates: Partial<User>, 
      requestingUserId: string, 
      userRole: UserRole
    ): Promise<void> {
      if (!userId || userId.length < 10) {
        throw new Error('Invalid user ID');
      }

      // Users can only update their own profile, unless they're managers+ updating others
      if (userId !== requestingUserId && !['manager', 'admin', 'owner'].includes(userRole)) {
        throw new Error('Insufficient permissions to update this user');
      }

      // Validate and sanitize updates
      if (updates.name || updates.email) {
        const validation = await InputValidator.validateInput(
          ValidationSchemas.userProfile.partial(),
          updates,
          true
        );
        
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.errors.issues.map(i => i.message).join(', ')}`);
        }
      }

      const sanitizedUpdates: Partial<User> = {};
      
      if (updates.name) {
        sanitizedUpdates.name = InputSanitizer.sanitizeText(updates.name);
      }
      if (updates.email) {
        sanitizedUpdates.email = InputSanitizer.sanitizeEmail(updates.email);
      }
      if (updates.phone) {
        sanitizedUpdates.phone = InputSanitizer.sanitizePhone(updates.phone);
      }

      return await UserService.updateUser(userId, sanitizedUpdates);
    }
  };

  /**
   * Clean up rate limiters periodically
   */
  static cleanupRateLimiters(): void {
    this.clientCreationLimiter.cleanup();
    this.inquiryLimiter.cleanup();
    this.interactionLimiter.cleanup();
  }

  /**
   * Get security headers for API responses
   */
  static getSecurityHeaders(): Record<string, string> {
    return SecurityHeaders.getSecurityHeaders();
  }

  /**
   * Generate CSRF token for forms
   */
  static generateCsrfToken(): string {
    return SecurityHeaders.generateCsrfToken();
  }

  /**
   * Validate CSRF token
   */
  static validateCsrfToken(token: string, expectedToken: string): boolean {
    return SecurityHeaders.validateCsrfToken(token, expectedToken);
  }
}

// Export individual secure services for convenience
export const SecureClientService = SecureCRMService.Client;
export const SecureInquiryService = SecureCRMService.Inquiry;
export const SecureTaskService = SecureCRMService.Task;
export const SecureInteractionService = SecureCRMService.Interaction;
export const SecureUserService = SecureCRMService.User;

export default SecureCRMService;