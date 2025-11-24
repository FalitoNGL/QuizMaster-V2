// src/utils/audioManager.js

const sounds = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  click: '/sounds/click.mp3',
  finish: '/sounds/finish.mp3',
  achievement: '/sounds/achievement.mp3'
};

const audioCache = {};

export const preloadSounds = () => {
  // Kosongkan logic preload agar tidak error saat file tidak ada
};

export const playSound = (soundName) => {
  // Cek apakah audio cache ada (kemungkinan besar kosong jika file tidak ada)
  // Kita bungkus try-catch agar aplikasi tidak crash
  try {
    const audioPath = sounds[soundName];
    if (audioPath) {
        const audio = new Audio(audioPath);
        // Tangkap error jika file tidak ditemukan/tidak didukung
        audio.play().catch(() => {
            // Silent fail: Jangan lakukan apa-apa jika suara gagal putar
            // Ini mencegah error merah memenuhi console
        });
    }
  } catch (e) {
    // Abaikan error
  }
};