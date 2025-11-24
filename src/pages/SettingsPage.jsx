// src/pages/SettingsPage.jsx

import { useState } from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import styled from 'styled-components';
import { themes } from '../App';
// <-- Impor ikon baru -->
import { FiUser, FiSun, FiMoon, FiCheck, FiType, FiDroplet, FiRefreshCw, FiStar, FiAlertTriangle } from 'react-icons/fi';
import { PageContainer, PageHeader, PageBackButton } from '../components/ui/PageLayout';
import { Button } from '../components/ui/Button';
import { AuroraCard } from '../components/ui/AuroraCard';

const SettingsSection = styled(AuroraCard)`
  padding: 2rem;
  margin-bottom: 1.5rem;
  h2 {
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
`;

const ControlGroup = styled.div`
  margin-bottom: 1.5rem;
  label {
    display: block;
    margin-bottom: 0.75rem;
    color: ${({ theme }) => theme.textSecondary};
    font-weight: 500;
  }
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.textSecondary};
    background: transparent;
    color: ${({ theme }) => theme.text};
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
`;

const OptionButton = styled(Button)`
  background: ${({ theme, $isActive }) => ($isActive ? theme.accent : theme.cardBg)};
  border: 1px solid ${({ theme, $isActive }) => ($isActive ? theme.accent : theme.textSecondary)};
  color: ${({ theme, $isActive }) => ($isActive ? theme.buttonText : theme.text)};
  box-shadow: none;
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: none;
    box-shadow: none;
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const ThemeCard = styled.div`
  border: 2px solid ${({ theme, $isActive }) => ($isActive ? theme.accent : 'transparent')};
  border-radius: 12px;
  padding: 1rem;
  background: ${({ $themeOption }) => $themeOption.dark.bg};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  &:hover { transform: scale(1.05); }
  .theme-name { color: ${({ $themeOption }) => $themeOption.dark.text}; font-weight: 600; }
  .theme-accents { display: flex; margin-top: 0.5rem; gap: 0.25rem; }
  .theme-accent { width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${({ $themeOption }) => $themeOption.dark.bg}; }
`;

const ColorGrid = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const ColorSwatch = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  cursor: pointer;
  border: 3px solid ${({ theme, $isActive }) => ($isActive ? theme.accent : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
`;

// <-- ZONA BERBAHAYA -->
const DangerZone = styled.div`
  border: 2px solid #ef4444;
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 2rem;
  
  h2 {
    color: #ef4444;
    margin-top: 0;
  }

  p {
    color: ${({ theme }) => theme.textSecondary};
    margin-bottom: 1.5rem;
  }
`;

const DangerButton = styled(Button)`
  background: #ef4444;
  background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0.25));
  
  &:hover {
    box-shadow: 0 7px 25px rgba(239, 68, 68, 0.4);
  }
`;


const accentColors = ['#3b82f6', '#22c55e', '#ef4444', '#eab308', '#8b5cf6', '#f97316'];

const SettingsPage = ({ onBack }) => {
  // <-- Ambil fungsi resetAllProgress -->
  const { userName, setUserName, settings, setSettings, resetAllProgress } = useUserProgress();
  const [currentName, setCurrentName] = useState(userName);

  const handleSaveName = () => { if (currentName.trim()) { setUserName(currentName.trim()); alert('Nama berhasil disimpan!'); } };
  const setFontSize = (size) => setSettings(p => ({ ...p, fontSize: size }));
  const setThemeMode = (mode) => setSettings(p => ({ ...p, themeMode: mode }));
  const setThemeFamily = (family) => { setSettings(p => ({ ...p, themeFamily: family, accentColor: null })); };
  const setAccentColor = (color) => setSettings(p => ({ ...p, accentColor: color }));
  const resetAccentColor = () => setSettings(p => ({ ...p, accentColor: null }));
  const setBackgroundEffect = (effect) => setSettings(p => ({...p, backgroundEffect: effect}));

  return (
    <PageContainer>
      <PageHeader>
        <PageBackButton onClick={onBack} />
        <h1>Pengaturan</h1>
      </PageHeader>
      
      <SettingsSection>
        <h2><FiUser /> Profil</h2>
        <ControlGroup>
          <label htmlFor="username">Nama Tampilan</label>
          <Input type="text" id="username" value={currentName} onChange={(e) => setCurrentName(e.target.value)} />
        </ControlGroup>
        <Button onClick={handleSaveName}>Simpan Nama</Button>
      </SettingsSection>

      <SettingsSection>
        <h2><FiType /> Ukuran Font</h2>
        <ButtonGroup>
          <OptionButton $isActive={settings.fontSize === 'small'} onClick={() => setFontSize('small')}>Kecil</OptionButton>
          <OptionButton $isActive={settings.fontSize === 'medium'} onClick={() => setFontSize('medium')}>Normal</OptionButton>
          <OptionButton $isActive={settings.fontSize === 'large'} onClick={() => setFontSize('large')}>Besar</OptionButton>
        </ButtonGroup>
      </SettingsSection>
      
      <SettingsSection>
        <h2><FiDroplet /> Tema Aplikasi</h2>
        <ControlGroup>
          <label>1. Pilih Keluarga Tema</label>
          <ThemeGrid>
            {Object.entries(themes).map(([key, themeFamily]) => (
              <ThemeCard key={key} $themeOption={themeFamily} $isActive={settings.themeFamily === key} onClick={() => setThemeFamily(key)}>
                <div className="theme-name">{themeFamily.name}</div>
                <div className="theme-accents">
                  <div className="theme-accent" style={{ background: themeFamily.light.accent }}></div>
                  <div className="theme-accent" style={{ background: themeFamily.dark.accent }}></div>
                </div>
                {settings.themeFamily === key && <FiCheck style={{position: 'absolute', top: '10px', right: '10px'}} />}
              </ThemeCard>
            ))}
          </ThemeGrid>
        </ControlGroup>
        <ControlGroup>
          <label>2. Pilih Mode Tampilan</label>
          <ButtonGroup>
            <OptionButton $isActive={settings.themeMode === 'light'} onClick={() => setThemeMode('light')}><FiSun/> Terang</OptionButton>
            <OptionButton $isActive={settings.themeMode === 'dark'} onClick={() => setThemeMode('dark')}><FiMoon/> Gelap</OptionButton>
          </ButtonGroup>
        </ControlGroup>
        <ControlGroup>
          <label>3. Ganti Warna Aksen (Opsional)</label>
          <ColorGrid>
            {accentColors.map(color => (
              <ColorSwatch key={color} color={color} $isActive={settings.accentColor === color} onClick={() => setAccentColor(color)}>
                {settings.accentColor === color && <FiCheck />}
              </ColorSwatch>
            ))}
            <button onClick={resetAccentColor} title="Reset ke warna default tema" style={{background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize: '1.5rem', opacity: 0.7, marginLeft: '0.5rem'}}><FiRefreshCw/></button>
          </ColorGrid>
        </ControlGroup>
      </SettingsSection>
      
      <SettingsSection>
        <h2><FiStar /> Efek Latar Belakang</h2>
        <ButtonGroup>
          <OptionButton $isActive={settings.backgroundEffect === 'minimalis'} onClick={() => setBackgroundEffect('minimalis')}>Minimalis</OptionButton>
          <OptionButton $isActive={settings.backgroundEffect === 'jaringan'} onClick={() => setBackgroundEffect('jaringan')}>Jaringan</OptionButton>
          <OptionButton $isActive={settings.backgroundEffect === 'nebula'} onClick={() => setBackgroundEffect('nebula')}>Nebula</OptionButton>
          <OptionButton $isActive={settings.backgroundEffect === 'gelembung'} onClick={() => setBackgroundEffect('gelembung')}>Gelembung</OptionButton>
          <OptionButton $isActive={settings.backgroundEffect === 'aurora'} onClick={() => setBackgroundEffect('aurora')}>Aurora</OptionButton>
        </ButtonGroup>
      </SettingsSection>

      {/* <-- AREA BARU UNTUK TOMBOL RESET --> */}
      <DangerZone>
        <h2><FiAlertTriangle /> Zona Berbahaya</h2>
        <p>Tindakan ini akan menghapus semua statistik, skor tertinggi, dan pencapaian Anda secara permanen. Pengaturan tampilan Anda tidak akan berubah.</p>
        <DangerButton onClick={resetAllProgress}>Reset Semua Progres</DangerButton>
      </DangerZone>

    </PageContainer>
  );
};

export default SettingsPage;