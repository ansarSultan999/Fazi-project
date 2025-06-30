import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// Create or update provider profile
export const saveProviderProfile = async (userId, profileData, profileImage = null) => {
  try {
    let imageUrl = profileData.imageUrl || null;
    
    // Upload profile image if provided
    if (profileImage) {
      const storageRef = ref(storage, `profile_images/${userId}`);
      await uploadBytes(storageRef, profileImage);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    // Save provider data to Firestore
    const providerRef = doc(db, "providers", userId);
    await setDoc(providerRef, {
      ...profileData,
      imageUrl,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    return { success: true, imageUrl };
  } catch (error) {
    console.error("Error saving provider profile:", error);
    throw error;
  }
};

// Get provider by ID
export const getProviderById = async (providerId) => {
  try {
    const providerDoc = await getDoc(doc(db, "providers", providerId));
    
    if (providerDoc.exists()) {
      return { id: providerDoc.id, ...providerDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching provider:", error);
    throw error;
  }
};

// Get provider by user ID
export const getProviderByUserId = async (userId) => {
  try {
    const providerDoc = await getDoc(doc(db, "providers", userId));
    
    if (providerDoc.exists()) {
      return { id: providerDoc.id, ...providerDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching provider by user ID:", error);
    throw error;
  }
};

// Get all providers
export const getAllProviders = async () => {
  try {
    const providersSnapshot = await getDocs(collection(db, "providers"));
    return providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all providers:", error);
    throw error;
  }
};

// Get providers by skill
export const getProvidersBySkill = async (skill) => {
  try {
    const q = query(
      collection(db, "providers"), 
      where("skills", "array-contains", skill)
    );
    
    const providersSnapshot = await getDocs(q);
    return providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching providers by skill:", error);
    throw error;
  }
};

// Delete provider profile
export const deleteProviderProfile = async (providerId) => {
  try {
    await deleteDoc(doc(db, "providers", providerId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting provider:", error);
    throw error;
  }
};

// Get providers by location (city or area)
export const getProvidersByLocation = async (location) => {
  try {
    const q = query(
      collection(db, "providers"), 
      where("location.city", "==", location)
    );
    
    const providersSnapshot = await getDocs(q);
    return providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching providers by location:", error);
    throw error;
  }
};

// Get top rated providers
export const getTopProviders = async (limit = 5) => {
  try {
    const q = query(
      collection(db, "providers"),
      orderBy("rating", "desc"),
      limit(limit)
    );
    
    const providersSnapshot = await getDocs(q);
    return providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching top providers:", error);
    throw error;
  }
};

// Create a new service card for a provider
export const createProviderCard = async (providerId, cardData) => {
  try {
    const docRef = await addDoc(collection(db, "providerCards"), {
      ...cardData,
      providerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error creating provider card:", error);
    throw error;
  }
};

// Get all cards for a provider
export const getProviderCards = async (providerId) => {
  try {
   const q = query(
    collection(db, "providerCards"),
    where("providerId", "==", providerId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
} catch (error) {
    console.error("Error fetching provider cards:", error);
    throw error;
  }
};

// Delete a provider card by cardId
export const deleteProviderCard = async (cardId) => {
  try {
    await deleteDoc(doc(db, "providerCards", cardId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting provider card:", error);
    throw error;
  }
};

// Log when a user views a provider's profile
export const logProfileView = async (providerId, viewerId) => {
  try {
    await addDoc(collection(db, "profileViews"), {
      providerId,
      viewerId,
      viewedAt: Timestamp.now()
    });
  } catch (error) {
    // Optionally handle/log error
  }
};

// Reviews
export const addProviderReview = async (providerId, review) => {
  try {
    await addDoc(collection(db, "providerReviews"), {
      providerId,
      ...review
    });
  } catch (error) {
    throw error;
  }
};

export const getProviderReviews = async (providerId) => {
  try {
    const q = query(
      collection(db, "providerReviews"),
      where("providerId", "==", providerId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    return [];
  }
};