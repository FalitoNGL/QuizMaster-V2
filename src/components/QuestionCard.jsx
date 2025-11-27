// src/components/QuestionCard.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Button } from './ui/Button';
import { FiCheckCircle, FiXCircle, FiEye, FiEyeOff, FiLogOut, FiClock, FiZap, FiHelpCircle } from 'react-icons/fi'; 
import { playSound } from '../utils/audioManager'; 

// --- NEON GLASS STYLES ---

const CardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  /* Hiasan Neon di Atas */
  &::before {
    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px;
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.accent}, transparent);
    opacity: 0.8;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column-reverse; 
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const MetaInfo = styled.div`
  display: flex; align-items: center; gap: 0.8rem;
`;

const TimerWrapper = styled.div`
  display: flex; align-items: center; gap: 0.5rem;
  font-family: 'Courier New', monospace; font-weight: 700; font-size: 1.1rem;
  color: ${({ theme }) => theme.accent};
  background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 50px;
  border: 1px solid ${({ theme }) => theme.accent}40;
  box-shadow: 0 0 10px ${({ theme }) => theme.accent}10;
`;

const ToolButton = styled(motion.button)`
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: ${({ theme }) => theme.textSecondary};
  width: 42px; height: 42px; border-radius: 12px; 
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; cursor: pointer; transition: all 0.2s;
  
  &:hover:not(:disabled) { 
    background: ${({ theme }) => theme.accent}20; 
    color: ${({ theme }) => theme.accent}; 
    border-color: ${({ theme }) => theme.accent};
  }
`;

// Tombol Lifeline Spesial
const LifelineButton = styled(ToolButton)`
  width: auto; padding: 0 1rem; gap: 0.5rem; font-size: 0.9rem; font-weight: 700;
  border-color: #eab308; color: #eab308;
  
  &:hover:not(:disabled) {
    background: rgba(234, 179, 8, 0.15);
    box-shadow: 0 0 15px rgba(234, 179, 8, 0.4);
    transform: translateY(-2px);
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(1); }
`;

const QuestionText = styled(motion.h2)`
  font-size: 1.4rem; font-weight: 600; line-height: 1.6; margin: 0 0 2rem 0; 
  color: ${({ theme }) => theme.text};
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const OptionsContainer = styled(motion.div)` display: flex; flex-direction: column; gap: 1rem; `;

const OptionButton = styled(motion.button)`
  width: 100%; padding: 1.2rem 1.5rem; border-radius: 16px; text-align: left; 
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03); 
  color: ${({ theme }) => theme.text}; 
  font-size: 1rem; font-family: 'Poppins', sans-serif;
  display: flex; align-items: center; gap: 1rem; cursor: pointer;
  transition: all 0.2s ease;
  position: relative; overflow: hidden;

  /* Efek Hover */
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${({ theme }) => theme.accent};
    transform: translateX(5px);
  }

  /* State Colors */
  ${({ $state, theme }) => {
    if ($state === 'correct') return `
      background: rgba(34, 197, 94, 0.15); border-color: #22c55e; color: #4ade80;
      box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
    `;
    if ($state === 'incorrect') return `
      background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #f87171;
    `;
    if ($state === 'selected') return `
      background: ${theme.accent}15; border-color: ${theme.accent}; color: ${theme.accent};
    `;
    if ($state === 'hidden') return `
      opacity: 0.3; pointer-events: none; filter: grayscale(1); border-style: dashed;
    `;
  }}

  &:disabled { cursor: default; }
`;

const OptionLabel = styled.span`
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  background: rgba(255,255,255,0.1); 
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const OptionFeedbackIcon = styled(motion.div)` margin-left: auto; font-size: 1.5rem; display: flex; `;

const ExplanationBox = styled(motion.div)`
  margin-top: 2rem; padding: 1.5rem; border-radius: 16px;
  background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3);
  
  p.title { font-weight: bold; margin-bottom: 0.5rem; color: #34d399; display: flex; align-items: center; gap: 0.5rem; }
  p.explanation { font-size: 1rem; line-height: 1.6; color: ${({ theme }) => theme.text}; }
  p.reference { font-size: 0.85rem; font-style: italic; opacity: 0.7; margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem; }
`;

const Footer = styled.div` margin-top: 2.5rem; display: flex; justify-content: flex-end; `;

const QuestionCard = ({ 
  questionData, onSelectOption, selectedOption, isAnswered, onNext, onExit, 
  gameMode, isFocusMode, toggleFocusMode, timerComponent, progressBar 
}) => {
    // STATE: Menyimpan index jawaban yang dihapus oleh 50:50
    const [hiddenOptions, setHiddenOptions] = useState([]);
    const [lifelineUsed, setLifelineUsed] = useState(false);

    // Reset lifeline setiap kali soal berubah
    useEffect(() => {
        setHiddenOptions([]);
        setLifelineUsed(false); 
    }, [questionData]);

    if (!questionData) return null; 

    // --- LOGIKA 50:50 ---
    const handleLifeline5050 = () => {
        if (lifelineUsed || isAnswered) return;
        
        playSound('click'); 
        const correctIndex = questionData.correct;
        
        // Cari semua index yang SALAH
        const wrongIndices = questionData.options
            .map((_, idx) => idx)
            .filter(idx => idx !== correctIndex);
        
        // Acak dan ambil 2 index untuk disembunyikan
        const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
        const toHide = shuffled.slice(0, 2);
        
        setHiddenOptions(toHide);
        setLifelineUsed(true);
    };

    const getOptionState = (index) => {
        if (hiddenOptions.includes(index)) return 'hidden';
        if (!isAnswered) return selectedOption === index ? 'selected' : 'default';
        if (index === questionData.correct) return 'correct';
        if (selectedOption === index) return 'incorrect';
        return 'default';
    };

    return (
        <CardContainer
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <HeaderContainer>
                <div style={{flex: 1}}>
                    <motion.div animate={{opacity: isFocusMode ? 0 : 1, height: isFocusMode ? 0 : 'auto'}}>
                        {progressBar}
                    </motion.div>
                </div>

                <MetaInfo>
                    {/* TOMBOL 50:50 (Hanya muncul jika belum jawab & belum mode fokus) */}
                    {!isAnswered && !isFocusMode && (
                        <LifelineButton 
                            onClick={handleLifeline5050} 
                            disabled={lifelineUsed}
                            title="Bantuan 50:50 (Hilangkan 2 Jawaban Salah)"
                            whileTap={{ scale: 0.9 }}
                        >
                            <FiZap /> 50:50
                        </LifelineButton>
                    )}

                    <TimerWrapper><FiClock /> {timerComponent}</TimerWrapper>
                    
                    <ToolButton onClick={toggleFocusMode} title={isFocusMode ? "Keluar Mode Fokus" : "Mode Fokus"}>
                        {isFocusMode ? <FiEyeOff /> : <FiEye />}
                    </ToolButton>
                    <ToolButton onClick={onExit} title="Nyerah (Keluar)" style={{color: '#ef4444', borderColor: '#ef444440'}}>
                        <FiLogOut />
                    </ToolButton>
                </MetaInfo>
            </HeaderContainer>

            <AnimatePresence mode='wait'>
                <QuestionText
                    key={questionData.question}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    {questionData.question}
                </QuestionText>
            </AnimatePresence>

            <OptionsContainer>
                {questionData.options.map((option, index) => {
                  const state = getOptionState(index);
                  
                  // Tampilan khusus untuk opsi yang dihilangkan
                  if (state === 'hidden') {
                      return (
                          <OptionButton key={index} $state="hidden" disabled>
                              <OptionLabel>-</OptionLabel>
                              <span>---</span>
                          </OptionButton>
                      );
                  }

                  return (
                    <OptionButton 
                      key={`${questionData.question}-${index}`} 
                      onClick={() => !isAnswered && onSelectOption(index)} 
                      $state={state} 
                      disabled={isAnswered} 
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                        <OptionLabel>{String.fromCharCode(65 + index)}</OptionLabel>
                        <span>{option}</span>
                        {isAnswered && (state === 'correct' || state === 'incorrect') && (
                            <OptionFeedbackIcon initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                {state === 'correct' ? <FiCheckCircle /> : <FiXCircle />}
                            </OptionFeedbackIcon>
                        )}
                    </OptionButton>
                  )
                })}
            </OptionsContainer>

            <AnimatePresence>
                {isAnswered && (
                    <ExplanationBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="title"><FiHelpCircle/> Pembahasan:</p>
                        <p className="explanation">{questionData.explanation || "Tidak ada pembahasan detail."}</p>
                        {questionData.reference && <p className="reference">Sumber: {questionData.reference}</p>}
                    </ExplanationBox>
                )}
            </AnimatePresence>

            {isAnswered && (
                <Footer>
                    <Button onClick={onNext} style={{padding: '0.8rem 2rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}>
                        Selanjutnya →
                    </Button>
                </Footer>
            )}
        </CardContainer>
    );
};

export default QuestionCard;