// src/pages/SettingsPage.jsx

import { useState, useEffect } from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import styled from 'styled-components';
import { themes } from '../App';
import { auth, db } from '../services/firebase'; // Import Auth & DB
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { FiUser, FiSun, FiMoon, FiCheck, FiType, FiDroplet, FiRefreshCw, FiStar, FiAlertTriangle, FiArrowLeft, FiSave, FiImage, FiEdit2 } from 'react-icons/fi';
import { PageContainer } from '../components/ui/PageLayout';
import { Button } from '../components/ui/Button';

// --- AVATAR PRESETS (Gunakan gambar online atau aset lokal) ---
const AVATAR_PRESETS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Cyber1",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Robot2",
  "https://api.dicebear.com/9.x/identicon/svg?seed=AgentX",
  "https://api.dicebear.com/9.x/micah/svg?seed=Hero",
];

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
  font-size: 2rem; margin: 0;
  background: linear-gradient(135deg, #94a3b8, #e2e8f0);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(255,255,255,0.2);
`;

const SettingsSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  padding: 2rem; border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 2rem;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: ${({ theme }) => theme.accent}40;
  }

  h2 {
    font-size: 1.3rem; margin-top: 0; margin-bottom: 1.5rem;
    padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex; align-items: center; gap: 0.75rem;
    color: ${({ theme }) => theme.accent};
  }
`;

const ControlGroup = styled.div`
  margin-bottom: 1.5rem;
  label {
    display: block; margin-bottom: 0.8rem;
    color: ${({ theme }) => theme.textSecondary}; font-weight: 600; font-size: 0.9rem;
  }
`;

const Input = styled.input`
    width: 100%; padding: 1rem; font-size: 1rem;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.2);
    color: ${({ theme }) => theme.text};
    transition: all 0.3s;
    
    &:focus {
      border-color: ${({ theme }) => theme.accent};
      background: rgba(255,255,255,0.05);
      box-shadow: 0 0 15px ${({ theme }) => theme.accent}20;
      outline: none;
    }
`;

const TextArea = styled.textarea`
    width: 100%; padding: 1rem; font-size: 1rem;
    border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.2); color: ${({ theme }) => theme.text};
    font-family: inherit; resize: vertical; min-height: 80px;
    &:focus {
      border-color: ${({ theme }) => theme.accent};
      outline: none;
    }
`;

// --- AVATAR STYLES ---
const AvatarPreview = styled.div`
  width: 100px; height: 100px; border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.accent};
  overflow: hidden; margin-bottom: 1rem;
  box-shadow: 0 0 20px ${({ theme }) => theme.accent}40;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const AvatarGrid = styled.div`
  display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;
`;

const AvatarOption = styled.div`
  width: 50px; height: 50px; border-radius: 50%; cursor: pointer;
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.accent : 'transparent'};
  opacity: ${({ $selected }) => $selected ? 1 : 0.6};
  transition: all 0.2s; overflow: hidden; background: rgba(255,255,255,0.1);
  
  &:hover { transform: scale(1.1); opacity: 1; }
  img { width: 100%; height: 100%; object-fit: cover; }
`;

// --- THEME & COLOR STYLES ---
const ButtonGroup = styled.div` display: flex; flex-wrap: wrap; gap: 0.8rem; `;

const OptionButton = styled(Button)`
  background: ${({ theme, $isActive }) => ($isActive ? theme.accent + '20' : 'rgba(255,255,255,0.05)')};
  border: 1px solid ${({ theme, $isActive }) => ($isActive ? theme.accent : 'rgba(255,255,255,0.1)')};
  color: ${({ theme, $isActive }) => ($isActive ? theme.accent : theme.textSecondary)};
  padding: 0.75rem 1.5rem; border-radius: 50px; font-size: 0.9rem;
  box-shadow: ${({ $isActive, theme }) => ($isActive ? `0 0 15px ${theme.accent}30` : 'none')};
  
  &:hover {
    border-color: ${({ theme }) => theme.accent}; color: ${({ theme }) => theme.accent}; transform: translateY(-2px);
  }
`;

const ThemeGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; `;

const ThemeCard = styled.div`
  border: 2px solid ${({ theme, $isActive }) => ($isActive ? theme.accent : 'rgba(255,255,255,0.1)')};
  border-radius: 16px; padding: 1rem; background: ${({ $themeOption }) => $themeOption.dark.bg};
  cursor: pointer; position: relative; transition: all 0.3s;
  box-shadow: ${({ $isActive, theme }) => ($isActive ? `0 0 20px ${theme.accent}40` : 'none')};

  &:hover { transform: translateY(-5px); border-color: ${({ theme }) => theme.accent}; }
  
  .theme-name { color: ${({ $themeOption }) => $themeOption.dark.text}; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .theme-accents { display: flex; gap: 0.4rem; }
  .theme-accent { width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); }
`;

const ColorGrid = styled.div` display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; `;

const ColorSwatch = styled.div`
  width: 45px; height: 45px; border-radius: 50%; background-color: ${({ color }) => color}; cursor: pointer;
  border: 3px solid ${({ theme, $isActive }) => ($isActive ? theme.accent : 'transparent')};
  display: flex; align-items: center; justify-content: center; color: white;
  transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  &:hover { transform: scale(1.1); }
`;

const DangerZone = styled.div`
  border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05);
  border-radius: 24px; padding: 2rem; margin-top: 3rem;
  h2 { color: #ef4444; margin-top: 0; display: flex; align-items: center; gap: 0.75rem; font-size: 1.3rem; }
  p { color: ${({ theme }) => theme.textSecondary}; margin-bottom: 1.5rem; line-height: 1.6; font-size: 0.95rem; }
`;

const DangerButton = styled(Button)`
  background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444;
  &:hover { background: #ef4444; color: white; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
`;

const accentColors = ['#3b82f6', '#22c55e', '#ef4444', '#eab308', '#8b5cf6', '#f97316'];

const SettingsPage = ({ onBack }) => {
  const { user, setUserName, settings, setSettings, resetAllProgress } = useUserProgress();
  
  // State untuk Form Profil
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || 'Agent',
    photoURL: user?.photoURL || AVATAR_PRESETS[0],
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load data tambahan (Bio) dari Firestore saat mount
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData(prev => ({
              ...prev,
              bio: docSnap.data().bio || ''
            }));
          }
        } catch (err) {
          console.error("Gagal memuat profil:", err);
        }
      }
    };
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // 1. Update Auth Profile (Display Name & Photo)
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });
      
      // 2. Update Firestore (Bio & Redundant Data)
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
        bio: profileData.bio
      });

      // 3. Update Context State
      setUserName(profileData.displayName); // Biar UI langsung update
      
      alert('✅ Profil Agen berhasil diperbarui!');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('❌ Gagal menyimpan: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const setFontSize = (size) => setSettings(p => ({ ...p, fontSize: size }));
  const setThemeMode = (mode) => setSettings(p => ({ ...p, themeMode: mode }));
  const setThemeFamily = (family) => { setSettings(p => ({ ...p, themeFamily: family, accentColor: null })); };
  const setAccentColor = (color) => setSettings(p => ({ ...p, accentColor: color }));
  const resetAccentColor = () => setSettings(p => ({ ...p, accentColor: null }));
  const setBackgroundEffect = (effect) => setSettings(p => ({...p, backgroundEffect: effect}));

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={onBack}><FiArrowLeft size={20} /></BackButton>
        <Title>Konfigurasi Sistem</Title>
      </Header>
      
      {/* SEKSI PROFIL YANG BARU */}
      <SettingsSection>
        <h2><FiUser /> Identitas Agen</h2>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {/* Bagian Avatar */}
          <div style={{display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap'}}>
            <div style={{textAlign: 'center'}}>
              <AvatarPreview>
                <img src={profileData.photoURL} alt="Avatar" />
              </AvatarPreview>
              <span style={{fontSize: '0.8rem', opacity: 0.7}}>Preview</span>
            </div>
            
            <div style={{flex: 1}}>
              <label style={{fontWeight: 600, marginBottom: '0.5rem', display: 'block'}}>Pilih Penampilan (Avatar)</label>
              <AvatarGrid>
                {AVATAR_PRESETS.map((url, idx) => (
                  <AvatarOption 
                    key={idx} 
                    $selected={profileData.photoURL === url}
                    onClick={() => setProfileData({...profileData, photoURL: url})}
                  >
                    <img src={url} alt={`Avatar ${idx}`} />
                  </AvatarOption>
                ))}
              </AvatarGrid>
            </div>
          </div>

          {/* Input Nama */}
          <ControlGroup>
            <label htmlFor="username"><FiEdit2 style={{marginRight: 8}}/> Kode Nama (Display Name)</label>
            <Input 
              type="text" 
              id="username" 
              value={profileData.displayName} 
              onChange={(e) => setProfileData({...profileData, displayName: e.target.value})} 
              placeholder="Masukkan nama agen..."
            />
          </ControlGroup>

          {/* Input Bio/Status - FITUR BARU */}
          <ControlGroup>
            <label htmlFor="bio"><FiType style={{marginRight: 8}}/> Status / Motto Operasi</label>
            <TextArea 
              id="bio" 
              value={profileData.bio} 
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})} 
              placeholder="Contoh: 'Selalu waspada, selalu siap.' atau 'Ahli Kriptografi'"
            />
          </ControlGroup>

          <Button onClick={handleSaveProfile} style={{background: '#3b82f6', alignSelf: 'flex-end'}} disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : <><FiSave/> Simpan Perubahan Profil</>}
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection>
        <h2><FiDroplet /> Tampilan & Visual</h2>
        <ControlGroup>
          <label>1. Tema Antarmuka</label>
          <ThemeGrid>
            {Object.entries(themes).map(([key, themeFamily]) => (
              <ThemeCard key={key} $themeOption={themeFamily} $isActive={settings.themeFamily === key} onClick={() => setThemeFamily(key)}>
                <div className="theme-name">{themeFamily.name}</div>
                <div className="theme-accents">
                  <div className="theme-accent" style={{ background: themeFamily.light.accent }}></div>
                  <div className="theme-accent" style={{ background: themeFamily.dark.accent }}></div>
                </div>
                {settings.themeFamily === key && <div style={{position: 'absolute', top: 10, right: 10, background: '#22c55e', borderRadius: '50%', padding: 2}}><FiCheck size={12} color="white"/></div>}
              </ThemeCard>
            ))}
          </ThemeGrid>
        </ControlGroup>

        <ControlGroup>
          <label>2. Mode Pencahayaan</label>
          <ButtonGroup>
            <OptionButton $isActive={settings.themeMode === 'light'} onClick={() => setThemeMode('light')}><FiSun/> Terang</OptionButton>
            <OptionButton $isActive={settings.themeMode === 'dark'} onClick={() => setThemeMode('dark')}><FiMoon/> Gelap</OptionButton>
          </ButtonGroup>
        </ControlGroup>

        <ControlGroup>
          <label>3. Warna Aksen Hologram</label>
          <ColorGrid>
            {accentColors.map(color => (
              <ColorSwatch key={color} color={color} $isActive={settings.accentColor === color} onClick={() => setAccentColor(color)}>
                {settings.accentColor === color && <FiCheck />}
              </ColorSwatch>
            ))}
            <button onClick={resetAccentColor} title="Reset Default" style={{background:'rgba(255,255,255,0.1)', width: 40, height: 40, borderRadius: '50%', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition: '0.2s'}}>
                <FiRefreshCw/>
            </button>
          </ColorGrid>
        </ControlGroup>
      </SettingsSection>

      <SettingsSection>
        <h2><FiType /> Preferensi Teks</h2>
        <ButtonGroup>
          <OptionButton $isActive={settings.fontSize === 'small'} onClick={() => setFontSize('small')}>Kecil</OptionButton>
          <OptionButton $isActive={settings.fontSize === 'medium'} onClick={() => setFontSize('medium')}>Standar</OptionButton>
          <OptionButton $isActive={settings.fontSize === 'large'} onClick={() => setFontSize('large')}>Besar</OptionButton>
        </ButtonGroup>
      </SettingsSection>
      
      <SettingsSection>
        <h2><FiStar /> Efek Visual Latar</h2>
        <ButtonGroup>
          {['minimalis', 'jaringan', 'nebula', 'gelembung', 'aurora'].map(effect => (
             <OptionButton 
                key={effect} 
                $isActive={settings.backgroundEffect === effect} 
                onClick={() => setBackgroundEffect(effect)}
                style={{textTransform: 'capitalize'}}
             >
                {effect}
             </OptionButton>
          ))}
        </ButtonGroup>
      </SettingsSection>

      <DangerZone>
        <h2><FiAlertTriangle /> Zona Bahaya</h2>
        <p>Tindakan ini bersifat destruktif. Menghapus data akan menghilangkan semua riwayat skor, medali, dan progres level Anda secara permanen.</p>
        <DangerButton onClick={() => { if(window.confirm("YAKIN HAPUS SEMUA PROGRES?")) resetAllProgress() }}>
            Reset Semua Data Sistem
        </DangerButton>
      </DangerZone>

    </PageContainer>
  );
};

export default SettingsPage;