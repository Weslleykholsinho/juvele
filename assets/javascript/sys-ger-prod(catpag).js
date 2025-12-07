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
    return palavra
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
        .toLowerCase()
        .replace(/(oes|aes|aos|is|ns|s)$/i, ''); // remove plurais comuns
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
    if (prevBtn) prevBtn.disabled = paginaAtual <= 1;
    if (nextBtn) nextBtn.disabled = paginaAtual >= totalPaginas;
    if (info) info.textContent = `${paginaAtual} de ${totalPaginas}`;
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
    return filtrados;
}

// Renderiza página específica dos resultados de busca
function renderizarPaginaBusca() {
    const filtrados = filtrarEOrdenarPorPreco(resultadosBusca, filtroPrecoSelecionado);
    totalPaginas = Math.max(1, Math.ceil(filtrados.length / itensPorPagina));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const paginaResultados = filtrados.slice(inicio, fim);
    renderizarProdutos(paginaResultados, true);
    atualizarPaginacao();
}

// Modifica buscarProdutosPorTermo para embaralhar antes de filtrar
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
        if (isCategoriaBusca) {
            // Busca por categoria (campo categoria ou categorias)
            const termoNormalizado = normalizarPalavra(termo);
            resultados = produtos.filter(produto => {
                // Suporta campo categoria (string) ou categorias (array)
                let categorias = [];
                if (typeof produto.categoria === 'string') {
                    categorias = [produto.categoria];
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

// NOVA UTILITÁRIA: busca ou cria um container para produtos (suporta categorias page)
function getOrCreateProdutosContainer() {
    // Prioridade: elemento com id 'produtosContainer'
    let container = document.getElementById('produtosContainer');
    if (container) return container;

    // Tenta inserir dentro de #sugestoes-produtos (categories page)
    const sugestoes = document.getElementById('sugestoes-produtos');
    const categoriasSections = document.getElementById('categorias-sections');

    const parent = sugestoes || categoriasSections || document.body;
    container = document.createElement('div');
    container.id = 'produtosContainer';
    container.className = 'produtos-grid'; // pode usar estilos já existentes
    parent.appendChild(container);

    // Cria um elemento para mensagens de erro se não existir
    if (!document.getElementById('produtosErro')) {
        const erroDiv = document.createElement('div');
        erroDiv.id = 'produtosErro';
        erroDiv.hidden = true;
        parent.appendChild(erroDiv);
    }
    return container;
}

function renderizarProdutos(produtos, isBusca = false) {
    const container = getOrCreateProdutosContainer();
    const erroDiv = document.getElementById('produtosErro');

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
            mostrarSemResultados();
            return;
        } else {
            mostrarErro();
            return;
        }
    }

    const noResultsEl = document.getElementById('noResults');
    if (noResultsEl) noResultsEl.hidden = true;
    if (erroDiv) erroDiv.hidden = true;

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

    if (erroDiv) erroDiv.hidden = true;
}

function mostrarSemResultados() {
    const container = getOrCreateProdutosContainer();
    const erroDiv = document.getElementById('produtosErro');
    if (container) {
        container.innerHTML = `
            <div class="sem-resultados">
                <p class="sem-resultados-texto">Ops, nenhum resultado foi encontrado para sua pesquisa.</p>
                <img src="./assets/images/avatars/searchnotfound.png" alt="Nenhum resultado encontrado" class="imagem-sem-resultados" />
            </div>
        `;
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.minHeight = '60vh';
    }
    if (erroDiv) erroDiv.hidden = true;

    setPromoToggleState(false);

    const oldStyle = document.getElementById('sem-resultados-style');
    if (oldStyle) oldStyle.remove();

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
                buscarProdutosPorTermo(termo);
            } else {
                carregarProdutos();
            }
        });
    }

    const pathname = window.location.pathname;
    const isCategoriasPage = pathname.endsWith('categorias.html') || !!document.getElementById('sugestoes-produtos');

    if (pathname.endsWith('search.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const termo = urlParams.get('q') || '';
        buscarProdutosPorTermo(termo);
        // Listeners de paginação
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', function () {
                if (paginaAtual > 1) {
                    paginaAtual--;
                    renderizarPaginaBusca();
                }
            });
            nextBtn.addEventListener('click', function () {
                if (paginaAtual < totalPaginas) {
                    paginaAtual++;
                    renderizarPaginaBusca();
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
    } else if (isCategoriasPage) {
        // Se estivermos na página de categorias (ou existir #sugestoes-produtos), carrega produtos em destaque
        carregarProdutos();
    } else {
        carregarProdutos();
    }
});

// Exemplo de uso para search.html:
// buscarProdutosPorTermo('termo pesquisado pelo usuário');