const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const app = $('#app');
const music = $('#music');
const H = window.HISTORIA;
const UI_VERSION = '20260819-premium2';
const fresh = (src) => `${src}${src.includes('?') ? '&' : '?'}ui=${UI_VERSION}`;
const META = H.meta || { inicio: '2019', hoy: '2026', anos: '6 años', familia: '4 corazones' };
const PORTADA_CHIPS = H.portada.chips || ['2019 → 2026', '6 años', 'George + Mía', 'una sola pregunta al final'];
const FAMILY_ROLES = { Annys: 'mi lugar favorito', Diego: 'el que hizo esta locura', George: 'primer hijo oficial', 'Mía': 'la que completó la manada' };
const FAMILY_QUOTE = H.familia.frase || 'No sé exactamente cuándo dejamos de ser tú y yo para convertirnos en “nosotros”. Solo sé que un día ya éramos familia.';
const CHAPTER_NOTES = {
  origin: 'Y pensar que en ese momento todavía no sabíamos todo lo que venía…',
  covid: 'Afuera había miedo. Adentro estábamos aprendiendo a ser nosotros.',
  george: 'George: primer testigo oficial de esta historia de amor.',
  route: 'Hicimos hogar tantas veces que terminé entendiendo que hogar eras tú.',
  mia: 'La familia también se elige. Y Mía nos eligió a nosotros.',
  battle: 'Gracias por quedarte también en días que nunca terminan en una foto bonita.',
  routine: 'Mi plan favorito casi siempre termina siendo simplemente estar contigo.',
  return: 'Volver también fue elegirnos otra vez, pero esta vez con los ojos más abiertos.',
  maturity: 'Si pudiera empezar de nuevo, no pediría una historia perfecta. Pediría volver a encontrarte.'
};
const chapterNote = (c) => c.note || CHAPTER_NOTES[c.kind] || 'Hay recuerdos que dicen más cuando los miramos despacio.';
const GALLERY_BLOCKS = H.galeriaBloques || [
  { desde: 0, hasta: 8, titulo: 'Los imprescindibles', subtitulo: 'Esas fotos que cuentan muchísimo con muy poco.' },
  { desde: 9, hasta: 17, titulo: 'La familia creciendo', subtitulo: 'Nosotros, la calle, las casas, los abrazos y la manada.' },
  { desde: 18, hasta: 46, titulo: 'George siendo George 🐾', subtitulo: 'Porque claramente necesitábamos muchas pruebas de que este señor siempre fue protagonista.' }
];
const FINAL_PHOTOS = H.fotosFinales || [2, 4, 7, 8, 0, 1].map(i => H.galeria[i]).filter(Boolean);
const LETTER_SIGNATURE = H.carta.firma || '— Diego';
const FINAL_SIGNATURE = H.firmaFinal || '— Diego';

let screens = [];
let current = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchBlocked = false;
let lightboxIndex = 0;
let lightboxStartX = 0;
let galleryReady = false;
let countdown = 10;
let countdownId = null;
let recognition = null;
let musicWanted = false;
let musicUserPaused = false;
let musicUnlocked = false;
let hintTimer = null;
let toastTimer = null;

const supportsVoice = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
const supportsSpeech = 'speechSynthesis' in window;
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const img = (src, alt, eager = false) =>
  `<img class="story-img" data-src="${fresh(src)}" alt="${alt}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

const familyIcon = (person) => person.tipo === 'flag'
  ? `<span class="flag ${person.clase}" aria-hidden="true"></span>`
  : `<span class="pet-icon" aria-hidden="true">${person.icono}</span>`;

function sceneStyle(src) {
  return src ? `style="--scene-bg:url('${fresh(src)}')"` : '';
}

function special(c) {
  let html = '';
  if (c.route) {
    html += `<div class="route-card glass-card interactive-block"><div class="route-kicker">NUESTRO RECORRIDO</div>${c.route.map((place, i) => `<div class="route-stop"><span class="route-index">${String(i + 1).padStart(2, '0')}</span><b>${place}</b></div>${i < c.route.length - 1 ? '<div class="route-line"><i></i></div>' : ''}`).join('')}</div>`;
  }
  if (c.stats) {
    html += `<div class="stats-grid interactive-block">${c.stats.map(([label, value]) => `<article class="stat-card glass-card"><small>${label}</small><strong>${value}</strong></article>`).join('')}</div>`;
  }
  if (c.bullets) {
    html += `<div class="battle-list glass-card interactive-block">${c.bullets.map((item, i) => `<span style="--delay:${i * 70}ms"><i>✓</i>${item}</span>`).join('')}</div>`;
  }
  if (c.equation) {
    html += `<button class="equation glass-card interactive-block" data-spark type="button" aria-label="Activar dinamita pura">${c.equation.map((item, i) => `<span class="equation-${i}">${item}</span>`).join('')}<small>Toca para comprobarlo ✨</small></button>`;
  }
  if (c.arepa) {
    html += `<div class="arepa-box glass-card interactive-block"><div class="arepa-icon" aria-hidden="true">🫓</div><div><small>PRUEBA CIENTÍFICA DE NUESTRA RELACIÓN</small><button class="micro-btn" id="arepaBtn" type="button">${c.arepa.pregunta}</button><p id="arepaAnswer" class="micro-answer" hidden>${c.arepa.respuesta}</p></div></div>`;
  }
  if (c.kind === 'george') html += `<button class="micro-btn paw-button" data-paws type="button">🐾 George dejó algo por aquí</button>`;
  return html;
}

function chapter(c, i) {
  const [main, ...extras] = c.images;
  const noteId = `memory-note-${i}`;
  return `<section class="screen chapter-screen" data-screen-type="chapter" data-dock="${c.year}" ${sceneStyle(main)}><div class="scene-glow" aria-hidden="true"></div><div class="chapter-shell ${i % 2 ? 'chapter-shell--reverse' : ''}"><div class="chapter-media"><div class="photo-stack"><figure class="main-photo photo-frame tilt-${i % 3 + 1}" data-memory-note="${noteId}" tabindex="0" role="button" aria-label="Abrir una nota escondida">${img(main, c.title, i < 2)}<figcaption class="photo-tap-hint">Toca la foto <span>💌</span></figcaption><div class="memory-note" id="${noteId}" hidden><span>Una cosa más…</span><p>${chapterNote(c)}</p></div></figure><div class="mini-photos">${extras.map((src, j) => `<figure class="mini-photo photo-frame tilt-${(i + j + 2) % 3 + 1}">${img(src, `${c.title}. Recuerdo ${j + 2}`)}</figure>`).join('')}</div></div></div><div class="chapter-copy"><span class="eyebrow">${c.kicker}</span><div class="year">${c.year}</div><h2>${c.title}</h2><p class="chapter-text">${c.text}</p>${c.quote ? `<blockquote class="story-quote"><span>“</span>${c.quote}</blockquote>` : ''}${special(c)}<button class="primary scene-next" data-next type="button">Seguir recordando <span>→</span></button></div></div></section>`;
}

function render() {
  const c = H.consentimiento;
  const consent = `<section class="screen consent-screen active" data-screen-type="consent" data-dock="Inicio"><div class="consent-orbit" aria-hidden="true"><i></i><i></i><i></i></div><div class="consent-wrap"><div class="classified-pill"><span></span>${c.subtitulo}</div><div class="warning-symbol" aria-hidden="true">⚠</div><h1>${c.titulo}</h1><p class="consent-main">${c.texto}</p><p class="exclusive">${c.exclusivo}</p><h3>${c.pregunta}</h3><div class="consent-actions" id="consentActions"><button class="primary voice-primary" id="voiceBtn" type="button"><span>🎙️</span> Activar voz</button><button class="soft" id="manualBtn" type="button">Continuar ❤️</button></div><div class="voice-line"><span class="voice-dot"></span><p id="voiceHelp">${supportsVoice ? c.ayudaVoz : 'Tu navegador no soporta reconocimiento de voz. Usa “Continuar ❤️”.'}</p></div><div class="countdown-box" id="countdownBox"><span>Si no aceptas en</span><strong id="countdown">10</strong><span>segundos se activará el protocolo romántico de emergencia.</span></div><small class="swipe-copy">${c.ayudaSwipe}</small></div><div class="fake-cracks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="emergency-panel glass-card" id="emergencyPanel" hidden><span class="emergency-title">PROTOCOLO ROMÁNTICO ACTIVADO</span><div class="emergency-heart">❤️</div><h2>George autorizó el protocolo.</h2><p>Tranquila. No era malware. No se descargó nada y tu tablet está a salvo.</p><p>Diego apenas sabe sobrevivir sin ti 😂.</p><button class="primary" id="emergencyContinue" type="button">JAJA OK, CONTINUAR ❤️</button></div></section>`;

  const hero = `<section class="screen hero-screen" data-screen-type="hero" data-dock="Para Annys" ${sceneStyle(H.portada.imagen)}><div class="hero-bg"></div><div class="scene-glow" aria-hidden="true"></div><div class="hero-inner"><div class="hero-copy"><span class="eyebrow">UNA HISTORIA DE ${META.inicio} A ${META.hoy}</span><h1>${H.portada.titulo}</h1><p class="hero-subtitle">${H.portada.subtitulo}</p><p class="hero-text">${H.portada.texto}</p><div class="hero-chips">${PORTADA_CHIPS.map(x => `<span>${x}</span>`).join('')}</div><button class="primary hero-cta" data-next type="button">Empezar nuestra historia <span>→</span></button><div class="music-promise"><i></i><span>Nuestra canción te acompañará durante todo el recorrido.</span></div></div><div class="hero-visual"><figure class="hero-card photo-frame tilt-2">${img(H.portada.imagen, 'Annys, Diego y George', true)}</figure><div class="hero-stamp"><strong>${META.anos}</strong><span>de historia</span></div></div></div></section>`;

  const family = `<section class="screen family-screen" data-screen-type="family" data-dock="Nuestra familia" ${sceneStyle(H.familia.fotos[2])}><div class="scene-glow" aria-hidden="true"></div><div class="family-wrap"><span class="eyebrow">UNA FAMILIA IMPROBABLE Y PERFECTA</span><h2>${H.familia.titulo}</h2><p class="lead">${H.familia.texto}</p><div class="constellation">${H.familia.integrantes.map((person, i) => `<article class="person-card glass-card" style="--card-delay:${i * 80}ms">${familyIcon(person)}<b>${person.nombre}</b><small>${person.detalle.replace(/🇻🇪|🇵🇪/g, '').trim()}</small><em>${person.rol || FAMILY_ROLES[person.nombre] || 'parte de nuestra familia'}</em></article>`).join('')}</div><div class="family-equation-label"><span>Annys</span><i>+</i><span>Diego</span><i>+</i><span>George</span><i>+</i><span>Mía</span><b>= FAMILIA ❤️</b></div><div class="family-stage"><div class="family-photo-strip">${H.familia.fotos.map((src, i) => `<figure class="family-photo photo-frame tilt-${i + 1}">${img(src, 'Nuestra familia')}</figure>`).join('')}</div><blockquote class="family-quote">“${FAMILY_QUOTE}”</blockquote></div><button class="primary" data-next type="button">Volvamos al comienzo <span>→</span></button></div></section>`;

  const gallery = `<section class="screen gallery-screen" data-screen-type="gallery" data-dock="47 recuerdos"><div class="gallery-copy"><span class="eyebrow">NUESTROS 47 RECUERDOS</span><h2>Una vida no cabe en nueve capítulos.</h2><p>Por eso aquí están todos: nosotros, George, Mía, nuestras calles, nuestros días normales y esos momentos que quizá parecían pequeños… hasta que se volvieron parte de nuestra historia.</p><div class="gallery-meta"><span>47 fotografías</span><span>•</span><span>toca para ampliar</span><span>•</span><span>desliza dentro del visor</span></div></div><div class="memory-mosaic" id="memoryMosaic"></div><div class="gallery-ending glass-card"><span>Si llegaste hasta aquí…</span><h3>todavía falta lo más importante.</h3><button class="primary gallery-next" data-next type="button">Hay algo que todavía no te dije <span>→</span></button></div></section>`;

  const letter = `<section class="screen letter-screen" data-screen-type="letter" data-dock="Mi carta" ${sceneStyle(H.portada.imagen)}><div class="scene-glow" aria-hidden="true"></div><article class="letter glass-card"><div class="letter-pin">PARA ANNYS</div><span class="eyebrow">DESPUÉS DE TODO ESTE TIEMPO</span><h2>${H.carta.titulo}</h2><div class="letter-body">${H.carta.parrafos.map((p, i) => `<p style="--p-delay:${i * 130}ms">${p}</p>`).join('')}</div><div class="letter-signature">${LETTER_SIGNATURE}</div><button class="primary" data-next type="button">Ahora sí… ❤️</button></article></section>`;

  const prefinal = `<section class="screen prefinal-screen" data-screen-type="prefinal" data-dock="Casi llegamos…"><div class="prefinal-vignette"></div><div class="prefinal-copy">${H.prefinal.map((line, i) => `<p class="prefinal-line prefinal-${i + 1}">${line}</p>`).join('')}<button class="primary prefinal-btn" data-next type="button">Estoy lista ❤️</button></div></section>`;

  const proposalPhotos = FINAL_PHOTOS.map((src, i) => `<figure class="orbit-photo orbit-photo-${i + 1}">${img(src, `Recuerdo final ${i + 1}`)}</figure>`).join('');
  const proposal = `<section class="screen proposal-screen" data-screen-type="proposal" data-dock="La pregunta"><div class="proposal-aurora" aria-hidden="true"></div><div class="proposal-stage"><div class="proposal-memories" aria-hidden="true">${proposalPhotos}</div><div class="proposal-card glass-card" id="proposalCard"><span class="tiny-heart">♥</span><span class="eyebrow">MI PREGUNTA PARA TI</span><div class="proposal-name">ANNYS</div><h2>${H.pregunta}</h2><p class="proposal-sub">Después de todo lo vivido, quiero volver a elegirte como si fuera la primera vez.</p><div class="proposal-actions" id="proposalActions"><button class="yes" id="yesBtn" type="button">Sí ❤️</button><button class="soft" id="emotionBtn" type="button">Espera, estoy llorando 🥹</button></div><div class="answer" id="answer" hidden><div class="big-heart">❤️</div><h3>Entonces seguimos escribiendo.</h3><p>${H.respuesta}</p><div class="answer-signature">${FINAL_SIGNATURE}</div><p class="next-chapter">${H.siguiente}</p></div></div></div></section>`;

  const ui = `<button class="sound-pill" id="soundBtn" type="button" aria-label="Pausar o reanudar música"><span class="equalizer" aria-hidden="true"><i></i><i></i><i></i></span><span class="sound-copy"><b>Nuestra canción</b><small id="soundState">lista para sonar</small></span></button><div class="step-count" id="stepCount"></div><div class="progress"><span id="progressBar"></span></div><div class="swipe-hint" id="swipeHint"><span>↔</span> Desliza para recorrer nuestra historia</div><nav class="story-dock" id="storyDock" aria-label="Navegación de la historia"><button class="dock-btn" id="prevBtn" type="button" aria-label="Anterior">←</button><div class="dock-center"><small>AHORA</small><span id="dockLabel">Nuestra historia</span></div><button class="dock-btn" id="nextBtn" type="button" aria-label="Siguiente">→</button></nav><div class="heart-layer" id="heartLayer"></div><div class="paw-layer" id="pawLayer"></div><div class="spark-layer" id="sparkLayer"></div><div class="toast" id="toast" hidden></div><div class="lightbox" id="lightbox" hidden><button id="lightboxClose" class="lightbox-close" type="button" aria-label="Cerrar">×</button><button id="lightboxPrev" class="lightbox-prev" type="button" aria-label="Foto anterior">‹</button><figure><img id="lightboxImg" alt="Recuerdo ampliado"><figcaption id="lightboxCaption"></figcaption></figure><button id="lightboxNext" class="lightbox-next" type="button" aria-label="Foto siguiente">›</button><div id="lightboxCount" class="lightbox-count"></div></div>`;

  app.innerHTML = consent + hero + family + H.capitulos.map(chapter).join('') + gallery + letter + prefinal + proposal + ui;
  screens = $$('.screen');
}

function hydrate(screen, eager = false) {
  if (!screen) return;
  $$('img[data-src]', screen).forEach((el) => {
    if (el.getAttribute('src')) return;
    if (eager) el.loading = 'eager';
    el.src = el.dataset.src;
    el.addEventListener('load', () => el.classList.add('loaded'), { once: true });
    el.addEventListener('error', () => { el.classList.add('image-failed'); el.closest('figure')?.classList.add('photo-error'); }, { once: true });
  });
}

function preloadAdjacent() {
  [current - 1, current, current + 1].forEach((index) => {
    const screen = screens[index];
    if (!screen || screen.dataset.screenType === 'gallery') return;
    $$('img[data-src]', screen).forEach((el) => {
      if (!el.getAttribute('src')) { const preloader = new Image(); preloader.src = el.dataset.src; }
    });
  });
}

function renderGallery() {
  if (galleryReady) return;
  const mosaic = $('#memoryMosaic');
  if (!mosaic) return;
  GALLERY_BLOCKS.forEach((block, blockIndex) => {
    const section = document.createElement('section');
    section.className = 'memory-block';
    const photos = H.galeria.slice(block.desde, block.hasta + 1);
    section.innerHTML = `<header class="memory-block-heading"><span>${String(blockIndex + 1).padStart(2, '0')}</span><div><h3>${block.titulo}</h3><p>${block.subtitulo}</p></div></header><div class="memory-grid">${photos.map((src, localIndex) => { const absoluteIndex = block.desde + localIndex; return `<figure class="memory-tile memory-shape-${absoluteIndex % 7}" data-gallery-index="${absoluteIndex}" tabindex="0" role="button" aria-label="Abrir recuerdo ${absoluteIndex + 1}"><img src="${fresh(src)}" loading="lazy" decoding="async" alt="Recuerdo ${absoluteIndex + 1} de nuestra historia"><figcaption>${String(absoluteIndex + 1).padStart(2, '0')}</figcaption></figure>`; }).join('')}</div>`;
    mosaic.appendChild(section);
  });
  galleryReady = true;
}

function show(index, direction = null) {
  if (index < 0 || index >= screens.length || index === current) return;
  const old = screens[current];
  const next = screens[index];
  const forward = direction ?? (index > current);
  old.classList.remove('active', 'enter-forward', 'enter-back');
  current = index;
  next.classList.add('active', forward ? 'enter-forward' : 'enter-back');
  next.scrollTop = 0;
  if (next.dataset.screenType === 'gallery') renderGallery();
  hydrate(next, current < 3);
  preloadAdjacent();
  updateUI();
  applySceneAudio(next.dataset.screenType);
  keepMusicAlive();
  clearTimeout(hintTimer);
  if (current > 0 && current < 4) {
    $('#swipeHint')?.classList.remove('hidden-ui');
    hintTimer = setTimeout(() => $('#swipeHint')?.classList.add('hidden-ui'), 3800);
  }
  setTimeout(() => next.classList.remove('enter-forward', 'enter-back'), 800);
}

function updateUI() {
  const progress = $('#progressBar');
  const counter = $('#stepCount');
  const dock = $('#storyDock');
  const label = $('#dockLabel');
  const prev = $('#prevBtn');
  const next = $('#nextBtn');
  const hint = $('#swipeHint');
  const type = screens[current]?.dataset.screenType || '';
  const sound = $('#soundBtn');
  if (sound) sound.classList.toggle('ui-hidden', type === 'consent');
  if (counter) counter.classList.toggle('ui-hidden', type === 'consent');
  if (progress) progress.parentElement?.classList.toggle('ui-hidden', type === 'consent');
  if (progress) progress.style.width = `${(current / Math.max(1, screens.length - 1)) * 100}%`;
  if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(screens.length).padStart(2, '0')}`;
  if (label) label.textContent = screens[current]?.dataset.dock || 'Nuestra historia';
  if (dock) dock.classList.toggle('hidden-ui', type === 'consent' || type === 'proposal');
  if (hint) hint.classList.toggle('hidden-ui', type === 'consent' || type === 'proposal' || current > 3);
  if (prev) prev.disabled = current <= 1;
  if (next) next.disabled = current >= screens.length - 1;
}

function fadeMusic(target = 0.48, duration = 700) {
  if (!music) return;
  const start = Number.isFinite(music.volume) ? music.volume : 0;
  const startAt = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - startAt) / Math.max(1, duration));
    music.volume = Math.max(0, Math.min(1, start + (target - start) * p));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function setSoundState(label, playing = false) {
  const button = $('#soundBtn');
  const state = $('#soundState');
  if (state) state.textContent = label;
  button?.classList.toggle('is-playing', playing);
}

async function unlockAudioSilently() {
  if (!music || musicUnlocked) return;
  try {
    music.volume = 0;
    await music.play();
    musicUnlocked = true;
    setSoundState('esperando tu “sí acepto”', true);
  } catch (_) { setSoundState('toca para activar', false); }
}

async function beginMusic({ restart = false } = {}) {
  if (!music) return;
  musicWanted = true;
  musicUserPaused = false;
  try {
    if (restart) { try { music.currentTime = 0; } catch (_) {} }
    await music.play();
    musicUnlocked = true;
    setSoundState('sonando ♫', true);
    fadeMusic(0.44, 900);
  } catch (_) {
    setSoundState('toca para activar', false);
    $('#soundBtn')?.classList.add('needs-tap');
  }
}

function keepMusicAlive() {
  if (!music || !musicWanted || musicUserPaused || !music.paused) return;
  music.play().then(() => { musicUnlocked = true; setSoundState('sonando ♫', true); }).catch(() => { setSoundState('toca para reanudar', false); });
}

function toggleMusic() {
  if (!music) return;
  if (music.paused) {
    musicWanted = true;
    musicUserPaused = false;
    music.play().then(() => { musicUnlocked = true; fadeMusic(0.46, 400); setSoundState('sonando ♫', true); $('#soundBtn')?.classList.remove('needs-tap'); }).catch(() => setSoundState('toca otra vez', false));
  } else {
    musicUserPaused = true;
    music.pause();
    setSoundState('pausada', false);
  }
}

function applySceneAudio(type) {
  if (!musicWanted || musicUserPaused || !music) return;
  const volumes = { hero: 0.44, family: 0.46, chapter: 0.47, gallery: 0.43, letter: 0.35, prefinal: 0.22, proposal: 0.18 };
  fadeMusic(volumes[type] ?? 0.46, 700);
}

function speak(text, { onEnd } = {}) {
  if (!supportsSpeech) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.92;
  utterance.pitch = 1.02;
  const voice = window.speechSynthesis.getVoices().find(v => /^es/i.test(v.lang));
  if (voice) utterance.voice = voice;
  if (musicWanted && !musicUserPaused) fadeMusic(0.12, 250);
  utterance.onend = () => { if (musicWanted && !musicUserPaused) fadeMusic(0.44, 700); onEnd?.(); };
  utterance.onerror = () => { if (musicWanted && !musicUserPaused) fadeMusic(0.44, 700); onEnd?.(); };
  window.speechSynthesis.speak(utterance);
}

function acceptConsent(source = 'manual') {
  clearInterval(countdownId);
  const help = $('#voiceHelp');
  if (help) help.textContent = source === 'voice' ? 'Sí acepto confirmado 💖' : 'Perfecto. Entonces esto empieza ahora ❤️';
  beginMusic({ restart: true });
  speak('Bienvenida Annys. Te estábamos esperando. Esto fue hecho para ti.');
  setTimeout(() => show(1, true), 900);
}

function startVoice() {
  clearInterval(countdownId);
  $('#countdownBox')?.classList.add('hidden');
  if (!supportsVoice) { showToast('Tu navegador no admite voz. Usa “Continuar ❤️”.'); return; }
  unlockAudioSilently();
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new Recognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  const help = $('#voiceHelp');
  if (help) help.textContent = 'Te escucho… di “sí acepto”.';
  $('.voice-dot')?.classList.add('listening');
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    if (transcript.includes('sí acepto') || transcript.includes('si acepto')) acceptConsent('voice');
    else if (help) help.textContent = `Escuché “${transcript}”. Intenta otra vez diciendo “sí acepto”.`;
  };
  recognition.onerror = () => {
    if (help) help.textContent = 'No pude escucharte bien. Puedes intentarlo otra vez o usar “Continuar ❤️”.';
    if (!musicWanted && music && !music.paused) { music.pause(); try { music.currentTime = 0; } catch (_) {} }
  };
  recognition.onend = () => $('.voice-dot')?.classList.remove('listening');
  try { recognition.start(); } catch (_) {}
}

function startCountdown() {
  countdownId = setInterval(() => {
    countdown -= 1;
    const counter = $('#countdown');
    if (counter) counter.textContent = Math.max(0, countdown);
    if (countdown <= 0) { clearInterval(countdownId); triggerEmergency(); }
  }, 1000);
}

function triggerEmergency() {
  $('.consent-screen')?.classList.add('emergency-active');
  $('#consentActions')?.classList.add('hidden');
  $('#countdownBox')?.classList.add('hidden');
  const panel = $('#emergencyPanel');
  if (panel) panel.hidden = false;
  rainHearts(22);
  navigator.vibrate?.([40, 30, 40]);
}

function showToast(message, duration = 2400) {
  const toast = $('#toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('show'));
  toastTimer = setTimeout(() => { toast.classList.remove('show'); setTimeout(() => { toast.hidden = true; }, 220); }, duration);
}

function rainHearts(total = 24) {
  const layer = $('#heartLayer');
  if (!layer) return;
  for (let i = 0; i < total; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-float';
    heart.textContent = ['♥', '♡', '❤', '💕'][i % 4];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${14 + Math.random() * 32}px`;
    heart.style.animationDuration = `${3 + Math.random() * 3.5}s`;
    heart.style.animationDelay = `${Math.random() * 0.8}s`;
    layer.appendChild(heart);
    setTimeout(() => heart.remove(), 7500);
  }
}

function rainPaws(total = 16) {
  const layer = $('#pawLayer');
  if (!layer) return;
  for (let i = 0; i < total; i++) {
    const paw = document.createElement('span');
    paw.className = 'paw-float';
    paw.textContent = '🐾';
    paw.style.left = `${4 + Math.random() * 92}vw`;
    paw.style.top = `${12 + Math.random() * 72}vh`;
    paw.style.animationDelay = `${Math.random() * 0.7}s`;
    layer.appendChild(paw);
    setTimeout(() => paw.remove(), 3300);
  }
}

function spark(total = 18) {
  const layer = $('#sparkLayer');
  if (!layer) return;
  const icons = ['✨', '💥', '❤️', '✨'];
  for (let i = 0; i < total; i++) {
    const item = document.createElement('span');
    item.className = 'spark-float';
    item.textContent = icons[i % icons.length];
    item.style.left = `${35 + Math.random() * 30}%`;
    item.style.top = `${35 + Math.random() * 25}%`;
    item.style.setProperty('--tx', `${(Math.random() - 0.5) * 420}px`);
    item.style.setProperty('--ty', `${(Math.random() - 0.5) * 300}px`);
    layer.appendChild(item);
    setTimeout(() => item.remove(), 1800);
  }
}

function openLightbox(index) { lightboxIndex = index; const lightbox = $('#lightbox'); if (!lightbox) return; lightbox.hidden = false; document.body.classList.add('lightbox-open'); updateLightbox(); }
function closeLightbox() { const lightbox = $('#lightbox'); if (lightbox) lightbox.hidden = true; document.body.classList.remove('lightbox-open'); }
function updateLightbox() { const image = $('#lightboxImg'); const count = $('#lightboxCount'); const caption = $('#lightboxCaption'); if (image) image.src = fresh(H.galeria[lightboxIndex]); if (count) count.textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${H.galeria.length}`; if (caption) caption.textContent = `Recuerdo ${lightboxIndex + 1} de nuestra historia`; }
function shiftLightbox(delta) { lightboxIndex = (lightboxIndex + delta + H.galeria.length) % H.galeria.length; updateLightbox(); }

function toggleMemoryNote(figure) {
  const id = figure?.dataset.memoryNote;
  if (!id) return;
  const note = document.getElementById(id);
  if (!note) return;
  const opening = note.hidden;
  $$('.memory-note:not([hidden])').forEach(el => { if (el !== note) el.hidden = true; });
  note.hidden = !opening;
  figure.classList.toggle('note-open', opening);
  if (opening) navigator.vibrate?.(25);
}

function onYes() {
  $('#proposalActions')?.setAttribute('hidden', '');
  const answer = $('#answer');
  if (answer) answer.hidden = false;
  $('#proposalCard')?.classList.add('accepted');
  $('.proposal-screen')?.classList.add('accepted');
  rainHearts(64);
  spark(24);
  navigator.vibrate?.([60, 40, 120]);
  if (musicWanted && !musicUserPaused) fadeMusic(0.55, 1000);
  speak('Entonces seguimos escribiendo. Te amo muchísimo, Annys.');
}

function bind() {
  document.addEventListener('click', (event) => {
    const nextTrigger = event.target.closest('[data-next]');
    if (nextTrigger) { if (current > 0 && !musicWanted) beginMusic(); show(current + 1, true); return; }
    if (event.target.closest('#voiceBtn')) { startVoice(); return; }
    if (event.target.closest('#manualBtn')) { acceptConsent('manual'); return; }
    if (event.target.closest('#emergencyContinue')) { acceptConsent('emergency'); return; }
    if (event.target.closest('#soundBtn')) { toggleMusic(); return; }
    if (event.target.closest('#prevBtn')) { show(current - 1, false); return; }
    if (event.target.closest('#nextBtn')) { show(current + 1, true); return; }
    const noteFigure = event.target.closest('[data-memory-note]');
    if (noteFigure) { toggleMemoryNote(noteFigure); return; }
    if (event.target.closest('[data-paws]')) { rainPaws(); showToast('George aprobó este capítulo 🐾'); return; }
    if (event.target.closest('[data-spark]')) { spark(); rainHearts(8); showToast('Confirmado: dinamita pura 💥'); return; }
    if (event.target.closest('#arepaBtn')) { const answer = $('#arepaAnswer'); if (answer) answer.hidden = false; const button = $('#arepaBtn'); if (button) button.textContent = 'Caso cerrado 😂'; navigator.vibrate?.(20); return; }
    const tile = event.target.closest('[data-gallery-index]');
    if (tile) { openLightbox(Number(tile.dataset.galleryIndex)); return; }
    if (event.target.closest('#lightboxClose')) { closeLightbox(); return; }
    if (event.target.closest('#lightboxPrev')) { shiftLightbox(-1); return; }
    if (event.target.closest('#lightboxNext')) { shiftLightbox(1); return; }
    if (event.target.closest('#emotionBtn')) { const button = $('#emotionBtn'); if (button) button.textContent = 'Ok… ya estoy lista 🥹❤️'; rainHearts(12); showToast('Tómate tu tiempo, mi amor ❤️'); return; }
    if (event.target.closest('#yesBtn')) onYes();
  });

  document.addEventListener('keydown', (event) => {
    if (!$('#lightbox')?.hidden) { if (event.key === 'Escape') closeLightbox(); if (event.key === 'ArrowRight') shiftLightbox(1); if (event.key === 'ArrowLeft') shiftLightbox(-1); return; }
    const focusedNote = event.target.closest?.('[data-memory-note]');
    if (focusedNote && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggleMemoryNote(focusedNote); return; }
    if (event.key === 'ArrowRight') show(current + 1, true);
    if (event.key === 'ArrowLeft') show(current - 1, false);
  });

  document.addEventListener('touchstart', (event) => {
    if (!$('#lightbox')?.hidden) return;
    const target = event.target;
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
    touchBlocked = Boolean(target.closest('button, a, [data-memory-note], .memory-mosaic, .interactive-block, input, textarea'));
  }, { passive: true });
  document.addEventListener('touchend', (event) => {
    if (!$('#lightbox')?.hidden || touchBlocked) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.55) return;
    dx < 0 ? show(current + 1, true) : show(current - 1, false);
  }, { passive: true });

  const lightbox = $('#lightbox');
  lightbox?.addEventListener('touchstart', (event) => { lightboxStartX = event.changedTouches[0].clientX; }, { passive: true });
  lightbox?.addEventListener('touchend', (event) => { const dx = event.changedTouches[0].clientX - lightboxStartX; if (Math.abs(dx) < 50) return; dx < 0 ? shiftLightbox(1) : shiftLightbox(-1); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) keepMusicAlive(); });
  window.addEventListener('pageshow', keepMusicAlive);
  music?.addEventListener('play', () => setSoundState('sonando ♫', true));
  music?.addEventListener('pause', () => { if (!musicUserPaused && musicWanted) setSoundState('toca para reanudar', false); });
}

function init() {
  render();
  bind();
  hydrate(screens[0], true);
  updateUI();
  startCountdown();
  setSoundState('lista para sonar', false);
  if (prefersReducedMotion) document.documentElement.classList.add('reduce-motion');
}

init();