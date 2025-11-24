// src/components/ui/QuizConfigModal.jsx

import { useState, useMemo } from 'react';
// <-- PERBAIKAN DI SINI: Tambahkan AnimatePresence -->
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { AuroraCard } from './AuroraCard';
import { Button } from './Button';
import { FiX } from 'react-icons/fi';

// ... sisa kode di file ini tetap sama ...

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;
const ModalCard = styled(AuroraCard)`
  width: 100%;
  max-width: 32rem;
  text-align: center;
  position: relative;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.5rem;
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.accent}; }
`;
const Title = styled.h2`
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
`;
const Subtitle = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 2rem 0;
`;
const ConfigSection = styled.div`
  margin-bottom: 2rem;
  text-align: left;
  
  label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 500;
    color: ${({ theme }) => theme.textSecondary};
  }
`;
const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
`;
const OptionButton = styled(Button)`
  background: ${({ theme, $isActive }) => ($isActive ? theme.accent : theme.cardBg)};
  border: 1px solid ${({ theme, $isActive }) => ($isActive ? theme.accent : theme.textSecondary)};
  color: ${({ theme, $isActive }) => ($isActive ? theme.buttonText : theme.text)};
  box-shadow: none;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: none;
    box-shadow: none;
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: ${({ theme }) => theme.cardBg};
    border-color: ${({ theme }) => theme.textSecondary};
    color: ${({ theme }) => theme.textSecondary};
  }
`;
const SliderValue = styled.span`
  font-weight: 700;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.accent};
  background: ${({ theme }) => theme.cardBg};
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
`;
const SliderInput = styled.input`
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: rgba(0,0,0,0.3);
  border-radius: 5px;
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: ${({ theme }) => theme.accent};
    cursor: pointer;
    border-radius: 50%;
    border: 3px solid ${({ theme }) => theme.bg};
  }
  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: ${({ theme }) => theme.accent};
    cursor: pointer;
    border-radius: 50%;
    border: 3px solid ${({ theme }) => theme.bg};
  }
`;

const QuizConfigModal = ({ category, onStart, onClose, totalQuestions }) => {
  const [mode, setMode] = useState('klasik');
  const [questionCount, setQuestionCount] = useState(Math.min(10, totalQuestions));
  const [duration, setDuration] = useState(120);
  const handleStart = () => {
    onStart(
      category.id, 
      mode, 
      mode === 'klasik' ? questionCount : totalQuestions,
      duration
    );
  };
  
  return (
    <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ModalCard initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
        <CloseButton onClick={onClose}><FiX /></CloseButton>
        <Title>{category.name}</Title>
        <Subtitle>Atur sesi kuis Anda</Subtitle>

        <ConfigSection>
          <label>Mode Permainan</label>
          <ButtonGroup>
            <OptionButton $isActive={mode === 'klasik'} onClick={() => setMode('klasik')}>Klasik</OptionButton>
            <OptionButton $isActive={mode === 'time_attack'} onClick={() => setMode('time_attack')}>Time Attack</OptionButton>
          </ButtonGroup>
        </ConfigSection>

        <AnimatePresence>
          {mode === 'time_attack' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <ConfigSection>
                <label>Durasi Waktu</label>
                <ButtonGroup>
                  <OptionButton $isActive={duration === 60} onClick={() => setDuration(60)}>1 Menit</OptionButton>
                  <OptionButton $isActive={duration === 120} onClick={() => setDuration(120)}>2 Menit</OptionButton>
                  <OptionButton $isActive={duration === 300} onClick={() => setDuration(300)}>5 Menit</OptionButton>
                </ButtonGroup>
              </ConfigSection>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfigSection>
          <label htmlFor="question-slider" style={{ opacity: mode === 'klasik' ? 1 : 0.4 }}>
            Jumlah Soal
            <SliderValue>{mode === 'klasik' ? questionCount : 'Semua'}</SliderValue>
          </label>
          <SliderInput 
            type="range"
            id="question-slider"
            min="1"
            max={totalQuestions}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            disabled={mode === 'time_attack'}
          />
        </ConfigSection>
        
        <Button onClick={handleStart} style={{width: '100%', padding: '1rem'}}>Mulai Kuis</Button>
      </ModalCard>
    </Overlay>
  );
};

export default QuizConfigModal;