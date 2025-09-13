/**
 * Upface CRM Cloud Functions
 * 
 * These functions handle server-side operations for the CRM system:
 * - Processing contact form submissions
 * - Converting inquiries to clients
 * - Sending notifications
 * - Managing user permissions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

// Function to process contact form submissions
exports.processContactForm = onRequest({cors: true}, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({error: 'Method not allowed'});
    }

    const {name, email, phone, company, message, source} = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({error: 'Missing required fields'});
    }

    // Create inquiry document
    const inquiryData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      company: company ? company.trim() : null,
      message: message.trim(),
      source: source || 'contact_form',
      status: 'new',
      submittedAt: Timestamp.now(),
    };

    const docRef = await db.collection('inquiries').add(inquiryData);
    
    logger.info('New inquiry created', {inquiryId: docRef.id, email: email});
    
    return res.status(200).json({
      success: true,
      inquiryId: docRef.id,
      message: 'Inquiry submitted successfully'
    });

  } catch (error) {
    logger.error('Error processing contact form', error);
    return res.status(500).json({error: 'Internal server error'});
  }
});

// Function to convert inquiry to client
exports.convertInquiryToClient = onCall(async (request) => {
  try {
    const {inquiryId, acquisitionSource, assignedTo} = request.data;
    const userId = request.auth?.uid;

    if (!userId) {
      throw new Error('Authentication required');
    }

    // Get inquiry document
    const inquiryDoc = await db.collection('inquiries').doc(inquiryId).get();
    if (!inquiryDoc.exists) {
      throw new Error('Inquiry not found');
    }

    const inquiry = inquiryDoc.data();

    // Create client document
    const clientData = {
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      company: inquiry.company,
      acquisitionSource: acquisitionSource || 'website',
      status: 'lead',
      notes: `Converted from inquiry: ${inquiry.message}`,
      assignedTo: assignedTo || userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      interactions: [],
      followUps: [],
      profileViews: []
    };

    const clientRef = await db.collection('clients').add(clientData);

    // Update inquiry status
    await db.collection('inquiries').doc(inquiryId).update({
      status: 'converted',
      convertedToClientId: clientRef.id
    });

    logger.info('Inquiry converted to client', {
      inquiryId,
      clientId: clientRef.id,
      convertedBy: userId
    });

    return {
      success: true,
      clientId: clientRef.id,
      message: 'Inquiry converted to client successfully'
    };

  } catch (error) {
    logger.error('Error converting inquiry to client', error);
    throw error;
  }
});

// Function to log profile views
exports.logProfileView = onCall(async (request) => {
  try {
    const {clientId} = request.data;
    const userId = request.auth?.uid;

    if (!userId || !clientId) {
      throw new Error('Missing required parameters');
    }

    await db.collection('profileViews').add({
      clientId,
      userId,
      viewedAt: Timestamp.now()
    });

    return {success: true};

  } catch (error) {
    logger.error('Error logging profile view', error);
    throw error;
  }
});

// Trigger when new inquiry is created - send notification
exports.onNewInquiry = onDocumentCreated('inquiries/{inquiryId}', (event) => {
  const inquiry = event.data?.data();
  const inquiryId = event.params.inquiryId;

  logger.info('New inquiry received', {
    inquiryId,
    name: inquiry?.name,
    email: inquiry?.email,
    source: inquiry?.source
  });

  // Here you could add email notifications, Slack messages, etc.
  // For example: await sendNotificationToTeam(inquiry);
  
  return null;
});

// Trigger when client is updated - log the change
exports.onClientUpdate = onDocumentUpdated('clients/{clientId}', (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  const clientId = event.params.clientId;

  logger.info('Client updated', {
    clientId,
    statusChanged: before?.status !== after?.status,
    oldStatus: before?.status,
    newStatus: after?.status
  });

  return null;
});

// Function to create admin user (use once to set up authentication)
exports.createAdminUser = onCall({region: 'us-central1'}, async (request) => {
  try {
    const {email, password, fullName} = request.data;
    
    if (!email || !password || !fullName) {
      throw new Error('Missing required fields: email, password, fullName');
    }

    const {getAuth} = require('firebase-admin/auth');
    const adminAuth = getAuth();

    // Create the user
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      displayName: fullName,
      emailVerified: true
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      fullName: fullName,
      role: 'admin',
      permissions: [
        'admin_access',
        'manage_users', 
        'view_clients',
        'edit_clients',
        'delete_clients',
        'view_inquiries',
        'assign_clients',
        'website_management'
      ],
      createdAt: Timestamp.now(),
      isActive: true
    });

    logger.info('Admin user created successfully', {
      uid: userRecord.uid,
      email: email
    });

    return {
      success: true,
      uid: userRecord.uid,
      message: 'Admin user created successfully'
    };

  } catch (error) {
    logger.error('Error creating admin user', error);
    throw error;
  }
});
