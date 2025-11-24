// src/components/ui/ChallengeModal.jsx

import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { quizCategories } from '../../data/quizData';
import { FiX, FiZap } from 'react-icons/fi';

const Overlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
  z-index: 2000; backdrop-filter: blur(5px);
`;

const ModalCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg}; width: 90%; max-width: 400px;
  border-radius: 24px; border: 1px solid ${({ theme }) => theme.accent}40;
  padding: 2rem; position: relative; text-align: center;
`;

const Title = styled.h3`
  margin-top: 0; font-size: 1.5rem; color: ${({ theme }) => theme.accent};
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
`;

const InputGroup = styled.div`
  margin: 1.5rem 0; text-align: left;
  label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
  select, input {
    width: 100%; padding: 0.8rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);
    background: rgba(0,0,0,0.2); color: white; outline: none; font-size: 1rem;
  }
`;

const CloseButton = styled.button`
  position: absolute; top: 1rem; right: 1rem; background: none; border: none;
  color: ${({ theme }) => theme.textSecondary}; cursor: pointer; font-size: 1.5rem;
`;

const ChallengeModal = ({ friend, onClose, onSend }) => {
  const [categoryId, setCategoryId] = useState(quizCategories[0].id);
  const [score, setScore] = useState(100);

  const handleSubmit = () => {
    onSend(friend.uid, categoryId, score);
  };

  return (
    <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ModalCard initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <CloseButton onClick={onClose}><FiX/></CloseButton>
        <Title><FiZap/> Tantang Teman</Title>
        <p>Kirim tantangan skor ke <b>{friend.displayName}</b>!</p>
        
        <InputGroup>
          <label>Pilih Kategori</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {quizCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </InputGroup>

        <InputGroup>
          <label>Target Skor</label>
          <input 
            type="number" 
            value={score} 
            onChange={(e) => setScore(e.target.value)} 
            min="10" max="1000" step="10"
          />
        </InputGroup>

        <Button onClick={handleSubmit} style={{ width: '100%', background: '#eab308', color: '#000' }}>
          Kirim Tantangan 🚀
        </Button>
      </ModalCard>
    </Overlay>
  );
};

export default ChallengeModal;