// src/services/socialService.js

import { db } from './firebase';
import { 
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, 
  collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, or 
} from 'firebase/firestore';

// --- USER & FRIEND SEARCH ---

export const searchUsers = async (searchQuery) => {
  try {
    const usersRef = collection(db, "users");
    const emailQuery = query(usersRef, where("email", "==", searchQuery));
    const emailSnapshot = await getDocs(emailQuery);
    const results = [];
    emailSnapshot.forEach(doc => { results.push({ uid: doc.id, ...doc.data() }); });
    return results;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

export const sendFriendRequest = async (currentUserId, targetUserId) => {
  try {
    const targetRef = doc(db, "users", targetUserId);
    await updateDoc(targetRef, { friendRequests: arrayUnion(currentUserId) });
    return true;
  } catch (error) {
    console.error("Error sending request:", error);
    throw error;
  }
};

export const acceptFriendRequest = async (currentUserId, requesterId) => {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const requesterRef = doc(db, "users", requesterId);
    await updateDoc(currentUserRef, { friends: arrayUnion(requesterId), friendRequests: arrayRemove(requesterId) });
    await updateDoc(requesterRef, { friends: arrayUnion(currentUserId) });
    return true;
  } catch (error) {
    console.error("Error accepting request:", error);
    throw error;
  }
};

export const rejectFriendRequest = async (currentUserId, requesterId) => {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    await updateDoc(currentUserRef, { friendRequests: arrayRemove(requesterId) });
    return true;
  } catch (error) {
    console.error("Error rejecting request:", error);
    throw error;
  }
};

export const getFriendsDetails = async (friendUids) => {
  if (!friendUids || friendUids.length === 0) return [];
  try {
    const friendsData = [];
    for (const uid of friendUids) {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        friendsData.push({ uid: docSnap.id, ...docSnap.data() });
      }
    }
    return friendsData;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
};

// --- CHALLENGE SYSTEM (UPDATED) ---

// 1. Kirim Tantangan (Simpan ID Penantang juga)
export const sendChallenge = async (challengerId, challengerName, targetId, categoryId, scoreToBeat) => {
  try {
    await addDoc(collection(db, "challenges"), {
      challengerId, // Penting untuk riwayat
      challengerName,
      targetId,
      categoryId,
      scoreToBeat,
      status: 'pending',
      winner: null,
      finalScore: 0,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error sending challenge:", error);
    throw error;
  }
};

// 2. Ambil Tantangan Masuk (Inbox)
export const getMyChallenges = async (currentUserId) => {
  try {
    const q = query(
      collection(db, "challenges"), 
      where("targetId", "==", currentUserId),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting challenges:", error);
    return [];
  }
};

// 3. Selesaikan Tantangan (Simpan Hasil)
export const finishChallenge = async (challengeId, winnerName, finalScore) => {
  try {
    const ref = doc(db, "challenges", challengeId);
    await updateDoc(ref, {
      status: 'completed',
      winner: winnerName,
      finalScore: finalScore,
      completedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error finishing challenge:", error);
  }
};

// 4. Ambil Riwayat Duel (History)
export const getChallengeHistory = async (currentUserId) => {
  try {
    // Ambil semua challenge di mana user terlibat (sebagai penantang atau target)
    // Note: Firestore punya limitasi query 'OR'. Kita ambil manual 2 query lalu gabung.
    
    const q1 = query(collection(db, "challenges"), where("challengerId", "==", currentUserId), where("status", "==", "completed"));
    const q2 = query(collection(db, "challenges"), where("targetId", "==", currentUserId), where("status", "==", "completed"));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const history = [];
    snap1.forEach(doc => history.push({ id: doc.id, ...doc.data(), role: 'challenger' }));
    snap2.forEach(doc => history.push({ id: doc.id, ...doc.data(), role: 'target' }));

    // Urutkan dari yang terbaru (perlu handling timestamp null sementara)
    return history.sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
  } catch (error) {
    console.error("Error getting history:", error);
    return [];
  }
};

export const deleteChallenge = async (challengeId) => {
  try {
    await deleteDoc(doc(db, "challenges", challengeId));
  } catch (error) {
    console.error("Error deleting challenge:", error);
  }
};