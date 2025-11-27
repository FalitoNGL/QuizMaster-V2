// src/components/Results.jsx

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { FiRefreshCw, FiHome, FiAward, FiList } from 'react-icons/fi'; 
import { playSound } from '../utils/audioManager';
import { useEffect } from 'react';

// --- NEON GLASS STYLES ---

const ResultsContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem 2rem;
  text-align: center;
  max-width: 500px;
  width: 90%;
  margin: 2rem auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;

  /* Glow Effect di atas */
  &::before {
    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
    background: ${({ $isWin, theme }) => $isWin ? '#22c55e' : theme.accent};
    box-shadow: 0 0 20px ${({ $isWin, theme }) => $isWin ? '#22c55e' : theme.accent};
  }
`;

const Title = styled.h1`
  font-size: 2.5rem; margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff, ${({ theme }) => theme.accent});
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px ${({ theme }) => theme.accent}40;
`;

const SubTitle = styled.p`
  font-size: 1.1rem; color: ${({ theme }) => theme.textSecondary}; margin-bottom: 2rem;
`;

const ScoreCircle = styled(motion.div)`
  width: 180px; height: 180px; border-radius: 50%;
  background: rgba(255,255,255,0.02);
  border: 4px solid ${({ $color }) => $color};
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  margin: 0 auto 2rem auto;
  box-shadow: 0 0 30px ${({ $color }) => $color}30, inset 0 0 20px ${({ $color }) => $color}20;
  
  h2 { font-size: 3.5rem; margin: 0; color: ${({ $color }) => $color}; text-shadow: 0 0 15px ${({ $color }) => $color}60; }
  span { font-size: 0.9rem; color: ${({ theme }) => theme.textSecondary}; margin-top: -5px; }
`;

const StatRow = styled.div`
  display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem;
`;

const StatItem = styled.div`
  text-align: center;
  .val { font-size: 1.5rem; font-weight: 800; color: ${({ theme }) => theme.text}; }
  .label { font-size: 0.8rem; color: ${({ theme }) => theme.textSecondary}; text-transform: uppercase; }
`;

const ActionButtons = styled.div`
  display: flex; flex-direction: column; gap: 1rem;
`;

const ReviewButton = styled(Button)`
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: ${({ theme }) => theme.text};
  &:hover { background: rgba(255,255,255,0.1); border-color: ${({ theme }) => theme.accent}; }
`;

const Results = ({ score, totalQuestions, onRestart, highScore, questions, userAnswers, onReview }) => {
    useEffect(() => {
        playSound('finish');
    }, []);

    const percentage = Math.round((score / (totalQuestions * 10)) * 100);
    
    // Logika warna skor
    let color = '#ef4444'; // Merah
    if (percentage >= 50) color = '#eab308'; // Kuning
    if (percentage >= 80) color = '#22c55e'; // Hijau

    const handleReviewClick = () => {
        if (onReview) {
            // Kirim data soal dan jawaban user ke fungsi onReview (yang ada di App.jsx)
            onReview({ questions, userAnswers });
        }
    };

    return (
        <ResultsContainer 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            $isWin={percentage >= 80}
        >
            <Title>{percentage >= 80 ? 'Misi Sukses!' : 'Misi Selesai'}</Title>
            <SubTitle>{percentage >= 80 ? 'Performa Luar Biasa, Agen.' : 'Perlu latihan lebih lanjut.'}</SubTitle>

            <ScoreCircle 
                $color={color}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            >
                <h2>{score}</h2>
                <span>Skor Akhir</span>
            </ScoreCircle>

            <StatRow>
                <StatItem>
                    <div className="val">{percentage}%</div>
                    <div className="label">Akurasi</div>
                </StatItem>
                <StatItem>
                    <div className="val">{highScore}</div>
                    <div className="label">Rekor</div>
                </StatItem>
            </StatRow>

            <ActionButtons>
                {/* TOMBOL REVIEW YANG BARU */}
                <ReviewButton onClick={handleReviewClick}>
                    <FiList style={{marginRight: 8}}/> Analisis & Pembahasan
                </ReviewButton>

                <div style={{display: 'flex', gap: '1rem'}}>
                    <Button onClick={onRestart} style={{flex: 1, background: '#3b82f6'}}>
                        <FiHome style={{marginRight: 8}}/> Menu Utama
                    </Button>
                </div>
            </ActionButtons>

        </ResultsContainer>
    );
};

export default Results;