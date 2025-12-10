async function carregarProdutos() {
    try {
        const response = await fetch('./data/produtos.json');
        if (!response.ok) throw new Error('Erro ao carregar produtos');

        let produtos = await response.json();
        // Embaralha os produtos antes de qualquer filtragem/ordenação
        produtos = shuffleArray(produtos);
        // Ordena todos os produtos se o toggle promo estiver ativo
        if (isPromoToggleAtivo()) {
            produtos = ordenarPromocionaisPrimeiro(produtos);
        }
        // Filtra apenas os produtos em destaque
        const produtosDestaque = produtos.filter(p => {
            const destaque = p.Destaque ?? p.destaque;
            return destaque === true || destaque === "true";
        });

        // Garante cache das imagens dos produtos em destaque
        garantirImagensPagina(produtosDestaque);

        // Chama renderizarProdutos diretamente, sem paginação
        renderizarProdutos(produtosDestaque);
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarErro();
    }
}

// Função utilitária para embaralhar um array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função para verificar se o produto está em promoção
function isProdutoPromocao(produto) {
    // Considera promoção se tiver desconto, oldprice, ou campo promocao/destaque
    return !!(produto.desconto || produto.oldprice || produto.promocao === true || produto.promocao === "true" || produto.destaque === "promocao");
}

// Modifique o comportamento do toggle promo para ordenar, não ocultar
function ordenarPromocionaisPrimeiro(produtos) {
    return produtos.slice().sort((a, b) => {
        const aPromo = isProdutoPromocao(a) ? 1 : 0;
        const bPromo = isProdutoPromocao(b) ? 1 : 0;
        // Promocionais primeiro, embaralhados entre si
        if (aPromo !== bPromo) return bPromo - aPromo;
        // Se ambos são do mesmo tipo, embaralhe
        return Math.random() < 0.5 ? -1 : 1;
    });
}

// Função para normalizar palavras (remove acentos, minúsculo, trata plural/singular simples)
function normalizarPalavra(palavra) {
    return (palavra || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
        .toLowerCase()
        .replace(/^#/, '') // remove hash inicial
        .replace(/(oes|aes|aos|is|ns|s)$/i, ''); // remove plurais comuns
}

// Função para detectar se a hash ou termo indica "Promoções"
function indicaPromocoes(valor) {
    const normalized = normalizarPalavra(valor)
        .replace(/[^a-z0-9]/g, ''); // remove caracteres não alfanuméricos
    // Aceita variações como "promo", "promocao", "promocoes"
    return ['promo', 'promocao', 'promocoes'].some(k =>
        normalized === k || normalized.startsWith(k)
    );
}

// Função para detectar se a hash atual indica "Promoções"
function hashIndicaPromocoes() {
    return indicaPromocoes(window.location.hash || '');
}

// Variáveis de paginação (apenas para search.html)
let paginaAtual = 1;
const itensPorPagina = 2;
let resultadosBusca = [];
let totalPaginas = 1;
let filtroPrecoSelecionado = "all";

// Atualiza os controles de paginação
function atualizarPaginacao() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const info = document.getElementById('paginationInfo');
    prevBtn.disabled = paginaAtual <= 1;
    nextBtn.disabled = paginaAtual >= totalPaginas;
    info.textContent = `${paginaAtual} de ${totalPaginas}`;
}

// Função para filtrar e ordenar resultados de busca conforme filtro de preço
function filtrarEOrdenarPorPreco(produtos, filtro) {
    let filtrados = produtos.slice();
    switch (filtro) {
        case "0-50":
            filtrados = filtrados.filter(p => parseFloat(p.preco) <= 50);
            break;
        case "50-100":
            filtrados = filtrados.filter(p => parseFloat(p.preco) > 50 && parseFloat(p.preco) <= 100);
            break;
        case "100-200":
            filtrados = filtrados.filter(p => parseFloat(p.preco) > 100 && parseFloat(p.preco) <= 200);
            break;
        case "200+":
            filtrados = filtrados.filter(p => parseFloat(p.preco) > 200);
            break;
        case "price-asc":
            filtrados.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
            break;
        case "price-desc":
            filtrados.sort((a, b) => parseFloat(b.preco) - parseFloat(a.preco));
            break;
        default:
            // "all" não filtra nem ordena
            break;
    }
    // Se for faixa de preço, mantém ordem original; se for asc/desc, já está ordenado
    return filtrados;
}

// Renderiza página específica dos resultados de busca
function renderizarPaginaBusca() {
    // Aplica filtro de preço antes de paginar
    const filtrados = filtrarEOrdenarPorPreco(resultadosBusca, filtroPrecoSelecionado);
    totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const paginaResultados = filtrados.slice(inicio, fim);

    // Garante cache das imagens dos produtos da página de busca
    garantirImagensPagina(paginaResultados);

    renderizarProdutos(paginaResultados, true);
    atualizarPaginacao();
}

// Modifica buscarProdutosPorTermo para identificar buscas por promoções no termo
async function buscarProdutosPorTermo(termo) {
    try {
        const response = await fetch('./data/produtos.json');
        if (!response.ok) throw new Error('Erro ao carregar produtos');

        let produtos = await response.json();
        produtos = shuffleArray(produtos);
        if (isPromoToggleAtivo()) {
            produtos = ordenarPromocionaisPrimeiro(produtos);
        }

        // Detecta se é busca por categoria
        const urlParams = new URLSearchParams(window.location.search);
        const isCategoriaBusca = urlParams.get('categoria') === '1';

        let resultados;
        // Se o termo indica promoções, busca produtos em promoção
        if (indicaPromocoes(termo)) {
            resultados = produtos.filter(p => isProdutoPromocao(p));
        } else if (isCategoriaBusca) {
            // Busca por categoria (campo categoria pode ser string ou array)
            const termoNormalizado = normalizarPalavra(termo);
            resultados = produtos.filter(produto => {
                let categorias = [];
                if (typeof produto.categoria === 'string') {
                    categorias = [produto.categoria];
                } else if (Array.isArray(produto.categoria)) {
                    categorias = produto.categoria;
                } else if (Array.isArray(produto.categorias)) {
                    categorias = produto.categorias;
                }
                return categorias.some(cat =>
                    normalizarPalavra(cat || '').includes(termoNormalizado)
                );
            });
        } else {
            // Busca por nome (comportamento padrão)
            const palavrasBusca = termo.trim().split(/\s+/).map(normalizarPalavra);
            resultados = produtos.filter(produto => {
                const nomeProduto = (produto.nome || '')
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                return palavrasBusca.every(palavra => {
                    return nomeProduto.includes(palavra) || nomeProduto.includes(palavra + 's');
                });
            });
        }

        resultadosBusca = resultados;
        paginaAtual = 1;
        const filtrados = filtrarEOrdenarPorPreco(resultadosBusca, filtroPrecoSelecionado);
        totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
        renderizarPaginaBusca();
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarErro();
    }
}

// Função para limitar o número de caracteres do título
function limitarTitulo(titulo, limite = 30) {
    if (typeof titulo !== 'string') return '';
    return titulo.length > limite ? titulo.slice(0, limite - 1) + '…' : titulo;
}

function renderizarProdutos(produtos, isBusca = false) {
    const container = document.getElementById('produtosContainer');
    const erroDiv = document.getElementById('produtosErro');

    // Garante cache das imagens dos produtos renderizados (útil para chamadas diretas)
    garantirImagensPagina(produtos);

    // Corrige bug visual: sempre limpa estilos do container antes de renderizar
    if (container) {
        container.style.display = '';
        container.style.justifyContent = '';
        container.style.alignItems = '';
        container.style.minHeight = '';
    }

    // Controle do toggle promo: habilita se houver resultados, desabilita se não houver
    setPromoToggleState(produtos && produtos.length > 0);

    if (!produtos || produtos.length === 0) {
        if (isBusca) {
            // mostra mensagem elegante de "sem resultados" apenas para buscas
            mostrarSemResultados();
            return;
        } else {
            mostrarErro();
            return;
        }
    }

    // se houver produtos, garante que a área "sem resultados" e o erro estejam ocultos
    // Removido: const noResultsEl = document.getElementById('noResults');
    // Removido: if (noResultsEl) noResultsEl.hidden = true;
    if (erroDiv) erroDiv.hidden = true;

    // garantir que data-price contenha número (se possível) para facilitar filtro/ordenacão
    container.innerHTML = produtos.map(produto => {
        const precoNum = parseFloat(String(produto.preco).replace(',', '.'));
        const dataPrice = Number.isFinite(precoNum) ? precoNum : '';
        return `
        <article class="produto-card" role="listitem" data-price="${dataPrice}">
            <div class="produto-imagem-wrapper">
                <img src="${produto.imagem}" alt="${produto.nome}" class="produto-imagem" loading="lazy" />
                ${produto.desconto ? `<div class="desconto-badge">${produto.desconto}% OFF</div>` : ''}
            </div>
            <div class="produto-info">
                <h3 class="produto-nome">${limitarTitulo(produto.nome)}</h3>
                <div class="produto-preco-wrapper">
                    ${produto.oldprice ? `<div class="produto-preco-original">R$ ${formatarPreco(produto.oldprice)}</div>` : ''}
                    <div class="produto-preco-atual">R$ ${formatarPreco(produto.preco)}</div>
                </div>
                <button class="produto-botao" onclick="adicionarAoCarrinho('${produto.id}')">
                    Comprar
                </button>
            </div>
        </article>
        `;
    }).join('');

    erroDiv.hidden = true;
}

function mostrarSemResultados() {
    const container = document.getElementById('produtosContainer');
    const erroDiv = document.getElementById('produtosErro');
    if (container) {
        container.innerHTML = `
            <div class="sem-resultados">
                <p class="sem-resultados-texto">Ops, nenhum resultado foi encontrado para sua pesquisa.</p>
                <img src="./assets/images/avatars/searchnotfound.png" alt="Nenhum resultado encontrado" class="imagem-sem-resultados" />
            </div>
        `;
        // Centraliza o conteúdo do container usando flexbox
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.minHeight = '60vh'; // altura mínima para centralizar melhor
    }
    if (erroDiv) erroDiv.hidden = true; // Esconde mensagem de erro

    // Desabilita o toggle promo
    setPromoToggleState(false);

    // Remove estilos antigos se já existirem
    const oldStyle = document.getElementById('sem-resultados-style');
    if (oldStyle) oldStyle.remove();

    // Adiciona estilos diretamente na página
    const style = document.createElement('style');
    style.id = 'sem-resultados-style';
    style.textContent = `
        .sem-resultados { 
            width: 350px;
            flex-direction: column;
            display: flex;
            padding: 20px;
            justify-content: center;
            text-align: center;
            align-items: center;
            background-color: none;
            border-radius: 8px;
        }
        .sem-resultados-texto {
            width: 100%;
            height: 100%;
            font-size: 20px;
            font-family: Montserrat, sans-serif;
            font-weight: 300;  
            color: #000000ff;
        }
        .imagem-sem-resultados {
            width: 100%;
            height: auto;
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
}

function formatarPreco(preco) {
    return parseFloat(preco).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function mostrarErro() {
    const container = document.getElementById('produtosContainer');
    const erroDiv = document.getElementById('produtosErro');
    if (container) container.innerHTML = '';
    // Removido: lógica para ocultar "noResults"
    if (erroDiv) erroDiv.hidden = false;
}

function adicionarAoCarrinho(produtoId) {
    console.log('Produto adicionado:', produtoId);
    // Implementar lógica do carrinho aqui
}

// Função para saber se o toggle de promoções está ativado
function isPromoToggleAtivo() {
    const promoToggle = document.getElementById('promoToggle');
    return promoToggle && promoToggle.checked;
}

// Função utilitária para controlar o estado do toggle promo
function setPromoToggleState(enabled) {
    const promoToggle = document.getElementById('promoToggle');
    const promoLabel = promoToggle ? promoToggle.closest('label') : null;
    if (promoToggle) {
        promoToggle.disabled = !enabled;
        // Remove inline opacity, usa classe CSS
        if (promoLabel) {
            if (!enabled) {
                promoLabel.classList.add('promo-toggle-disabled');
                promoToggle.checked = false;
            } else {
                promoLabel.classList.remove('promo-toggle-disabled');
            }
        }
    }
}

// Nova função: busca somente produtos em promoção e renderiza como busca (com paginação)
async function buscarProdutosPromocoes() {
    try {
        const response = await fetch('./data/produtos.json');
        if (!response.ok) throw new Error('Erro ao carregar produtos');

        let produtos = await response.json();
        produtos = shuffleArray(produtos);

        // Filtra apenas produtos em promoção
        const promocionais = produtos.filter(p => isProdutoPromocao(p));

        resultadosBusca = promocionais;
        paginaAtual = 1;
        const filtrados = filtrarEOrdenarPorPreco(resultadosBusca, filtroPrecoSelecionado);
        totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));

        renderizarPaginaBusca();
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarErro();
    }
}

// --- Sistema de cache de imagens unificado ---
window.IMAGE_CACHE_KEY = 'imagemCacheV1';
window.IMAGE_CACHE_EXPIRATION = 1 * 60 * 60 * 1000; // 1 hora em ms

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

// Baixa e adiciona ao cache apenas imagens de uma lista de produtos
window.garantirImagensPagina = function (produtosPagina) {
    const cache = window.getImagemCache();
    produtosPagina.forEach(produto => {
        if (produto.imagem && !cache[produto.imagem]?.dataURL) {
            fetch(produto.imagem)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        window.cacheImagem(produto.imagem, e.target.result);
                        const img = new Image();
                        img.src = e.target.result;
                        window.imagemCache = window.imagemCache || new Map();
                        window.imagemCache.set(produto.imagem, img);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(() => {
                    window.imagemCache = window.imagemCache || new Map();
                    window.imagemCache.set(produto.imagem, null);
                });
        } else if (produto.imagem) {
            const img = new Image();
            img.src = cache[produto.imagem].dataURL;
            window.imagemCache = window.imagemCache || new Map();
            window.imagemCache.set(produto.imagem, img);
        }
    });
};

// Para usar a imagem cacheada em seu site:
window.getImagemParaUso = function (url) {
    const cache = window.getImagemCache();
    return cache[url]?.dataURL || url;
};

// Log detalhado único ao entrar na página
document.addEventListener('DOMContentLoaded', function () {
    const cacheAtual = window.getImagemCache();
    const totalCache = Object.keys(cacheAtual).length;
    let cacheSizeBytes = 0;
    let ultimoTimestamp = 0;
    Object.values(cacheAtual).forEach(entry => {
        if (entry.dataURL) {
            cacheSizeBytes += entry.dataURL.length * 0.75;
            if (entry.timestamp > ultimoTimestamp) {
                ultimoTimestamp = entry.timestamp;
            }
        }
    });
    const cacheSizeMB = (cacheSizeBytes / (1024 * 1024)).toFixed(2);
    let ultimaSolicitacao = ultimoTimestamp ? new Date(ultimoTimestamp) : null;
    let expiracaoCache = ultimaSolicitacao ? new Date(ultimoTimestamp + window.IMAGE_CACHE_EXPIRATION) : null;

    console.log(`[CACHE] Página: ${window.location.pathname}
Imagens no cache: ${totalCache}
Cache total: ${cacheSizeMB} MB
Cache criado: ${ultimaSolicitacao ? ultimaSolicitacao.toLocaleString() : 'N/A'}
Cache expira: ${expiracaoCache ? expiracaoCache.toLocaleString() : 'N/A'}`);
});

// Detecta a página e executa a função correta ao carregar
document.addEventListener('DOMContentLoaded', function () {
    const promoToggle = document.getElementById('promoToggle');
    if (promoToggle) {
        promoToggle.addEventListener('change', function () {
            const pathname = window.location.pathname;
            const urlParams = new URLSearchParams(window.location.search);
            const termo = urlParams.get('q') || '';
            // Resetar paginação para a primeira página ao mudar promoções
            if (typeof paginaAtual !== 'undefined') {
                paginaAtual = 1;
            }
            // Resetar filtro de preço ao mudar promoções
            if (typeof filtroPrecoSelecionado !== 'undefined') {
                filtroPrecoSelecionado = 'all';
            }
            // Também resetar o select visualmente, se existir
            const priceFilter = document.getElementById('priceFilter');
            if (priceFilter) {
                priceFilter.value = 'all';
            }
            if (pathname.endsWith('search.html')) {
                // Se a hash indica Promoções, mostrar apenas promocionais
                if (hashIndicaPromocoes()) {
                    buscarProdutosPromocoes();
                } else {
                    buscarProdutosPorTermo(termo);
                }
            } else {
                carregarProdutos();
            }
        });
    }
    const pathname = window.location.pathname;
    if (pathname.endsWith('search.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const termo = urlParams.get('q') || '';

        // Se a hash atual indica promoções, carregar apenas promocionais
        if (hashIndicaPromocoes()) {
            buscarProdutosPromocoes();
        } else {
            buscarProdutosPorTermo(termo);
        }

        // Reage a mudanças de hash (ex.: clique em categoria que aponta para #Promoções)
        window.addEventListener('hashchange', function () {
            if (hashIndicaPromocoes()) {
                buscarProdutosPromocoes();
            } else {
                // volta ao comportamento padrão: re-executa busca normal (mantém query 'q' se existir)
                const params = new URLSearchParams(window.location.search);
                const termoHash = params.get('q') || '';
                buscarProdutosPorTermo(termoHash);
            }
        });

        // Listeners de paginação
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', function () {
                if (paginaAtual > 1) {
                    paginaAtual--;
                    renderizarPaginaBusca();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
            nextBtn.addEventListener('click', function () {
                if (paginaAtual < totalPaginas) {
                    paginaAtual++;
                    renderizarPaginaBusca();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
        // Listener do filtro de preço
        const priceFilter = document.getElementById('priceFilter');
        if (priceFilter) {
            priceFilter.addEventListener('change', function () {
                filtroPrecoSelecionado = priceFilter.value;
                paginaAtual = 1;
                renderizarPaginaBusca();
            });
        }
    } else {
        carregarProdutos();
    }
});