// src/pages/SocialPage.jsx

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../context/UserProgressContext';
import { 
  searchUsers, sendFriendRequest, acceptFriendRequest, 
  rejectFriendRequest, getFriendsDetails, 
  sendChallenge, getMyChallenges, deleteChallenge, getChallengeHistory
} from '../services/socialService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { quizCategories } from '../data/quizData';
import { Button } from '../components/ui/Button';
import { FiUserPlus, FiUsers, FiBell, FiZap, FiArrowLeft, FiCheck, FiX, FiSearch, FiTrash2, FiPlay, FiClock } from 'react-icons/fi';
import FriendProfileModal from '../components/ui/FriendProfileModal';
import ChallengeModal from '../components/ui/ChallengeModal';
import { PageContainer } from '../components/ui/PageLayout';

// --- NEON GLASS STYLES ---

const Header = styled.div`
  display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
`;

const BackButton = styled(Button)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem; border-radius: 50%; width: 50px; height: 50px;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: ${({ theme }) => theme.accent}20; border-color: ${({ theme }) => theme.accent}; }
`;

const Title = styled.h1`
  margin: 0; font-size: 2rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.3));
`;

const TabContainer = styled.div`
  display: flex; gap: 0.8rem; margin-bottom: 2rem; 
  padding-bottom: 0.5rem; overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
  mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
  padding-left: 5px;
`;

const TabButton = styled.button`
  background: ${({ $active, theme }) => $active ? theme.accent + '20' : 'rgba(255,255,255,0.03)'};
  border: 1px solid ${({ $active, theme }) => $active ? theme.accent : 'rgba(255,255,255,0.1)'};
  color: ${({ $active, theme }) => $active ? theme.accent : theme.textSecondary};
  padding: 0.6rem 1.2rem; border-radius: 50px; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s; white-space: nowrap;
  font-weight: 600; font-size: 0.9rem;

  &:hover { 
    background: ${({ theme }) => theme.accent}10;
    border-color: ${({ theme }) => theme.accent}60;
    color: ${({ theme }) => theme.accent};
    transform: translateY(-2px);
  }
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px);
  padding: 1.2rem; border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${({ theme }) => theme.accent}40;
    transform: translateX(5px);
  }
`;

const HistoryCard = styled(Card)`
  border-left: 4px solid ${({ $win }) => $win ? '#22c55e' : '#ef4444'};
  background: linear-gradient(90deg, ${({ $win }) => $win ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'}, transparent);
`;

const UserInfo = styled.div`
  display: flex; align-items: center; gap: 1rem;
  img { 
    width: 50px; height: 50px; border-radius: 50%; object-fit: cover; 
    border: 2px solid ${({ theme }) => theme.accent}; 
    box-shadow: 0 0 10px ${({ theme }) => theme.accent}40;
  }
  div { display: flex; flex-direction: column; }
  h4 { margin: 0; font-size: 1.1rem; font-weight: 700; }
  span { font-size: 0.85rem; color: ${({ theme }) => theme.textSecondary}; }
`;

const InputGroup = styled.div`
  display: flex; gap: 1rem; margin-bottom: 2rem;
  input {
    flex: 1; padding: 1rem; border-radius: 16px; 
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05); color: white; outline: none;
    transition: all 0.3s;
    &:focus { 
      border-color: ${({ theme }) => theme.accent}; 
      background: rgba(255,255,255,0.1);
      box-shadow: 0 0 15px ${({ theme }) => theme.accent}20;
    }
  }
`;

const Badge = styled.span`
  background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 6px; 
  border-radius: 10px; position: absolute; top: -5px; right: -8px;
  border: 2px solid ${({ theme }) => theme.bg};
`;

// --- MAIN COMPONENT ---

const SocialPage = ({ onBack, onStartQuiz }) => {
  const { user } = useUserProgress();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [challengesList, setChallengesList] = useState([]); 
  const [historyList, setHistoryList] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [selectedFriend, setSelectedFriend] = useState(null); 
  const [friendToChallenge, setFriendToChallenge] = useState(null); 

  useEffect(() => {
    if (user) loadSocialData();
  }, [user, activeTab]);

  const loadSocialData = async () => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (activeTab === 'friends') setFriendsList(await getFriendsDetails(data.friends || []));
        if (activeTab === 'requests') setRequestsList(await getFriendsDetails(data.friendRequests || []));
        if (activeTab === 'challenges') setChallengesList(await getMyChallenges(user.uid));
        if (activeTab === 'history') setHistoryList(await getChallengeHistory(user.uid));
      }
    } catch (error) {
      console.error("Error loading social data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const results = await searchUsers(searchQuery);
    const filtered = results.filter(u => u.uid !== user.uid);
    setSearchResults(filtered);
    setLoading(false);
  };

  const handleAddFriend = async (targetUid) => {
    await sendFriendRequest(user.uid, targetUid);
    alert("Permintaan pertemanan dikirim!");
    setSearchResults(prev => prev.filter(u => u.uid !== targetUid));
  };

  const handleAccept = async (requesterId) => {
    await acceptFriendRequest(user.uid, requesterId);
    loadSocialData();
  };

  const handleReject = async (requesterId) => {
    await rejectFriendRequest(user.uid, requesterId);
    loadSocialData();
  };

  const handleSendChallenge = async (targetUid, catId, score) => {
    await sendChallenge(user.uid, user.displayName, targetUid, catId, score);
    alert("Tantangan terkirim! Cek tab Riwayat nanti untuk melihat hasilnya.");
    setFriendToChallenge(null);
  };

  const handleAcceptChallenge = async (challenge) => {
    onStartQuiz({ 
      categoryId: challenge.categoryId, 
      mode: 'klasik', 
      questionCount: 10, 
      duration: 120,
      isChallenge: true,
      challengeId: challenge.id,
      targetScore: parseInt(challenge.scoreToBeat),
      challengerName: challenge.challengerName
    });
  };

  const handleDeleteChallenge = async (id) => {
    if(window.confirm("Hapus/Tolak tantangan ini?")) {
      await deleteChallenge(id);
      loadSocialData();
    }
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={onBack}><FiArrowLeft/></BackButton>
        <Title>Hubungan Sosial</Title>
      </Header>

      <TabContainer>
        <TabButton $active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}><FiUsers/> Teman</TabButton>
        <TabButton $active={activeTab === 'add'} onClick={() => setActiveTab('add')}><FiUserPlus/> Cari</TabButton>
        <TabButton $active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}>
          <div style={{position: 'relative'}}><FiBell/>{requestsList.length > 0 && <Badge>{requestsList.length}</Badge>}</div> Req
        </TabButton>
        <TabButton $active={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')}>
          <div style={{position: 'relative'}}><FiZap/>{challengesList.length > 0 && <Badge>{challengesList.length}</Badge>}</div> Duel
        </TabButton>
        <TabButton $active={activeTab === 'history'} onClick={() => setActiveTab('history')}><FiClock/> Riwayat</TabButton>
      </TabContainer>

      {activeTab === 'friends' && (
        <div>
          {friendsList.length === 0 ? <p style={{textAlign:'center', opacity:0.6}}>Belum ada teman. Cari di tab 'Cari'.</p> : friendsList.map(friend => (
            <Card key={friend.uid} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <UserInfo>
                <img src={friend.photoURL || 'https://via.placeholder.com/50'} alt="Avatar" />
                <div><h4>{friend.displayName}</h4><span>Skor Total: {Object.values(friend.highScores || {}).reduce((a, b) => a + b, 0)}</span></div>
              </UserInfo>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <Button style={{fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius:'10px'}} onClick={() => setSelectedFriend(friend)}>Profil</Button>
                <Button style={{fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#eab308', color: '#000', borderRadius:'10px'}} onClick={() => setFriendToChallenge(friend)}><FiZap/> Duel</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'add' && (
        <div>
          <InputGroup>
            <input placeholder="Cari email atau nama teman..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Button onClick={handleSearch} style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius:'16px'}}><FiSearch/></Button>
          </InputGroup>
          {searchResults.map(u => (
            <Card key={u.uid} initial={{opacity:0}} animate={{opacity:1}}>
              <UserInfo>
                <img src={u.photoURL || 'https://via.placeholder.com/50'} alt="Avatar" />
                <div><h4>{u.displayName}</h4><span>{u.email}</span></div>
              </UserInfo>
              <Button onClick={() => handleAddFriend(u.uid)} style={{background: '#10b981', borderRadius:'10px'}}><FiUserPlus/> Add</Button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {requestsList.length === 0 ? <p style={{textAlign:'center', opacity:0.6}}>Tidak ada permintaan masuk.</p> : requestsList.map(req => (
            <Card key={req.uid}>
              <UserInfo>
                <img src={req.photoURL || 'https://via.placeholder.com/50'} alt="Avatar" />
                <div><h4>{req.displayName}</h4><span>Ingin berteman</span></div>
              </UserInfo>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <Button onClick={() => handleAccept(req.uid)} style={{background: '#10b981', padding: '0.6rem', borderRadius:'10px'}}><FiCheck/></Button>
                <Button onClick={() => handleReject(req.uid)} style={{background: '#ef4444', padding: '0.6rem', borderRadius:'10px'}}><FiX/></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div>
          {challengesList.length === 0 ? <p style={{textAlign:'center', opacity:0.6}}>Aman. Tidak ada yang menantangmu.</p> : challengesList.map(ch => {
            const catName = quizCategories.find(c => c.id === ch.categoryId)?.name || "Kuis";
            return (
              <Card key={ch.id}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{fontSize: '2rem', color: '#eab308', filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.5))'}}><FiZap/></div>
                  <div>
                    <h4 style={{margin: 0}}>Lawan: {ch.challengerName}</h4>
                    <span style={{fontSize: '0.9rem', color: '#ccc'}}>Target: <b style={{color: '#eab308'}}>{ch.scoreToBeat}</b> di {catName}</span>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <Button onClick={() => handleAcceptChallenge(ch)} style={{background: '#10b981', fontSize: '0.8rem', borderRadius:'10px'}}><FiPlay/> Terima</Button>
                  <Button onClick={() => handleDeleteChallenge(ch.id)} style={{background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.5rem', borderRadius:'10px'}}><FiTrash2/></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {historyList.length === 0 ? <p style={{textAlign:'center', opacity:0.6}}>Belum ada riwayat pertempuran.</p> : historyList.map(h => {
            const isChallenger = h.challengerId === user.uid;
            const myName = user.displayName;
            const amIWinner = h.winner === myName; 
            
            return (
              <HistoryCard key={h.id} $win={amIWinner}>
                <div>
                  <h4 style={{margin: 0}}>{h.winner ? `Pemenang: ${h.winner}` : "Selesai"}</h4>
                  <span style={{fontSize: '0.85rem', opacity: 0.7}}>
                    Skor Akhir: {h.finalScore} (Target: {h.scoreToBeat})
                  </span>
                </div>
                <div style={{fontWeight: 'bold', color: amIWinner ? '#22c55e' : '#ef4444', textShadow: amIWinner ? '0 0 10px rgba(34,197,94,0.4)' : 'none'}}>
                  {amIWinner ? "MENANG" : "KALAH"}
                </div>
              </HistoryCard>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedFriend && <FriendProfileModal user={selectedFriend} onClose={() => setSelectedFriend(null)} />}
        {friendToChallenge && <ChallengeModal friend={friendToChallenge} onClose={() => setFriendToChallenge(null)} onSend={handleSendChallenge} />}
      </AnimatePresence>

    </PageContainer>
  );
};

export default SocialPage;