// src/services/quizService.js
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { quizCategories } from '../data/quizData';

// Import data JSON bawaan untuk keperluan migrasi awal
import questionsFundamental from '../data/fundamental-keamanan.json';
import questionsBiologi from '../data/biologi.json';
import questionsIntelijen from '../data/intelijen.json';
import questionsElektronika from '../data/elektronika.json';

// Mapping ID kategori ke Data JSON
const initialData = {
  'fundamental-keamanan-informasi': questionsFundamental,
  'biologi-dasar': questionsBiologi,
  'intelijen-dasar': questionsIntelijen,
  'elektronika-dasar': questionsElektronika
};

/**
 * Mengambil daftar soal dari Database Firestore berdasarkan ID Kategori.
 * Jika data tidak ditemukan di DB, return null (indikator perlu migrasi).
 */
export const fetchQuestionsFromDB = async (categoryId) => {
  try {
    const docRef = doc(db, "quizzes", categoryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().questions;
    } else {
      return null; 
    }
  } catch (error) {
    console.error("Error fetching questions from DB:", error);
    return [];
  }
};

/**
 * Menyimpan array soal ke Database Firestore.
 * Digunakan untuk Update soal atau Migrasi awal.
 */
export const saveQuestionsToDB = async (categoryId, questions) => {
  try {
    const docRef = doc(db, "quizzes", categoryId);
    // merge: true menjaga data lain di dokumen jika ada
    await setDoc(docRef, { questions }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving questions to DB:", error);
    alert("Gagal menyimpan ke database: " + error.message);
    return false;
  }
};

/**
 * Fungsi sekali jalan untuk memindahkan semua file JSON ke Firestore.
 * Dipanggil dari tombol di Admin Page.
 */
export const migrateAllData = async () => {
  if (!window.confirm("Apakah Anda yakin ingin memindahkan semua data JSON ke Database? Ini akan menimpa data database yang ada untuk kategori default.")) return;
  
  try {
    let successCount = 0;
    for (const cat of quizCategories) {
      const data = initialData[cat.id];
      if (data) {
        await saveQuestionsToDB(cat.id, data);
        console.log(`Berhasil migrasi kategori: ${cat.name}`);
        successCount++;
      }
    }
    alert(`Migrasi Sukses! ${successCount} kategori berhasil diupload ke database.`);
    window.location.reload(); // Reload agar tampilan admin terupdate
  } catch (error) {
    console.error("Migration failed:", error);
    alert("Terjadi kesalahan saat migrasi.");
  }
};