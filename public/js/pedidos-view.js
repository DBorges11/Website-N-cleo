// public/js/pedidos-view.js

document.addEventListener('DOMContentLoaded', initPedidosView);

function initPedidosView() {
    const listContainer = document.getElementById('pedidos-list');
    
    if (!listContainer) return;

    fetchPedidos();

    async function fetchPedidos() {
        listContainer.innerHTML = '<p class="loading">A carregar pedidos...</p>';

        try {
            // Chamada ao novo endpoint de API que criámos
            const response = await fetch('/api/pedidos');
            
            if (!response.ok) {
                throw new Error('Erro ao buscar dados: ' + response.statusText);
            }

            const pedidos = await response.json();

            // Limpar o conteúdo de carregamento
            listContainer.innerHTML = '';

            if (pedidos.length === 0) {
                listContainer.innerHTML = '<p>Nenhum pedido de ajuda encontrado.</p>';
                return;
            }

            // Iterar e criar os elementos HTML para cada pedido
            pedidos.forEach(pedido => {
                const card = document.createElement('div');
                card.className = 'pedido-card reveal-on-scroll'; 
                
                const date = new Date(pedido.data_envio);
                const formattedDate = date.toLocaleString('pt-PT', { 
                    dateStyle: 'short', 
                    timeStyle: 'short' 
                });

                card.innerHTML = `
                    <p>${pedido.texto}</p>
                    <p class="date">ID: ${pedido.id} | Enviado em: ${formattedDate}</p>
                `;

                listContainer.appendChild(card);
            });
            
            // Se estiver a usar o 'reveal-on-scroll', pode precisar de chamar a inicialização aqui
            // (Assumindo que o código está noutro script que corre na página)
            // if (window.initScrollReveal) window.initScrollReveal();

        } catch (error) {
            console.error('Falha ao carregar pedidos:', error);
            listContainer.innerHTML = `<p style="color: red;">Erro: Não foi possível ligar à API. (${error.message})</p>`;
        }
    }
}