// src/pages/ReviewPage.jsx

import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiHelpCircle, FiAlertCircle } from 'react-icons/fi';
import { PageContainer } from '../components/ui/PageLayout';
import { Button } from '../components/ui/Button';

// --- NEON GLASS STYLES ---

const Header = styled.div`
  display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
  position: sticky; top: 0; z-index: 10;
  background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px);
  padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const BackButton = styled(Button)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem; border-radius: 50%; width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: ${({ theme }) => theme.accent}20; border-color: ${({ theme }) => theme.accent}; }
`;

const Title = styled.h1`
  font-size: 1.8rem; margin: 0;
  background: linear-gradient(135deg, #fff, ${({ theme }) => theme.accent});
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
`;

const FilterContainer = styled.div`
  display: flex; gap: 0.8rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 5px;
  &::-webkit-scrollbar { display: none; }
`;

const FilterBadge = styled.button`
  padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; font-size: 0.9rem;
  border: 1px solid ${({ $active, $color }) => $active ? $color : 'rgba(255,255,255,0.1)'};
  background: ${({ $active, $color }) => $active ? $color + '30' : 'rgba(255,255,255,0.03)'};
  color: ${({ $active, $color }) => $active ? $color : '#94a3b8'};
  transition: all 0.3s;
  
  &:hover { transform: translateY(-2px); border-color: ${({ $color }) => $color}; color: ${({ $color }) => $color}; }
`;

const ReviewGrid = styled.div`
  display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 3rem;
`;

const QuestionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border-radius: 20px; padding: 1.5rem;
  border: 1px solid ${({ $status }) => $status === 'correct' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  position: relative; overflow: hidden;

  /* Glow effect based on status */
  &::before {
    content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
    background: ${({ $status }) => $status === 'correct' ? '#22c55e' : '#ef4444'};
  }
`;

const QuestionText = styled.h3`
  font-size: 1.1rem; margin: 0 0 1rem 0; line-height: 1.5;
  color: ${({ theme }) => theme.text};
`;

const OptionList = styled.div`
  display: flex; flex-direction: column; gap: 0.8rem;
`;

const OptionItem = styled.div`
  padding: 0.8rem 1rem; border-radius: 12px;
  background: ${({ $type }) => {
    if ($type === 'userCorrect') return 'rgba(34, 197, 94, 0.15)';
    if ($type === 'userWrong') return 'rgba(239, 68, 68, 0.15)';
    if ($type === 'correct') return 'rgba(34, 197, 94, 0.1)'; // Jawaban benar yg tidak dipilih user
    return 'rgba(255, 255, 255, 0.03)';
  }};
  border: 1px solid ${({ $type }) => {
    if ($type === 'userCorrect') return '#22c55e';
    if ($type === 'userWrong') return '#ef4444';
    if ($type === 'correct') return '#22c55e';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  color: ${({ $type, theme }) => {
    if ($type === 'userCorrect' || $type === 'correct') return '#4ade80';
    if ($type === 'userWrong') return '#f87171';
    return theme.textSecondary;
  }};
  display: flex; align-items: center; gap: 0.8rem; font-size: 0.95rem;
`;

const Explanation = styled.div`
  margin-top: 1.5rem; padding: 1rem; border-radius: 12px;
  background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255,255,255,0.1);
  
  h4 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: ${({ theme }) => theme.accent}; display: flex; align-items: center; gap: 0.5rem; }
  p { margin: 0; font-size: 0.9rem; color: ${({ theme }) => theme.textSecondary}; line-height: 1.5; }
`;

const StatusIcon = styled.div`
  position: absolute; top: 1.5rem; right: 1.5rem; font-size: 1.5rem;
  color: ${({ $status }) => $status === 'correct' ? '#22c55e' : '#ef4444'};
  opacity: 0.8;
`;

const ReviewPage = ({ questions = [], userAnswers = {}, onBack }) => {
  const [filter, setFilter] = useState('all'); // all, correct, incorrect

  // Hitung statistik sederhana
  const totalQ = questions.length;
  const correctQ = questions.filter((q, i) => userAnswers[i] === q.correct).length;
  const wrongQ = totalQ - correctQ;

  const filteredQuestions = questions.map((q, i) => ({...q, index: i})).filter((q, i) => {
    const isCorrect = userAnswers[q.index] === q.correct;
    if (filter === 'correct') return isCorrect;
    if (filter === 'incorrect') return !isCorrect;
    return true;
  });

  if (!questions || questions.length === 0) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={onBack}><FiArrowLeft /></BackButton>
          <Title>Analisis Misi</Title>
        </Header>
        <div style={{textAlign: 'center', marginTop: '5rem', opacity: 0.6}}>
          <FiAlertCircle size={50}/>
          <p>Data review tidak tersedia. Silakan mainkan kuis terlebih dahulu.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={onBack}><FiArrowLeft /></BackButton>
        <div style={{flex:1}}>
          <Title>Analisis Misi</Title>
          <span style={{fontSize: '0.85rem', opacity: 0.7}}>Skor Akurasi: {totalQ > 0 ? Math.round((correctQ/totalQ)*100) : 0}%</span>
        </div>
      </Header>

      <FilterContainer>
        <FilterBadge $active={filter === 'all'} $color="#3b82f6" onClick={() => setFilter('all')}>
          Semua ({totalQ})
        </FilterBadge>
        <FilterBadge $active={filter === 'correct'} $color="#22c55e" onClick={() => setFilter('correct')}>
          Benar ({correctQ})
        </FilterBadge>
        <FilterBadge $active={filter === 'incorrect'} $color="#ef4444" onClick={() => setFilter('incorrect')}>
          Salah ({wrongQ})
        </FilterBadge>
      </FilterContainer>

      <ReviewGrid>
        <AnimatePresence mode='popLayout'>
          {filteredQuestions.map((q) => {
            const userAns = userAnswers[q.index];
            const isCorrect = userAns === q.correct;

            return (
              <QuestionCard 
                key={q.index}
                $status={isCorrect ? 'correct' : 'incorrect'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <StatusIcon $status={isCorrect ? 'correct' : 'incorrect'}>
                  {isCorrect ? <FiCheckCircle /> : <FiXCircle />}
                </StatusIcon>

                <QuestionText>{q.index + 1}. {q.question}</QuestionText>

                <OptionList>
                  {q.options.map((opt, optIdx) => {
                    let type = 'default';
                    if (optIdx === q.correct) {
                      type = isCorrect ? 'userCorrect' : 'correct'; // Jika salah, tandai yg benar
                    } else if (optIdx === userAns) {
                      type = 'userWrong'; // Pilihan user yang salah
                    }

                    return (
                      <OptionItem key={optIdx} $type={type}>
                        <span style={{fontWeight: 'bold'}}>{String.fromCharCode(65+optIdx)}.</span>
                        {opt}
                        {type === 'userCorrect' && <FiCheckCircle style={{marginLeft: 'auto'}}/>}
                        {type === 'userWrong' && <FiXCircle style={{marginLeft: 'auto'}}/>}
                        {type === 'correct' && <span style={{marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.8}}>(Jawaban Benar)</span>}
                      </OptionItem>
                    )
                  })}
                </OptionList>

                <Explanation>
                  <h4><FiHelpCircle /> Intelijen Data:</h4>
                  <p>{q.explanation || "Tidak ada data tambahan untuk soal ini."}</p>
                  {q.reference && <div style={{marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6, fontStyle: 'italic'}}>Sumber: {q.reference}</div>}
                </Explanation>
              </QuestionCard>
            );
          })}
        </AnimatePresence>
      </ReviewGrid>

    </PageContainer>
  );
};

export default ReviewPage;