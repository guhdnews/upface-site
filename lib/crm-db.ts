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
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import { 
  User, 
  Client, 
  Interaction, 
  FollowUp, 
  Inquiry,
  Task,
  TaskComment,
  ClientAssignment,
  UserProfile,
  TaskAnalytics,
  UserPerformance,
  ProjectTemplate,
  AcquisitionSource
} from './crm-types';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  INTERACTIONS: 'interactions',
  FOLLOW_UPS: 'followUps',
  INQUIRIES: 'inquiries',
  PROFILE_VIEWS: 'profileViews',
  TASKS: 'tasks',
  TASK_COMMENTS: 'taskComments',
  CLIENT_ASSIGNMENTS: 'clientAssignments',
  USER_PROFILES: 'userProfiles',
  PROJECT_TEMPLATES: 'projectTemplates'
} as const;

// Define Firestore Timestamp interface
interface FirestoreTimestamp {
  toDate(): Date;
}

// Utility to convert Firestore timestamps to Date objects
export const convertTimestampToDate = (timestamp: unknown): Date => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as FirestoreTimestamp).toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp as string | number);
};

// User Management
export class UserService {
  static async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async getUser(userId: string): Promise<User | null> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestampToDate(data.createdAt),
        lastLogin: data.lastLogin ? convertTimestampToDate(data.lastLogin) : undefined,
      } as User;
    }
    return null;
  }

  static async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToDate(doc.data().createdAt),
      lastLogin: doc.data().lastLogin ? convertTimestampToDate(doc.data().lastLogin) : undefined,
    } as User));
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, updates);
  }

  static async deleteUser(userId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(docRef);
  }
}

// Client Management
export class ClientService {
  static async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'interactions' | 'followUps' | 'profileViews'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CLIENTS), {
      ...clientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      interactions: [],
      followUps: [],
      profileViews: []
    });
    return docRef.id;
  }

  static async getClient(clientId: string): Promise<Client | null> {
    const docRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as Client;
    }
    return null;
  }

  static async getAllClients(): Promise<Client[]> {
    const q = query(collection(db, COLLECTIONS.CLIENTS), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToDate(doc.data().createdAt),
      updatedAt: convertTimestampToDate(doc.data().updatedAt),
    } as Client));
  }

  static async getClientsByUser(userId: string): Promise<Client[]> {
    const q = query(
      collection(db, COLLECTIONS.CLIENTS), 
      where('assignedTo', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToDate(doc.data().createdAt),
      updatedAt: convertTimestampToDate(doc.data().updatedAt),
    } as Client));
  }

  static async updateClient(clientId: string, updates: Partial<Client>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  static async deleteClient(clientId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    await deleteDoc(docRef);
  }

  static async logProfileView(clientId: string, userId: string): Promise<void> {
    try {
      // Use Cloud Function for profile view logging
      const logProfileViewFunction = httpsCallable(functions, 'logProfileView');
      await logProfileViewFunction({ clientId });
    } catch (error) {
      console.error('Error logging profile view via Cloud Function, falling back to direct:', error);
      // Fallback to direct Firestore
      await addDoc(collection(db, COLLECTIONS.PROFILE_VIEWS), {
        clientId,
        userId,
        viewedAt: Timestamp.now()
      });
    }
  }
}

// Interaction Management
export class InteractionService {
  static async createInteraction(interactionData: Omit<Interaction, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.INTERACTIONS), {
      ...interactionData,
      date: Timestamp.fromDate(interactionData.date),
      followUpDate: interactionData.followUpDate ? Timestamp.fromDate(interactionData.followUpDate) : null
    });
    
    // Update client's last interaction
    await ClientService.updateClient(interactionData.clientId, {
      updatedAt: new Date()
    });
    
    return docRef.id;
  }

  static async getInteractionsByClient(clientId: string): Promise<Interaction[]> {
    const q = query(
      collection(db, COLLECTIONS.INTERACTIONS),
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: convertTimestampToDate(doc.data().date),
      followUpDate: doc.data().followUpDate ? convertTimestampToDate(doc.data().followUpDate) : undefined,
    } as Interaction));
  }
}

// Follow-up Management
export class FollowUpService {
  static async createFollowUp(followUpData: Omit<FollowUp, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.FOLLOW_UPS), {
      ...followUpData,
      dueDate: Timestamp.fromDate(followUpData.dueDate),
      completedDate: followUpData.completedDate ? Timestamp.fromDate(followUpData.completedDate) : null
    });
    return docRef.id;
  }

  static async getFollowUpsByUser(userId: string): Promise<FollowUp[]> {
    const q = query(
      collection(db, COLLECTIONS.FOLLOW_UPS),
      where('userId', '==', userId),
      where('completed', '==', false),
      orderBy('dueDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: convertTimestampToDate(doc.data().dueDate),
      completedDate: doc.data().completedDate ? convertTimestampToDate(doc.data().completedDate) : undefined,
    } as FollowUp));
  }

  static async getFollowUpsByAssignee(userId: string): Promise<FollowUp[]> {
    const q = query(
      collection(db, COLLECTIONS.FOLLOW_UPS),
      where('assignedTo', '==', userId),
      orderBy('dueDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dueDate: convertTimestampToDate(data.dueDate),
        completedDate: data.completedDate ? convertTimestampToDate(data.completedDate) : undefined,
      } as FollowUp;
    });
  }

  static async completeFollowUp(followUpId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.FOLLOW_UPS, followUpId);
    await updateDoc(docRef, {
      completed: true,
      completedDate: Timestamp.now()
    });
  }
}

// Inquiry Management
export class InquiryService {
  static async createInquiry(inquiryData: Omit<Inquiry, 'id' | 'submittedAt' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.INQUIRIES), {
      ...inquiryData,
      status: 'new',
      submittedAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async getNewInquiries(): Promise<Inquiry[]> {
    const q = query(
      collection(db, COLLECTIONS.INQUIRIES),
      where('status', '==', 'new'),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: convertTimestampToDate(doc.data().submittedAt),
    } as Inquiry));
  }

  static async convertInquiryToClient(inquiryId: string, clientData: {
    acquisitionSource: AcquisitionSource;
    assignedTo?: string;
  }): Promise<string> {
    try {
      // Use Cloud Function for inquiry conversion
      const convertFunction = httpsCallable(functions, 'convertInquiryToClient');
      const result = await convertFunction({
        inquiryId,
        acquisitionSource: clientData.acquisitionSource,
        assignedTo: clientData.assignedTo
      });
      
      const data = result.data as { success: boolean; clientId: string; message: string };
      if (data.success) {
        return data.clientId;
      } else {
        throw new Error('Cloud Function failed');
      }
    } catch (error) {
      console.error('Error converting inquiry via Cloud Function, falling back to direct:', error);
      
      // Fallback to direct Firestore operations
      const inquiryDoc = await getDoc(doc(db, COLLECTIONS.INQUIRIES, inquiryId));
      if (!inquiryDoc.exists()) throw new Error('Inquiry not found');
      
      const inquiry = inquiryDoc.data() as Inquiry;
      
      // Create client from inquiry
      const clientId = await ClientService.createClient({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        company: inquiry.company,
        acquisitionSource: clientData.acquisitionSource,
        status: 'lead',
        notes: `Converted from inquiry: ${inquiry.message}`,
        assignedTo: clientData.assignedTo
      });
      
      // Update inquiry status
      await updateDoc(doc(db, COLLECTIONS.INQUIRIES, inquiryId), {
        status: 'converted',
        convertedToClientId: clientId
      });
      
      return clientId;
    }
  }
}

// Real-time subscriptions
export class RealtimeService {
  static subscribeToFollowUps(userId: string, callback: (followUps: FollowUp[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.FOLLOW_UPS),
      where('userId', '==', userId),
      where('completed', '==', false),
      orderBy('dueDate', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const followUps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: convertTimestampToDate(doc.data().dueDate),
        completedDate: doc.data().completedDate ? convertTimestampToDate(doc.data().completedDate) : undefined,
      } as FollowUp));
      callback(followUps);
    });
  }

  static subscribeToNewInquiries(callback: (inquiries: Inquiry[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.INQUIRIES),
      where('status', '==', 'new'),
      orderBy('submittedAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const inquiries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: convertTimestampToDate(doc.data().submittedAt),
      } as Inquiry));
      callback(inquiries);
    });
  }
}

// Enhanced Task Management Service
export class TaskService {
  static async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'subtasks'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), {
      ...taskData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      dueDate: Timestamp.fromDate(taskData.dueDate),
      completedAt: taskData.completedAt ? Timestamp.fromDate(taskData.completedAt) : null,
      comments: [],
      attachments: [],
      subtasks: []
    });
    return docRef.id;
  }

  static async getTask(taskId: string): Promise<Task | null> {
    const docRef = doc(db, COLLECTIONS.TASKS, taskId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
        dueDate: convertTimestampToDate(data.dueDate),
        completedAt: data.completedAt ? convertTimestampToDate(data.completedAt) : undefined,
      } as Task;
    }
    return null;
  }

  static async getTasksByUser(userId: string, includeCompleted = false): Promise<Task[]> {
    let q = query(
      collection(db, COLLECTIONS.TASKS),
      where('assignedTo', '==', userId),
      orderBy('dueDate', 'asc')
    );

    if (!includeCompleted) {
      q = query(
        collection(db, COLLECTIONS.TASKS),
        where('assignedTo', '==', userId),
        where('status', '!=', 'completed'),
        orderBy('dueDate', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToDate(doc.data().createdAt),
      updatedAt: convertTimestampToDate(doc.data().updatedAt),
      dueDate: convertTimestampToDate(doc.data().dueDate),
      completedAt: doc.data().completedAt ? convertTimestampToDate(doc.data().completedAt) : undefined,
    } as Task));
  }

  static async getTasksByClient(clientId: string): Promise<Task[]> {
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToDate(doc.data().createdAt),
      updatedAt: convertTimestampToDate(doc.data().updatedAt),
      dueDate: convertTimestampToDate(doc.data().dueDate),
      completedAt: doc.data().completedAt ? convertTimestampToDate(doc.data().completedAt) : undefined,
    } as Task));
  }

  static async getAllTasks(filters?: { status?: string; priority?: string; type?: string }): Promise<Task[]> {
    let q = query(collection(db, COLLECTIONS.TASKS), orderBy('createdAt', 'desc'));

    if (filters) {
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToDate(doc.data().createdAt),
      updatedAt: convertTimestampToDate(doc.data().updatedAt),
      dueDate: convertTimestampToDate(doc.data().dueDate),
      completedAt: doc.data().completedAt ? convertTimestampToDate(doc.data().completedAt) : undefined,
    } as Task));
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TASKS, taskId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }
    if (updates.completedAt) {
      updateData.completedAt = Timestamp.fromDate(updates.completedAt);
    }
    if (updates.status === 'completed' && !updates.completedAt) {
      updateData.completedAt = Timestamp.now();
    }

    await updateDoc(docRef, updateData);
  }

  static async deleteTask(taskId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TASKS, taskId);
    await deleteDoc(docRef);
  }

  static async addTaskComment(taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.TASK_COMMENTS), {
      ...comment,
      taskId,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async getTaskComments(taskId: string): Promise<TaskComment[]> {
    const q = query(
      collection(db, COLLECTIONS.TASK_COMMENTS),
      where('taskId', '==', taskId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToDate(doc.data().createdAt),
      editedAt: doc.data().editedAt ? convertTimestampToDate(doc.data().editedAt) : undefined,
    } as TaskComment));
  }

  static async getTaskAnalytics(userId?: string, dateRange?: { start: Date; end: Date }): Promise<TaskAnalytics> {
    const q = collection(db, COLLECTIONS.TASKS);
    let queryRef = query(q);

    if (userId) {
      queryRef = query(queryRef, where('assignedTo', '==', userId));
    }

    if (dateRange) {
      queryRef = query(
        queryRef,
        where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
        where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
      );
    }

    const querySnapshot = await getDocs(queryRef);
    const tasks = querySnapshot.docs.map(doc => doc.data() as Task);

    const analytics: TaskAnalytics = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      overdueTasks: tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length,
      averageCompletionTime: 0,
      tasksByPriority: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length,
        urgent: tasks.filter(t => t.priority === 'urgent').length,
      },
      tasksByStatus: {
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        in_review: tasks.filter(t => t.status === 'in_review').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length,
      },
      tasksByType: {
        client_outreach: tasks.filter(t => t.type === 'client_outreach').length,
        project_work: tasks.filter(t => t.type === 'project_work').length,
        admin: tasks.filter(t => t.type === 'admin').length,
        meeting: tasks.filter(t => t.type === 'meeting').length,
        research: tasks.filter(t => t.type === 'research').length,
        proposal: tasks.filter(t => t.type === 'proposal').length,
        follow_up: tasks.filter(t => t.type === 'follow_up').length,
        bug_fix: tasks.filter(t => t.type === 'bug_fix').length,
        feature_development: tasks.filter(t => t.type === 'feature_development').length,
        testing: tasks.filter(t => t.type === 'testing').length,
        deployment: tasks.filter(t => t.type === 'deployment').length,
        training: tasks.filter(t => t.type === 'training').length,
        documentation: tasks.filter(t => t.type === 'documentation').length,
        other: tasks.filter(t => t.type === 'other').length,
      },
      productivityScore: 0
    };

    // Calculate average completion time and productivity score
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt);
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt).getTime();
        const completed = new Date(task.completedAt!).getTime();
        return sum + (completed - created);
      }, 0);
      analytics.averageCompletionTime = totalTime / completedTasks.length / (1000 * 60 * 60); // Convert to hours
    }

    // Simple productivity score calculation
    analytics.productivityScore = Math.min(100, Math.round(
      (analytics.completedTasks / Math.max(1, analytics.totalTasks)) * 100
    ));

    return analytics;
  }
}

// Client Assignment Service
export class ClientAssignmentService {
  static async assignClientToUser(assignment: Omit<ClientAssignment, 'id' | 'assignedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.CLIENT_ASSIGNMENTS), {
      ...assignment,
      assignedAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async getClientAssignments(clientId: string): Promise<ClientAssignment[]> {
    const q = query(
      collection(db, COLLECTIONS.CLIENT_ASSIGNMENTS),
      where('clientId', '==', clientId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      assignedAt: convertTimestampToDate(doc.data().assignedAt),
    } as ClientAssignment));
  }

  static async getUserAssignments(userId: string): Promise<ClientAssignment[]> {
    const q = query(
      collection(db, COLLECTIONS.CLIENT_ASSIGNMENTS),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      assignedAt: convertTimestampToDate(doc.data().assignedAt),
    } as ClientAssignment));
  }

  static async updateAssignment(assignmentId: string, updates: Partial<ClientAssignment>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.CLIENT_ASSIGNMENTS, assignmentId);
    await updateDoc(docRef, updates);
  }

  static async deactivateAssignment(assignmentId: string): Promise<void> {
    await this.updateAssignment(assignmentId, { isActive: false });
  }
}

// User Profile Service
export class UserProfileService {
  static async createUserProfile(profileData: Omit<UserProfile, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.USER_PROFILES), profileData);
    return docRef.id;
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const q = query(
      collection(db, COLLECTIONS.USER_PROFILES),
      where('userId', '==', userId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as UserProfile;
    }
    return null;
  }

  static async updateUserProfile(profileId: string, updates: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USER_PROFILES, profileId);
    await updateDoc(docRef, updates);
  }

  static async getUserPerformance(userId: string, period: { start: Date; end: Date }): Promise<UserPerformance> {
    const [tasks] = await Promise.all([
      this.getTasksInPeriod(userId, period),
      this.getClientInteractionsInPeriod(userId, period),
      ClientAssignmentService.getUserAssignments(userId)
    ]);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => 
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length;

    let avgCompletionTime = 0;
    const completedTasksWithTime = tasks.filter(t => t.status === 'completed' && t.completedAt);
    if (completedTasksWithTime.length > 0) {
      const totalTime = completedTasksWithTime.reduce((sum, task) => {
        const created = new Date(task.createdAt).getTime();
        const completed = new Date(task.completedAt!).getTime();
        return sum + (completed - created);
      }, 0);
      avgCompletionTime = totalTime / completedTasksWithTime.length / (1000 * 60 * 60);
    }

    return {
      userId,
      period,
      tasksCompleted: completedTasks,
      tasksOverdue: overdueTasks,
      averageCompletionTime: avgCompletionTime,
      clientsSatisfaction: 85, // TODO: Calculate based on client feedback
      revenueGenerated: 0, // TODO: Calculate based on won deals
      efficiency: tasks.reduce((sum, task) => {
        if (task.estimatedHours && task.actualHours) {
          return sum + (task.estimatedHours / task.actualHours);
        }
        return sum;
      }, 0) / Math.max(1, tasks.filter(t => t.estimatedHours && t.actualHours).length)
    };
  }

  private static async getTasksInPeriod(userId: string, period: { start: Date; end: Date }): Promise<Task[]> {
    const q = query(
      collection(db, COLLECTIONS.TASKS),
      where('assignedTo', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(period.start)),
      where('createdAt', '<=', Timestamp.fromDate(period.end))
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: convertTimestampToDate(doc.data().createdAt),
      updatedAt: convertTimestampToDate(doc.data().updatedAt),
      dueDate: convertTimestampToDate(doc.data().dueDate),
      completedAt: doc.data().completedAt ? convertTimestampToDate(doc.data().completedAt) : undefined,
    } as Task));
  }

  private static async getClientInteractionsInPeriod(userId: string, period: { start: Date; end: Date }): Promise<Interaction[]> {
    const q = query(
      collection(db, COLLECTIONS.INTERACTIONS),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(period.start)),
      where('date', '<=', Timestamp.fromDate(period.end))
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: convertTimestampToDate(doc.data().date),
    } as Interaction));
  }
}
