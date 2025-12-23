// quem.js

// Observer para as animações de scroll
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('reveal'); });
}, { threshold: 0.15 });

document.addEventListener('DOMContentLoaded', initQuemSomos);

// Função que gera dados fictícios (Placeholders)
function getPlaceholders(count = 20) {
    return Array.from({ length: count }, (_, i) => ({
        nome: `Membro ${i + 1}`,
        cargo: "Membro do Núcleo",
        foto_url: `https://picsum.photos/seed/${i + 100}/360/360`,
        linkedin_url: "https://linkedin.com",
        github_url: "https://github.com"
    }));
}

async function initQuemSomos() {
    // Sincronizado com o id="team-lista" do seu HTML
    const teamGrid = document.getElementById('team-lista');
    if (!teamGrid) return;

    /* IMPLEMENTAÇÃO FUTURA COM BASE DE DADOS:
    try {
        const response = await fetch('/api/usuarios');
        if (!response.ok) throw new Error();
        const membros = await response.json();
        renderMembros(membros);
    } catch (error) {
        console.error("Erro ao carregar da base de dados, a usar placeholders.");
        renderMembros(getPlaceholders());
    }
    */

    // Por agora, utiliza apenas os placeholders
    renderMembros(getPlaceholders());
}

function renderMembros(lista) {
    const teamGrid = document.getElementById('team-lista');
    if (!teamGrid) return; // Garante que o elemento existe
    teamGrid.innerHTML = '';

    lista.forEach(membro => {
        const card = document.createElement('article');
        card.className = 'card reveal-on-scroll'; 
        
        card.innerHTML = `
            <img src="${membro.foto_url}" alt="${membro.nome}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover;">
            <div class="card-body">
                <h3>${membro.nome}</h3>
                <p class="muted">${membro.cargo}</p>
                <div class="social-links" style="margin-top: 12px; display: flex; gap: 15px; justify-content: center;">
                    <a href="${membro.linkedin_url}" target="_blank" aria-label="LinkedIn" style="color: inherit; font-size: 1.2rem;">
                        <i class="fa-brands fa-linkedin"></i>
                    </a>
                    <a href="${membro.github_url}" target="_blank" aria-label="GitHub" style="color: inherit; font-size: 1.2rem;">
                        <i class="fa-brands fa-github"></i>
                    </a>
                </div>
            </div>
        `;
        
        teamGrid.appendChild(card);
        observer.observe(card); // Ativa a animação de scroll no novo card
    });
}