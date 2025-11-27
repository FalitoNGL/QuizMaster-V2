// src/pages/LeaderboardPage.jsx

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { quizCategories } from '../data/quizData';
import { Button } from '../components/ui/Button';
import { PageContainer } from '../components/ui/PageLayout'; // Gunakan Layout Standar agar background sama
import { FiArrowLeft, FiUser, FiAward } from 'react-icons/fi';
import { FaTrophy, FaMedal } from 'react-icons/fa';

// --- STYLED COMPONENTS (NEON GLASS STYLE) ---

const Header = styled.div`
  display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
  position: relative; z-index: 2;
`;

const BackButton = styled(Button)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem; border-radius: 50%; width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: ${({ theme }) => theme.accent}20; border-color: ${({ theme }) => theme.accent}; }
`;

const Title = styled.h1`
  font-size: 2rem; margin: 0;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  display: flex; align-items: center; gap: 0.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.3));
`;

// Container Filter (Scrollable Horizontal)
const FilterContainer = styled.div`
  display: flex; gap: 0.8rem; overflow-x: auto; padding-bottom: 1rem; margin-bottom: 1.5rem;
  
  /* Sembunyikan Scrollbar tapi tetap bisa discroll */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none; scrollbar-width: none;
  
  mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
  padding-left: 1rem; padding-right: 1rem;
`;

// Tombol Filter ala "Neon Pill"
const FilterButton = styled.button`
  padding: 0.6rem 1.2rem; 
  border-radius: 50px; 
  border: 1px solid ${({ $active, theme }) => $active ? '#FFD700' : 'rgba(255,255,255,0.1)'};
  background: ${({ $active, theme }) => $active ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
  color: ${({ $active, theme }) => $active ? '#FFD700' : theme.textSecondary};
  cursor: pointer; white-space: nowrap; transition: all 0.3s ease;
  font-size: 0.9rem; font-weight: 600;

  &:hover { 
    border-color: #FFD700; 
    color: #FFD700;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  }
`;

const ListContainer = styled(motion.div)`
  display: flex; flex-direction: column; gap: 1rem;
  max-width: 800px; margin: 0 auto;
`;

// Kartu Peringkat (Glass Effect)
const RankItem = styled(motion.div)`
  display: flex; align-items: center; gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  padding: 1rem 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
  transition: all 0.3s;

  /* Style Khusus Juara 1, 2, 3 */
  ${({ $rank }) => $rank === 1 && `
    border-color: #FFD700; 
    background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.15);
  `}
  ${({ $rank }) => $rank === 2 && `
    border-color: #C0C0C0; 
    background: linear-gradient(90deg, rgba(192, 192, 192, 0.1), transparent);
  `}
  ${({ $rank }) => $rank === 3 && `
    border-color: #CD7F32; 
    background: linear-gradient(90deg, rgba(205, 127, 50, 0.1), transparent);
  `}

  &:hover {
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const RankBadge = styled.div`
  width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 800;
  
  /* Ikon Piala/Medali untuk Top 3 */
  color: ${({ $rank }) => 
    $rank === 1 ? '#FFD700' : 
    $rank === 2 ? '#C0C0C0' : 
    $rank === 3 ? '#CD7F32' : 'rgba(255,255,255,0.3)'};
`;

const UserAvatar = styled.div`
  width: 50px; height: 50px; border-radius: 50%; overflow: hidden;
  background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;
  border: 2px solid ${({ $rank }) => 
    $rank === 1 ? '#FFD700' : 
    $rank === 2 ? '#C0C0C0' : 
    $rank === 3 ? '#CD7F32' : 'transparent'};
    
  img { width: 100%; height: 100%; object-fit: cover; }
  svg { font-size: 1.5rem; color: rgba(255,255,255,0.5); }
`;

const UserInfo = styled.div` flex: 1; `;
const UserName = styled.div` 
  font-weight: 700; font-size: 1.1rem; 
  color: ${({ theme }) => theme.text};
`;
const UserSubtext = styled.div` font-size: 0.8rem; color: ${({ theme }) => theme.textSecondary}; `;

const ScoreBadge = styled.div`
  background: rgba(0,0,0,0.3);
  padding: 0.5rem 1rem; border-radius: 12px;
  font-weight: 700; font-family: 'Poppins', sans-serif;
  color: ${({ $rank, theme }) => 
    $rank === 1 ? '#FFD700' : 
    $rank === 2 ? '#C0C0C0' : 
    $rank === 3 ? '#CD7F32' : theme.accent};
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; gap: 0.5rem;
`;

// --- MAIN COMPONENT ---

const LeaderboardPage = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState(quizCategories[0].id);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const allUsers = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const scores = data.highScores || {};
          
          let maxScore = 0;
          // Logika pencarian skor per kategori (DARI KODE ANDA)
          Object.keys(scores).forEach(key => {
            if (key.startsWith(activeCategory)) {
              if (scores[key] > maxScore) maxScore = scores[key];
            }
          });

          if (maxScore > 0) {
            allUsers.push({
              uid: doc.id,
              name: data.displayName || 'Agen Rahasia',
              photo: data.photoURL, 
              email: data.email,
              score: maxScore
            });
          }
        });

        allUsers.sort((a, b) => b.score - a.score);
        setLeaderboard(allUsers.slice(0, 10)); 
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeCategory]);

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={onBack}><FiArrowLeft size={20}/></BackButton>
        <Title>
            <FaTrophy color="#FFD700"/>
            Leaderboard
        </Title>
      </Header>

      {/* FILTER BUTTONS (Gaya Neon Pills) */}
      <FilterContainer>
        {quizCategories.map(cat => (
          <FilterButton 
            key={cat.id} 
            $active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </FilterButton>
        ))}
      </FilterContainer>

      {loading ? (
        <div style={{textAlign: 'center', marginTop: '3rem', opacity: 0.7}}>Mengakses Database Pusat...</div>
      ) : (
        <ListContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {leaderboard.length === 0 ? (
            <div style={{textAlign: 'center', opacity: 0.5, marginTop: '3rem', padding: '2rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '20px'}}>
               <FiUser size={40} style={{marginBottom: '1rem'}}/>
               <p>Belum ada agen yang menaklukkan kategori ini.</p>
            </div>
          ) : (
            leaderboard.map((user, index) => (
              <RankItem 
                key={user.uid} 
                $rank={index + 1}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* NOMOR / MEDALI */}
                <RankBadge $rank={index + 1}>
                    {index === 0 ? <FaTrophy /> : 
                     index === 1 ? <FaMedal /> : 
                     index === 2 ? <FaMedal /> : 
                     (index + 1)}
                </RankBadge>

                {/* AVATAR */}
                <UserAvatar $rank={index + 1}>
                  {user.photo ? <img src={user.photo} alt={user.name} /> : <FiUser />}
                </UserAvatar>

                {/* INFO USER */}
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserSubtext>{user.email ? user.email.split('@')[0] : 'Unknown'}</UserSubtext>
                </UserInfo>

                {/* SKOR */}
                <ScoreBadge $rank={index + 1}>
                   {user.score} pts
                </ScoreBadge>
              </RankItem>
            ))
          )}
        </ListContainer>
      )}
    </PageContainer>
  );
};

export default LeaderboardPage;