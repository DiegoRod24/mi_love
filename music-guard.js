(() => {
  const music = document.getElementById('music');
  if (!music) return;

  let storyAudioEnabled = false;
  let userPaused = false;
  let resumeTimer = null;

  music.loop = true;
  music.preload = 'metadata';

  const safePlay = async (targetVolume = 0.5) => {
    if (!storyAudioEnabled || userPaused) return;
    try {
      if (music.volume <= 0.01) music.volume = Math.min(targetVolume, 0.18);
      await music.play();
      if (music.volume < targetVolume) {
        const start = music.volume;
        const startedAt = performance.now();
        const duration = 700;
        const fade = (now) => {
          if (userPaused || music.paused) return;
          const p = Math.min(1, (now - startedAt) / duration);
          music.volume = start + (targetVolume - start) * p;
          if (p < 1) requestAnimationFrame(fade);
        };
        requestAnimationFrame(fade);
      }
    } catch (_) {
      // El navegador puede exigir otro toque. El siguiente gesto lo intentará de nuevo.
    }
  };

  const unlockFromGesture = () => {
    storyAudioEnabled = true;
    userPaused = false;
    safePlay(0.5);
  };

  // La música se desbloquea en el primer gesto real de la experiencia.
  // Esto cubre tanto el botón de voz como el botón manual y evita bloqueos en tablet/móvil.
  document.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('#voiceBtn, #manualBtn, #emergencyContinue, [data-next]');
    if (!target) return;
    unlockFromGesture();
  }, true);

  // Si la usuaria toca el botón de música, respetamos su decisión de pausar/reanudar.
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('#soundBtn')) return;
    userPaused = !music.paused;
    if (!userPaused) {
      storyAudioEnabled = true;
      setTimeout(() => safePlay(0.5), 0);
    }
  }, true);

  // Cada avance o retroceso mantiene la misma pista y la misma posición.
  document.addEventListener('touchend', () => {
    if (storyAudioEnabled && !userPaused && music.paused) safePlay(0.5);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) return;
    if (storyAudioEnabled && !userPaused && music.paused) safePlay(0.5);
  });

  // Algunos navegadores pausan multimedia al cambiar momentáneamente de app/pestaña.
  // Si Annys vuelve a la historia, reanudamos desde el mismo segundo, nunca desde cero.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !storyAudioEnabled || userPaused) return;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => safePlay(0.5), 180);
  });

  window.addEventListener('pageshow', () => {
    if (storyAudioEnabled && !userPaused) safePlay(0.5);
  });

  // Nunca reiniciar currentTime al cambiar de capítulo.
  music.addEventListener('ended', () => {
    if (!music.loop && storyAudioEnabled && !userPaused) {
      music.currentTime = 0;
      safePlay(0.5);
    }
  });
})();
