const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

const i18n = {
  pt: { 'nav.quem': 'Quem somos', 'nav.fazemos': 'O que fazemos', 'nav.noticias': 'Notícias', 'nav.contactos': 'Contacte-nos', 'page.quem.title': 'Quem somos', 'page.quem.subtitle': 'Membros do núcleo — substitui com os nomes e fotos reais.' },
  en: { 'nav.quem': 'Who we are', 'nav.fazemos': 'What we do', 'nav.noticias': 'News', 'nav.contactos': 'Contact us', 'page.quem.title': 'Who we are', 'page.quem.subtitle': 'Members of the society — replace with real names and photos.' }
};
function getLang() { return localStorage.getItem('lang') || 'pt'; }
function t(k) { const lang = getLang(); return (i18n[lang] && i18n[lang][k]) || (i18n.pt[k] || k); }
function applyLangToDom() { document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); const v = t(k); if (v) el.textContent = v; }); }
function initLangToggle() { const btn = document.getElementById('lang-toggle'); if (!btn) return; btn.addEventListener('click', () => { const next = getLang() === 'pt' ? 'en' : 'pt'; localStorage.setItem('lang', next); applyLangToDom(); location.reload(); }); }

function placeholders(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    id: `membro-${i+1}`,
    name: `Membro ${i+1}`,
    cover: `https://picsum.photos/seed/m${i+1}/360/360`
  }));
}

function renderTeam(list) {
  const root = document.getElementById('team-lista');
  root.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card reveal-on-scroll';
    const img = document.createElement('img'); img.src = p.cover; img.alt = p.name; img.loading = 'lazy';
    const body = document.createElement('div'); body.className = 'card-body';
    const h3 = document.createElement('h3'); h3.textContent = p.name;
    body.appendChild(h3);
    card.appendChild(img);
    card.appendChild(body);
    root.appendChild(card);
    observer.observe(card);
  });
}

renderTeam(placeholders(20));
applyLangToDom();
initLangToggle();

function initBackground() {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  let w, h;
  function resize() { w = window.innerWidth; h = window.innerHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  resize();
  window.addEventListener('resize', resize);
  const nodes = Array.from({ length: 80 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    r: 3 + Math.random() * 2,
    hue: 180 + Math.random() * 180
  }));
  function step() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < -50 || n.x > w + 50) n.vx *= -1;
      if (n.y < -50 || n.y > h + 50) n.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${n.hue}, 90%, 65%, 0.95)`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y; const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const alpha = 0.10 + (140 - dist) / 140 * 0.20;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  step();
}

initBackground();
