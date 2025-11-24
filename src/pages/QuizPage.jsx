// src/pages/QuizPage.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProgress } from '../context/UserProgressContext';
import { fetchQuestionsFromDB } from '../services/quizService'; 
import { playSound } from '../utils/audioManager';

import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import Results from '../components/Results';
import Timer from '../components/Timer';
import { FocusOverlay } from '../components/ui/FocusOverlay';

// Wrapper Sederhana Tanpa Efek Berat
const QuizWrapper = styled(motion.div)`
  position: relative; width: 100%; max-width: 48rem; margin: 0 auto;
  padding: 1rem;
`;

const LoadingText = styled.div`
  text-align: center; font-size: 1.5rem; margin-top: 5rem; 
  color: ${({theme}) => theme.accent}; font-weight: bold;
`;

const QuizPage = ({ config, onQuizEnd }) => {
  if (!config) return null;

  const { updateStats, setHighScores, highScores, unlockAchievement, addWrongAnswer, wrongAnswers } = useUserProgress();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [quizSessionQuestions, setQuizSessionQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const isFinishedRef = useRef(isFinished);
  useEffect(() => { isFinishedRef.current = isFinished; }, [isFinished]);

  const saveQuestionProgress = useCallback((questionIdx) => {
    const answerIndex = sessionAnswers[questionIdx];
    const question = questions[questionIdx];
    if (question && answerIndex !== undefined && config.categoryId !== 'wrong_answers') {
        const isCorrect = answerIndex === question.correct;
        updateStats(isCorrect, questionIdx === 0);
        if (!isCorrect) addWrongAnswer(config.categoryId, question);
    }
  }, [questions, sessionAnswers, config.categoryId, updateStats, addWrongAnswer]);

  const handleTimerTick = (timeLeft) => {
    setTimeRemaining(timeLeft);
  };

  const finishQuiz = useCallback(() => {
    if (isFinishedRef.current) return;
    saveQuestionProgress(currentQuestionIndex);
    setIsTimerRunning(false);

    let calculatedScore = 0;
    quizSessionQuestions.forEach((question, index) => {
      if (sessionAnswers[index] === question.correct) calculatedScore += 10;
    });
    setFinalScore(calculatedScore);
    
    if (config.categoryId !== 'wrong_answers') {
        const scoreKey = `${config.categoryId}-${config.mode}`;
        const currentHighScore = highScores[scoreKey] || 0;
        
        if (calculatedScore > currentHighScore) {
            const newScores = { ...highScores, [scoreKey]: calculatedScore };
            setHighScores(newScores); 
        }

        unlockAchievement('FIRST_QUIZ');
        if (calculatedScore > 0 && calculatedScore / 10 === quizSessionQuestions.length) unlockAchievement('PERFECT_SCORE');
    }
    setIsFinished(true);
  }, [quizSessionQuestions, sessionAnswers, config, highScores, setHighScores, unlockAchievement, saveQuestionProgress, currentQuestionIndex]);

  useEffect(() => {
    if (!config) return;
    const initQuiz = async () => {
      setIsLoading(true);
      let quizQuestions = [];

      if (config.categoryId === 'wrong_answers') {
        const wrongAnswerQuestions = wrongAnswers ? Object.values(wrongAnswers).flat() : [];
        quizQuestions = wrongAnswerQuestions.sort(() => 0.5 - Math.random());
      } else {
        const dbQuestions = await fetchQuestionsFromDB(config.categoryId);
        if (dbQuestions && dbQuestions.length > 0) {
          let shuffled = [...dbQuestions].sort(() => 0.5 - Math.random());
          if (config.questionCount && config.questionCount > 0) shuffled = shuffled.slice(0, config.questionCount);
          quizQuestions = shuffled.map(q => {
            const originalOptions = [...q.options];
            const correctText = originalOptions[q.correct];
            const shuffledOptions = [...originalOptions].sort(() => 0.5 - Math.random());
            const correctIndex = shuffledOptions.findIndex(opt => opt === correctText);
            return { ...q, options: shuffledOptions, correct: correctIndex };
          });
        }
      }

      if (quizQuestions.length === 0) {
        alert(config.categoryId === 'wrong_answers' ? "Selamat! Tidak ada soal salah." : "Soal kosong! Admin perlu migrasi data.");
        onQuizEnd();
        return;
      }
      
      setQuestions(quizQuestions);
      setQuizSessionQuestions(quizQuestions);
      setSessionAnswers({});
      setCurrentQuestionIndex(0);
      setFinalScore(0);
      setIsFinished(false);
      setIsTimerRunning(true);
      setIsLoading(false);
    };
    initQuiz();
  }, [config, onQuizEnd]); 

  useEffect(() => {
    if (questions.length === 0 || isFinished) return;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isLastQuestionAnswered = sessionAnswers[currentQuestionIndex] !== undefined;

    if (isLastQuestion && isLastQuestionAnswered) {
      const timer = setTimeout(() => finishQuiz(), 1200); 
      return () => clearTimeout(timer);
    }
  }, [sessionAnswers, currentQuestionIndex, questions, isFinished, finishQuiz]);

  const advanceToNextQuestion = () => {
    saveQuestionProgress(currentQuestionIndex);
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;
    if (!isLastQuestion) setCurrentQuestionIndex(prevIndex => prevIndex + 1);
  };

  const handleSelectOption = (optionIndex) => {
    if (sessionAnswers[currentQuestionIndex] !== undefined) return;
    const isCorrect = optionIndex === questions[currentQuestionIndex].correct;
    if (navigator.vibrate) navigator.vibrate(50);
    playSound(isCorrect ? 'correct' : 'incorrect');
    setSessionAnswers(prevAnswers => ({ ...prevAnswers, [currentQuestionIndex]: optionIndex }));
  };
  
  const handleExit = () => {
    if (window.confirm("Yakin ingin keluar?")) {
      setIsTimerRunning(false);
      onQuizEnd();
    }
  };

  useEffect(() => {
    const isCurrentQuestionAnswered = sessionAnswers[currentQuestionIndex] !== undefined;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    if (isCurrentQuestionAnswered && config.mode === 'time_attack' && !isLastQuestion) {
      const timer = setTimeout(() => advanceToNextQuestion(), 1200);
      return () => clearTimeout(timer);
    }
  }, [sessionAnswers, currentQuestionIndex, questions.length, config.mode]);

  if (isLoading) return <LoadingText>Menyiapkan soal...</LoadingText>;
  if (questions.length === 0) return null;
  
  if (isFinished) {
    return <Results 
      score={finalScore} totalQuestions={questions.length} onRestart={onQuizEnd} 
      highScore={highScores[`${config.categoryId}-${config.mode}`] || 0} 
      gameMode={config.mode} isPracticeMode={config.categoryId === 'wrong_answers'}
      questions={quizSessionQuestions} userAnswers={sessionAnswers}
      challengeConfig={config.isChallenge ? { target: config.targetScore, challenger: config.challengerName } : null}
      timeRemaining={timeRemaining}
    />;
  }
  
  const isCurrentQuestionAnswered = sessionAnswers[currentQuestionIndex] !== undefined;

  return (
    <QuizWrapper layoutId={`quiz-card-${config.categoryId}`}>
      <AnimatePresence>
        {isFocusMode && <FocusOverlay onClick={() => setIsFocusMode(false)} />}
      </AnimatePresence>
      
      <div style={{ position: 'relative', zIndex: isFocusMode ? 50 : 1 }}>
        <QuestionCard
            key={currentQuestionIndex}
            questionData={questions[currentQuestionIndex]}
            onSelectOption={handleSelectOption}
            selectedOption={sessionAnswers[currentQuestionIndex]}
            isAnswered={isCurrentQuestionAnswered}
            onNext={advanceToNextQuestion}
            onExit={handleExit}
            gameMode={config.mode}
            isFocusMode={isFocusMode}
            toggleFocusMode={() => setIsFocusMode(p => !p)}
            
            // TIMER DI-PASS SEBAGAI KOMPONEN AGAR TIDAK RESET
            timerComponent={
              <Timer 
                isRunning={isTimerRunning} 
                mode={config.mode} 
                duration={config.duration || 120} 
                onTimeUp={finishQuiz} 
                onTick={handleTimerTick}
                config={config} 
              />
            }
            
            progressBar={<ProgressBar current={currentQuestionIndex + 1} total={questions.length} />}
        />
      </div>
    </QuizWrapper>
  );
};

export default QuizPage;