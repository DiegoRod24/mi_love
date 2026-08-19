const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const app = $('#app');
const music = $('#music');
const H = window.HISTORIA;

let screens = [];
let current = 0;
let countdown = 10;
let timerId = null;
let recognition = null;
let galleryReady = false;
let lightboxIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let lightboxStartX = 0;
let musicUnlocked = false;
let musicUserPaused = false;
let musicWanted = false;

const supportsVoice = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
const supportsSpeech = 'speechSynthesis' in window;

const img = (src, alt, cls = '', eager = false) =>
  `<img class="story-img ${cls}" data-src="${src}" alt="${alt}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

const familyIcon = (person) => person.tipo === 'flag'
  ? `<span class="flag ${person.clase}" aria-hidden="true"></span>`
  : `<span class="pet-icon" aria-hidden="true">${person.icono}</span>`;

function special(c) {
  let out = '';
  if (c.route) {
    out += `<div class="route-card glass-card">${c.route.map((x, i) => `
      <div class="route-stop"><span>${i + 1}</span><b>${x}</b></div>
      ${i < c.route.length - 1 ? '<div class="route-line">↓</div>' : ''}
    `).join('')}</div>`;
  }
  if (c.stats) {
    out += `<div class="stats-grid">${c.stats.map(([label, value]) => `
      <article class="stat-card glass-card"><small>${label}</small><strong>${value}</strong></article>
    `).join('')}</div>`;
  }
  if (c.bullets) {
    out += `<div class="battle-list glass-card">${c.bullets.map(x => `<span>✓ ${x}</span>`).join('')}</div>`;
  }
  if (c.equation) {
    out += `<div class="equation glass-card">${c.equation.map((x, i) => `<span class="equation-${i}">${x}</span>`).join('')}</div>`;
  }
  if (c.arepa) {
    out += `<div class="arepa-box glass-card">
      <button class="micro-btn" id="arepaBtn">${c.arepa.pregunta}</button>
      <p id="arepaAnswer" hidden>${c.arepa.respuesta}</p>
    </div>`;
  }
  if (c.quote) out += `<blockquote class="story-quote">${c.quote}</blockquote>`;
  if (c.kind === 'george') out += `<button class="micro-btn" data-paws>🐾 Toca aquí para las huellitas</button>`;
  return out;
}

function chapter(c, i) {
  const [main, ...extras] = c.images;
  return `<section class="screen chapter-screen" data-screen-type="chapter">
    <div class="chapter-shell ${i % 2 ? 'chapter-shell--reverse' : ''}">
      <div class="chapter-media">
        <figure class="main-photo photo-frame tilt-${i % 3 + 1}">${img(main, c.title)}</figure>
        <div class="mini-photos">${extras.map((x, j) => `
          <figure class="mini-photo photo-frame tilt-${(i + j + 1) % 3 + 1}">${img(x, `${c.title}, recuerdo ${j + 2}`)}</figure>
        `).join('')}</div>
      </div>
      <div class="chapter-copy">
        <span class="eyebrow">${c.kicker}</span>
        <div class="year">${c.year}</div>
        <h2>${c.title}</h2>
        <p>${c.text}</p>
        ${special(c)}
        <button class="primary" data-next>Seguir recordando →</button>
      </div>
    </div>
  </section>`;
}

function render() {
  const c = H.consentimiento;
  const consent = `<section class="screen consent-screen active" data-screen-type="consent">
    <div class="consent-wrap">
      <span class="warning-symbol">⚠️</span>
      <span class="eyebrow">${c.subtitulo}</span>
      <h1>${c.titulo}</h1>
      <p class="consent-main">${c.texto}</p>
      <p class="exclusive">${c.exclusivo}</p>
      <h3>${c.pregunta}</h3>
      <div class="consent-actions" id="consentActions">
        <button class="primary" id="voiceBtn">🎙️ Activar voz</button>
        <button class="soft" id="manualBtn">Continuar ❤️</button>
      </div>
      <p id="voiceHelp" class="voice-help">${supportsVoice ? c.ayudaVoz : 'Tu navegador no soporta reconocimiento de voz. Usa “Continuar ❤️”.'}</p>
      <div class="countdown-box" id="countdownBox">
        <span>Si no aceptas en</span><strong id="countdown">10</strong><span>segundos se activará el protocolo romántico de emergencia.</span>
      </div>
      <small class="swipe-copy">${c.ayudaSwipe}</small>
    </div>
    <div class="fake-cracks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="emergency-panel glass-card" id="emergencyPanel" hidden>
      <span class="emergency-title">DEMASIADO TARDE 😈❤️</span>
      <h2>George autorizó el protocolo.</h2>
      <p>Tranquila. No era malware. No se descargó nada y tu tablet está a salvo.</p>
      <p>Diego apenas sabe sobrevivir sin ti 😂.</p>
      <button class="primary" id="emergencyContinue">JAJA OK, CONTINUAR ❤️</button>
    </div>
  </section>`;

  const hero = `<section class="screen hero-screen" data-screen-type="hero">
    <div class="hero-bg"></div><div class="hero-overlay"></div>
    <div class="hero-inner">
      <div class="hero-copy">
        <span class="eyebrow">PARA ANNYS ❤️</span>
        <h1>${H.portada.titulo}</h1>
        <p class="hero-subtitle">${H.portada.subtitulo}</p>
        <p>${H.portada.texto}</p>
        <button class="primary" data-next>Empezar nuestra historia →</button>
        <small>La canción seguirá sonando mientras recorres nuestra historia 🎵</small>
      </div>
      <figure class="hero-card photo-frame tilt-2">${img(H.portada.imagen, 'Annys, Diego y George', '', true)}</figure>
    </div>
  </section>`;

  const family = `<section class="screen family-screen" data-screen-type="family">
    <div class="family-wrap">
      <span class="eyebrow">UNA FAMILIA IMPROBABLE Y PERFECTA</span>
      <h2>${H.familia.titulo}</h2>
      <p class="lead">${H.familia.texto}</p>
      <div class="constellation">${H.familia.integrantes.map((x, i) => `
        <article class="person-card glass-card">${familyIcon(x)}<b>${x.nombre}</b><small>${x.detalle}</small></article>
        ${i < H.familia.integrantes.length - 1 ? '<div class="plus">+</div>' : ''}
      `).join('')}</div>
      <div class="family-photo-strip">${H.familia.fotos.map((x, i) => `
        <figure class="family-photo photo-frame tilt-${i + 1}">${img(x, 'Nuestra familia')}</figure>
      `).join('')}</div>
      <button class="primary" data-next>Y así comenzó todo →</button>
    </div>
  </section>`;

  const gallery = `<section class="screen gallery-screen" data-screen-type="gallery">
    <div class="gallery-copy">
      <span class="eyebrow">NUESTROS 47 RECUERDOS</span>
      <h2>Nosotros, George, Mía y todos esos días que hicieron familia.</h2>
      <p>Estas 47 fotos son pedacitos de nuestra vida. Toca cualquiera para verla completa y desliza dentro del álbum para seguir.</p>
    </div>
    <div class="memory-mosaic" id="memoryMosaic"></div>
    <button class="primary gallery-next" data-next>Hay algo que todavía no te dije →</button>
  </section>`;

  const letter = `<section class="screen letter-screen" data-screen-type="letter">
    <article class="letter glass-card">
      <span class="eyebrow">DESPUÉS DE TODO ESTE TIEMPO</span>
      <h2>${H.carta.titulo}</h2>
      ${H.carta.parrafos.map(p => `<p>${p}</p>`).join('')}
      <button class="primary" data-next>Ahora sí… ❤️</button>
    </article>
  </section>`;

  const prefinal = `<section class="screen prefinal-screen" data-screen-type="prefinal">
    <div class="prefinal-copy">${H.prefinal.map((x, i) => `<p class="prefinal-line prefinal-${i + 1}">${x}</p>`).join('')}
      <button class="primary prefinal-btn" data-next>Continuar</button>
    </div>
  </section>`;

  const proposal = `<section class="screen proposal-screen" data-screen-type="proposal">
    <div class="proposal-card glass-card">
      <span class="tiny-heart">♥</span>
      <span class="eyebrow">MI PREGUNTA PARA TI</span>
      <h2>${H.pregunta}</h2>
      <div class="proposal-actions" id="proposalActions">
        <button class="yes" id="yesBtn">Sí ❤️</button>
        <button class="soft" id="emotionBtn">Espera, estoy llorando 🥹</button>
      </div>
      <div class="answer hidden" id="answer">
        <div class="big-heart">❤️</div>
        <h3>Entonces seguimos escribiendo.</h3>
        <p>${H.respuesta}</p>
        <p class="next-chapter">${H.siguiente}</p>
      </div>
    </div>
  </section>`;

  const ui = `
    <button class="sound" id="soundBtn" aria-label="Pausar o reanudar música"><span>♫</span></button>
    <div class="progress"><span id="progressBar"></span></div>
    <div class="step-count" id="stepCount"></div>
    <div class="swipe-hint" id="swipeHint">Desliza ↔ para recorrer nuestra historia</div>
    <nav class="story-dock" id="storyDock" aria-label="Navegación de la historia">
      <button class="dock-btn" id="prevBtn" aria-label="Anterior">←</button>
      <span class="dock-label" id="dockLabel">Nuestra historia</span>
      <button class="dock-btn" id="nextBtn" aria-label="Siguiente">→</button>
    </nav>
    <div class="heart-layer" id="heartLayer"></div>
    <div class="paw-layer" id="pawLayer"></div>
    <div class="toast" id="toast" hidden></div>
    <div class="lightbox" id="lightbox" hidden>
      <button id="lightboxClose" class="lightbox-close" aria-label="Cerrar">×</button>
      <button id="lightboxPrev" class="lightbox-prev" aria-label="Foto anterior">‹</button>
      <figure><img id="lightboxImg" alt="Recuerdo ampliado"></figure>
      <button id="lightboxNext" class="lightbox-next" aria-label="Foto siguiente">›</button>
      <div id="lightboxCount" class="lightbox-count"></div>
    </div>`;

  app.innerHTML = consent + hero + family + H.capitulos.map(chapter).join('') + gallery + letter + prefinal + proposal + ui;
  screens = $$('.screen');
}

function hydrate(screen, eager = false) {
  if (!screen || (screen.classList.contains('gallery-screen') && !screen.classList.contains('active'))) return;
  $$('img[data-src]', screen).forEach(el => {
    if (el.getAttribute('src')) return;
    if (eager) el.loading = 'eager';
    el.src = el.dataset.src;
    el.addEventListener('load', () => el.classList.add('loaded'), { once: true });
    el.addEventListener('error', () => {
      el.classList.add('image-failed');
      const figure = el.closest('figure');
      if (figure) figure.classList.add('photo-error');
    }, { once: true });
  });
}

function preloadAdjacent() {
  hydrate(screens[current], current < 3);
  [current - 1, current + 1].forEach(i => {
    const screen = screens[i];
    if (!screen || screen.classList.contains('gallery-screen')) return;
    $$('img[data-src]', screen).forEach(el => {
      if (!el.getAttribute('src')) {
        const preload = new Image();
        preload.src = el.dataset.src;
      }
    });
  });
}

function renderGallery() {
  if (galleryReady) return;
  const mosaic = $('#memoryMosaic');
  if (!mosaic) return;
  mosaic.innerHTML = H.galeria.map((src, i) => `
    <figure class="memory-tile memory-${i % 9 + 1}" data-gallery-index="${i}" tabindex="0" aria-label="Abrir recuerdo ${i + 1}">
      <img src="${src}" loading="lazy" decoding="async" alt="Recuerdo ${i + 1} de nuestra historia">
    </figure>`).join('');
  galleryReady = true;
}

function show(index) {
  if (index < 0 || index >= screens.length || index === current) return;
  screens[current].classList.remove('active');
  current = index;
  const nextScreen = screens[current];
  nextScreen.classList.add('active');
  nextScreen.scrollTop = 0;
  if (nextScreen.classList.contains('gallery-screen')) renderGallery();
  hydrate(nextScreen, current < 3);
  preloadAdjacent();
  keepMusicAlive();
  updateUI();
}

function updateUI() {
  const progress = $('#progressBar');
  const counter = $('#stepCount');
  const hint = $('#swipeHint');
  const dock = $('#storyDock');
  const prev = $('#prevBtn');
  const next = $('#nextBtn');
  const label = $('#dockLabel');
  const type = screens[current]?.dataset.screenType || '';

  if (progress) progress.style.width = `${(current / (screens.length - 1)) * 100}%`;
  if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(screens.length).padStart(2, '0')}`;
  if (hint) hint.classList.toggle('hidden-ui', current === 0 || type === 'proposal');
  if (dock) dock.classList.toggle('hidden-ui', current === 0 || type === 'proposal');
  if (prev) prev.disabled = current <= 1;
  if (next) next.disabled = current >= screens.length - 1;
  if (label) label.textContent = type === 'gallery' ? '47 recuerdos' : type === 'letter' ? 'Una última carta' : type === 'prefinal' ? 'Casi llegamos…' : 'Nuestra historia';
}

function fadeMusic(target = 0.5, duration = 700) {
  if (!music) return;
  const start = music.volume;
  const started = performance.now();
  const step = (now) => {
    if (!music || music.paused || musicUserPaused) return;
    const p = Math.min(1, (now - started) / duration);
    music.volume = start + (target - start) * p;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

async function unlockMusic({ quiet = false } = {}) {
  if (!music) return false;
  musicWanted = true;
  musicUnlocked = true;
  musicUserPaused = false;
  try {
    if (music.paused) {
      music.volume = quiet ? 0.08 : Math.max(music.volume, 0.12);
      await music.play();
    }
    fadeMusic(quiet ? 0.12 : 0.5, quiet ? 250 : 900);
    $('#soundBtn')?.classList.add('on');
    $('#soundBtn')?.classList.remove('needs-tap');
    return true;
  } catch (_) {
    $('#soundBtn')?.classList.add('needs-tap');
    return false;
  }
}

function keepMusicAlive() {
  if (!music || !musicWanted || musicUserPaused) return;
  if (music.paused) unlockMusic();
}

async function toggleMusic() {
  if (!music) return;
  if (music.paused) {
    musicUserPaused = false;
    musicWanted = true;
    await unlockMusic();
  } else {
    musicUserPaused = true;
    music.pause();
    $('#soundBtn')?.classList.remove('on');
  }
}

function speak(text, onDone) {
  if (!supportsSpeech) {
    if (onDone) onDone();
    return;
  }
  const restoreVolume = music && !music.paused && !musicUserPaused ? music.volume || 0.5 : null;
  if (restoreVolume !== null) fadeMusic(0.16, 250);
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.92;
  utterance.pitch = 1.03;
  const voice = window.speechSynthesis.getVoices().find(x => /^es/i.test(x.lang));
  if (voice) utterance.voice = voice;
  const finish = () => {
    if (restoreVolume !== null && !musicUserPaused) fadeMusic(0.5, 650);
    if (onDone) onDone();
  };
  utterance.onend = finish;
  utterance.onerror = finish;
  window.speechSynthesis.speak(utterance);
}

function acceptConsent(source = 'manual') {
  clearInterval(timerId);
  const help = $('#voiceHelp');
  if (help) help.textContent = source === 'voice' ? 'Consentimiento confirmado por voz 💖' : 'Consentimiento confirmado ❤️';
  unlockMusic();
  speak('Bienvenida Annys, te estábamos esperando. Esto fue hecho para ti.');
  setTimeout(() => show(1), 800);
}

async function startVoice() {
  await unlockMusic({ quiet: true });
  if (!supportsVoice) {
    $('#voiceHelp').textContent = 'Tu navegador no soporta reconocimiento de voz. Usa “Continuar ❤️”.';
    return;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new Recognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  $('#voiceHelp').textContent = 'Te escucho… di “sí acepto”.';
  recognition.onresult = e => {
    const transcript = e.results[0][0].transcript.toLowerCase().trim();
    if (transcript.includes('sí acepto') || transcript.includes('si acepto')) acceptConsent('voice');
    else $('#voiceHelp').textContent = `Escuché “${transcript}”. Intenta otra vez diciendo “sí acepto”.`;
  };
  recognition.onerror = () => $('#voiceHelp').textContent = 'No pude escucharte bien. Inténtalo otra vez o usa “Continuar ❤️”.';
  try { recognition.start(); } catch (_) {}
}

function startCountdown() {
  timerId = setInterval(() => {
    countdown -= 1;
    const el = $('#countdown');
    if (el) el.textContent = Math.max(0, countdown);
    if (countdown <= 0) {
      clearInterval(timerId);
      triggerEmergency();
    }
  }, 1000);
}

function triggerEmergency() {
  const screen = $('.consent-screen');
  screen?.classList.add('emergency-active');
  $('#consentActions')?.classList.add('hidden');
  $('#countdownBox')?.classList.add('hidden');
  if ($('#emergencyPanel')) $('#emergencyPanel').hidden = false;
  rainHearts(22);
}

function rainHearts(total = 24) {
  const layer = $('#heartLayer');
  if (!layer) return;
  for (let i = 0; i < total; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-float';
    heart.textContent = ['♥', '♡', '❤'][i % 3];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${14 + Math.random() * 30}px`;
    heart.style.animationDuration = `${3 + Math.random() * 3}s`;
    heart.style.animationDelay = `${Math.random() * 0.7}s`;
    layer.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
  }
}

function rainPaws(total = 14) {
  const layer = $('#pawLayer');
  if (!layer) return;
  for (let i = 0; i < total; i++) {
    const paw = document.createElement('span');
    paw.className = 'paw-float';
    paw.textContent = '🐾';
    paw.style.left = `${Math.random() * 92}vw`;
    paw.style.top = `${15 + Math.random() * 65}vh`;
    paw.style.animationDelay = `${Math.random() * 0.8}s`;
    layer.appendChild(paw);
    setTimeout(() => paw.remove(), 3000);
  }
}

function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { el.hidden = true; }, 2200);
}

function openLightbox(i) {
  lightboxIndex = i;
  $('#lightbox').hidden = false;
  document.body.classList.add('lightbox-open');
  updateLightbox();
}
function closeLightbox() {
  $('#lightbox').hidden = true;
  document.body.classList.remove('lightbox-open');
}
function updateLightbox() {
  $('#lightboxImg').src = H.galeria[lightboxIndex];
  $('#lightboxCount').textContent = `${lightboxIndex + 1} / ${H.galeria.length}`;
}
function shiftLightbox(delta) {
  lightboxIndex = (lightboxIndex + delta + H.galeria.length) % H.galeria.length;
  updateLightbox();
}

function bind() {
  document.addEventListener('click', e => {
    const next = e.target.closest('[data-next]');
    if (next) {
      keepMusicAlive();
      show(current + 1);
      return;
    }

    if (e.target.id === 'voiceBtn') startVoice();
    if (e.target.id === 'manualBtn') acceptConsent('manual');
    if (e.target.id === 'emergencyContinue') acceptConsent('emergency');
    if (e.target.closest('#soundBtn')) toggleMusic();
    if (e.target.id === 'prevBtn') show(current - 1);
    if (e.target.id === 'nextBtn') show(current + 1);

    if (e.target.id === 'arepaBtn') {
      const answer = $('#arepaAnswer');
      answer.hidden = false;
      e.target.textContent = 'Confirmado 😂';
    }
    if (e.target.closest('[data-paws]')) rainPaws();

    const tile = e.target.closest('[data-gallery-index]');
    if (tile) openLightbox(Number(tile.dataset.galleryIndex));

    if (e.target.id === 'lightboxClose') closeLightbox();
    if (e.target.id === 'lightboxPrev') shiftLightbox(-1);
    if (e.target.id === 'lightboxNext') shiftLightbox(1);

    if (e.target.id === 'emotionBtn') {
      e.target.textContent = 'Ok… ya estoy lista 🥹❤️';
      rainHearts(10);
    }
    if (e.target.id === 'yesBtn') {
      $('#proposalActions').classList.add('hidden');
      $('#answer').classList.remove('hidden');
      rainHearts(46);
      fadeMusic(0.34, 900);
      speak('Entonces seguimos escribiendo. Te amo muchísimo, Annys.');
    }
  });

  document.addEventListener('keydown', e => {
    const lightbox = $('#lightbox');
    if (lightbox && !lightbox.hidden) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') shiftLightbox(1);
      if (e.key === 'ArrowLeft') shiftLightbox(-1);
      return;
    }
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });

  document.addEventListener('touchstart', e => {
    if (!$('#lightbox').hidden) return;
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (!$('#lightbox').hidden) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    keepMusicAlive();
    dx < 0 ? show(current + 1) : show(current - 1);
  }, { passive: true });

  $('#lightbox').addEventListener('touchstart', e => {
    lightboxStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  $('#lightbox').addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - lightboxStartX;
    if (Math.abs(dx) < 55) return;
    dx < 0 ? shiftLightbox(1) : shiftLightbox(-1);
  }, { passive: true });

  $('#lightbox').addEventListener('click', e => {
    if (e.target.id === 'lightbox') closeLightbox();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(keepMusicAlive, 180);
  });
  window.addEventListener('pageshow', () => setTimeout(keepMusicAlive, 180));
}

function init() {
  render();
  bind();
  hydrate(screens[0], true);
  updateUI();
  startCountdown();
  if (H.galeria.length !== 47) toast(`Aviso: detecté ${H.galeria.length} fotos en la galería.`);
}

init();
