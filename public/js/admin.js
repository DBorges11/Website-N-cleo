// admin.js

// 1. Verificação de Login e Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar Autenticação Existente
    const auth = localStorage.getItem('admin_auth');
    const overlay = document.getElementById('login-overlay');
    
    if (auth === 'true') {
        if (overlay) overlay.style.display = 'none';
        loadAdminData(); 
    } else {
        if (overlay) overlay.style.display = 'flex'; 
    }
    
    // 2. Configurar o Botão de Login (Listener em vez de onclick)
    const btnLogin = document.getElementById('btn-login');
    const inputPass = document.getElementById('admin-pass');

    // Função de verificação
    const performLogin = () => {
        const pass = inputPass.value;
        if (pass === '1234') { 
            if (overlay) overlay.style.display = 'none';
            localStorage.setItem('admin_auth', 'true');
            loadAdminData();
        } else {
            alert('Palavra-passe incorreta!');
        }
    };

    if (btnLogin) {
        btnLogin.addEventListener('click', performLogin);
    }

    // Permitir login com tecla ENTER
    if (inputPass) {
        inputPass.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performLogin();
        });
    }
    
    // Carregar pedidos iniciais
    fetchPedidos().then(lists => renderPedidos(lists));
});

// 2. Navegação Lateral
window.showView = function(viewId, event) {
    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(`view-${viewId}`).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
};

// 3. Gestão do Perfil (Ligação à tabela 'usuarios')
async function loadAdminData() {
    try {
        const res = await fetch('/api/usuarios'); 
        if (res.ok) {
            const data = await res.json();
            // Assume-se que o admin é o primeiro utilizador da tabela
            const user = Array.isArray(data) ? data[0] : data;
            
            if (user) {
                document.getElementById('perfil-nome').value = user.nome || '';
                document.getElementById('perfil-insta').value = user.instagram_url || '';
                document.getElementById('perfil-linkedin').value = user.linkedin_url || '';
                if (user.foto_url) document.getElementById('profile-img-preview').src = user.foto_url;
                // Exibe total de respostas (calculado pela query SQL com subquery)
                document.getElementById('count-total').textContent = user.total_respostas || 0;
            }
        }
    } catch (err) {
        console.error("Erro ao carregar dados do perfil:", err);
    }
}

// Upload de Foto para Pré-visualização
document.getElementById('upload-photo')?.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('profile-img-preview').src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

window.saveProfile = async function() {
    const payload = {
        nome: document.getElementById('perfil-nome').value,
        instagram_url: document.getElementById('perfil-insta').value,
        linkedin_url: document.getElementById('perfil-linkedin').value,
        foto_url: document.getElementById('profile-img-preview').src
    };

    try {
        const res = await fetch('/api/usuarios', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) alert('Perfil atualizado com sucesso!');
        else alert('Erro ao guardar no servidor.');
    } catch (err) {
        console.error("Erro ao salvar:", err);
    }
};

// 4. Gestão de Pedidos (Pendentes e Respondidos)
async function fetchPedidos() {
    try {
        const res = await fetch('/api/pedidos');
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        
        return {
            pendentes: arr.filter(p => !p.resposta || p.status === 'pending'),
            respondidos: arr.filter(p => p.resposta || p.status === 'respondido')
        };
    } catch (err) {
        return { pendentes: [], respondidos: [] };
    }
}

function renderPedidos({ pendentes, respondidos }) {
    const lp = document.getElementById('lista-pendentes');
    const lr = document.getElementById('lista-respondidos');
    if(!lp || !lr) return;

    // --- LISTA DE PENDENTES (Com espaço para notificações) ---
    lp.innerHTML = pendentes.length ? pendentes.map(p => `
        <div class="pedido-card">
            <div class="pedido-meta">
                <span>📅 ${new Date(p.data_envio).toLocaleString('pt-PT')}</span>
                <span style="margin-left: 15px; color: #00d4ff;">📧 ${p.email || 'Sem email'}</span>
            </div>
            
            <div class="pedido-text">${p.texto}</div>
            
            <div class="pedido-actions">
                <textarea id="reply-${p.id}" placeholder="Escrever resposta técnica..."></textarea>
                <button class="btn primary" onclick="responderPedido(${p.id})">Enviar Resposta</button>
                
                <div id="status-${p.id}" style="margin-top: 10px; font-weight: 600; font-size: 0.9rem; min-height: 20px;"></div>
            </div>
        </div>
    `).join('') : '<p style="color:var(--muted)">Nenhum pedido pendente.</p>';

    // --- LISTA DE RESPONDIDOS (Histórico) ---
    lr.innerHTML = respondidos.length ? respondidos.map(p => `
        <div class="pedido-card" style="border-left: 4px solid var(--success);">
            <div class="pedido-meta">
                <span>📅 Respondido: ${p.data_resposta ? new Date(p.data_resposta).toLocaleString('pt-PT') : 'N/A'}</span>
                <br><span style="font-size: 0.9em; opacity: 0.8;">📧 Para: ${p.email || 'Sem email'}</span>
            </div>
            <p style="color: var(--dark-text-muted); font-size: 0.9rem; margin-bottom:0.5rem">Pedido:</p>
            <div class="pedido-text" style="margin-bottom: 1.5rem">${p.texto}</div>
            <div style="background: rgba(63, 185, 80, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--success);">
                <p style="color: var(--success); font-weight: bold; margin:0 0 0.5rem 0;">✅ Resposta:</p>
                <p style="margin:0; color: var(--dark-text); white-space: pre-wrap;">${p.resposta}</p>
            </div>
        </div>
    `).join('') : '<p style="color:var(--muted)">Histórico vazio.</p>';
}

// 5. NOVA Função Responder (Mensagem na Tela, sem Alert)
window.responderPedido = async function(id) {
    const textarea = document.getElementById(`reply-${id}`);
    const statusDiv = document.getElementById(`status-${id}`); // O local onde vamos escrever
    const btn = document.querySelector(`button[onclick="responderPedido(${id})"]`);
    
    const textoResposta = textarea ? textarea.value : '';

    // Limpar mensagens anteriores
    if(statusDiv) statusDiv.textContent = '';

    if (!textoResposta || !textoResposta.trim()) {
        if(statusDiv) {
            statusDiv.style.color = '#ff4444'; // Vermelho
            statusDiv.textContent = '⚠️ A resposta não pode estar vazia.';
        }
        return;
    }

    // Feedback Visual: Botão Loading
    const textoBtnOriginal = btn ? btn.innerText : 'Enviar';
    if (btn) {
        btn.innerText = 'A enviar...';
        btn.disabled = true;
        btn.style.opacity = "0.7";
    }
    if (textarea) textarea.disabled = true;

    try {
        const res = await fetch('/api/responder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, resposta: textoResposta })
        });

        const data = await res.json();

        if (res.ok) {
            // --- SUCESSO: Mensagem no ecrã (VERDE) ---
            if(statusDiv) {
                statusDiv.style.color = 'var(--success)'; // Usa a cor verde do teu tema
                statusDiv.textContent = '✅ Pedido respondido e arquivado!';
            }

            // Esperar 2 segundos para o user ler a mensagem antes de atualizar a lista
            setTimeout(async () => {
                const lists = await fetchPedidos();
                renderPedidos(lists);
                loadAdminData();
            }, 2000);

        } else {
            throw new Error(data.message || 'Erro desconhecido');
        }

    } catch (err) {
        console.error("Erro:", err);
        // --- ERRO: Mensagem no ecrã (VERMELHO) ---
        if(statusDiv) {
            statusDiv.style.color = '#ff4444';
            statusDiv.textContent = `❌ Erro: ${err.message}`;
        }
        
        // Devolve o controle ao user
        if (btn) {
            btn.innerText = textoBtnOriginal;
            btn.disabled = false;
            btn.style.opacity = "1";
        }
        if (textarea) textarea.disabled = false;
    }
};