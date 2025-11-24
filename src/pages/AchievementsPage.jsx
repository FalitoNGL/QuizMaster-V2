import { useUserProgress } from '../context/UserProgressContext';
import { achievementsList } from '../data/achievements';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAward, FiLock } from 'react-icons/fi';
import { PageContainer, PageHeader, PageBackButton } from '../components/ui/PageLayout';

const AchievementGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const AchievementCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  filter: ${({ $isUnlocked }) => ($isUnlocked ? 'none' : 'grayscale(90%)')};
  opacity: ${({ $isUnlocked }) => ($isUnlocked ? 1 : 0.6)};
  transition: all 0.3s;
`;

const AchievementIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme, $isUnlocked }) => ($isUnlocked ? theme.accent : theme.textSecondary)};
  flex-shrink: 0;
`;

const AchievementInfo = styled.div`
  h3 {
    font-size: 1.2rem;
    margin: 0 0 0.25rem 0;
    color: ${({ theme }) => theme.text};
  }
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.textSecondary};
    margin: 0;
  }
`;

const AchievementsPage = ({ onBack }) => {
  const { unlockedAchievements } = useUserProgress();

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageBackButton onClick={onBack} />
        <h1>Pencapaian</h1>
      </PageHeader>

      <AchievementGrid variants={gridVariants} initial="hidden" animate="visible">
        {Object.entries(achievementsList).map(([id, achievement]) => {
          const isUnlocked = !!unlockedAchievements[id];
          return (
            <AchievementCard key={id} $isUnlocked={isUnlocked} variants={itemVariants}>
              <AchievementIcon $isUnlocked={isUnlocked}>
                {isUnlocked ? <FiAward /> : <FiLock />}
              </AchievementIcon>
              <AchievementInfo>
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
              </AchievementInfo>
            </AchievementCard>
          );
        })}
      </AchievementGrid>
    </PageContainer>
  );
};

export default AchievementsPage;