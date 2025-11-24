// src/data/quizData.js

import { FiShield, FiKey, FiCpu } from 'react-icons/fi';
import { GiBrain, GiDna1 } from 'react-icons/gi';

// Impor data soal dari file JSON yang relevan
import questionsFundamental from './fundamental-keamanan.json' with { type: 'json' };
import questionsBiologi from './biologi.json' with { type: 'json' };
import questionsIntelijen from './intelijen.json' with { type: 'json' };
import questionsElektronika from './elektronika.json' with { type: 'json' };

// 1. Definisikan kategori yang tersedia
export const quizCategories = [
  {
    id: 'fundamental-keamanan-informasi',
    name: 'Fundamental Keamanan Informasi',
    description: 'Uji pemahaman Anda tentang konsep dasar keamanan informasi.',
    icon: FiKey,
  },
  {
    id: 'biologi-dasar',
    name: 'Biologi Dasar',
    description: 'Jelajahi konsep fundamental tentang kehidupan dan organisme.',
    icon: GiDna1,
  },
  {
    id: 'intelijen-dasar',
    name: 'Intelijen',
    description: 'Uji wawasan Anda seputar dunia intelijen.',
    icon: GiBrain,
  },
  {
    id: 'elektronika-dasar',
    name: 'Elektronika Dasar',
    description: 'Pahami komponen dan sirkuit dasar dalam dunia elektronika.',
    icon: FiCpu,
  },
];

// 2. Buat objek yang berisi semua soal
const allQuizzes = {
  'fundamental-keamanan-informasi': questionsFundamental,
  'biologi-dasar': questionsBiologi,
  'intelijen-dasar': questionsIntelijen,
  'elektronika-dasar': questionsElektronika
};

// --- Fungsi Helper ---

export const getQuestionCount = (categoryId) => {
  return allQuizzes[categoryId]?.length || 0;
}

const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export const getShuffledQuestions = (categoryId, dataOrCount) => {
  let quizData = [];

  if (categoryId === 'wrong_answers') {
    quizData = dataOrCount;
  } else {
    quizData = allQuizzes[categoryId];
    const count = dataOrCount;
    if (count && count > 0 && count <= quizData.length) {
      quizData = shuffleArray([...quizData]).slice(0, count);
    }
  }

  if (!quizData || quizData.length === 0) return [];

  const processedQuestions = quizData.map(q => {
    const originalOptions = [...q.options];
    const correctText = originalOptions[q.correct];
    const shuffledOptions = shuffleArray([...originalOptions]);
    const correctIndex = shuffledOptions.findIndex(opt => opt === correctText);
    return { ...q, options: shuffledOptions, correct: correctIndex };
  });
  
  return shuffleArray(processedQuestions);
};