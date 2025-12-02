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
            container.querySelectorAll('#filterNoResultsMsg').forEach(el => el.remove());
            const spacer = container.querySelector('.filter-no-results-spacer');
            if (spacer) {
                spacer.style.display = 'none';
                spacer.style.height = '0';
            }
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

        // Após aplicar o filtro, verifica se há pelo menos UM produto visível em TODOS os containers
        let anyVisible = false;
        containers.forEach(container => {
            const items = Array.from(container.querySelectorAll('[data-price], .produto-card, .product-card, .produto, [role="listitem"]'));
            if (items.some(it => it.style.display !== 'none')) {
                anyVisible = true;
            }
        });

        if (!anyVisible) {
            // Exibe a mensagem apenas no primeiro container
            const container = containers[0];
            const items = Array.from(container.querySelectorAll('[data-price], .produto-card, .product-card, .produto, [role="listitem"]'));
            // Esconde todos os produtos
            items.forEach(it => it.style.display = 'none');
            // cria/garante spacer que reserva espaço no fluxo
            let spacer = container.querySelector('.filter-no-results-spacer');
            if (!spacer) {
                spacer = document.createElement('div');
                spacer.className = 'filter-no-results-spacer';
                container.appendChild(spacer);
            }
            // cria a mensagem absoluta
            const filterMsgEl = document.createElement('div');
            filterMsgEl.id = 'filterNoResultsMsg';
            filterMsgEl.className = 'filter-no-results-msg';
            filterMsgEl.textContent = 'Nenhum resultado encontrado para esse filtro.';
            container.appendChild(filterMsgEl);
            filterMsgEl.hidden = false;
            if (!container.style.position) container.style.position = container.style.position;
            requestAnimationFrame(() => {
                const h = filterMsgEl.getBoundingClientRect().height;
                spacer.style.height = h + 'px';
                spacer.style.display = 'block';
                spacer.style.visibility = 'hidden';
            });
        }
        // Se houver algum produto visível, a mensagem já foi removida acima
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