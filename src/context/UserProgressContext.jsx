// src/context/UserProgressContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../services/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { achievementsList } from '../data/achievements';
import { playSound } from '../utils/audioManager';

const UserProgressContext = createContext();

export const useUserProgress = () => useContext(UserProgressContext);

const initialStats = { quizzesPlayed: 0, totalCorrect: 0, totalIncorrect: 0 };

export const UserProgressProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Data Game
  const [stats, setStats] = useState(initialStats);
  const [highScores, setHighScores] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState({});
  const [wrongAnswers, setWrongAnswers] = useState({});
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('quiz_settings');
    return saved ? JSON.parse(saved) : { 
      themeFamily: 'ocean', themeMode: 'dark', accentColor: null, fontSize: 'medium', backgroundEffect: 'jaringan' 
    };
  });

  useEffect(() => {
    localStorage.setItem('quiz_settings', JSON.stringify(settings));
  }, [settings]);

  // Pantau Status Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Kita clone object user agar bisa dimodifikasi (displayName) secara lokal
        setUser({ ...currentUser });
        await loadUserData(currentUser);
      } else {
        setUser(null);
        setStats(initialStats);
        setHighScores({});
        setUnlockedAchievements({});
        setWrongAnswers({});
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loadUserData = async (currentUser) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats(data.stats || initialStats);
        setHighScores(data.highScores || {});
        setUnlockedAchievements(data.unlockedAchievements || {});
        const wa = data.wrongAnswers ? JSON.parse(data.wrongAnswers) : {};
        setWrongAnswers(wa);
      } else {
        // Dokumen baru untuk user baru
        await setDoc(userRef, {
          email: currentUser.email,
          displayName: currentUser.displayName || 'User',
          stats: initialStats,
          highScores: {},
          unlockedAchievements: {},
          wrongAnswers: "{}"
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    }
  };

  // --- LOGIC AUTHENTICATION ---

  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      playSound('click');
    } catch (error) {
      console.error("Login Google gagal:", error);
      throw error;
    }
  };

  const loginEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      playSound('click');
    } catch (error) {
      console.error("Login Email gagal:", error);
      throw error;
    }
  };

  const registerEmail = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      await updateProfile(newUser, { displayName: name });
      setUser({ ...newUser, displayName: name });
      
      const userRef = doc(db, "users", newUser.uid);
      await setDoc(userRef, {
        email: email,
        displayName: name,
        stats: initialStats,
        highScores: {},
        unlockedAchievements: {},
        wrongAnswers: "{}"
      });

      playSound('click');
    } catch (error) {
      console.error("Registrasi gagal:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      playSound('click');
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };

  // --- FUNGSI BARU (FIX ERROR) ---
  
  // 1. Fungsi manual update nama di state lokal (agar UI langsung berubah)
  const setUserName = (newName) => {
    if (user) {
      setUser((prev) => ({ ...prev, displayName: newName }));
    }
  };

  // 2. Fungsi reset semua progres (Danger Zone)
  const resetAllProgress = async () => {
    if (!user) return;
    
    // Reset Local State
    setStats(initialStats);
    setHighScores({});
    setUnlockedAchievements({});
    setWrongAnswers({});

    // Reset Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        stats: initialStats,
        highScores: {},
        unlockedAchievements: {},
        wrongAnswers: "{}"
      });
      alert("Semua progres telah direset.");
    } catch (error) {
      console.error("Gagal reset progres:", error);
      alert("Gagal mereset data di server.");
    }
  };

  // --- LOGIC UPDATE DATA ---
  
  const updateStats = (isCorrect, isFirstQuestion) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        quizzesPlayed: isFirstQuestion ? prev.quizzesPlayed + 1 : prev.quizzesPlayed,
        totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
        totalIncorrect: !isCorrect ? prev.totalIncorrect + 1 : prev.totalIncorrect,
      };
      if (user) {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, { stats: newStats }).catch(console.error);
      }
      return newStats;
    });
  };

  const updateHighScores = (newHighScores) => {
    setHighScores(newHighScores);
    if (user) {
       const userRef = doc(db, "users", user.uid);
       updateDoc(userRef, { highScores: newHighScores });
    }
  };

  const unlockAchievement = (achievementId) => {
    if (achievementsList[achievementId] && !unlockedAchievements[achievementId]) {
      const newAchievements = { ...unlockedAchievements, [achievementId]: true };
      setUnlockedAchievements(newAchievements);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, { unlockedAchievements: newAchievements });
      }
    }
  };

  const addWrongAnswer = (categoryId, question) => {
    setWrongAnswers(prev => {
      const categoryWrongs = prev[categoryId] || [];
      if (!categoryWrongs.some(q => q.question === question.question)) {
        const newWrongAnswers = { ...prev, [categoryId]: [...categoryWrongs, question] };
        if (user) {
          const userRef = doc(db, "users", user.uid);
          updateDoc(userRef, { wrongAnswers: JSON.stringify(newWrongAnswers) });
        }
        return newWrongAnswers;
      }
      return prev;
    });
  };

  const toggleThemeMode = () => {
    setSettings(prev => ({ ...prev, themeMode: prev.themeMode === 'dark' ? 'light' : 'dark' }));
    playSound('click');
  };

  const value = {
    user, loading, 
    loginGoogle, loginEmail, registerEmail, logout,
    setUserName, // <-- SUDAH DITAMBAHKAN
    resetAllProgress, // <-- SUDAH DITAMBAHKAN
    stats, updateStats,
    highScores, setHighScores: updateHighScores,
    unlockedAchievements, unlockAchievement,
    wrongAnswers, addWrongAnswer,
    settings, setSettings,
    toggleThemeMode,
  };

  return (
    <UserProgressContext.Provider value={value}>
      {!loading && children}
    </UserProgressContext.Provider>
  );
};