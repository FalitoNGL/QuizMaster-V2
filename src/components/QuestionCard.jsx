// src/components/QuestionCard.jsx

import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Button } from './ui/Button';
import { FiCheckCircle, FiXCircle, FiEye, FiEyeOff, FiLogOut, FiClock } from 'react-icons/fi'; 

const CardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column-reverse; 
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const LeftSection = styled.div` flex: 1; display: flex; flex-direction: column; justify-content: center; `;
const RightSection = styled.div` display: flex; align-items: center; justify-content: flex-end; gap: 0.8rem; `;

const TimerWrapper = styled.div`
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1rem; font-weight: 700;
  color: ${({ theme }) => theme.textSecondary};
  background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const TopButton = styled.button`
  background: rgba(255,255,255,0.05); border: none; color: ${({ theme }) => theme.textSecondary};
  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; cursor: pointer; transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.15); color: ${({ theme }) => theme.text}; }
`;

const QuestionText = styled(motion.h2)`
  font-size: 1.4rem; font-weight: 600; line-height: 1.5; margin: 0 0 2rem 0; color: ${({ theme }) => theme.text};
`;

const OptionsContainer = styled(motion.div)` display: flex; flex-direction: column; gap: 1rem; `;

const OptionButton = styled(motion.button)`
  width: 100%; padding: 1.2rem; border-radius: 16px; text-align: left; border: 2px solid;
  transition: all 0.2s ease; font-size: 1rem; font-family: 'Poppins', sans-serif;
  color: ${({ theme }) => theme.text}; background: rgba(0, 0, 0, 0.15); 
  display: flex; align-items: center; gap: 1rem; cursor: pointer;

  border-color: ${({ $state, theme }) => {
    if ($state === 'correct') return '#22c55e';
    if ($state === 'incorrect') return '#ef4444';
    if ($state === 'selected') return theme.accent;
    return 'rgba(255, 255, 255, 0.2)';
  }};

  background: ${({ $state, theme }) => {
    if ($state === 'correct') return 'rgba(34, 197, 94, 0.1)';
    if ($state === 'incorrect') return 'rgba(239, 68, 68, 0.1)';
    if ($state === 'selected') return theme.accent + '15';
    return 'rgba(0, 0, 0, 0.15)';
  }};

  &:hover {
    border-color: ${({ theme, disabled }) => !disabled && theme.accent};
    background: ${({ theme, disabled }) => !disabled && 'rgba(255, 255, 255, 0.1)'};
  }

  &:disabled { cursor: default; opacity: 1; }
`;

const OptionLabel = styled.span`
  flex-shrink: 0; width: 32px; height: 32px; border-radius: 10px;
  background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;
  font-weight: 600; color: ${({ theme }) => theme.textSecondary};
`;

const OptionFeedbackIcon = styled(motion.div)` margin-left: auto; font-size: 1.5rem; display: flex; `;

const ExplanationBox = styled(motion.div)`
  margin-top: 2rem; padding: 1.5rem; border-radius: 16px;
  background: rgba(0, 0, 0, 0.2); border-left: 4px solid ${({ theme }) => theme.accent};
  p.title { font-weight: bold; margin-bottom: 0.5rem; color: ${({ theme }) => theme.accent}; }
  p.explanation { font-size: 1rem; line-height: 1.6; }
  p.reference { font-size: 0.8rem; font-style: italic; opacity: 0.7; margin-top: 0.75rem; }
`;

const Footer = styled.div` margin-top: 2rem; display: flex; justify-content: flex-end; padding-top: 1rem; `;

const QuestionCard = ({ 
  questionData, onSelectOption, selectedOption, isAnswered, onNext, onExit, 
  gameMode, isFocusMode, toggleFocusMode, timerComponent, progressBar 
}) => {
    if (!questionData) return null; 

    const getOptionState = (index) => {
        if (!isAnswered) return selectedOption === index ? 'selected' : 'default';
        if (index === questionData.correct) return 'correct';
        if (selectedOption === index) return 'incorrect';
        return 'default';
    };

    return (
        <CardContainer>
            <HeaderContainer>
                <LeftSection>
                    <motion.div animate={{opacity: isFocusMode ? 0 : 1, height: isFocusMode ? 0 : 'auto'}}>
                        {progressBar}
                    </motion.div>
                </LeftSection>

                <RightSection>
                    <TimerWrapper><FiClock /> {timerComponent}</TimerWrapper>
                    <TopButton onClick={toggleFocusMode} title="Mode Fokus">{isFocusMode ? <FiEyeOff /> : <FiEye />}</TopButton>
                    <TopButton onClick={onExit} title="Keluar" style={{color: '#ef4444'}}><FiLogOut /></TopButton>
                </RightSection>
            </HeaderContainer>

            {/* ANIMASI DI SINI: Menggunakan 'key' pada QuestionText agar teks berganti dengan animasi */}
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
                                {state === 'correct' ? <FiCheckCircle style={{ color: '#22c55e' }} /> : <FiXCircle style={{ color: '#ef4444' }} />}
                            </OptionFeedbackIcon>
                        )}
                    </OptionButton>
                  )
                })}
            </OptionsContainer>

            <AnimatePresence>
                {isAnswered && (
                    <ExplanationBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0}}>
                        <p className="title">Pembahasan:</p>
                        <p className="explanation">{questionData.explanation}</p>
                        <p className="reference">{questionData.reference}</p>
                    </ExplanationBox>
                )}
            </AnimatePresence>

            {isAnswered && (
                <Footer>
                    <Button onClick={onNext} style={{padding: '0.8rem 2rem', fontSize: '1.1rem'}}>Selanjutnya →</Button>
                </Footer>
            )}
        </CardContainer>
    );
};

export default QuestionCard;