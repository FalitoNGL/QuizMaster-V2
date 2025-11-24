// src/pages/AdminPage.jsx

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { quizCategories } from '../data/quizData';
import { fetchQuestionsFromDB, saveQuestionsToDB, migrateAllData } from '../services/quizService';
import { useUserProgress } from '../context/UserProgressContext';
import { ADMIN_EMAILS } from '../utils/adminConfig'; // Import Config Admin
import { FiSave, FiTrash2, FiPlus, FiEdit3, FiDatabase, FiArrowLeft, FiLock } from 'react-icons/fi';

// Styles
const AdminWrapper = styled.div`
  padding: 2rem; max-width: 1200px; margin: 0 auto; color: ${({ theme }) => theme.text}; min-height: 100vh;
`;

const AccessDeniedWrapper = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 80vh; text-align: center; color: #ef4444;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
`;

const TabContainer = styled.div`
  display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; margin-bottom: 2rem;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.accent}; border-radius: 3px; }
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem; border-radius: 12px; border: none; cursor: pointer;
  background: ${({ $active, theme }) => $active ? theme.accent : 'rgba(255,255,255,0.05)'};
  color: ${({ $active, theme }) => $active ? theme.buttonText : theme.text};
  font-weight: 600; white-space: nowrap; transition: all 0.3s;
  &:hover { background: ${({ theme }) => theme.accent}80; }
`;

const QuestionList = styled.div` display: flex; flex-direction: column; gap: 1rem; `;

const QuestionItem = styled.div`
  background: ${({ theme }) => theme.cardBg}; padding: 1.5rem; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
  h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
  p { margin: 0; color: ${({ theme }) => theme.textSecondary}; font-size: 0.9rem; }
`;

const ActionGroup = styled.div` display: flex; gap: 0.5rem; flex-shrink: 0; `;

const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.8); z-index: 1000;
  display: flex; justify-content: center; align-items: flex-start;
  overflow-y: auto; padding: 2rem 0; backdrop-filter: blur(5px);
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.bg}; padding: 2rem; border-radius: 20px;
  width: 90%; max-width: 700px; border: 1px solid ${({ theme }) => theme.accent};
  box-shadow: 0 0 30px rgba(0,0,0,0.5); margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.25rem;
  label { display: block; margin-bottom: 0.5rem; font-weight: bold; color: ${({ theme }) => theme.accent}; font-size: 0.9rem; }
  input, textarea, select {
    width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);
    background: rgba(0,0,0,0.2); color: ${({ theme }) => theme.text}; outline: none; font-family: inherit; font-size: 1rem;
    &:focus { border-color: ${({ theme }) => theme.accent}; background: rgba(0,0,0,0.3); }
  }
  textarea { min-height: 100px; resize: vertical; }
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
    // PROTEKSI: Jika user ada tapi emailnya tidak ada di daftar admin, jangan load data
    if (user && ADMIN_EMAILS.includes(user.email)) {
      loadQuestions(activeTab);
    }
  }, [activeTab, user]);

  // --- LOGIKA PROTEKSI AKSES ---
  if (!user) {
    return <AdminWrapper><div style={{textAlign: 'center', marginTop: '5rem'}}>Silakan login terlebih dahulu.</div></AdminWrapper>;
  }

  if (!ADMIN_EMAILS.includes(user.email)) {
    return (
      <AdminWrapper>
        <AccessDeniedWrapper>
          <FiLock size={80} style={{marginBottom: '1rem'}}/>
          <h2>Akses Ditolak</h2>
          <p>Maaf, akun <b>{user.email}</b> tidak memiliki izin akses ke halaman Admin.</p>
          <Button onClick={onBack} style={{marginTop: '2rem'}}>Kembali ke Menu</Button>
        </AccessDeniedWrapper>
      </AdminWrapper>
    );
  }
  // -----------------------------

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
      alert("Berhasil disimpan ke Database!");
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
    if(window.confirm("Yakin ingin menghapus soal ini?")) {
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
    <AdminWrapper>
      <Header>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <Button onClick={onBack} style={{padding: '0.6rem 1rem'}}><FiArrowLeft/> Kembali</Button>
          <h2 style={{margin: 0}}>Admin Dashboard</h2>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
           <Button onClick={migrateAllData} style={{background: '#f59e0b', color: '#000'}}>
             <FiDatabase/> Migrasi Data JSON
           </Button>
           <Button onClick={handleSaveToDB} primary>
             <FiSave/> Simpan Perubahan
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

      {loading ? <p style={{textAlign: 'center', fontSize: '1.2rem'}}>Memuat data dari database...</p> : (
        <>
          <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px'}}>
            <span>Total Soal Aktif: <b>{questions.length}</b></span>
            <Button onClick={handleAdd} primary><FiPlus/> Tambah Soal Baru</Button>
          </div>

          <QuestionList>
            {questions.length === 0 && (
              <div style={{textAlign: 'center', padding: '3rem', opacity: 0.7}}>
                <FiDatabase size={50} style={{marginBottom: '1rem'}}/>
                <p>Belum ada soal di database untuk kategori ini.</p>
                <p>Klik tombol <b>"Migrasi Data JSON"</b> di kanan atas jika ini pertama kali.</p>
              </div>
            )}
            
            {questions.map((q, idx) => (
              <QuestionItem key={idx}>
                <div style={{flex: 1}}>
                  <h4>{idx + 1}. {q.question}</h4>
                  <p style={{color: '#10b981', fontWeight: 'bold'}}>Jawaban: {q.options[q.correct]}</p>
                  {q.explanation && <p style={{marginTop: '0.5rem', fontSize: '0.85rem'}}>💡 {q.explanation}</p>}
                </div>
                <ActionGroup>
                  <Button onClick={() => handleEdit(idx)} style={{padding: '0.6rem', background: '#3b82f6'}} title="Edit"><FiEdit3/></Button>
                  <Button onClick={() => handleDelete(idx)} style={{padding: '0.6rem', background: '#ef4444'}} title="Hapus"><FiTrash2/></Button>
                </ActionGroup>
              </QuestionItem>
            ))}
          </QuestionList>
        </>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <ModalOverlay initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <ModalContent initial={{scale:0.9, y: 50}} animate={{scale:1, y: 0}} exit={{scale:0.9, y: 50}}>
              <h3 style={{marginTop: 0}}>{editingIndex !== null ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
              <form onSubmit={handleFormSubmit}>
                <InputGroup>
                  <label>Pertanyaan</label>
                  <textarea value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} required placeholder="Tulis pertanyaan di sini..." />
                </InputGroup>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  {formData.options.map((opt, i) => (
                    <InputGroup key={i} style={{marginBottom: '0.5rem'}}>
                      <label style={{fontSize: '0.8rem'}}>Pilihan Jawaban {i + 1}</label>
                      <input value={opt} onChange={e => {
                        const newOpts = [...formData.options];
                        newOpts[i] = e.target.value;
                        setFormData({...formData, options: newOpts});
                      }} required placeholder={`Opsi ${i+1}`} />
                    </InputGroup>
                  ))}
                </div>

                <InputGroup style={{marginTop: '1rem'}}>
                  <label>Kunci Jawaban</label>
                  <select value={formData.correct} onChange={e => setFormData({...formData, correct: parseInt(e.target.value)})}>
                    {formData.options.map((opt, i) => (
                      <option key={i} value={i}>Opsi {i+1}: {opt.substring(0, 30)}{opt.length > 30 ? '...' : ''}</option>
                    ))}
                  </select>
                </InputGroup>

                <InputGroup>
                  <label>Penjelasan (Opsional)</label>
                  <textarea value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} placeholder="Penjelasan jawaban..." style={{minHeight: '80px'}} />
                </InputGroup>

                <InputGroup>
                  <label>Referensi (Opsional)</label>
                  <input value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="Contoh: Buku Hal 12" />
                </InputGroup>

                <div style={{display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end'}}>
                  <Button type="button" onClick={() => setIsModalOpen(false)} style={{background: '#64748b'}}>Batal</Button>
                  <Button type="submit" primary>Simpan ke Daftar (Draft)</Button>
                </div>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </AdminWrapper>
  );
};

export default AdminPage;