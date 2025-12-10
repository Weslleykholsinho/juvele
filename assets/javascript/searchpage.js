const searchInput = document.getElementById('searchInput');
const searchSubmit = document.getElementById('searchSubmit');
const searchTitle = document.querySelector('.search-title');
const searchDescription = document.querySelector('.search-description');

function updateSearchText(q) {
    const trimmed = (q || '').trim();
    if (trimmed) {
        searchTitle.textContent = `Resultados da busca`;
        searchDescription.textContent = `Resultados encontrados para "${trimmed}". Filtre por categoria ou navegue pelas sugestões abaixo.`;
    } else {
        searchTitle.textContent = 'Resultados da busca';
        searchDescription.textContent = 'Encontre os produtos perfeitos para você! Filtre por categoria ou navegue pelas sugestões abaixo.';
    }
}

function performSearch() {
    const params = new URLSearchParams(window.location.search);
    const categoriaParam = params.get('categoria');
    let url = `search.html?q=${encodeURIComponent(searchInput.value)}`;
    if (categoriaParam) {
        url += `&categoria=${categoriaParam}`;
    }
    window.location.href = url;
}

// Atualiza ao clicar no botão Buscar
searchSubmit.addEventListener('click', () => {
    performSearch();
});

// Permite Enter ou ícone de pesquisa do teclado disparar a busca
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
    }
});

// Permite submmit do formulário (caso exista)
if (searchInput.form) {
    searchInput.form.addEventListener('submit', function (e) {
        e.preventDefault();
        performSearch();
    });
}

// Preenche a busca a partir da query string (ex.: ?q=vestido) ao carregar a página
const params = new URLSearchParams(window.location.search);
if (params.has('q')) {
    const q = params.get('q');
    searchInput.value = q;
    // Mantém a atualização inicial quando a página é aberta com ?q=
    updateSearchText(q);
}

// --- Adapte a função que renderiza a página de resultados de busca ---
function renderizarPaginaBusca() {
    // Aplica filtro de preço antes de paginar
    const filtrados = filtrarEOrdenarPorPreco(resultadosBusca, filtroPrecoSelecionado);
    totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const paginaResultados = filtrados.slice(inicio, fim);
    renderizarProdutos(paginaResultados, true);

    atualizarPaginacao();
}

// No carregamento inicial, não baixe todas as imagens, apenas carregue produtos normalmente
async function carregarProdutos() {
    if (window.produtos?.length > 0) return window.produtos;

    const response = await fetch('./data/produtos.json');
    const produtos = await response.json();
    window.produtos = produtos;

    // Não baixa imagens aqui!
    // Apenas retorna os produtos

    return produtos;
}

// Chama ao iniciar a página
carregarProdutos();