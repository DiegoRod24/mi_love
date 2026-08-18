const $ = (s) => document.querySelector(s);
const app = document.getElementById('app');
const music = document.getElementById('music');
const soundBtn = document.getElementById('soundBtn');
let musicStarted = false;

async function setPhoto(img, path) {
  if (!img || !path) return;
  try {
    const res = await fetch(path, { cache: 'force-cache' });
    if (!res.ok) throw new Error('No se pudo cargar');
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('image/')) { img.src = path; return; }
    const raw = (await res.text()).trim();
    if (raw.startsWith('/9j/')) img.src = `data:image/jpeg;base64,${raw}`;
    else if (raw.startsWith('iVBOR')) img.src = `data:image/png;base64,${raw}`;
    else img.src = path;
  } catch (e) {
    img.classList.add('photo-error');
    console.warn('Foto no disponible:', path, e);
  }
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

function render() {
  const h = HISTORIA;
  const hero = `<section class="screen hero active"><div class="hero-photo"><img id="heroImage" alt="Annys, Diego y nuestra familia"></div><div class="hero-overlay"></div><div class="hero-content"><span class="eyebrow">PARA ANNYS ❤️</span><h1>${h.portada.titulo}</h1><p class="hero-subtitle">${h.portada.subtitulo}</p><p>${h.portada.texto}</p><div class="cta-stack"><button class="primary" data-next data-start-music>Empezar nuestra historia <span>→</span></button><small>Al comenzar sonará nuestra canción 🎵</small></div></div></section>`;

  const family = `<section class="screen family-screen"><div class="family-wrap"><span class="eyebrow">UNA FAMILIA IMPROBABLE Y PERFECTA</span><h2>${h.familia.titulo}</h2><p class="lead">${h.familia.texto}</p><div class="constellation">${h.familia.integrantes.map((x,i)=>`<div class="person-card">${familyIcon(x)}<b>${x.nombre}</b><small>${x.detalle}</small></div>${i<h.familia.integrantes.length-1?'<div class="plus">+</div>':''}`).join('')}</div><button class="primary" data-next>Y así comenzó todo <span>→</span></button></div></section>`;

  const chapters = h.capitulos.map((c,i)=>`<section class="screen chapter"><div class="chapter-inner ${i%2?'reverse':''}"><div class="chapter-copy"><span class="eyebrow">${c.kicker}</span><div class="year">${c.year}</div><h2>${c.title}</h2><p>${c.text}</p><button class="primary" data-next>Seguir recordando <span>→</span></button></div><div class="chapter-photo ${i%2?'polaroid':''}"><img data-photo="${c.image||''}" alt="${c.title}"></div></div></section>`).join('');

  const gallery = `<section class="screen gallery-screen"><div class="gallery-copy"><span class="eyebrow">NUESTROS RECUERDOS</span><h2>Un montón de fotos. Seis años. Una familia.</h2><p>No quería que vieras cuatro fotos nada más. Te hice una pared de recuerdos con muchas de las imágenes que guardamos de nuestra historia.</p></div><div class="memory-stage"><div class="collage-wall">${h.collages.map((src,i)=>`<div class="collage-card c${i+1}"><img data-photo="${src}" alt="Collage de recuerdos ${i+1}"></div>`).join('')}</div><div class="highlight-grid">${h.destacados.map((src,i)=>`<img data-photo="${src}" alt="Recuerdo destacado ${i+1}" loading="lazy">`).join('')}</div></div><button class="primary floating-next" data-next>Hay algo que todavía no te dije <span>→</span></button></section>`;

  const letter = `<section class="screen letter-screen"><div class="letter"><span class="eyebrow">DESPUÉS DE TODO ESTE TIEMPO</span><h2>${h.carta.titulo}</h2>${h.carta.parrafos.map(p=>`<p>${p}</p>`).join('')}<button class="primary" data-next>Ahora sí… <span>❤️</span></button></div></section>`;

  const final = `<section class="screen proposal-screen"><div class="proposal-card"><span class="tiny-heart">♥</span><span class="eyebrow">MI PREGUNTA PARA TI</span><h2>${h.pregunta}</h2><p>Quiero seguir siendo tu compañero, tu cómplice y una parte feliz de esta familia que construimos.</p><div class="proposal-actions" id="proposalActions"><button class="yes" id="yesBtn">Sí, quiero ❤️</button><button class="soft" id="emotionBtn">Espera, estoy llorando 🥹</button></div><div class="answer hidden" id="answer"><div class="big-heart">❤️</div><h3>Entonces seguimos escribiendo.</h3><p>${h.respuesta}</p><p class="signature">— Diego</p></div></div></section>`;

  app.innerHTML = hero + family + chapters + gallery + letter + final;
  setPhoto($('#heroImage'), h.portada.imagen);
  document.querySelectorAll('[data-photo]').forEach(img => setPhoto(img, img.dataset.photo));
}

render();

let screens = [...document.querySelectorAll('.screen')];
let current = 0;

function show(index) {
  if (index < 0 || index >= screens.length) return;
  screens[current].classList.remove('active');
  current = index;
  screens[current].classList.add('active');
  $('#progressBar').style.width = ((current / (screens.length - 1)) * 100) + '%';
  $('#stepCount').textContent = `${String(current + 1).padStart(2,'0')} / ${String(screens.length).padStart(2,'0')}`;
  if (screens[current].classList.contains('gallery-screen') || screens[current].classList.contains('letter-screen')) {
    screens[current].scrollTop = 0;
  }
}

document.addEventListener('click', e => {
  const next = e.target.closest('[data-next]');
  if (next) {
    if (next.hasAttribute('data-start-music')) startMusic();
    show(current + 1);
  }
  if (e.target.id === 'emotionBtn') e.target.textContent = 'Ok… ya estoy lista 🥹❤️';
  if (e.target.id === 'yesBtn') {
    $('#proposalActions').classList.add('hidden');
    $('#answer').classList.remove('hidden');
    for (let i = 0; i < 36; i++) setTimeout(makeHeart, i * 75);
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'Enter') show(current + 1);
  if (e.key === 'ArrowLeft') show(current - 1);
});

let sx = 0, sy = 0;
document.addEventListener('touchstart', e => {
  sx = e.changedTouches[0].clientX;
  sy = e.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - sx;
  const dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
  if (current === 0) startMusic();
  dx < 0 ? show(current + 1) : show(current - 1);
}, { passive: true });

function makeHeart() {
  const h = document.createElement('div');
  h.className = 'heart-float';
  h.textContent = Math.random() > .45 ? '♥' : '♡';
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = (14 + Math.random() * 26) + 'px';
  h.style.animationDuration = (3 + Math.random() * 3) + 's';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 6500);
}

show(0);
