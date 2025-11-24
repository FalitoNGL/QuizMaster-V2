import { useEffect } from 'react';
import { animate } from 'framer-motion';

export const useAnimatedCounter = (targetValue, onUpdate) => {
  useEffect(() => {
    const controls = animate(0, targetValue, {
      duration: 1, // Durasi animasi 1 detik
      ease: "easeOut",
      onUpdate(latest) {
        onUpdate(Math.round(latest));
      }
    });

    return () => controls.stop();
  }, [targetValue, onUpdate]);
};