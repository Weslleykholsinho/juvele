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

// Cache de imagens com expiração (4 horas) - proteção contra redefinição
if (!window.IMAGE_CACHE_KEY) {
    window.IMAGE_CACHE_KEY = 'imagemCacheV1';
    window.IMAGE_CACHE_EXPIRATION = 4 * 60 * 60 * 1000; // 4 horas em ms

    window.getImagemCache = function () {
        const raw = localStorage.getItem(window.IMAGE_CACHE_KEY);
        if (!raw) return {};
        try {
            const cache = JSON.parse(raw);
            const now = Date.now();
            Object.keys(cache).forEach(url => {
                if (now - cache[url].timestamp > window.IMAGE_CACHE_EXPIRATION) {
                    delete cache[url];
                }
            });
            return cache;
        } catch {
            return {};
        }
    };

    window.setImagemCache = function (cache) {
        localStorage.setItem(window.IMAGE_CACHE_KEY, JSON.stringify(cache));
    };

    window.cacheImagem = function (url, dataURL) {
        const cache = window.getImagemCache();
        cache[url] = { dataURL, timestamp: Date.now() };
        window.setImagemCache(cache);
    };
}

// Use sempre window.IMAGE_CACHE_KEY, window.getImagemCache, etc. daqui pra frente

// Adiciona imagem ao cache (sem limpar)
function cacheImagem(url, dataURL) {
    const cache = window.getImagemCache();
    cache[url] = { dataURL, timestamp: Date.now() };
    window.setImagemCache(cache);
}

// Baixa e adiciona ao cache apenas imagens de uma lista de produtos
function garantirImagensPagina(produtosPagina) {
    const cache = window.getImagemCache();
    let baixadas = 0;
    let jaNoCache = 0;
    let ultimoTimestamp = 0;

    produtosPagina.forEach(produto => {
        if (produto.imagem && !cache[produto.imagem]?.dataURL) {
            baixadas++;
            fetch(produto.imagem)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        cacheImagem(produto.imagem, e.target.result);
                        const img = new Image();
                        img.src = e.target.result;
                        window.imagemCache = window.imagemCache || new Map();
                        window.imagemCache.set(produto.imagem, img);
                        console.log(`[CACHE] Imagem baixada e adicionada ao cache: ${produto.imagem}`);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(() => {
                    window.imagemCache = window.imagemCache || new Map();
                    window.imagemCache.set(produto.imagem, null);
                    console.log(`[ERRO] Falha ao baixar imagem: ${produto.imagem}`);
                });
        } else if (produto.imagem) {
            jaNoCache++;
            const img = new Image();
            img.src = cache[produto.imagem].dataURL;
            window.imagemCache = window.imagemCache || new Map();
            window.imagemCache.set(produto.imagem, img);
            if (cache[produto.imagem].timestamp > ultimoTimestamp) {
                ultimoTimestamp = cache[produto.imagem].timestamp;
            }
        }
    });

    const cacheAtual = getImagemCache();
    const totalCache = Object.keys(cacheAtual).length;
    let ultimaSolicitacao = ultimoTimestamp ? new Date(ultimoTimestamp) : null;
    let expiracaoCache = ultimaSolicitacao ? new Date(ultimoTimestamp + IMAGE_CACHE_EXPIRATION) : null;

    // Calcula o tamanho do cache em bytes, KB e MB
    let cacheSizeBytes = 0;
    Object.values(cacheAtual).forEach(entry => {
        if (entry.dataURL) {
            cacheSizeBytes += entry.dataURL.length * 0.75; // Base64: cada caractere ~0.75 byte
        }
    });
    const cacheSizeKB = (cacheSizeBytes / 1024).toFixed(2);
    const cacheSizeMB = (cacheSizeBytes / (1024 * 1024)).toFixed(2);

    console.log(`[CACHE] garantirImagensPagina chamada. Imagens já no cache: ${jaNoCache}, imagens a baixar: ${baixadas}`);
    console.log(`[CACHE] Total de imagens no cache: ${totalCache}`);
    console.log(`[CACHE] Tamanho total do cache: ${cacheSizeBytes} bytes (${cacheSizeKB} KB, ${cacheSizeMB} MB)`);
    if (ultimaSolicitacao) {
        console.log(`[CACHE] Última solicitação/cache criada em: ${ultimaSolicitacao.toLocaleString()}`);
        console.log(`[CACHE] Cache atual expira em: ${expiracaoCache.toLocaleString()}`);
    }
    if (baixadas === 0 && jaNoCache > 0) {
        console.log('[CACHE] Todas as imagens desta página já estavam no cache.');
    }
}

// Para busca paginada: baixe imagens só da página atual
// Exemplo de uso: chame garantirImagensPagina(produtosPagina) após renderizar a página

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

    // Baixa e adiciona ao cache apenas as imagens desta página
    garantirImagensPagina(paginaResultados);

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

// Para usar a imagem cacheada em seu site:
function getImagemParaUso(url) {
    // Retorna src para <img>: DataURL se cacheado, senão URL original
    const cachedDataURL = getImagemDataURL(url);
    return cachedDataURL || url;
}

// Chama ao iniciar a página
carregarProdutos();