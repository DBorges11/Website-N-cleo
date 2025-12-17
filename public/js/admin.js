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

async function fetchPedidos() {
  try {
    const res = await fetch('/api/ajuda/list');
    if (res.ok) {
      const data = await res.json();
      let arr = Array.isArray(data) ? data : (data.items || data.data || data.results || []);
      if (!Array.isArray(arr)) arr = [];
      let pendentes = arr.filter(p => p.status !== 'respondido');
      let respondidos = arr.filter(p => p.status === 'respondido');
      const lp = JSON.parse(localStorage.getItem('ajudaPedidos') || '[]');
      const lr = JSON.parse(localStorage.getItem('ajudaRespostas') || '[]');
      pendentes = mergeUnique([...lp, ...pendentes], 'id');
      respondidos = mergeUnique([...lr, ...respondidos], 'id');
      return { pendentes, respondidos };
    }
  } catch {}
  const pendentes = JSON.parse(localStorage.getItem('ajudaPedidos') || '[]');
  const respondidos = JSON.parse(localStorage.getItem('ajudaRespostas') || '[]');
  return { pendentes, respondidos };
}

function mergeUnique(list, key) {
  const seen = new Set();
  return list.filter(item => {
    const k = item[key] || JSON.stringify(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function renderPedidos({ pendentes, respondidos }) {
  const lp = document.getElementById('lista-pendentes');
  const lr = document.getElementById('lista-respondidos');
  lp.innerHTML = ''; lr.innerHTML = '';
  if (!pendentes.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Sem pedidos por responder.';
    lp.appendChild(empty);
  }
  pendentes.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pedido-card reveal-on-scroll';
    const meta = document.createElement('div');
    meta.className = 'pedido-meta';
    meta.textContent = p.at ? new Date(p.at).toLocaleString('pt-PT') : '';
    const body = document.createElement('p');
    body.textContent = p.text;
    const actions = document.createElement('div');
    actions.className = 'pedido-actions';
    const ta = document.createElement('textarea');
    ta.placeholder = 'Escrever resposta...';
    const btn = document.createElement('button');
    btn.className = 'btn primary';
    btn.textContent = 'Responder';
    btn.addEventListener('click', () => responderPedido(p, ta.value));
    actions.appendChild(ta);
    actions.appendChild(btn);
    card.appendChild(meta);
    card.appendChild(body);
    card.appendChild(actions);
    lp.appendChild(card);
    observer.observe(card);
  });
  if (!respondidos.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Sem pedidos respondidos.';
    lr.appendChild(empty);
  }
  respondidos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pedido-card reveal-on-scroll';
    const meta = document.createElement('div');
    meta.className = 'pedido-meta';
    const atStr = p.at ? new Date(p.at).toLocaleString('pt-PT') : '';
    const rsStr = p.respondedAt ? new Date(p.respondedAt).toLocaleString('pt-PT') : '';
    meta.textContent = `${atStr}${rsStr ? ` · Respondido em ${rsStr}` : ''}`;
    const body = document.createElement('p');
    body.textContent = p.text;
    const resp = document.createElement('p');
    resp.textContent = `Resposta: ${p.response}`;
    card.appendChild(meta);
    card.appendChild(body);
    card.appendChild(resp);
    lr.appendChild(card);
    observer.observe(card);
  });
}

async function responderPedido(p, resposta) {
  const msg = (resposta || '').trim();
  if (!msg) return;
  const payload = { id: p.id || `hp_${Date.now()}`, response: resposta, respondedAt: new Date().toISOString() };
  let ok = false;
  try {
    const res = await fetch('/api/ajuda/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    ok = res.ok;
  } catch {}
  if (!ok) {
    const pend = JSON.parse(localStorage.getItem('ajudaPedidos') || '[]').filter(x => (x.id || '') !== (p.id || ''));
    localStorage.setItem('ajudaPedidos', JSON.stringify(pend));
    const resp = JSON.parse(localStorage.getItem('ajudaRespostas') || '[]');
    resp.push({ ...p, ...payload, status: 'respondido' });
    localStorage.setItem('ajudaRespostas', JSON.stringify(resp));
  }
  const lists = await fetchPedidos();
  renderPedidos(lists);
  const toast = document.createElement('div');
  toast.className = 'link-pill';
  toast.textContent = 'Resposta registada';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

(async function init() {
  const lists = await fetchPedidos();
  renderPedidos(lists);
})();
