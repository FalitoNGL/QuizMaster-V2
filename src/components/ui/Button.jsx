// src/components/ui/Button.jsx

import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);

  /* ================== PERBAIKAN UTAMA DI SINI ================== */
  color: ${({ theme }) => theme.buttonText || '#ffffff'};
  background: ${({ theme }) => theme.accent};
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 7px 25px ${({ theme }) => theme.glow};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: translateY(0);
    box-shadow: none;
    background: ${({ theme }) => theme.textSecondary};
    color: ${({ theme }) => theme.text};
  }
`;