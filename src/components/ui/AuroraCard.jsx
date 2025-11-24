import styled from 'styled-components';
import { motion } from 'framer-motion';

export const AuroraCard = styled(motion.div)`
  position: relative;
  background: ${({ theme }) => theme.cardBg};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 2.5rem;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: ${({ theme }) => theme.borderRadius};
    border: 2px solid transparent;
    background: linear-gradient(120deg, transparent, ${({ theme }) => theme.accent}, transparent) border-box;
    -webkit-mask:
      linear-gradient(#fff 0 0) padding-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
          mask-composite: exclude;
    opacity: 0.7;
    pointer-events: none;
    animation: rotateBorder 6s linear infinite;
  }

  @keyframes rotateBorder {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;