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

function sortByDateAsc(list) {
  return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderEvents(list) {
  const root = document.getElementById('news-list');
  root.innerHTML = '';
  const ordered = sortByDateAsc(list);
  ordered.forEach(ev => {
    const card = document.createElement('article');
    card.className = 'news-card reveal-on-scroll';
    const img = document.createElement('img');
    img.className = 'news-cover';
    img.src = ev.cover;
    img.alt = ev.title;
    img.loading = 'lazy';
    const body = document.createElement('div');
    body.className = 'news-body';
    const h3 = document.createElement('h3');
    h3.className = 'news-title';
    h3.textContent = ev.title;
    const meta = document.createElement('div');
    meta.className = 'news-meta';
    meta.textContent = `${formatDate(ev.date)} · ${ev.location}`;
    const p = document.createElement('p');
    p.textContent = ev.desc;
    const actions = document.createElement('div');
    actions.className = 'news-actions';
    const btn = document.createElement('a');
    btn.href = `/eventos.html?id=${ev.id}`;
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

renderEvents(events);

document.getElementById('filter-all').addEventListener('click', () => renderEvents(events));
document.getElementById('filter-soon').addEventListener('click', () => {
  const soon = events.filter(ev => {
    const d = new Date(ev.date);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  });
  renderEvents(soon.length ? soon : events);
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
