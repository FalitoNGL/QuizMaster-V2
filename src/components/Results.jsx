// src/components/Results.jsx

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { AuroraCard } from './ui/AuroraCard';
import { Button } from './ui/Button';
import { FiActivity, FiRefreshCw, FiHome, FiZap } from 'react-icons/fi';

const ScoreTitle = styled.h2`
  font-size: 1.5rem; margin-bottom: 0.5rem; color: ${({ theme }) => theme.text};
`;

const ScoreValue = styled.div`
  font-size: 4rem; font-weight: 800;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent}, #fff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.1rem; color: ${({ theme }) => theme.textSecondary}; margin-bottom: 2rem;
`;

const StatGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;
`;

const StatBox = styled.div`
  background: rgba(255, 255, 255, 0.05); padding: 1rem; border-radius: 16px;
  span { display: block; font-size: 0.9rem; color: ${({ theme }) => theme.textSecondary}; margin-bottom: 0.25rem; }
  strong { font-size: 1.2rem; color: ${({ theme }) => theme.text}; }
`;

// Style Khusus Hasil Tantangan
const ChallengeResultBox = styled(motion.div)`
  background: ${({ $won }) => $won ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border: 1px solid ${({ $won }) => $won ? '#22c55e' : '#ef4444'};
  padding: 1rem; border-radius: 16px; margin-bottom: 1.5rem;
  color: ${({ $won }) => $won ? '#22c55e' : '#ef4444'};
  font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
`;

const Results = ({ score, totalQuestions, onRestart, highScore, gameMode, isPracticeMode, challengeConfig }) => {
  // Tentukan pesan berdasarkan skor
  let message = "Terus Belajar!";
  if (score > totalQuestions * 5) message = "Bagus Sekali!";
  if (score === totalQuestions * 10) message = "Sempurna! Luar Biasa!";

  // Logika Tantangan
  let isChallengeWon = false;
  if (challengeConfig) {
    isChallengeWon = score > challengeConfig.target;
  }

  return (
    <AuroraCard initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <div style={{ textAlign: 'center' }}>
        <ScoreTitle>{isPracticeMode ? 'Latihan Selesai' : 'Kuis Selesai'}</ScoreTitle>
        <ScoreValue>{score}</ScoreValue>
        
        {/* TAMPILKAN HASIL TANTANGAN DI SINI */}
        {challengeConfig ? (
          <ChallengeResultBox 
            $won={isChallengeWon}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          >
            <FiZap/>
            {isChallengeWon 
              ? `ANDA MENANG! Mengalahkan ${challengeConfig.challenger} (${challengeConfig.target})` 
              : `KALAH... Target ${challengeConfig.challenger} adalah ${challengeConfig.target}`}
          </ChallengeResultBox>
        ) : (
          <Message>{message}</Message>
        )}

        <StatGrid>
          <StatBox>
            <span>Soal</span>
            <strong>{totalQuestions}</strong>
          </StatBox>
          <StatBox>
            <span>Tertinggi</span>
            <strong>{highScore}</strong>
          </StatBox>
        </StatGrid>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button onClick={onRestart} style={{ background: 'rgba(255,255,255,0.1)' }}>
            <FiHome /> Menu
          </Button>
          {!isPracticeMode && !challengeConfig && (
            <Button onClick={() => alert("Fitur 'Main Lagi' akan segera hadir!")} primary>
              <FiRefreshCw /> Main Lagi
            </Button>
          )}
        </div>
      </div>
    </AuroraCard>
  );
};

export default Results;