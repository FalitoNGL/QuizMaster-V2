// src/pages/LeaderboardPage.jsx

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { quizCategories } from '../data/quizData';
import { Button } from '../components/ui/Button';
// PERBAIKAN: Ganti FiTrophy dengan FaTrophy dari 'react-icons/fa'
import { FiArrowLeft, FiUser } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa'; 

const PageWrapper = styled.div`
  padding: 2rem; max-width: 800px; margin: 0 auto; min-height: 100vh;
  color: ${({ theme }) => theme.text};
`;

const Header = styled.div`
  display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
`;

const Title = styled.h1`
  margin: 0; font-size: 2rem;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
`;

const FilterContainer = styled.div`
  display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 1rem; margin-bottom: 2rem;
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.accent}; }
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid ${({ theme }) => theme.accent}40;
  background: ${({ $active, theme }) => $active ? theme.accent : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.buttonText : theme.textSecondary};
  cursor: pointer; white-space: nowrap; transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.accent}; }
`;

const ListContainer = styled(motion.div)`
  display: flex; flex-direction: column; gap: 1rem;
`;

const RankItem = styled(motion.div)`
  display: flex; align-items: center; gap: 1rem;
  background: ${({ theme }) => theme.cardBg}; padding: 1rem 1.5rem;
  border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);
  
  ${({ $rank }) => $rank === 1 && `border: 2px solid #FFD700; box-shadow: 0 0 15px #FFD70040;`}
  ${({ $rank }) => $rank === 2 && `border: 1px solid #C0C0C0;`}
  ${({ $rank }) => $rank === 3 && `border: 1px solid #CD7F32;`}
`;

const RankNumber = styled.div`
  font-size: 1.5rem; font-weight: 800; width: 40px; text-align: center;
  color: ${({ $rank }) => 
    $rank === 1 ? '#FFD700' : 
    $rank === 2 ? '#C0C0C0' : 
    $rank === 3 ? '#CD7F32' : 'inherit'};
`;

const UserAvatar = styled.div`
  width: 45px; height: 45px; border-radius: 50%; overflow: hidden;
  background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const UserInfo = styled.div` flex: 1; `;
const UserName = styled.div` font-weight: bold; font-size: 1.1rem; `;
const UserScore = styled.div` font-weight: 800; color: ${({ theme }) => theme.accent}; font-size: 1.2rem; `;

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
          Object.keys(scores).forEach(key => {
            if (key.startsWith(activeCategory)) {
              if (scores[key] > maxScore) maxScore = scores[key];
            }
          });

          if (maxScore > 0) {
            allUsers.push({
              uid: doc.id,
              name: data.displayName || 'Anonymous',
              photo: data.photoURL, 
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
    <PageWrapper>
      <Header>
        <Button onClick={onBack} style={{padding: '0.5rem'}}><FiArrowLeft/></Button>
        <Title><FaTrophy style={{marginRight: '10px', color: '#FFD700'}}/> Leaderboard</Title>
      </Header>

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
        <div style={{textAlign: 'center', marginTop: '3rem'}}>Memuat Peringkat...</div>
      ) : (
        <ListContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {leaderboard.length === 0 ? (
            <div style={{textAlign: 'center', opacity: 0.6, marginTop: '2rem'}}>Belum ada data skor untuk kategori ini.</div>
          ) : (
            leaderboard.map((user, index) => (
              <RankItem 
                key={user.uid} 
                $rank={index + 1}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <RankNumber $rank={index + 1}>{index + 1}</RankNumber>
                <UserAvatar>
                  {user.photo ? <img src={user.photo} alt={user.name} /> : <FiUser />}
                </UserAvatar>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                </UserInfo>
                <UserScore>{user.score}</UserScore>
              </RankItem>
            ))
          )}
        </ListContainer>
      )}
    </PageWrapper>
  );
};

export default LeaderboardPage;