// src/components/ui/ParticleBackground.jsx

import { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useUserProgress } from '../../context/UserProgressContext';
import { themes } from "../../App";

// Konfigurasi untuk setiap efek
const particleOptions = {
  jaringan: {
    particles: {
      color: { value: "#ffffff" },
      links: { color: "random", distance: 120, enable: true, opacity: 0.2, width: 1 },
      move: { direction: "none", enable: true, outModes: { default: "out" }, random: true, speed: 0.5, straight: false },
      number: { density: { enable: true, area: 800 }, value: 60 },
      opacity: { value: {min: 0.1, max: 0.4} },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2 } },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: "repulse" } },
      modes: { repulse: { distance: 100, duration: 0.4 } },
    },
  },
  gelembung: {
    particles: {
      number: { value: 30, density: { enable: true, area: 800 } },
      color: { value: ["#2EB67D", "#ECB22E", "#E01E5B", "#36C5F0"] },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: { min: 8, max: 16 } },
      move: { enable: true, speed: 1.5, direction: "top", straight: false, outModes: { default: "out", top: "destroy" } },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: "bubble" } },
      modes: { bubble: { distance: 200, duration: 2, opacity: 0.8, size: 20 } },
    },
  },
  aurora: {
    particles: {
      number: { value: 200, density: { enable: true, area: 800 } },
      color: { value: ["#52d171", "#ff8a71", "#64ffda", "#f000ff"] },
      shape: { type: "circle" },
      opacity: { value: { min: 0.1, max: 0.8 }, animation: { enable: true, speed: 0.8, sync: false, startValue: 'random' } },
      size: { value: { min: 1, max: 4 }, animation: { enable: true, speed: 3, sync: false, startValue: 'random' } },
      links: { enable: false },
      move: { enable: true, speed: { min: 0.5, max: 1.5 }, direction: "top-right", straight: false, outModes: { default: "out" } },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: "grab" } },
      modes: { grab: { distance: 150, links: { opacity: 0.5, color: "#ffffff" } } },
    },
  },
  // ================== EFEK BARU "NEBULA" DI SINI ==================
  nebula: {
    particles: {
      number: { value: 100, density: { enable: true, area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: { min: 0.1, max: 0.6 } },
      size: { value: { min: 1, max: 3 } },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
        attract: { // Partikel akan saling menarik
          enable: true,
          rotate: { x: 600, y: 1200 }
        }
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "attract" // Partikel akan tertarik ke kursor
        },
      },
      modes: {
        attract: {
          distance: 200,
          duration: 0.4,
          speed: 1,
        }
      }
    },
  }
};


const ParticleBackground = () => {
    const { settings } = useUserProgress();
    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    const options = useMemo(() => {
      const effect = settings.backgroundEffect || 'jaringan';
      const themeConfig = themes[settings.themeFamily] || themes.ocean;
      const modeConfig = themeConfig[settings.themeMode] || themeConfig.dark;
      const accent = settings.accentColor || modeConfig.accent;
      
      const selectedOptions = JSON.parse(JSON.stringify(particleOptions[effect] || particleOptions.jaringan));

      // Kustomisasi warna partikel berdasarkan tema yang aktif
      if (effect === 'jaringan' || effect === 'nebula') {
        selectedOptions.particles.color.value = accent;
      } else if (effect === 'aurora') {
        selectedOptions.particles.color.value = [accent, modeConfig.text, '#ffffff'];
      }
      return selectedOptions;

    }, [settings.backgroundEffect, settings.themeFamily, settings.themeMode, settings.accentColor]);

    if (settings.backgroundEffect === 'minimalis') {
      return null;
    }

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={options}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
        />
    );
};

export default ParticleBackground;