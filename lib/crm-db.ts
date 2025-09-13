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
  AcquisitionSource
} from './crm-types';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  INTERACTIONS: 'interactions',
  FOLLOW_UPS: 'followUps',
  INQUIRIES: 'inquiries',
  PROFILE_VIEWS: 'profileViews'
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