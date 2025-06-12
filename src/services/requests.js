import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Create a new request
export const createRequest = async (data) => {
  try {
    const requestRef = await addDoc(collection(db, "requests"), {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return { id: requestRef.id };
  } catch (error) {
    console.error("Error creating request:", error);
    throw error;
  }
};

// Get all requests for a provider
export const getProviderRequests = async (providerId) => {
  try {
    const q = query(
      collection(db, "requests"),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc")
    );
    
    const requestsSnapshot = await getDocs(q);
    return requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null
    }));
  } catch (error) {
    console.error("Error fetching provider requests:", error);
    throw error;
  }
};

// Get all requests made by a user
export const getUserRequests = async (userId) => {
  try {
    const q = query(
      collection(db, "requests"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const requestsSnapshot = await getDocs(q);
    return requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null
    }));
  } catch (error) {
    console.error("Error fetching user requests:", error);
    throw error;
  }
};

// Update request status (accept/reject)
export const updateRequestStatus = async (requestId, status) => {
  try {
    const requestRef = doc(db, "requests", requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: Timestamp.now()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
};

// Get a single request by ID
export const getRequestById = async (requestId) => {
  try {
    const requestDoc = await getDoc(doc(db, "requests", requestId));
    
    if (requestDoc.exists()) {
      return { 
        id: requestDoc.id, 
        ...requestDoc.data(),
        createdAt: requestDoc.data().createdAt?.toDate() || null,
        updatedAt: requestDoc.data().updatedAt?.toDate() || null
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching request:", error);
    throw error;
  }
};

// Check if user has already sent a request to this provider
export const checkExistingRequest = async (userId, providerId) => {
  try {
    const q = query(
      collection(db, "requests"),
      where("userId", "==", userId),
      where("providerId", "==", providerId),
      where("status", "in", ["pending", "accepted"])
    );
    
    const requestsSnapshot = await getDocs(q);
    return !requestsSnapshot.empty;
  } catch (error) {
    console.error("Error checking existing request:", error);
    throw error;
  }
};