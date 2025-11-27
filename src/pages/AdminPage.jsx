// src/pages/AdminPage.jsx

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { quizCategories } from '../data/quizData';
import { fetchQuestionsFromDB, saveQuestionsToDB, migrateAllData } from '../services/quizService';
import { useUserProgress } from '../context/UserProgressContext';
import { ADMIN_EMAILS } from '../utils/adminConfig'; 
import { FiSave, FiTrash2, FiPlus, FiEdit3, FiDatabase, FiArrowLeft, FiLock, FiCheckCircle } from 'react-icons/fi';
import { PageContainer } from '../components/ui/PageLayout'; // Layout konsisten

// --- NEON GLASS STYLES ---

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
`;

const BackButton = styled(Button)`
  background: rgba(255, 255, 255, 0.05); padding: 0.8rem 1.2rem; border-radius: 12px;
  display: flex; align-items: center; gap: 0.5rem;
  &:hover { background: ${({ theme }) => theme.accent}20; }
`;

const Title = styled.h2`
  font-size: 1.8rem; margin: 0;
  background: linear-gradient(to right, #fff, ${({ theme }) => theme.accent});
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
`;

// Tab Neon Style
const TabContainer = styled.div`
  display: flex; gap: 0.8rem; overflow-x: auto; padding-bottom: 1rem; margin-bottom: 2rem;
  &::-webkit-scrollbar { display: none; }
  mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
  padding-left: 5px;
`;

const Tab = styled.button`
  padding: 0.6rem 1.2rem; border-radius: 50px; cursor: pointer;
  border: 1px solid ${({ $active, theme }) => $active ? theme.accent : 'rgba(255,255,255,0.1)'};
  background: ${({ $active, theme }) => $active ? theme.accent + '30' : 'rgba(255,255,255,0.03)'};
  color: ${({ $active, theme }) => $active ? theme.accent : theme.textSecondary};
  font-weight: 600; white-space: nowrap; transition: all 0.3s;
  box-shadow: ${({ $active, theme }) => $active ? `0 0 15px ${theme.accent}40` : 'none'};

  &:hover { 
    border-color: ${({ theme }) => theme.accent}; 
    color: ${({ theme }) => theme.accent};
    transform: translateY(-2px);
  }
`;

const QuestionList = styled.div` display: flex; flex-direction: column; gap: 1rem; `;

const QuestionItem = styled.div`
  background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px);
  padding: 1.5rem; border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${({ theme }) => theme.accent}60;
    transform: scale(1.01);
  }

  h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: ${({ theme }) => theme.text}; }
  p { margin: 0; color: ${({ theme }) => theme.textSecondary}; font-size: 0.9rem; }
  .answer-badge {
    display: inline-block; margin-top: 0.5rem; padding: 0.2rem 0.6rem;
    background: rgba(16, 185, 129, 0.2); color: #34d399; border-radius: 8px; font-size: 0.85rem; font-weight: 600;
  }
`;

const ActionGroup = styled.div` display: flex; gap: 0.5rem; flex-shrink: 0; `;

const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 1000;
  display: flex; justify-content: center; align-items: flex-start;
  overflow-y: auto; padding: 3rem 1rem;
`;

const ModalContent = styled(motion.div)`
  background: rgba(15, 23, 42, 0.95); padding: 2rem; border-radius: 24px;
  width: 100%; max-width: 700px; 
  border: 1px solid ${({ theme }) => theme.accent}60;
  box-shadow: 0 0 40px rgba(0,0,0,0.5); margin-bottom: 2rem;
  position: relative;

  /* Neon glow border effect */
  &::before {
    content: ''; position: absolute; inset: -1px; z-index: -1; border-radius: 24px;
    background: linear-gradient(45deg, ${({ theme }) => theme.accent}, transparent, ${({ theme }) => theme.accent});
    opacity: 0.3;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1.25rem;
  label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: ${({ theme }) => theme.textSecondary}; font-size: 0.9rem; }
  input, textarea, select {
    width: 100%; padding: 0.8rem; border-radius: 12px; 
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05); 
    color: ${({ theme }) => theme.text}; outline: none; font-family: inherit; font-size: 1rem;
    transition: all 0.3s;
    
    &:focus { 
      border-color: ${({ theme }) => theme.accent}; 
      background: rgba(255,255,255,0.1); 
      box-shadow: 0 0 10px ${({ theme }) => theme.accent}30;
    }
  }
  textarea { min-height: 100px; resize: vertical; }
`;

const AccessDeniedWrapper = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 80vh; text-align: center; color: #ef4444;
`;

const AdminPage = ({ onBack }) => {
  const { user } = useUserProgress();
  const [activeTab, setActiveTab] = useState(quizCategories[0].id);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  
  const [formData, setFormData] = useState({
    question: '', options: ['', '', '', ''], correct: 0, explanation: '', reference: ''
  });

  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email)) {
      loadQuestions(activeTab);
    }
  }, [activeTab, user]);

  // --- PROTEKSI AKSES ---
  if (!user) return <PageContainer><div style={{textAlign: 'center', marginTop: '5rem'}}>Silakan login terlebih dahulu.</div></PageContainer>;

  if (!ADMIN_EMAILS.includes(user.email)) {
    return (
      <PageContainer>
        <AccessDeniedWrapper>
          <FiLock size={80} style={{marginBottom: '1rem', opacity: 0.8}}/>
          <h2 style={{fontSize: '2rem'}}>Akses Terbatas</h2>
          <p>Hanya personel berwenang yang dapat mengakses panel ini.</p>
          <Button onClick={onBack} style={{marginTop: '2rem', background: 'rgba(255,255,255,0.1)'}}><FiArrowLeft/> Kembali ke Markas</Button>
        </AccessDeniedWrapper>
      </PageContainer>
    );
  }

  const loadQuestions = async (catId) => {
    setLoading(true);
    const data = await fetchQuestionsFromDB(catId);
    setQuestions(data || []);
    setLoading(false);
  };

  const handleSaveToDB = async () => {
    if(window.confirm(`Simpan ${questions.length} soal ke database kategori ini?`)) {
      setLoading(true);
      await saveQuestionsToDB(activeTab, questions);
      setLoading(false);
      alert("Data berhasil disinkronisasi ke Mainframe!");
    }
  };

  const handleEdit = (idx) => {
    setEditingIndex(idx);
    setFormData(questions[idx]);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingIndex(null);
    setFormData({ question: '', options: ['', '', '', ''], correct: 0, explanation: '', reference: '' });
    setIsModalOpen(true);
  };

  const handleDelete = (idx) => {
    if(window.confirm("Hapus data ini secara permanen?")) {
      const newQ = [...questions];
      newQ.splice(idx, 1);
      setQuestions(newQ);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newQuestions = [...questions];
    if (editingIndex !== null) {
      newQuestions[editingIndex] = formData;
    } else {
      newQuestions.push(formData);
    }
    setQuestions(newQuestions);
    setIsModalOpen(false);
  };

  return (
    <PageContainer>
      <Header>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <BackButton onClick={onBack}><FiArrowLeft/> Kembali</BackButton>
          <Title>Panel Admin</Title>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
           <Button onClick={migrateAllData} style={{background: '#f59e0b', color: '#000', borderRadius: '12px'}}>
             <FiDatabase/> Migrasi JSON
           </Button>
           <Button onClick={handleSaveToDB} style={{background: '#3b82f6', borderRadius: '12px'}}>
             <FiSave/> Simpan Data
           </Button>
        </div>
      </Header>

      <TabContainer>
        {quizCategories.map(cat => (
          <Tab key={cat.id} $active={activeTab === cat.id} onClick={() => setActiveTab(cat.id)}>
            {cat.name}
          </Tab>
        ))}
      </TabContainer>

      {loading ? <p style={{textAlign: 'center', fontSize: '1.2rem', opacity: 0.7}}>Sedang mengambil data terenkripsi...</p> : (
        <>
          <div style={{marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
            <span style={{opacity: 0.8}}>Total Soal: <b style={{color: '#fff', fontSize: '1.1rem'}}>{questions.length}</b></span>
            <Button onClick={handleAdd} style={{background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px'}}><FiPlus/> Buat Soal Baru</Button>
          </div>

          <QuestionList>
            {questions.length === 0 && (
              <div style={{textAlign: 'center', padding: '3rem', opacity: 0.5, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px'}}>
                <FiDatabase size={50} style={{marginBottom: '1rem'}}/>
                <p>Database kosong untuk sektor ini.</p>
                <p>Gunakan tombol <b>"Migrasi JSON"</b> untuk inisialisasi awal.</p>
              </div>
            )}
            
            {questions.map((q, idx) => (
              <QuestionItem key={idx}>
                <div style={{flex: 1}}>
                  <h4>{idx + 1}. {q.question}</h4>
                  <span className="answer-badge"><FiCheckCircle style={{verticalAlign: 'middle'}}/> {q.options[q.correct]}</span>
                  {q.explanation && <p style={{marginTop: '0.8rem', fontSize: '0.85rem', fontStyle: 'italic'}}>ℹ️ {q.explanation}</p>}
                </div>
                <ActionGroup>
                  <Button onClick={() => handleEdit(idx)} style={{padding: '0.6rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '10px'}} title="Edit"><FiEdit3/></Button>
                  <Button onClick={() => handleDelete(idx)} style={{padding: '0.6rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '10px'}} title="Hapus"><FiTrash2/></Button>
                </ActionGroup>
              </QuestionItem>
            ))}
          </QuestionList>
        </>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <ModalOverlay initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <ModalContent initial={{scale:0.95, opacity: 0}} animate={{scale:1, opacity: 1}} exit={{scale:0.95, opacity: 0}}>
              <h3 style={{marginTop: 0, fontSize: '1.5rem', color: '#fff'}}>{editingIndex !== null ? 'Edit Data Soal' : 'Input Soal Baru'}</h3>
              <form onSubmit={handleFormSubmit}>
                <InputGroup>
                  <label>Pertanyaan</label>
                  <textarea value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} required placeholder="Input pertanyaan..." />
                </InputGroup>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  {formData.options.map((opt, i) => (
                    <InputGroup key={i} style={{marginBottom: '0.5rem'}}>
                      <label style={{fontSize: '0.8rem'}}>Opsi {String.fromCharCode(65+i)}</label>
                      <input value={opt} onChange={e => {
                        const newOpts = [...formData.options];
                        newOpts[i] = e.target.value;
                        setFormData({...formData, options: newOpts});
                      }} required placeholder={`Pilihan ${i+1}`} />
                    </InputGroup>
                  ))}
                </div>

                <InputGroup style={{marginTop: '1rem'}}>
                  <label>Kunci Jawaban Benar</label>
                  <select value={formData.correct} onChange={e => setFormData({...formData, correct: parseInt(e.target.value)})}>
                    {formData.options.map((opt, i) => (
                      <option key={i} value={i}>Opsi {String.fromCharCode(65+i)}: {opt.substring(0, 30)}{opt.length > 30 ? '...' : ''}</option>
                    ))}
                  </select>
                </InputGroup>

                <InputGroup>
                  <label>Penjelasan (Opsional)</label>
                  <textarea value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} placeholder="Detail pembahasan..." style={{minHeight: '80px'}} />
                </InputGroup>

                <InputGroup>
                  <label>Referensi Sumber (Opsional)</label>
                  <input value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="Contoh: Modul A Hal. 10" />
                </InputGroup>

                <div style={{display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end'}}>
                  <Button type="button" onClick={() => setIsModalOpen(false)} style={{background: 'rgba(255,255,255,0.1)', borderRadius: '12px'}}>Batal</Button>
                  <Button type="submit" style={{background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '12px'}}>Simpan Data</Button>
                </div>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default AdminPage;