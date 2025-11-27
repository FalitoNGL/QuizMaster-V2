// src/pages/AchievementsPage.jsx

import { useUserProgress } from '../context/UserProgressContext';
import { achievementsList } from '../data/achievements';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAward, FiLock, FiArrowLeft } from 'react-icons/fi';
import { PageContainer } from '../components/ui/PageLayout';
import { Button } from '../components/ui/Button';

// --- NEON GLASS STYLES ---

const Header = styled.div`
  display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
`;

const BackButton = styled(Button)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem; border-radius: 50%; width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: ${({ theme }) => theme.accent}20; border-color: ${({ theme }) => theme.accent}; }
`;

const Title = styled.h1`
  font-size: 2rem; margin: 0;
  background: linear-gradient(135deg, #ec4899, #f43f5e);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(236, 72, 153, 0.3));
`;

const AchievementGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding-bottom: 2rem;
`;

const AchievementCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid ${({ $isUnlocked, theme }) => $isUnlocked ? theme.accent + '60' : 'rgba(255, 255, 255, 0.05)'};
  display: flex; align-items: center; gap: 1.5rem;
  position: relative; overflow: hidden;
  transition: all 0.3s;

  /* Efek Glow jika Unlocked */
  ${({ $isUnlocked, theme }) => $isUnlocked && `
    box-shadow: 0 0 20px ${theme.accent}15;
    background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
  `}

  /* Efek Grayscale jika Locked */
  ${({ $isUnlocked }) => !$isUnlocked && `
    opacity: 0.6;
    filter: grayscale(100%);
  `}

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme, $isUnlocked }) => $isUnlocked ? theme.accent : 'rgba(255,255,255,0.2)'};
  }
`;

const IconWrapper = styled.div`
  width: 60px; height: 60px; border-radius: 50%;
  background: ${({ $isUnlocked, theme }) => $isUnlocked ? theme.accent + '20' : 'rgba(0,0,0,0.2)'};
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
  color: ${({ theme, $isUnlocked }) => ($isUnlocked ? theme.accent : '#aaa')};
  flex-shrink: 0;
  border: 1px solid ${({ $isUnlocked, theme }) => $isUnlocked ? theme.accent : 'transparent'};
  box-shadow: ${({ $isUnlocked, theme }) => $isUnlocked ? `0 0 15px ${theme.accent}40` : 'none'};
`;

const Info = styled.div`
  flex: 1;
  h3 {
    font-size: 1.1rem; margin: 0 0 0.4rem 0;
    color: ${({ theme }) => theme.text};
    font-weight: 700;
  }
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.textSecondary};
    margin: 0;
    line-height: 1.4;
  }
`;

const StatusBadge = styled.div`
  position: absolute; top: 1rem; right: 1rem;
  font-size: 0.7rem; font-weight: 800; letter-spacing: 1px;
  padding: 0.2rem 0.5rem; border-radius: 8px;
  background: ${({ $isUnlocked }) => $isUnlocked ? '#10b981' : '#64748b'};
  color: white;
  text-transform: uppercase;
`;

// --- MAIN COMPONENT ---

const AchievementsPage = ({ onBack }) => {
  const { unlockedAchievements } = useUserProgress();

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={onBack}><FiArrowLeft size={20} /></BackButton>
        <Title>Hall of Fame</Title>
      </Header>

      <AchievementGrid variants={gridVariants} initial="hidden" animate="visible">
        {Object.entries(achievementsList).map(([id, achievement]) => {
          const isUnlocked = !!unlockedAchievements[id];
          
          return (
            <AchievementCard key={id} $isUnlocked={isUnlocked} variants={itemVariants}>
              <IconWrapper $isUnlocked={isUnlocked}>
                {isUnlocked ? <FiAward /> : <FiLock />}
              </IconWrapper>
              
              <Info>
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
              </Info>

              <StatusBadge $isUnlocked={isUnlocked}>
                {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
              </StatusBadge>
            </AchievementCard>
          );
        })}
      </AchievementGrid>
    </PageContainer>
  );
};

export default AchievementsPage;