// src/components/Timer.jsx

import { useEffect, useState } from 'react';
import styled from 'styled-components';

const TimeDisplay = styled.span`
  font-family: 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
  color: ${({ $isLow, theme }) => $isLow ? '#ef4444' : theme.text};
  transition: color 0.3s;
`;

const Timer = ({ isRunning, duration, onTimeUp, onTick, mode }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (mode === 'time_attack') {
      // Jika mode Time Attack, reset waktu setiap kali durasi berubah (ganti soal)
      setTimeLeft(duration);
    }
    // Jika mode Klasik, waktu TIDAK di-reset (persistent)
  }, [duration, mode]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        const newValue = prev - 1;
        // Kirim update waktu ke parent (QuizPage)
        if (onTick) onTick(newValue);
        
        if (newValue <= 0) {
          clearInterval(intervalId);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, onTimeUp, onTick]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <TimeDisplay $isLow={timeLeft <= 10}>
      {formatTime(timeLeft)}
    </TimeDisplay>
  );
};

export default Timer;