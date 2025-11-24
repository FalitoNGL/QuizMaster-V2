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

const PageWrapper = styled.div`
  padding: 2rem; max-width: 800px; margin: 0 auto; min-height: 100vh; color: ${({ theme }) => theme.text};
`;

const Header = styled.div`
  display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
`;

const Title = styled.h1`
  margin: 0; font-size: 2rem; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
`;

const TabContainer = styled.div`
  display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; overflow-x: auto;
`;

const TabButton = styled.button`
  background: none; border: none; padding: 0.5rem 1rem; cursor: pointer;
  color: ${({ $active, theme }) => $active ? theme.accent : theme.textSecondary};
  font-weight: ${({ $active }) => $active ? 'bold' : 'normal'};
  border-bottom: 2px solid ${({ $active, theme }) => $active ? theme.accent : 'transparent'};
  display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s; white-space: nowrap;
  &:hover { color: ${({ theme }) => theme.accent}; }
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg}; padding: 1.5rem; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1); margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
`;

const HistoryCard = styled(Card)`
  border-left: 4px solid ${({ $win }) => $win ? '#22c55e' : '#ef4444'};
`;

const UserInfo = styled.div`
  display: flex; align-items: center; gap: 1rem;
  img { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid ${({ theme }) => theme.accent}; }
  div { display: flex; flex-direction: column; }
  h4 { margin: 0; font-size: 1.1rem; }
  span { font-size: 0.85rem; color: ${({ theme }) => theme.textSecondary}; }
`;

const InputGroup = styled.div`
  display: flex; gap: 1rem; margin-bottom: 2rem;
  input {
    flex: 1; padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);
    background: rgba(0,0,0,0.2); color: white; outline: none;
    &:focus { border-color: ${({ theme }) => theme.accent}; }
  }
`;

const Badge = styled.span`
  background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; position: absolute; top: -5px; right: -10px;
`;

const SocialPage = ({ onBack, onStartQuiz }) => {
  const { user } = useUserProgress();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [challengesList, setChallengesList] = useState([]); 
  const [historyList, setHistoryList] = useState([]); // Riwayat Duel
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
        if (activeTab === 'friends') {
          setFriendsList(await getFriendsDetails(data.friends || []));
        }
        if (activeTab === 'requests') {
          setRequestsList(await getFriendsDetails(data.friendRequests || []));
        }
        if (activeTab === 'challenges') {
          setChallengesList(await getMyChallenges(user.uid));
        }
        if (activeTab === 'history') {
          setHistoryList(await getChallengeHistory(user.uid));
        }
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
    // Jangan hapus dulu! Kita kirim ID-nya ke QuizPage
    onStartQuiz({ 
      categoryId: challenge.categoryId, 
      mode: 'klasik', 
      questionCount: 10, 
      duration: 120,
      // Data Penting untuk QuizPage
      isChallenge: true,
      challengeId: challenge.id, // ID Dokumen Challenge
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
    <PageWrapper>
      <Header>
        <Button onClick={onBack} style={{padding: '0.5rem'}}><FiArrowLeft/></Button>
        <Title>Komunitas</Title>
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
          {friendsList.length === 0 ? <p>Belum ada teman.</p> : friendsList.map(friend => (
            <Card key={friend.uid}>
              <UserInfo>
                <img src={friend.photoURL || 'https://via.placeholder.com/50'} alt="Avatar" />
                <div><h4>{friend.displayName}</h4><span>Skor Total: {Object.values(friend.highScores || {}).reduce((a, b) => a + b, 0)}</span></div>
              </UserInfo>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <Button style={{fontSize: '0.8rem', padding: '0.5rem'}} onClick={() => setSelectedFriend(friend)}>Profil</Button>
                <Button style={{fontSize: '0.8rem', padding: '0.5rem', background: '#eab308', color: '#000'}} onClick={() => setFriendToChallenge(friend)}><FiZap/> Tantang</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'add' && (
        <div>
          <InputGroup>
            <input placeholder="Cari email teman..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Button onClick={handleSearch} primary><FiSearch/></Button>
          </InputGroup>
          {searchResults.map(u => (
            <Card key={u.uid}>
              <UserInfo>
                <img src={u.photoURL || 'https://via.placeholder.com/50'} alt="Avatar" />
                <div><h4>{u.displayName}</h4><span>{u.email}</span></div>
              </UserInfo>
              <Button onClick={() => handleAddFriend(u.uid)} style={{background: '#10b981'}}><FiUserPlus/> Add</Button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {requestsList.length === 0 ? <p>Tidak ada permintaan.</p> : requestsList.map(req => (
            <Card key={req.uid}>
              <UserInfo>
                <img src={req.photoURL || 'https://via.placeholder.com/50'} alt="Avatar" />
                <div><h4>{req.displayName}</h4><span>Ingin berteman</span></div>
              </UserInfo>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <Button onClick={() => handleAccept(req.uid)} style={{background: '#10b981', padding: '0.5rem'}}><FiCheck/></Button>
                <Button onClick={() => handleReject(req.uid)} style={{background: '#ef4444', padding: '0.5rem'}}><FiX/></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div>
          {challengesList.length === 0 ? <p>Tidak ada tantangan aktif.</p> : challengesList.map(ch => {
            const catName = quizCategories.find(c => c.id === ch.categoryId)?.name || "Kuis";
            return (
              <Card key={ch.id}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <div style={{fontSize: '2rem', color: '#eab308'}}><FiZap/></div>
                  <div>
                    <h4 style={{margin: 0}}>Lawan: {ch.challengerName}</h4>
                    <span style={{fontSize: '0.9rem', color: '#ccc'}}>Target: {ch.scoreToBeat} di {catName}</span>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <Button onClick={() => handleAcceptChallenge(ch)} style={{background: '#10b981', fontSize: '0.8rem'}}><FiPlay/> Main</Button>
                  <Button onClick={() => handleDeleteChallenge(ch.id)} style={{background: '#ef4444', padding: '0.5rem'}}><FiTrash2/></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {historyList.length === 0 ? <p>Belum ada riwayat duel.</p> : historyList.map(h => {
            // Logika menentukan pesan menang/kalah
            const isChallenger = h.challengerId === user.uid; // Apakah saya yang menantang?
            const myName = user.displayName;
            const opponentName = isChallenger ? "Lawan" : h.challengerName; // Nama musuh
            
            // Pemenang adalah nama yang disimpan di field 'winner'
            const amIWinner = h.winner === myName; 
            
            return (
              <HistoryCard key={h.id} $win={amIWinner}>
                <div>
                  <h4 style={{margin: 0}}>{h.winner ? `Pemenang: ${h.winner}` : "Selesai"}</h4>
                  <span style={{fontSize: '0.85rem', opacity: 0.7}}>
                    Skor Akhir: {h.finalScore} (Target: {h.scoreToBeat})
                  </span>
                </div>
                <div style={{fontWeight: 'bold', color: amIWinner ? '#22c55e' : '#ef4444'}}>
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

    </PageWrapper>
  );
};

export default SocialPage;