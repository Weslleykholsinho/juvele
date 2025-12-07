fetch('./data/categorias.json')
    .then(response => {
        if (!response.ok) throw new Error('Arquivo categorias.json não encontrado ou inacessível');
        return response.json();
    })
    .then(data => {
        const categorias = data.categorias;
        if (!Array.isArray(categorias)) throw new Error('Formato inválido: "categorias" não é um array');
        const container = document.getElementById('categorias-sections');
        container.innerHTML = `
            <div class="categorias-grid">
                ${categorias.map(cat => `
                    <div class="categoria-card" tabindex="0" role="button" aria-label="${cat.nome}">
                        <div class="categoria-nome">${cat.nome}</div>
                    </div>
                `).join('')}
            </div>
        `;
        // Adiciona funcionalidade de clique aos botões
        const cards = container.querySelectorAll('.categoria-card');
        cards.forEach((card, idx) => {
            card.addEventListener('click', function (e) {
                e.preventDefault();
                const nomeCategoria = categorias[idx].nome.trim();
                window.location.href = `search.html?q=${encodeURIComponent(nomeCategoria)}&categoria=1`;
            });
            // Acessibilidade: permite ativar com Enter ou Espaço
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const nomeCategoria = categorias[idx].nome.trim();
                    window.location.href = `search.html?q=${encodeURIComponent(nomeCategoria)}&categoria=1`;
                }
            });
        });
    })
    .catch(err => {
        document.getElementById('categorias-sections').innerHTML =
            `<div style="color:red;text-align:center;">
                Erro ao carregar categorias.<br>
                <small>${err.message}</small><br>
                <small>Verifique se o arquivo <b>assets/data/categorias.json</b> existe e está acessível.</small>
            </div>`;
        console.error(err);
    });