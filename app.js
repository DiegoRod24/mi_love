const $ = (s) => document.querySelector(s);
const app = document.getElementById('app');
const music = document.getElementById('music');
const soundBtn = document.getElementById('soundBtn');
let musicStarted = false;
const objectUrls = [];

async function setPhoto(img, path) {
  if (!img || !path) return;
  img.classList.add('is-loading');
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      const url = URL.createObjectURL(new Blob([buffer], { type: 'image/jpeg' }));
      objectUrls.push(url);
      img.src = url;
    } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      const url = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }));
      objectUrls.push(url);
      img.src = url;
    } else {
      const raw = new TextDecoder('utf-8').decode(buffer).trim();
      if (raw.startsWith('/9j/')) img.src = `data:image/jpeg;base64,${raw}`;
      else if (raw.startsWith('iVBOR')) img.src = `data:image/png;base64,${raw}`;
      else throw new Error('Formato de imagen no reconocido');
    }

    await new Promise((resolve, reject) => {
      if (img.complete && img.naturalWidth) return resolve();
      img.onload = resolve;
      img.onerror = reject;
    });
    img.classList.remove('is-loading', 'photo-error');
  } catch (err) {
    img.classList.remove('is-loading');
    img.classList.add('photo-error');
    console.warn('No se pudo mostrar:', path, err);
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
  const hero = `<section class="screen hero active"><div class="hero-photo"><img id="heroImage" alt="Annys, Diego y nuestra familia"></div><div class="hero-overlay"></div><div class="hero-content"><span class="eyebrow">PARA ANNYS ❤️</span><h1>${h.portada.titulo}</h1><p class="hero-subtitle">${h.portada.subtitulo}</p><p>${h.portada.texto}</p><div class="cta-stack"><button class="primary" data-next>Empezar nuestra historia <span>→</span></button><small>Al comenzar sonará nuestra canción 🎵</small></div></div></section>`;

  const family = `<section class="screen family-screen"><div class="family-wrap"><span class="eyebrow">UNA FAMILIA IMPROBABLE Y PERFECTA</span><h2>${h.familia.titulo}</h2><p class="lead">${h.familia.texto}</p><div class="constellation">${h.familia.integrantes.map((x,i)=>`<div class="person-card">${familyIcon(x)}<b>${x.nombre}</b><small>${x.detalle}</small></div>${i<h.familia.integrantes.length-1?'<div class="plus">+</div>':''}`).join('')}</div><button class="primary" data-next>Y así comenzó todo <span>→</span></button></div></section>`;

  const chapters = h.capitulos.map((c,i)=>`<section class="screen chapter"><div class="chapter-inner ${i%2?'reverse':''}"><div class="chapter-photo ${i%2?'polaroid':''}"><img data-photo="${c.image}" alt="${c.title}"></div><div class="chapter-copy"><span class="eyebrow">${c.kicker}</span><div class="year">${c.year}</div><h2>${c.title}</h2><p>${c.text}</p><button class="primary" data-next>Seguir recordando <span>→</span></button></div></div></section>`).join('');

  const mosaicPhotos = [...h.destacados, ...h.destacados];
  const gallery = `<section class="screen gallery-screen"><div class="gallery-copy"><span class="eyebrow">NUESTROS RECUERDOS</span><h2>Fotos, aventuras y nuestra familia.</h2><p>Quise juntar aquí esos instantes que quizá parecían pequeños, pero hoy son pedacitos de nuestra vida: nosotros, George, Mía, paseos, abrazos y días que quiero seguir recordando contigo.</p></div><div class="memory-mosaic">${mosaicPhotos.map((src,i)=>`<figure class="memory-tile tile-${(i%6)+1}"><img data-photo="${src}" alt="Recuerdo ${i+1}"></figure>`).join('')}</div><button class="primary gallery-next" data-next>Hay algo que todavía no te dije <span>→</span></button></section>`;

  const letter = `<section class="screen letter-screen"><article class="letter"><span class="eyebrow">DESPUÉS DE TODO ESTE TIEMPO</span><h2>${h.carta.titulo}</h2>${h.carta.parrafos.map(p=>`<p>${p}</p>`).join('')}<button class="primary" data-next>Ahora sí… <span>❤️</span></button></article></section>`;

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
  screens[current].scrollTop = 0;
  $('#progressBar').style.width = ((current / (screens.length - 1)) * 100) + '%';
  $('#stepCount').textContent = `${String(current+1).padStart(2,'0')} / ${String(screens.length).padStart(2,'0')}`;
}

document.addEventListener('click', e => {
  const next = e.target.closest('[data-next]');
  if (next) { startMusic(); show(current + 1); }
  if (e.target.id === 'emotionBtn') e.target.textContent = 'Ok… ya estoy lista 🥹❤️';
  if (e.target.id === 'yesBtn') {
    $('#proposalActions').classList.add('hidden');
    $('#answer').classList.remove('hidden');
    for (let i=0;i<36;i++) setTimeout(makeHeart, i*75);
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'Enter') { startMusic(); show(current+1); }
  if (e.key === 'ArrowLeft') show(current-1);
});
let sx=0, sy=0;
document.addEventListener('touchstart', e => { sx=e.changedTouches[0].clientX; sy=e.changedTouches[0].clientY; }, {passive:true});
document.addEventListener('touchend', e => {
  const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
  if (Math.abs(dx)<55 || Math.abs(dx)<Math.abs(dy)*1.3) return;
  startMusic(); dx<0 ? show(current+1) : show(current-1);
}, {passive:true});
function makeHeart() {
  const h=document.createElement('span'); h.className='heart-float'; h.textContent=Math.random()>.45?'♥':'♡';
  h.style.left=Math.random()*100+'vw'; h.style.fontSize=(14+Math.random()*26)+'px'; h.style.animationDuration=(3+Math.random()*3)+'s';
  document.body.appendChild(h); setTimeout(()=>h.remove(),6500);
}
show(0);
