// src/components/ui/FriendProfileModal.jsx

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiX, FiAward, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { Button } from './Button';

const Overlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
  z-index: 2000; backdrop-filter: blur(5px);
`;

const ModalCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg}; width: 90%; max-width: 500px;
  border-radius: 24px; border: 1px solid ${({ theme }) => theme.accent}40;
  box-shadow: 0 0 40px rgba(0,0,0,0.5); overflow: hidden;
  display: flex; flex-direction: column; max-height: 90vh;
`;

const Header = styled.div`
  padding: 1.5rem; background: rgba(0,0,0,0.2); display: flex; align-items: center; gap: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const Avatar = styled.img`
  width: 60px; height: 60px; border-radius: 50%; border: 2px solid ${({ theme }) => theme.accent}; object-fit: cover;
`;

const NameInfo = styled.div`
  flex: 1;
  h3 { margin: 0; font-size: 1.25rem; }
  p { margin: 0; color: ${({ theme }) => theme.textSecondary}; font-size: 0.9rem; }
`;

const CloseButton = styled.button`
  background: transparent; border: none; color: ${({ theme }) => theme.textSecondary};
  font-size: 1.5rem; cursor: pointer; &:hover { color: #ef4444; }
`;

const Content = styled.div`
  padding: 1.5rem; overflow-y: auto;
`;

const StatGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;
`;

const StatBox = styled.div`
  background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; text-align: center;
  h4 { margin: 0; font-size: 1.5rem; color: ${({ theme }) => theme.accent}; }
  span { font-size: 0.8rem; color: ${({ theme }) => theme.textSecondary}; }
`;

const SectionTitle = styled.h4`
  margin: 0 0 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;
  display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; color: ${({ theme }) => theme.text};
`;

const HighScoreItem = styled.div`
  display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 0.9rem;
  &:last-child { border-bottom: none; }
  span:last-child { font-weight: bold; color: ${({ theme }) => theme.accent}; }
`;

const FriendProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  // Hitung total statistik
  const totalScore = Object.values(user.highScores || {}).reduce((a, b) => a + b, 0);
  const gamesPlayed = user.stats?.quizzesPlayed || 0;
  const correctAnswers = user.stats?.totalCorrect || 0;
  const achievementsCount = Object.keys(user.unlockedAchievements || {}).length;

  return (
    <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <ModalCard 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} 
        onClick={(e) => e.stopPropagation()} // Mencegah klik pada card menutup modal
      >
        <Header>
          <Avatar src={user.photoURL || 'https://via.placeholder.com/60'} alt="Avatar" />
          <NameInfo>
            <h3>{user.displayName}</h3>
            <p>{user.email}</p>
          </NameInfo>
          <CloseButton onClick={onClose}><FiX /></CloseButton>
        </Header>

        <Content>
          <StatGrid>
            <StatBox>
              <h4>{totalScore}</h4>
              <span>Total Skor</span>
            </StatBox>
            <StatBox>
              <h4>{gamesPlayed}</h4>
              <span>Kuis Dimainkan</span>
            </StatBox>
            <StatBox>
              <h4>{correctAnswers}</h4>
              <span>Jawaban Benar</span>
            </StatBox>
            <StatBox>
              <h4>{achievementsCount}</h4>
              <span>Pencapaian</span>
            </StatBox>
          </StatGrid>

          <SectionTitle><FiActivity /> Skor Tertinggi</SectionTitle>
          <div style={{ marginBottom: '1.5rem' }}>
            {Object.entries(user.highScores || {}).length === 0 ? (
              <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Belum ada skor tersimpan.</p>
            ) : (
              Object.entries(user.highScores || {}).map(([key, score]) => (
                <HighScoreItem key={key}>
                  <span style={{ textTransform: 'capitalize' }}>{key.replace(/-/g, ' ')}</span>
                  <span>{score}</span>
                </HighScoreItem>
              ))
            )}
          </div>

          <SectionTitle><FiAward /> Pencapaian Terbaru</SectionTitle>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.keys(user.unlockedAchievements || {}).length === 0 ? (
              <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Belum ada pencapaian.</p>
            ) : (
              Object.keys(user.unlockedAchievements || {}).map(achievementId => (
                <span key={achievementId} style={{ 
                  background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', 
                  border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <FiCheckCircle size={12}/> {achievementId.replace(/_/g, ' ')}
                </span>
              ))
            )}
          </div>
        </Content>
        
        <div style={{ padding: '1.5rem', paddingTop: 0 }}>
          <Button onClick={onClose} style={{ width: '100%', background: '#334155' }}>Tutup</Button>
        </div>
      </ModalCard>
    </Overlay>
  );
};

export default FriendProfileModal;