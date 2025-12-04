const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');

function toggleMenu() {
  const open = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}
menuToggle.addEventListener('click', toggleMenu);
navLinks.forEach(a => a.addEventListener('click', () => siteNav.classList.remove('open')));

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('reveal');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

import { events } from './events.js';

function sortHomepage(list) {
  const now = new Date();
  const rank = (x) => {
    if (!x.date || x.status === 'no_date') return 3; // Sem data no fundo
    const d = new Date(x.date);
    return d > now ? 2 : 1; // 1: passados, 2: futuros
  };
  return [...list].sort((a, b) => {
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (ra === 1) return new Date(b.date) - new Date(a.date); // passados: mais recentes primeiro
    if (ra === 2) return new Date(a.date) - new Date(b.date); // futuros: mais próximos primeiro
    return 0;
  });
}

function formatDate(dateStr) {
  if (!dateStr) return 'Sem data anunciada';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMeta(ev) {
  const now = new Date();
  if (ev.type === 'news') return `Notícia · ${formatDate(ev.date)}`;
  if (!ev.date || ev.status === 'no_date') return 'Sem data anunciada';
  const d = new Date(ev.date);
  if (d > now) return `Brevemente · ${ev.location}`;
  return `${formatDate(ev.date)} · ${ev.location}`;
}

function renderEvents(list) {
  const root = document.getElementById('news-list');
  root.innerHTML = '';
  const ordered = sortHomepage(list);
  ordered.forEach(ev => {
    const card = document.createElement('article');
    card.className = 'news-card reveal-on-scroll';
    const img = document.createElement('img');
    img.className = 'news-cover';
    img.src = ev.cover;
    img.alt = ev.title;
    img.loading = 'lazy';
    img.onerror = () => {
      if (img.src.endsWith('.jpg')) img.src = img.src.replace('.jpg', '.jpeg');
      else if (img.src.endsWith('.jpeg')) img.src = img.src.replace('.jpeg', '.png');
      else if (img.src.endsWith('.png')) img.src = img.src.replace('.png', '.jpg');
    };
    const body = document.createElement('div');
    body.className = 'news-body';
    if (ev.type === 'news') {
      const badge = document.createElement('span');
      badge.className = 'badge badge-news badge-overlay';
      badge.textContent = 'Notícia';
      card.appendChild(badge);
    }
    const h3 = document.createElement('h3');
    h3.className = 'news-title';
    h3.textContent = ev.title;
    const meta = document.createElement('div');
    meta.className = 'news-meta';
    meta.textContent = getMeta(ev);
    const p = document.createElement('p');
    const firstPara = (ev.desc || '').split(/\n\n+/)[0] || ev.desc || '';
    p.textContent = firstPara;
    const actions = document.createElement('div');
    actions.className = 'news-actions';
    const btn = document.createElement('a');
    btn.href = ev.type === 'news' ? (ev.external || '#') : `/eventos.html?id=${ev.id}`;
    btn.className = 'btn small';
    btn.textContent = 'Saber mais';
    actions.appendChild(btn);
    body.appendChild(h3);
    body.appendChild(meta);
    body.appendChild(p);
    body.appendChild(actions);
    card.appendChild(img);
    card.appendChild(body);
    root.appendChild(card);
    observer.observe(card);
  });
}

function getHomepageNews() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return [
    {
      id: 'gemini', type: 'news', title: 'Gemini Pro Grátis', date: todayStr,
      cover: '/images/noticia_gemini.jpg', external: 'https://gemini.google/pt/students',
      desc: 'A Google está a oferecer o Gemini Pro durante um ano para estudantes universitários utilizarem e explorarem nos estudos e aprendizagem. Mais informações no link abaixo.'
    },
    {
      id: 'nvidia-gr00t', type: 'news', title: 'Isaac GR00T N1: Robô humanoide', date: '2025-03-18',
      cover: '/images/noticia_robo_neo.jpg', external: 'https://blog.nvidia.com.br/blog/nvidia-anuncia-o-isaac-gr00t-n1-primeiro-modelo-de-base-de-robos-humanoides-aberto-do-mundo-e-frameworks-de-simulacao/',
      desc: 'A NVIDIA apresentou o Isaac GR00T N1, um modelo de base aberto e personalizável para robôs humanoides, com frameworks de simulação e o motor de física Newton em colaboração com o Google DeepMind e a Disney.'
    }
  ];
}

function renderHomepage(list) { renderEvents([...list, ...getHomepageNews()]); }

renderHomepage(events);

document.getElementById('filter-all').addEventListener('click', () => renderHomepage(events));
document.getElementById('filter-past').addEventListener('click', () => {
  const past = events.filter(ev => {
    if (!ev.date) return false;
    const d = new Date(ev.date);
    const now = new Date();
    return d < now;
  });
  renderEvents(past.length ? past : events);
});

const sections = ['quem', 'fazemos', 'noticias', 'contactos'];
const sectionEls = sections.map(id => document.getElementById(id));
window.addEventListener('scroll', () => {
  const y = window.scrollY + 90;
  let active = '';
  sectionEls.forEach((el, i) => {
    const top = el.offsetTop;
    const nextTop = i < sectionEls.length - 1 ? sectionEls[i + 1].offsetTop : Number.MAX_VALUE;
    if (y >= top && y < nextTop) active = '#' + sections[i];
  });
  navLinks.forEach(a => {
    const on = a.getAttribute('href') === active;
    a.style.fontWeight = on ? '700' : '400';
  });
});

function initBackground() {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  let w, h;
  function resize() { w = window.innerWidth; h = window.innerHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  resize();
  window.addEventListener('resize', resize);
  const nodes = Array.from({ length: 90 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    r: 3 + Math.random() * 2,
    hue: 180 + Math.random() * 180
  }));
  const mouse = { x: w/2, y: h/2, has: false };
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true; });
  window.addEventListener('mouseleave', () => { mouse.has = false; });
  function step() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (mouse.has) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y; const d = Math.hypot(dx, dy);
        if (d < 160) { n.vx += dx * 0.0002; n.vy += dy * 0.0002; }
      }
      n.vx *= 0.996; n.vy *= 0.996;
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
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  step();
}

initBackground();
function initIconConstellations() {
  if (window.innerWidth <= 880) return; // ocultar em mobile
  const wrap = document.createElement('div'); wrap.className = 'bg-icons'; document.body.appendChild(wrap);
  const icons = [
    () => svg('<rect x="8" y="16" width="16" height="16" rx="3" stroke="currentColor" fill="none"/>'), // computador
    () => svg('<polygon points="6,12 12,6 18,12" stroke="currentColor" fill="none"/><polygon points="6,18 12,12 18,18" stroke="currentColor" fill="none"/>'), // brackets
    () => svg('<path d="M12 6 L16 10 L12 22 L8 10 Z" stroke="currentColor" fill="none"/>'), // troféu simplificado
    () => svg('<circle cx="12" cy="9" r="3" stroke="currentColor" fill="none"/><rect x="9" y="12" width="6" height="8" rx="3" stroke="currentColor" fill="none"/>'), // programador
    () => svg('<circle cx="9" cy="10" r="3" stroke="currentColor" fill="none"/><circle cx="15" cy="10" r="3" stroke="currentColor" fill="none"/>'), // programar em grupo
    () => svg('<rect x="6" y="8" width="4" height="8" rx="1" stroke="currentColor" fill="none"/><rect x="14" y="8" width="4" height="8" rx="1" stroke="currentColor" fill="none"/>') // 0101
  ];
  function svg(inner) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 24 24'); el.setAttribute('width', '48'); el.setAttribute('height', '48');
    el.innerHTML = `<g stroke-width="2" stroke="currentColor" opacity="0.9">${inner}</g>`;
    return el;
  }
  icons.forEach((mk, i) => {
    const holder = document.createElement('div'); holder.className = 'icon-float';
    const x = Math.random() * (window.innerWidth - 100); const y = Math.random() * (window.innerHeight - 100);
    holder.style.setProperty('--x', `${Math.round(x)}px`); holder.style.setProperty('--y', `${Math.round(y)}px`);
    const palette = ['var(--bg-1)','var(--bg-2)','var(--bg-3)','var(--bg-4)'];
    holder.style.color = palette[i % palette.length];
    holder.appendChild(mk()); wrap.appendChild(holder);
  });
}

initIconConstellations();

// decorations removed

// removed
