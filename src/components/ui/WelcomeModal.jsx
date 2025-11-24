// src/components/ui/WelcomeModal.jsx

import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button'; 
import { useUserProgress } from '../../context/UserProgressContext';
import { FaGoogle, FaEnvelope, FaLock, FaUser } from 'react-icons/fa'; 

const Overlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85); display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(8px);
`;

const ModalCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg}; padding: 2.5rem; border-radius: 24px;
  width: 90%; max-width: 450px; text-align: center;
  border: 1px solid ${({ theme }) => theme.accent}40; box-shadow: 0 0 50px ${({ theme }) => theme.glow};
  display: flex; flex-direction: column; gap: 1rem;
`;

const Title = styled.h2`
  font-size: 2rem; margin: 0; font-weight: 800;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent}, #fff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
`;

const InputGroup = styled.div`
  position: relative; margin-bottom: 0.5rem;
  svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.textSecondary}; }
`;

const Input = styled.input`
  width: 100%; padding: 12px 12px 12px 45px;
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; color: ${({ theme }) => theme.text}; font-size: 1rem; outline: none;
  &:focus { border-color: ${({ theme }) => theme.accent}; background: rgba(255, 255, 255, 0.1); }
`;

const Divider = styled.div`
  display: flex; align-items: center; margin: 1rem 0; color: ${({ theme }) => theme.textSecondary}; font-size: 0.8rem;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
  span { padding: 0 10px; }
`;

const ErrorMsg = styled.p`
  color: #ff4d4d; font-size: 0.85rem; margin: -0.5rem 0 0.5rem 0;
`;

const ToggleText = styled.p`
  color: ${({ theme }) => theme.textSecondary}; font-size: 0.9rem; margin-top: 1rem; cursor: pointer;
  span { color: ${({ theme }) => theme.accent}; font-weight: bold; text-decoration: underline; }
`;

const WelcomeModal = () => {
  const { loginGoogle, loginEmail, registerEmail } = useUserProgress();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!formData.name) throw new Error("Nama wajib diisi.");
        await registerEmail(formData.name, formData.email, formData.password);
      } else {
        await loginEmail(formData.email, formData.password);
      }
    } catch (err) {
      // Terjemahan Error Firebase Sederhana
      let msg = "Terjadi kesalahan.";
      if (err.code === 'auth/invalid-email') msg = "Format email salah.";
      if (err.code === 'auth/user-not-found') msg = "User tidak ditemukan.";
      if (err.code === 'auth/wrong-password') msg = "Password salah.";
      if (err.code === 'auth/email-already-in-use') msg = "Email sudah terdaftar.";
      if (err.code === 'auth/weak-password') msg = "Password terlalu lemah (min 6 karakter).";
      if (err.code === 'auth/invalid-credential') msg = "Email atau password salah.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ModalCard initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div><Title>Quiz Master</Title></div>
        
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <InputGroup>
              <FaUser />
              <Input name="name" placeholder="Nama Panggilan" value={formData.name} onChange={handleChange} />
            </InputGroup>
          )}
          <InputGroup>
            <FaEnvelope />
            <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </InputGroup>
          <InputGroup>
            <FaLock />
            <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </InputGroup>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Memproses...' : (isRegister ? 'Daftar Akun' : 'Masuk')}
          </Button>
        </form>

        <Divider><span>ATAU</span></Divider>

        <Button onClick={loginGoogle} style={{ width: '100%', background: '#fff', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
           <FaGoogle color="#DB4437" /> Masuk dengan Google
        </Button>

        <ToggleText onClick={() => { setIsRegister(!isRegister); setError(''); }}>
          {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
          <span>{isRegister ? "Login di sini" : "Daftar sekarang"}</span>
        </ToggleText>
      </ModalCard>
    </Overlay>
  );
};

export default WelcomeModal;