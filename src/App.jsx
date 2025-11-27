// src/App.jsx

import { useState, useCallback } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { UserProgressProvider, useUserProgress } from './context/UserProgressContext';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// --- IMPOR SEMUA HALAMAN ---
import MenuPage from './pages/MenuPage';
import QuizPage from './pages/QuizPage';
import StatsPage from './pages/StatsPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage'; 
import LeaderboardPage from './pages/LeaderboardPage';
import SocialPage from './pages/SocialPage';
import ReviewPage from './pages/ReviewPage'; // <-- PENTING: Import ReviewPage
import ParticleBackground from './components/ui/ParticleBackground';
import WelcomeModal from './components/ui/WelcomeModal';

// --- DEFINISI TEMA ---
export const themes = {
  ocean: {
    name: 'Samudra',
    light: { bg: '#f0f9ff', cardBg: 'rgba(255, 255, 255, 0.7)', text: '#082f49', textSecondary: '#475569', accent: '#0ea5e9', buttonText: '#ffffff', glow: 'rgba(14, 165, 233, 0.3)', borderRadius: '24px', },
    dark: { bg: '#0a192f', cardBg: 'rgba(17, 34, 64, 0.75)', text: '#ccd6f6', textSecondary: '#8892b0', accent: '#64ffda', buttonText: '#0a192f', glow: 'rgba(100, 255, 218, 0.3)', borderRadius: '24px', }
  },
  sunset: {
    name: 'Matahari Terbenam',
    light: { bg: '#fff7ed', cardBg: 'rgba(255, 255, 255, 0.7)', text: '#431407', textSecondary: '#7c2d12', accent: '#f97316', buttonText: '#ffffff', glow: 'rgba(249, 115, 22, 0.3)', borderRadius: '24px', },
    dark: { bg: '#231a43', cardBg: 'rgba(49, 38, 89, 0.75)', text: '#e0cde7', textSecondary: '#9e8fb0', accent: '#ff8a71', buttonText: '#ffffff', glow: 'rgba(255, 138, 113, 0.3)', borderRadius: '24px', }
  }
};

const GlobalStyle = createGlobalStyle`
  html {
    font-size: ${({ theme }) => {
      if (theme.fontSize === 'large') return '18px';
      if (theme.fontSize === 'small') return '14px';
      return '16px';
    }};
  }
  body {
    background-color: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.text};
    transition: background-color 0.4s ease, color 0.4s ease;
    margin: 0;
    font-family: 'Poppins', sans-serif;
  }
  * { box-sizing: border-box; }
`;

const LoadingScreen = styled.div`
  display: flex; justify-content: center; align-items: center; height: 100vh;
  color: ${({ theme }) => theme.accent}; font-size: 1.5rem;
`;

// --- KOMPONEN UTAMA DENGAN TEMA ---
const ThemedApp = () => {
  const { settings, user, loading } = useUserProgress();
  
  const themeFamily = themes[settings.themeFamily] || themes.ocean;
  const activeThemeMode = themeFamily[settings.themeMode] || themeFamily.dark;
  const finalTheme = { 
    ...activeThemeMode, 
    fontSize: settings.fontSize,
    accent: settings.accentColor || activeThemeMode.accent
  };

  return (
    <ThemeProvider theme={finalTheme}>
      <GlobalStyle />
      <ParticleBackground />
      <AnimatePresence>
        {loading ? (
          <LoadingScreen>Memuat data...</LoadingScreen>
        ) : !user ? (
          <WelcomeModal key="welcome" />
        ) : (
          <AppRouter key="router" />
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

// --- ROUTER APLIKASI ---
const AppRouter = () => {
  const [currentPage, setCurrentPage] = useState('menu');
  const [quizConfig, setQuizConfig] = useState(null);
  
  // STATE BARU: Menyimpan data kuis terakhir untuk halaman Review
  const [lastQuizData, setLastQuizData] = useState(null);

  const handleNavigate = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleStartQuiz = useCallback((config) => {
    setQuizConfig(config);
    setCurrentPage('quiz');
  }, []);

  const handleQuizEnd = useCallback(() => {
    setCurrentPage('menu');
  }, []);

  // FUNGSI BARU: Menangani navigasi ke halaman Review dengan data
  const handleReview = useCallback((data) => {
    setLastQuizData(data);
    setCurrentPage('review');
  }, []);
  
  let pageComponent;
  switch (currentPage) {
    case 'quiz':
      pageComponent = (
        <QuizPage 
          key="quiz" 
          config={quizConfig} 
          onQuizEnd={handleQuizEnd}
          onReview={handleReview} // <-- Props baru diteruskan ke QuizPage
        />
      );
      break;
    case 'review': // <-- CASE BARU
      pageComponent = (
        <ReviewPage 
          key="review"
          questions={lastQuizData?.questions}
          userAnswers={lastQuizData?.userAnswers}
          onBack={() => handleNavigate('menu')}
        />
      );
      break;
    case 'stats':
      pageComponent = <StatsPage key="stats" onBack={handleQuizEnd} />;
      break;
    case 'achievements':
      pageComponent = <AchievementsPage key="achievements" onBack={handleQuizEnd} />;
      break;
    case 'settings':
      pageComponent = <SettingsPage key="settings" onBack={handleQuizEnd} />;
      break;
    case 'admin':
      pageComponent = <AdminPage key="admin" onBack={() => handleNavigate('menu')} />;
      break;
    case 'leaderboard':
      pageComponent = <LeaderboardPage key="leaderboard" onBack={() => handleNavigate('menu')} />;
      break;
    case 'social': 
      pageComponent = (
        <SocialPage 
          key="social" 
          onBack={() => handleNavigate('menu')} 
          onStartQuiz={handleStartQuiz} 
        />
      );
      break;

    case 'menu':
    default:
      pageComponent = <MenuPage key="menu" onNavigate={handleNavigate} onStartQuiz={handleStartQuiz} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <LayoutGroup>
        <AnimatePresence mode="wait">
          {pageComponent}
        </AnimatePresence>
      </LayoutGroup>
    </motion.div>
  );
};

// --- ENTRY POINT ---
function App() {
  return (
    <UserProgressProvider>
      <ThemedApp />
    </UserProgressProvider>
  );
}

export default App;