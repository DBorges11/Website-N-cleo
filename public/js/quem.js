// quem.js

// --- 1. TRADUÇÕES E SETUP ---
const i18n = {
  pt: {
    'nav.quem': 'Quem Somos',
    'nav.fazemos': 'O que Fazemos',
    'nav.sobre': 'Sobre o Curso',
    'nav.noticias': 'Notícias e Eventos',
    'nav.contactos': 'Contactos',
    'page.quem.hero': 'A Nossa Equipa',
    'page.quem.title': 'Membros do Núcleo',
    'page.quem.subtitle': 'Estudantes apaixonados por tecnologia que dinamizam a comunidade.'
  },
  en: {
    'nav.quem': 'Who We Are',
    'nav.fazemos': 'What We Do',
    'nav.sobre': 'About the Course',
    'nav.noticias': 'News & Events',
    'nav.contactos': 'Contact',
    'page.quem.hero': 'Our Team',
    'page.quem.title': 'Nucleus Members',
    'page.quem.subtitle': 'Technology-passionate students who drive the community.'
  }
};

function getLang() { return localStorage.getItem('lang') || 'pt'; }
function t(key) { const lang = getLang(); return (i18n[lang] && i18n[lang][key]) || (i18n.pt[key] || key); }
function applyLangToDom() { document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); const v = t(k); if (v) el.textContent = v; }); }

function initLangToggle() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = getLang() === 'pt' ? 'en' : 'pt';
    localStorage.setItem('lang', next);
    applyLangToDom();
  });
}

// --- 2. DADOS DOS MEMBROS (EDITA AQUI) ---
function getMembrosReais() {
  return [
    {
      id: 'membro-1',
      name: 'Diogo Vicente',
      cover: 'https://picsum.photos/seed/joao/360/360', // Substitui pelo caminho da tua imagem (ex: 'img/joao.jpg')
      github: 'https://github.com/DiogoVicente8',
      linkedin: 'https://www.linkedin.com/in/diogo-vicente-b2202b31a/'
    },
    {
      id: 'membro-2',
      name: 'Pedro Rodrigues',
      cover: 'https://picsum.photos/seed/maria/360/360',
      github: 'https://github.com/PedroRodrigues006',
      linkedin: 'https://www.linkedin.com/in/pedro-rodrigues-128b073a1/'
    },
    {
      id: 'membro-3',
      name: 'Guilherme Taipa',
      cover: 'https://picsum.photos/seed/pedro/360/360',
      github: 'https://github.com/2024118263-gif',
      linkedin: 'https://www.linkedin.com/in/guilherme-taipa-3b88673a3/'
    },
    {
      id: 'membro-4',
      name: 'Tiago Chousal',
      cover: '/images/tiago_chousal.jpeg',
      github: 'https://github.com/2024118263-gif',
      linkedin: 'https://www.linkedin.com/in/tiago-chousal-aa03ba389/'
    },
    {
      id: 'membro-5',
      name: 'Diogo Borges',
      cover: '/images/diogo_borges.jpeg',
      github: 'https://github.com/DBorges11',
      linkedin: 'https://www.linkedin.com/in/diogo-borges-335516393/'
    },
    {
      id: 'membro-6',
      name: 'Pedro Ramos ',
      cover: 'https://picsum.photos/seed/pedro/360/360',
      github: 'https://github.com/Ricardo132-maker',
      linkedin: 'https://www.linkedin.com'
    },
  ];
}

// --- 3. LÓGICA DE RENDERIZAÇÃO ---
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal'); });
}, { threshold: 0.15 });

function initQuemSomos() {
    const teamGrid = document.getElementById('team-lista');
    if (!teamGrid) return;

    // Carrega a lista manual
    const membros = getMembrosReais();
    renderMembros(membros);
}

function renderMembros(lista) {
    const teamGrid = document.getElementById('team-lista');
    if (!teamGrid) return;
    teamGrid.innerHTML = '';

    lista.forEach(membro => {
        const card = document.createElement('article');
        card.className = 'card reveal-on-scroll'; 
        
        // Aqui usamos as tuas variáveis: cover, name, cargo, links
        card.innerHTML = `
            <img src="${membro.cover}" alt="${membro.name}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover;">
            <div class="card-body">
                <h3>${membro.name}</h3>
                <p class="muted">${membro.cargo || 'Membro do Núcleo'}</p>
                <div class="social-links" style="margin-top: 12px; display: flex; gap: 15px; justify-content: center;">
                    ${membro.linkedin ? `
                    <a href="${membro.linkedin}" target="_blank" aria-label="LinkedIn" style="color: inherit; font-size: 1.2rem;">
                        <i class="fa-brands fa-linkedin"></i>
                    </a>` : ''}
                    
                    ${membro.github ? `
                    <a href="${membro.github}" target="_blank" aria-label="GitHub" style="color: inherit; font-size: 1.2rem;">
                        <i class="fa-brands fa-github"></i>
                    </a>` : ''}
                </div>
            </div>
        `;
        
        teamGrid.appendChild(card);
        observer.observe(card);
    });
}

// --- 4. CONFIGURAÇÕES GERAIS (Dark Mode, Menu, Background) ---
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// Fundo Animado (Canvas)
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
    const isDark = document.body.classList.contains('dark-mode');
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < -50 || n.x > w + 50) n.vx *= -1;
      if (n.y < -50 || n.y > h + 50) n.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = isDark ? `hsla(${n.hue}, 90%, 65%, 0.95)` : `hsla(${n.hue}, 70%, 35%, 0.6)`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Linhas
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 140) {
          const alpha = 0.10 + (140 - dist) / 140 * 0.20;
          ctx.strokeStyle = isDark ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 0.5})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  step();
}

// --- 5. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  applyLangToDom();
  initLangToggle();
  initBackground();
  initQuemSomos(); // Chama a tua lista manual
});