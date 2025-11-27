// src/pages/StatsPage.jsx
import { useUserProgress } from '../context/UserProgressContext';
import { quizCategories } from '../data/quizData';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheckCircle, FiXCircle, FiPercent, FiAward, FiArrowLeft } from 'react-icons/fi';
import { PageContainer } from '../components/ui/PageLayout';
import { AuroraCard } from '../components/ui/AuroraCard';
import { Button } from '../components/ui/Button';

// --- STYLED COMPONENTS (NEON GLASS) ---

const Header = styled.div`
  display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
  position: relative; z-index: 2;
`;

const BackButton = styled(Button)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem; border-radius: 50%; width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: ${({ theme }) => theme.accent}20; border-color: ${({ theme }) => theme.accent}; }
`;

const PageTitle = styled.h1`
  font-size: 2rem; margin: 0;
  background: linear-gradient(135deg, #fff, ${({ theme }) => theme.accent});
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px ${({ theme }) => theme.accent}40;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

// Konten dalam kartu statistik
const StatCardContent = styled.div`
  text-align: center;
  padding: 1rem;
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 8px currentColor); // Neon glow icon
`;

const StatValue = styled.p`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const StatLabel = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const HighScoreSection = styled.div`
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex; align-items: center; gap: 0.75rem;
    color: ${({ theme }) => theme.accent};
  }
`;

const HighScoreItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${({ theme }) => theme.accent}60;
    transform: translateX(5px);
  }
`;

const HighScoreInfo = styled.div`
  .category { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.2rem; }
  .mode { font-size: 0.85rem; color: ${({ theme }) => theme.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px; }
`;

const HighScoreValue = styled.div`
  font-size: 1.8rem; font-weight: 800;
  color: ${({ theme }) => theme.accent};
  text-shadow: 0 0 10px ${({ theme }) => theme.accent}40;
`;

const EmptyStateContainer = styled(motion.div)`
  text-align: center; padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  
  .icon { font-size: 4rem; color: ${({ theme }) => theme.textSecondary}; margin-bottom: 1rem; opacity: 0.5; }
  p { font-size: 1.1rem; color: ${({ theme }) => theme.textSecondary}; margin: 0; }
`;

const StatsPage = ({ onBack }) => {
  const { user, stats, highScores } = useUserProgress(); // Ganti userName ke user.displayName
  const userName = user?.displayName || 'Agen';
  
  const totalAnswers = stats.totalCorrect + stats.totalIncorrect;
  const accuracy = totalAnswers > 0 ? ((stats.totalCorrect / totalAnswers) * 100).toFixed(1) : 0;

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const getCategoryName = (key) => {
    const categoryId = key.split('-').slice(0, -1).join('-');
    const category = quizCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Misi Rahasia';
  }

  const getGameMode = (key) => {
    const mode = key.split('-').pop();
    return mode.replace('_', ' ');
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={onBack}><FiArrowLeft size={20} /></BackButton>
        <PageTitle>Laporan Statistik: {userName}</PageTitle>
      </Header>
      
      <StatsGrid variants={gridVariants} initial="hidden" animate="visible">
        <AuroraCard variants={itemVariants}>
            <StatCardContent>
                <StatIcon style={{color: '#3b82f6'}}><FiBarChart2 /></StatIcon>
                <StatValue>{stats.quizzesPlayed}</StatValue>
                <StatLabel>Misi Selesai</StatLabel>
            </StatCardContent>
        </AuroraCard>
        <AuroraCard variants={itemVariants}>
            <StatCardContent>
                <StatIcon style={{ color: '#22c55e' }}><FiCheckCircle /></StatIcon>
                <StatValue>{stats.totalCorrect}</StatValue>
                <StatLabel>Target Tepat</StatLabel>
            </StatCardContent>
        </AuroraCard>
        <AuroraCard variants={itemVariants}>
            <StatCardContent>
                <StatIcon style={{ color: '#ef4444' }}><FiXCircle /></StatIcon>
                <StatValue>{stats.totalIncorrect}</StatValue>
                <StatLabel>Meleset</StatLabel>
            </StatCardContent>
        </AuroraCard>
        <AuroraCard variants={itemVariants}>
            <StatCardContent>
                <StatIcon style={{color: '#a855f7'}}><FiPercent /></StatIcon>
                <StatValue>{accuracy}%</StatValue>
                <StatLabel>Akurasi Tembakan</StatLabel>
            </StatCardContent>
        </AuroraCard>
      </StatsGrid>

      <HighScoreSection>
        <h2><FiAward /> Rekor Operasi Tertinggi</h2>
        
        {Object.keys(highScores).length > 0 ? (
          <motion.div variants={gridVariants} initial="hidden" animate="visible">
            {Object.entries(highScores).sort(([,a],[,b]) => b-a).map(([key, score]) => (
              <HighScoreItem key={key} variants={itemVariants}>
                <HighScoreInfo>
                  <div className='category'>{getCategoryName(key)}</div>
                  <div className='mode'>{getGameMode(key)}</div>
                </HighScoreInfo>
                <HighScoreValue>{score}</HighScoreValue>
              </HighScoreItem>
            ))}
          </motion.div>
        ) : (
          <EmptyStateContainer initial={{opacity: 0}} animate={{opacity: 1}}>
            <div className="icon"><FiAward /></div>
            <p>Data kosong. Selesaikan misi untuk mencetak rekor baru.</p>
          </EmptyStateContainer>
        )}
      </HighScoreSection>
    </PageContainer>
  );
};

export default StatsPage;