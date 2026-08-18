const $ = (s) => document.querySelector(s);

function renderHero() {
  $("#heroImage").src = HISTORIA.portada.imagen;
  $("#heroTitle").textContent = HISTORIA.portada.titulo;
  $("#heroSubtitle").textContent = HISTORIA.portada.subtitulo;
  $("#heroText").textContent = HISTORIA.portada.texto;
}

function renderFamily() {
  $("#familyTitle").textContent = HISTORIA.familia.titulo;
  $("#familyText").textContent = HISTORIA.familia.texto;
  const grid = $("#familyGrid");
  HISTORIA.familia.integrantes.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "person-card";
    card.innerHTML = `<span>${item.icono}</span><b>${item.nombre}</b><small>${item.detalle}</small>`;
    grid.appendChild(card);
    if (idx < HISTORIA.familia.integrantes.length - 1) {
      const plus = document.createElement("div");
      plus.className = "plus";
      plus.textContent = "+";
      grid.appendChild(plus);
    }
  });
}

function renderChapters() {
  const wrap = document.getElementById("chapters");
  HISTORIA.capitulos.forEach((c, i) => {
    const section = document.createElement("section");
    section.className = "screen chapter";
    section.innerHTML = `
      <div class="chapter-inner ${i % 2 ? 'reverse' : ''}">
        <div class="chapter-copy">
          <span class="eyebrow">${c.kicker}</span>
          <div class="year">${c.year}</div>
          <h2>${c.title}</h2>
          <p>${c.text}</p>
          <button class="primary" data-next>Seguir recordando <span>→</span></button>
        </div>
        <div class="chapter-photo ${i % 2 ? 'polaroid' : ''}">
          <img src="${c.image}" alt="${c.alt || 'Recuerdo de nuestra historia'}">
        </div>
      </div>`;
    wrap.appendChild(section);
  });
}

function renderGallery() {
  const gallery = document.getElementById("gallery");
  HISTORIA.galeria.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Recuerdo ${i + 1} de Annys y Diego`;
    img.loading = "lazy";
    gallery.appendChild(img);
  });
}

renderHero();
renderFamily();
renderChapters();
renderGallery();

let screens = [...document.querySelectorAll(".screen")];
let current = 0;

function show(index) {
  if (index < 0 || index >= screens.length) return;
  screens[current].classList.remove("active");
  current = index;
  screens[current].classList.add("active");
  document.getElementById("progressBar").style.width = ((current / (screens.length - 1)) * 100) + "%";
  document.getElementById("stepCount").textContent = `${String(current + 1).padStart(2,"0")} / ${String(screens.length).padStart(2,"0")}`;
  if (screens[current].classList.contains("gallery-screen") || screens[current].classList.contains("letter-screen")) screens[current].scrollTop = 0;
}

document.addEventListener("click", e => {
  const next = e.target.closest("[data-next]");
  if (next) show(current + 1);
});

document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight" || e.key === "Enter") show(current + 1);
  if (e.key === "ArrowLeft") show(current - 1);
});

let touchStartX = 0;
document.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, { passive:true });
document.addEventListener("touchend", e => {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diff) < 45) return;
  diff < 0 ? show(current + 1) : show(current - 1);
}, { passive:true });

const music = document.getElementById("music");
const soundBtn = document.getElementById("soundBtn");
soundBtn.addEventListener("click", async () => {
  try {
    if (music.paused) { await music.play(); soundBtn.classList.add("on"); }
    else { music.pause(); soundBtn.classList.remove("on"); }
  } catch { alert("Todavía falta agregar nuestra canción en assets/nuestra-cancion.mp3 ❤️"); }
});

document.getElementById("emotionBtn").addEventListener("click", () => {
  document.getElementById("emotionBtn").textContent = "Ok… ya estoy lista 🥹❤️";
});

document.getElementById("yesBtn").addEventListener("click", () => {
  document.getElementById("proposalActions").classList.add("hidden");
  document.getElementById("answer").classList.remove("hidden");
  for (let i = 0; i < 30; i++) setTimeout(makeHeart, i * 80);
});

function makeHeart() {
  const h = document.createElement("div");
  h.className = "heart-float";
  h.textContent = Math.random() > .45 ? "♥" : "♡";
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = (14 + Math.random() * 24) + "px";
  h.style.animationDuration = (3 + Math.random() * 3) + "s";
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 6500);
}
setInterval(() => { if (current === screens.length - 1 && Math.random() > .55) makeHeart(); }, 900);
show(0);
