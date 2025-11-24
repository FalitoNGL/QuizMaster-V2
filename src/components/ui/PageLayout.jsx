// src/components/ui/PageLayout.jsx

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { Button } from './Button'; // Import tombol utama kita

export const PageContainer = styled(motion.div)`
  width: 100%;
  max-width: 52rem;
  margin: 0 auto; // Hapus margin atas bawah agar flexbox di App.jsx bekerja
  padding: 1rem;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    color: ${({ theme }) => theme.text};
  }
`;

// Tombol kembali sekarang menggunakan style dari Button utama
const BackButtonStyle = styled(Button)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.accent};

  &:hover {
    background: ${({ theme }) => theme.accent};
    color: white;
  }
`;

export const PageBackButton = ({ onClick }) => {
  return (
    <BackButtonStyle onClick={onClick}>
      <FiArrowLeft />
    </BackButtonStyle>
  );
};