// admin.js

// 1. Sistema de Login Simples
window.checkPass = function() {
  const pass = document.getElementById('admin-pass').value;
  if (pass === '1234') { // Altere para a sua password pretendida
    document.getElementById('login-overlay').style.display = 'none';
    localStorage.setItem('admin_auth', 'true');
  } else {
    alert('Palavra-passe incorreta!');
  }
};

// Verificar se já está logado
if (localStorage.getItem('admin_auth') === 'true') {
  document.getElementById('login-overlay').style.display = 'none';
}

// 2. Navegação entre Secções
window.showView = function(viewId) {
  // Remover classes ativas
  document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  
  // Ativar nova vista
  document.getElementById(`view-${viewId}`).classList.add('active');
  event.currentTarget.classList.add('active');
};

// 3. Carregamento de Dados (Atualizado para contar estatísticas)
async function fetchPedidos() {
  try {
    const res = await fetch('/api/ajuda/list');
    let arr = [];
    if (res.ok) {
      const data = await res.json();
      arr = Array.isArray(data) ? data : (data.items || []);
    }
    
    // Merge com localStorage (mantendo a lógica do seu script original)
    const lp = JSON.parse(localStorage.getItem('ajudaPedidos') || '[]');
    const lr = JSON.parse(localStorage.getItem('ajudaRespostas') || '[]');
    
    const todos = mergeUnique([...lp, ...lr, ...arr], 'id');
    
    const pendentes = todos.filter(p => p.status !== 'respondido');
    const respondidos = todos.filter(p => p.status === 'respondido');

    // Atualizar contador no Perfil
    const counterEl = document.getElementById('count-total');
    if (counterEl) counterEl.textContent = respondidos.length;

    return { pendentes, respondidos };
  } catch (err) {
    console.error(err);
    return { pendentes: [], respondidos: [] };
  }
}

// ... manter funções mergeUnique, renderPedidos e responderPedido como no original ...
// Nota: Certifique-se que renderPedidos aponta para os IDs corretos (lp e lr já definidos no novo HTML)

// Inicialização
(async function init() {
  const lists = await fetchPedidos();
  renderPedidos(lists);
})();