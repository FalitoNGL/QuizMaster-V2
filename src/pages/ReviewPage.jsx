// src/pages/ReviewPage.jsx

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { PageContainer, PageHeader, PageBackButton } from '../components/ui/PageLayout';
import { AuroraCard } from '../components/ui/AuroraCard';

const ReviewCard = styled(AuroraCard)`
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
`;

const QuestionText = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const OptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionItem = styled.li`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  border-color: ${({ theme, state }) => {
    if (state === 'correct') return '#22c55e';
    if (state === 'user-wrong') return '#ef4444';
    return 'rgba(255, 255, 255, 0.2)';
  }};
  
  background-color: ${({ theme, state }) => {
    if (state === 'correct') return 'rgba(34, 197, 94, 0.15)';
    if (state === 'user-wrong') return 'rgba(239, 68, 68, 0.15)';
    return 'transparent';
  }};
`;

const OptionIcon = styled.div`
  font-size: 1.25rem;
  color: ${({ theme, state }) => {
    if (state === 'correct') return '#22c55e';
    if (state === 'user-wrong') return '#ef4444';
    return theme.textSecondary;
  }};
`;

// ================== KOMPONEN BARU DI SINI ==================
const ExplanationBox = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  p {
    margin: 0;
    line-height: 1.6;
  }

  .explanation-title {
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    margin-bottom: 0.5rem;
  }

  .explanation-text {
    color: ${({ theme }) => theme.textSecondary};
  }

  .reference-text {
    font-size: 0.875rem;
    font-style: italic;
    opacity: 0.7;
    margin-top: 1rem;
  }
`;
// ==========================================================


const ReviewPage = ({ questions, userAnswers, onBack }) => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageBackButton onClick={onBack} />
        <h1>Tinjau Jawaban</h1>
      </PageHeader>
      
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {questions.map((q, index) => {
          const userAnswerIndex = userAnswers[index];
          
          return (
            <motion.div key={index} variants={itemVariants}>
              <ReviewCard>
                <QuestionText>{index + 1}. {q.question}</QuestionText>
                <OptionList>
                  {q.options.map((option, optIndex) => {
                    let state = 'default';
                    if (optIndex === q.correct) {
                      state = 'correct';
                    } else if (optIndex === userAnswerIndex) {
                      state = 'user-wrong';
                    }
                    
                    return (
                      <OptionItem key={optIndex} state={state}>
                        <OptionIcon state={state}>
                          {state === 'correct' && <FiCheckCircle />}
                          {state === 'user-wrong' && <FiXCircle />}
                        </OptionIcon>
                        <span>{option}</span>
                      </OptionItem>
                    );
                  })}
                </OptionList>

                {/* <-- TAMPILKAN PENJELASAN DI SINI --> */}
                <ExplanationBox>
                  <p className="explanation-title">Penjelasan:</p>
                  <p className="explanation-text">{q.explanation}</p>
                  <p className="reference-text">{q.reference}</p>
                </ExplanationBox>
                
              </ReviewCard>
            </motion.div>
          );
        })}
      </motion.div>
    </PageContainer>
  );
};

export default ReviewPage;