// src/pages/MenuPage.jsx

import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../context/UserProgressContext';
import { quizCategories, getQuestionCount } from '../data/quizData';
import { FiBarChart2, FiAward, FiSettings, FiBookOpen, FiThumbsUp, FiSun, FiMoon, FiLogOut, FiUser, FiDatabase, FiUsers } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import { AuroraCard } from '../components/ui/AuroraCard';
import { Button } from '../components/ui/Button';
import { PageContainer } from '../components/ui/PageLayout';
import { playSound } from '../utils/audioManager';
import QuizConfigModal from '../components/ui/QuizConfigModal';
import { isAdmin } from '../utils/adminConfig'; 

// --- STYLED COMPONENTS ---

const ThemeToggleButton = styled(motion.button)`
  position: absolute; top: 2rem; right: 2rem;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.textSecondary};
  width: 45px; height: 45px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; cursor: pointer; z-index: 10;
  &:hover { color: ${({ theme }) => theme.accent}; box-shadow: 0 0 15px ${({ theme }) => theme.glow}; }
`;

const UserProfile = styled.div`
  display: flex; align-items: center; gap: 1rem;
  background: ${({ theme }) => theme.cardBg}; padding: 0.75rem 1.25rem;
  border-radius: 50px; margin: 0 auto 2rem auto;
  border: 1px solid ${({ theme }) => theme.accent}40; width: fit-content;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const Avatar = styled.img`
  width: 45px; height: 45px; border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.accent}; object-fit: cover;
`;

const PlaceholderAvatar = styled.div`
  width: 45px; height: 45px; border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.accent};
  display: flex; align-items: center; justify-content: center;
  background: ${({ theme }) => theme.accent}20; color: ${({ theme }) => theme.accent}; font-size: 1.5rem;
`;

const UserInfo = styled.div` text-align: left; margin-right: 1rem; `;
const UserNameText = styled.div` font-weight: 700; color: ${({ theme }) => theme.text}; font-size: 1rem; `;
const UserStatus = styled.div` font-size: 0.75rem; color: ${({ theme }) => theme.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px; `;

const LogoutButton = styled.button`
  background: transparent; border: none; color: ${({ theme }) => theme.textSecondary}; cursor: pointer; padding: 0.5rem;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s; border-radius: 8px;
  &:hover { background: rgba(255, 50, 50, 0.1); color: #ff4d4d; }
`;

const Header = styled.header`
  text-align: center; margin-bottom: 2rem;
  h2 { font-size: 2.5rem; font-weight: 700; margin: 0; color: ${({ theme }) => theme.text}; }
  p { font-size: 1.125rem; color: ${({ theme }) => theme.textSecondary}; margin-top: 0.25rem; }
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;         
  width: 100%;
`;

const NavButton = styled(Button)`
  padding: 0.6rem 1.2rem; 
  font-size: 0.9rem; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap; 
  background: rgba(255, 255, 255, 0.05); 
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px; 
  color: ${({ theme }) => theme.text}; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  flex: 0 1 auto; 
  
  /* PENTING: Pastikan tombol navigasi bisa diklik */
  pointer-events: auto; 

  &:hover { 
    background: ${({ theme }) => theme.accent}15;
    border-color: ${({ theme }) => theme.accent}; 
    color: ${({ theme }) => theme.accent}; 
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.accent}30;
  }
  
  &.admin-btn {
    border-color: #eab308; 
    color: #eab308;
    background: rgba(234, 179, 8, 0.05);
    &:hover { 
      background: rgba(234, 179, 8, 0.15); 
      box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
    }
  }
`;

const CategoryGrid = styled(motion.div)`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;
`;

const ClickableCard = styled(AuroraCard)` cursor: pointer; `;

/* PERBAIKAN UTAMA DI SINI:
   Saya menghapus 'pointer-events: none' yang menghalangi klik.
   Sekarang diganti logic: kalau disabled baru none, kalau tidak ya auto.
*/
const CategoryCardContent = styled.div`
  text-align: center; display: flex; flex-direction: column; height: 100%;
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.6 : 1)}; 
  pointer-events: ${({ $isDisabled }) => ($isDisabled ? 'none' : 'auto')};
`;

const IconWrapper = styled.div` font-size: 3.5rem; margin-bottom: 1rem; color: ${({ theme }) => theme.accent}; `;
const CategoryName = styled.h3` font-size: 1.75rem; font-weight: 600; margin: 0; `;
const CategoryDescription = styled.p` color: ${({ theme }) => theme.textSecondary}; font-size: 1rem; margin-top: 0.5rem; flex-grow: 1; min-height: 50px; `;

const MenuPage = ({ onNavigate, onStartQuiz }) => {
  const { user, logout, wrongAnswers, settings, toggleThemeMode } = useUserProgress();
  const clickSound = () => { if(navigator.vibrate) navigator.vibrate(50); playSound('click'); };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0, scale: 0.95 }, visible: { y: 0, opacity: 1, scale: 1 } };
  
  // --- MODE TESTING ---
  const realWrongCount = wrongAnswers ? Object.values(wrongAnswers).flat().length : 0;

  const handleCategoryClick = (category) => { clickSound(); setSelectedCategory(category); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedCategory(null); };
  const handleStartFromModal = (categoryId, mode, questionCount, duration) => { setIsModalOpen(false); onStartQuiz({ categoryId, mode, questionCount, duration }); };
  const handleLogout = () => { if(window.confirm("Apakah Anda yakin ingin logout?")) logout(); };

  const handleRemedialClick = () => {
    clickSound();
    if (realWrongCount > 0) {
      onStartQuiz({
        categoryId: 'wrong_answers', 
        mode: 'klasik', 
        questionCount: realWrongCount, 
        duration: 120
      });
    } else {
      alert("⚠️ MODE DEMO BERHASIL DIKLIK!\n\nTombol berfungsi normal. Saat ini Anda belum memiliki data jawaban salah untuk dimainkan.");
    }
  };

  return (
    <PageContainer>
      <ThemeToggleButton onClick={toggleThemeMode} whileHover={{ scale: 1.1, rotate: 30 }} whileTap={{ scale: 0.9 }} title="Ganti Tema">
        {settings.themeMode === 'dark' ? <FiSun /> : <FiMoon />}
      </ThemeToggleButton>

      {user && (
        <UserProfile>
          {user.photoURL ? <Avatar src={user.photoURL} alt="Profil" /> : <PlaceholderAvatar><FiUser /></PlaceholderAvatar>}
          <UserInfo>
            <UserStatus>{isAdmin(user.email) ? 'ADMINISTRATOR' : 'PLAYER'}</UserStatus>
            <UserNameText>{user.displayName || 'Pengguna'}</UserNameText>
          </UserInfo>
          <LogoutButton onClick={handleLogout} title="Logout"><FiLogOut size={20} /></LogoutButton>
        </UserProfile>
      )}

      <Header>
        <h2>Halo, {user?.displayName?.split(' ')[0] || 'Teman'}!</h2>
        <p>Siap untuk menguji pengetahuanmu hari ini?</p>
      </Header>
      
      <NavContainer>
        <NavButton onClick={() => { clickSound(); onNavigate('stats'); }}>
          <FiBarChart2/> <span>Statistik</span>
        </NavButton>
        <NavButton onClick={() => { clickSound(); onNavigate('achievements'); }}>
          <FiAward/> <span>Pencapaian</span>
        </NavButton>
        <NavButton onClick={() => { clickSound(); onNavigate('settings'); }}>
          <FiSettings/> <span>Pengaturan</span>
        </NavButton>
        <NavButton onClick={() => { clickSound(); onNavigate('leaderboard'); }}>
          <FaTrophy/> <span>Peringkat</span>
        </NavButton>
        <NavButton onClick={() => { clickSound(); onNavigate('social'); }}>
          <FiUsers/> <span>Sosial</span>
        </NavButton>
        
        {user && isAdmin(user.email) && (
          <NavButton 
            onClick={() => { clickSound(); onNavigate('admin'); }} 
            className="admin-btn"
          >
            <FiDatabase/> <span>Admin</span>
          </NavButton>
        )}
      </NavContainer>

      <CategoryGrid variants={containerVariants} initial="hidden" animate="visible">
        {quizCategories.map((category) => {
          const Icon = category.icon;
          return (
            <ClickableCard key={category.id} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} layoutId={`quiz-card-${category.id}`} onClick={() => handleCategoryClick(category)}>
              <CategoryCardContent $isDisabled={false}>
                  <IconWrapper><Icon /></IconWrapper>
                  <CategoryName>{category.name}</CategoryName>
                  <CategoryDescription>{category.description}</CategoryDescription>
              </CategoryCardContent>
            </ClickableCard>
          );
        })}

        {/* KARTU LATIHAN PERSONAL */}
        <AuroraCard variants={itemVariants} whileHover={{y: -5, scale: 1.02}}>
          <CategoryCardContent $isDisabled={false}>
            <IconWrapper style={{color: '#eab308'}}>
               <FiBookOpen/>
            </IconWrapper>
            <CategoryName>Latihan Personal</CategoryName>
            <CategoryDescription>
              {realWrongCount > 0 
                ? `Ada ${realWrongCount} soal untuk diperbaiki.` 
                : "Mode Demo: Tombol aktif untuk percobaan."}
            </CategoryDescription>
            
            {/* Wrapper ini juga diberi pointer-events: auto untuk keamanan ganda */}
            <div style={{marginTop: '2rem', pointerEvents: 'auto', position: 'relative', zIndex: 10}}>
              <Button 
                style={{background: 'linear-gradient(145deg, #eab308, #a16207)', cursor: 'pointer'}} 
                onClick={handleRemedialClick}
                disabled={false}
              >
                Mulai Latihan
              </Button>
            </div>
          </CategoryCardContent>
        </AuroraCard>
      </CategoryGrid>
      
      <AnimatePresence>
        {isModalOpen && selectedCategory && (
          <QuizConfigModal category={selectedCategory} onStart={handleStartFromModal} onClose={handleCloseModal} totalQuestions={getQuestionCount(selectedCategory.id)} />
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default MenuPage;