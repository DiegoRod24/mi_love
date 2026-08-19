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

  // Desbloquear audio desde el gesto real de la usuaria, especialmente importante en tablet/móvil.
  document.addEventListener('pointerdown', (event) => {
    const target = event.target.closest('#voiceBtn, #manualBtn, #emergencyContinue, [data-next]');
    if (!target) return;
    unlockFromGesture();
  }, true);

  // Respetar únicamente una pausa hecha manualmente con el botón de música.
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('#soundBtn')) return;
    userPaused = !music.paused;
    if (!userPaused) {
      storyAudioEnabled = true;
      setTimeout(() => safePlay(0.5), 0);
    }
  }, true);

  // Avanzar o retroceder nunca reinicia la pista: conserva currentTime y mantiene reproducción.
  document.addEventListener('touchend', () => {
    if (storyAudioEnabled && !userPaused && music.paused) safePlay(0.5);
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) return;
    if (storyAudioEnabled && !userPaused && music.paused) safePlay(0.5);
  });

  // Si Android/iPad/Chrome interrumpe el audio accidentalmente, reanudar desde el mismo segundo.
  music.addEventListener('pause', () => {
    if (!storyAudioEnabled || userPaused || document.hidden) return;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => safePlay(0.5), 180);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !storyAudioEnabled || userPaused) return;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => safePlay(0.5), 180);
  });

  window.addEventListener('pageshow', () => {
    if (storyAudioEnabled && !userPaused) safePlay(0.5);
  });

  // El elemento ya está en loop; esta salvaguarda evita que quede en silencio si el navegador ignora loop.
  music.addEventListener('ended', () => {
    if (!storyAudioEnabled || userPaused) return;
    music.currentTime = 0;
    safePlay(0.5);
  });
})();
