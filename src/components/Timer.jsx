// src/components/Timer.jsx

import React, { useState, useEffect, useRef } from 'react'; // <-- PERBAIKAN: Tambahkan import React
import styled from 'styled-components';
import { FiClock } from 'react-icons/fi';

const TimerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  align-self: flex-end;
  min-width: 120px;
  transition: color 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);

  svg { font-size: 1.25rem; }
  span {
    font-family: 'Poppins', sans-serif;
    font-size: 1.125rem;
    font-weight: 600;
  }
`;

// ================== LOGIKA TIMER DIPERBAIKI TOTAL DI SINI ==================
const Timer = ({ isRunning, mode, duration = 120, onTimeUp, config }) => {
    const [time, setTime] = useState(mode === 'klasik' ? 0 : duration);
    const intervalRef = useRef(null);
    const onTimeUpRef = useRef(onTimeUp);

    // Sinkronkan onTimeUp terbaru ke ref agar tidak menyebabkan re-run effect
    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    // useEffect untuk menjalankan interval
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime(prevTime => {
                    if (mode === 'klasik') {
                        return prevTime + 1;
                    }
                    if (prevTime > 0) {
                        return prevTime - 1;
                    }
                    return 0;
                });
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, mode]);

    // useEffect untuk mengecek jika waktu habis
    useEffect(() => {
        if (isRunning && mode === 'time_attack' && time === 0) {
            // Panggil onTimeUp dari ref
            if (onTimeUpRef.current) {
                onTimeUpRef.current();
            }
        }
    }, [time, isRunning, mode]);
    
    // useEffect untuk me-reset timer saat kuis baru (config berubah)
    useEffect(() => {
      setTime(mode === 'klasik' ? 0 : duration);
    }, [config.categoryId, mode, duration]);

    const formatTime = () => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const remainingSeconds = (time % 60).toString().padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    };

    const timeUpWarning = mode === 'time_attack' && time <= 10 && time > 0;

    return (
        <TimerContainer style={timeUpWarning ? {color: '#ef4444', boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'} : {}}>
            <FiClock />
            <span>{formatTime()}</span>
        </TimerContainer>
    );
};

export default Timer;