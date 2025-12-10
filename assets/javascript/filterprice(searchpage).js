(function () {
    const select = document.getElementById('priceFilter');
    const wrapper = document.querySelector('.price-filter-wrapper');
    const promoToggle = document.getElementById('promoToggle');
    if (!select) return;

    select.addEventListener('change', applyPriceFilter);

    // aplica filtro/ordenação ao mudar e no carregamento
    applyPriceFilter();

    function applyPriceFilter() {
        const value = select.value;
        const containers = [
            document.getElementById('produtosContainer'),
            document.getElementById('searchResultsContainer')
        ].filter(Boolean);

        // Remove todas as mensagens de filtro antes de processar
        containers.forEach(container => {
            // Removido: container.querySelectorAll('#filterNoResultsMsg').forEach(el => el.remove());
            // Removido: const spacer = container.querySelector('.filter-no-results-spacer');
            // Removido: if (spacer) { spacer.style.display = 'none'; spacer.style.height = '0'; }
        });

        // Aplica filtro e ordenação normalmente
        containers.forEach(container => {
            // coletar itens (preservando apenas os elementos de produto)
            const items = Array.from(container.querySelectorAll('[data-price], .produto-card, .product-card, .produto, [role="listitem"]'));

            // aplicar filtro de faixa (se aplicável)
            items.forEach(item => {
                let price = getPrice(item);
                let visible = true;
                if (value === '0-50') visible = (price != null) ? price <= 50 : true;
                else if (value === '50-100') visible = (price != null) ? price > 50 && price <= 100 : true;
                else if (value === '100-200') visible = (price != null) ? price > 100 && price <= 200 : true;
                else if (value === '200+') visible = (price != null) ? price > 200 : true;
                else if (value === 'all' || value === 'price-asc' || value === 'price-desc') visible = true;
                item.style.display = visible ? '' : 'none';
            });

            // se o valor indica ordenação, ordenar os itens visíveis
            if (value === 'price-asc' || value === 'price-desc') {
                const visibleItems = items.filter(it => it.style.display !== 'none');
                visibleItems.sort((a, b) => {
                    const pa = getPrice(a), pb = getPrice(b);
                    // itens sem preço vão para o final
                    if (pa == null && pb == null) return 0;
                    if (pa == null) return 1;
                    if (pb == null) return -1;
                    return value === 'price-asc' ? pa - pb : pb - pa;
                });
                // reapendar na nova ordem
                visibleItems.forEach(it => container.appendChild(it));
            }
        });

        // Após aplicar o filtro, não exibe mensagem se não houver produtos visíveis
        // Removido: lógica de exibição da mensagem e spacer

        // Sempre que um filtro é aplicado/desaplicado, vai para o topo e paginação para 1
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof paginaAtual !== 'undefined') {
            paginaAtual = 1;
        }
    }

    function getPrice(item) {
        // primeiro tenta data-price (numérico)
        if (item.dataset && item.dataset.price) {
            const v = parseFloat(item.dataset.price);
            if (Number.isFinite(v)) return v;
        }
        // depois tenta elementos de preço conhecidos (inclui .produto-preco-atual)
        const priceEl = item.querySelector('.produto-preco-atual, .price, .product-price, .preco, .valor');
        if (priceEl) {
            // extrai apenas números e separadores e normaliza vírgula para ponto
            const txt = priceEl.textContent.replace(/[^\d,\.]/g, '').replace(',', '.');
            const parsed = parseFloat(txt);
            if (Number.isFinite(parsed)) return parsed;
        }
        return null;
    }

    if (promoToggle) {
        promoToggle.addEventListener('change', function () {
            // Resetar filtro de preço ao mudar o toggle de promoções
            select.value = 'all';
            // Resetar variável global do filtro de preço
            if (typeof filtroPrecoSelecionado !== 'undefined') {
                filtroPrecoSelecionado = 'all';
            }
            // Resetar paginação para a primeira página, se variável global existir
            if (typeof paginaAtual !== 'undefined') {
                paginaAtual = 1;
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Não aplique filtro/ocultação de promoções aqui, apenas dispare a busca
            const pathname = window.location.pathname;
            if (pathname.endsWith('search.html')) {
                const urlParams = new URLSearchParams(window.location.search);
                const termo = urlParams.get('q') || '';
                // Chama a busca que já faz a ordenação correta
                window.buscarProdutosPorTermo ? buscarProdutosPorTermo(termo) : null;
            } else {
                window.carregarProdutos ? carregarProdutos() : null;
            }
        });
    }
})();