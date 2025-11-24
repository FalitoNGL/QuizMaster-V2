// src/utils/storage.js

const HIGH_SCORES_KEY = 'quizMasterHighScores';

/**
 * Fungsi untuk mengambil semua data skor tertinggi dari localStorage.
 * @returns {object} Objek berisi skor tertinggi, contoh: { 'kategori-id': 100 }
 */
export const getHighScores = () => {
  try {
    const rawScores = localStorage.getItem(HIGH_SCORES_KEY);
    // Jika tidak ada data, kembalikan objek kosong
    return rawScores ? JSON.parse(rawScores) : {};
  } catch (error) {
    console.error("Gagal mengambil skor dari localStorage", error);
    return {};
  }
};

/**
 * Fungsi untuk menyimpan skor baru jika lebih tinggi dari yang sudah ada.
 * @param {string} categoryId - ID dari kategori kuis.
 * @param {number} newScore - Skor baru yang didapat pengguna.
 */
export const saveHighScore = (categoryId, newScore) => {
  if (typeof newScore !== 'number') return;
  
  try {
    const highScores = getHighScores();
    const currentHighScore = highScores[categoryId] || 0;

    // Hanya simpan jika skor baru lebih tinggi
    if (newScore > currentHighScore) {
      highScores[categoryId] = newScore;
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
    }
  } catch (error) {
    console.error("Gagal menyimpan skor ke localStorage", error);
  }
};