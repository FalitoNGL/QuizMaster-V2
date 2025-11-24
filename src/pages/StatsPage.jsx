// src/pages/StatsPage.jsx
import { useUserProgress } from '../context/UserProgressContext';
import { quizCategories } from '../data/quizData';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCheckCircle, FiXCircle, FiPercent, FiAward } from 'react-icons/fi';
import { PageContainer, PageHeader, PageBackButton } from '../components/ui/PageLayout';
import { AuroraCard } from '../components/ui/AuroraCard';

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const StatCardContent = styled.div`
  text-align: center;
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.accent};
  margin-bottom: 0.5rem;
`;

const StatValue = styled.p`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
`;

const StatLabel = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

const HighScoreSection = styled.div`
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const HighScoreItem = styled(motion.div)`
  background: ${({ theme }) => `color-mix(in srgb, ${theme.cardBg} 50%, transparent)`};
  padding: 1rem 1.5rem;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HighScoreInfo = styled.div`
  .category {
    font-size: 1.1rem;
    font-weight: 600;
  }
  .mode {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.textSecondary};
    text-transform: capitalize;
  }
`;

const HighScoreValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

// <-- KOMPONEN BARU UNTUK EMPTY STATE -->
const EmptyStateContainer = styled(motion.div)`
  text-align: center;
  padding: 3rem 2rem;
  background: ${({ theme }) => theme.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px dashed ${({ theme }) => theme.textSecondary};
  opacity: 0.7;

  .icon {
    font-size: 4rem;
    color: ${({ theme }) => theme.accent};
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.125rem;
    color: ${({ theme }) => theme.textSecondary};
    margin: 0;
  }
`;


const StatsPage = ({ onBack }) => {
  const { userName, stats, highScores } = useUserProgress();
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
    return category ? category.name : 'Kategori Kustom';
  }

  const getGameMode = (key) => {
    const mode = key.split('-').pop();
    return mode.replace('_', ' ');
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageBackButton onClick={onBack} />
        <h1>Statistik {userName}</h1>
      </PageHeader>
      
      <StatsGrid variants={gridVariants} initial="hidden" animate="visible">
        <AuroraCard variants={itemVariants}><StatCardContent><StatIcon><FiBarChart2 /></StatIcon><StatValue>{stats.quizzesPlayed}</StatValue><StatLabel>Kuis Dimainkan</StatLabel></StatCardContent></AuroraCard>
        <AuroraCard variants={itemVariants}><StatCardContent><StatIcon style={{ color: '#22c55e' }}><FiCheckCircle /></StatIcon><StatValue>{stats.totalCorrect}</StatValue><StatLabel>Jawaban Benar</StatLabel></StatCardContent></AuroraCard>
        <AuroraCard variants={itemVariants}><StatIcon style={{ color: '#ef4444' }}><FiXCircle /></StatIcon><StatValue>{stats.totalIncorrect}</StatValue><StatLabel>Jawaban Salah</StatLabel></AuroraCard>
        <AuroraCard variants={itemVariants}><StatCardContent><StatIcon><FiPercent /></StatIcon><StatValue>{accuracy}%</StatValue><StatLabel>Akurasi</StatLabel></StatCardContent></AuroraCard>
      </StatsGrid>

      <HighScoreSection>
        <h2><FiAward /> Skor Tertinggi</h2>
        {/* <-- LOGIKA UNTUK MENAMPILKAN EMPTY STATE --> */}
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
            <p>Anda belum memiliki rekor. Mainkan kuis dan cetak sejarah pertamamu!</p>
          </EmptyStateContainer>
        )}
      </HighScoreSection>
    </PageContainer>
  );
};

export default StatsPage;