const $ = (s) => document.querySelector(s);
const app = document.getElementById('app');
const music = document.getElementById('music');
const soundBtn = document.getElementById('soundBtn');
const PHOTO_VERSION = '20260818-47';
let musicStarted = false;
let galleryRendered = false;

function photoUrl(path) {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}v=${PHOTO_VERSION}`;
}

function setPhoto(img, path) {
  if (!img || !path) return;
  img.src = photoUrl(path);
  img.onerror = () => {
    img.onerror = null;
    img.classList.add('photo-error');
    img.alt = 'Recuerdo de nuestra historia';
  };
}

async function startMusic() {
  if (musicStarted && !music.paused) return;
  try {
    await music.play();
    musicStarted = true;
    soundBtn.classList.add('on');
  } catch (_) {}
}

soundBtn.addEventListener('click', async () => {
  try {
    if (music.paused) {
      await music.play();
      musicStarted = true;
      soundBtn.classList.add('on');
    } else {
      music.pause();
      soundBtn.classList.remove('on');
    }
  } catch (_) {}
});

function familyIcon(x) {
  return x.tipo === 'flag'
    ? `<span class="flag ${x.clase}" aria-hidden="true"></span>`
    : `<span class="pet-icon" aria-hidden="true">${x.icono}</span>`;
}

function chapterExtras(extras = []) {
  if (!extras.length) return '';
  return `<div class="chapter-thumbs">${extras.map((src, i) => `<figure><img data-photo="${src}" alt="Otro recuerdo ${i + 1}"></figure>`).join('')}</div>`;
}

function render() {
  const h = HISTORIA;

  const hero = `
    <section class="screen hero active">
      <div class="hero-photo"><img id="heroImage" alt="Annys, Diego y nuestra familia"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="eyebrow">PARA ANNYS ❤️</span>
        <h1>${h.portada.titulo}</h1>
        <p class="hero-subtitle">${h.portada.subtitulo}</p>
        <p>${h.portada.texto}</p>
        <div class="cta-stack">
          <button class="primary" data-next>Empezar nuestra historia <span>→</span></button>
          <small>Al comenzar sonará nuestra canción 🎵</small>
        </div>
      </div>
    </section>`;

  const familyPhotos = h.familia.fotos.map((src, i) => `<figure class="family-photo family-photo-${i + 1}"><img data-photo="${src}" alt="Nuestra familia"></figure>`).join('');
  const family = `
    <section class="screen family-screen">
      <div class="family-wrap">
        <span class="eyebrow">UNA FAMILIA IMPROBABLE Y PERFECTA</span>
        <h2>${h.familia.titulo}</h2>
        <p class="lead">${h.familia.texto}</p>
        <div class="constellation">${h.familia.integrantes.map((x, i) => `<div class="person-card">${familyIcon(x)}<b>${x.nombre}</b><small>${x.detalle}</small></div>${i < h.familia.integrantes.length - 1 ? '<div class="plus">+</div>' : ''}`).join('')}</div>
        <div class="family-photo-strip">${familyPhotos}</div>
        <button class="primary" data-next>Y así comenzó todo <span>→</span></button>
      </div>
    </section>`;

  const chapters = h.capitulos.map((c, i) => `
    <section class="screen chapter">
      <div class="chapter-inner ${i % 2 ? 'reverse' : ''}">
        <div class="chapter-photo ${i % 2 ? 'polaroid' : ''}"><img data-photo="${c.image}" alt="${c.title}"></div>
        <div class="chapter-copy">
          <span class="eyebrow">${c.kicker}</span>
          <div class="year">${c.year}</div>
          <h2>${c.title}</h2>
          <p>${c.text}</p>
          ${chapterExtras(c.extras)}
          <button class="primary" data-next>Seguir recordando <span>→</span></button>
        </div>
      </div>
    </section>`).join('');

  const gallery = `
    <section class="screen gallery-screen">
      <div class="gallery-copy">
        <span class="eyebrow">NUESTROS 47 RECUERDOS</span>
        <h2>Nosotros, George, Mía y todos esos días que hicieron familia.</h2>
        <p>Quise guardar aquí todas las fotos que elegí para ti. Algunas son románticas, otras graciosas, otras simplemente cotidianas. Juntas cuentan algo que una sola imagen nunca podría contar: nuestra vida.</p>
      </div>
      <div class="memory-mosaic" id="memoryMosaic"></div>
      <button class="primary gallery-next" data-next>Hay algo que todavía no te dije <span>→</span></button>
    </section>`;

  const letter = `
    <section class="screen letter-screen">
      <article class="letter">
        <span class="eyebrow">DESPUÉS DE TODO ESTE TIEMPO</span>
        <h2>${h.carta.titulo}</h2>
        ${h.carta.parrafos.map(p => `<p>${p}</p>`).join('')}
        <button class="primary" data-next>Ahora sí… <span>❤️</span></button>
      </article>
    </section>`;

  const final = `
    <section class="screen proposal-screen">
      <div class="proposal-card">
        <span class="tiny-heart">♥</span>
        <span class="eyebrow">MI PREGUNTA PARA TI</span>
        <h2>${h.pregunta}</h2>
        <p>Quiero seguir siendo tu compañero, tu cómplice y una parte feliz de esta familia que construimos.</p>
        <div class="proposal-actions" id="proposalActions">
          <button class="yes" id="yesBtn">Sí, quiero ❤️</button>
          <button class="soft" id="emotionBtn">Espera, estoy llorando 🥹</button>
        </div>
        <div class="answer hidden" id="answer">
          <div class="big-heart">❤️</div>
          <h3>Entonces seguimos escribiendo.</h3>
          <p>${h.respuesta}</p>
          <p class="signature">— Diego</p>
        </div>
      </div>
    </section>`;

  app.innerHTML = hero + family + chapters + gallery + letter + final;
  setPhoto($('#heroImage'), h.portada.imagen);
  document.querySelectorAll('[data-photo]').forEach(img => setPhoto(img, img.dataset.photo));
}

function renderGallery() {
  if (galleryRendered) return;
  const mosaic = $('#memoryMosaic');
  if (!mosaic) return;

  const fragment = document.createDocumentFragment();
  HISTORIA.galeria.forEach((src, i) => {
    const figure = document.createElement('figure');
    figure.className = `memory-tile memory-${(i % 9) + 1}`;
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = `Recuerdo ${i + 1} de nuestra historia`;
    setPhoto(img, src);
    figure.appendChild(img);
    fragment.appendChild(figure);
  });

  mosaic.appendChild(fragment);
  galleryRendered = true;
}

render();
let screens = [...document.querySelectorAll('.screen')];
let current = 0;

function show(index) {
  if (index < 0 || index >= screens.length) return;
  screens[current].classList.remove('active');
  current = index;
  screens[current].classList.add('active');
  screens[current].scrollTop = 0;

  if (screens[current].classList.contains('gallery-screen')) renderGallery();

  $('#progressBar').style.width = ((current / (screens.length - 1)) * 100) + '%';
  $('#stepCount').textContent = `${String(current + 1).padStart(2, '0')} / ${String(screens.length).padStart(2, '0')}`;
}

document.addEventListener('click', e => {
  const next = e.target.closest('[data-next]');
  if (next) {
    startMusic();
    show(current + 1);
  }

  if (e.target.id === 'emotionBtn') {
    e.target.textContent = 'Ok… ya estoy lista 🥹❤️';
  }

  if (e.target.id === 'yesBtn') {
    $('#proposalActions').classList.add('hidden');
    $('#answer').classList.remove('hidden');
    for (let i = 0; i < 36; i++) setTimeout(makeHeart, i * 75);
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'Enter') {
    startMusic();
    show(current + 1);
  }
  if (e.key === 'ArrowLeft') show(current - 1);
});

let sx = 0;
let sy = 0;
document.addEventListener('touchstart', e => {
  sx = e.changedTouches[0].clientX;
  sy = e.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - sx;
  const dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
  startMusic();
  dx < 0 ? show(current + 1) : show(current - 1);
}, { passive: true });

function makeHeart() {
  const h = document.createElement('span');
  h.className = 'heart-float';
  h.textContent = Math.random() > .45 ? '♥' : '♡';
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = (14 + Math.random() * 26) + 'px';
  h.style.animationDuration = (3 + Math.random() * 3) + 's';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 6500);
}

show(0);
