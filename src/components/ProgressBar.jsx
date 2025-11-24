// src/components/ProgressBar.jsx

import { motion } from 'framer-motion';
import styled from 'styled-components';

const BarContainer = styled.div`
  width: 100%;
`;

const InfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
  padding: 0 0.25rem;
`;

const Label = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

const ProgressText = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const BarBackground = styled.div`
  width: 100%;
  height: 12px;
  background-color: ${({ theme }) => theme.cardBg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
`;

const BarFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${({ theme }) => theme.accent}, ${({ theme }) => `color-mix(in srgb, ${theme.accent} 50%, #fff)`});
  border-radius: 9999px;
`;

const ProgressBar = ({ current, total }) => {
  const progress = (current / total) * 100;
  return (
    <BarContainer>
      <InfoContainer>
        <Label>Progres Kuis</Label>
        <ProgressText>Soal {current} dari {total}</ProgressText>
      </InfoContainer>
      <BarBackground>
        <BarFill
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </BarBackground>
    </BarContainer>
  );
};

export default ProgressBar;