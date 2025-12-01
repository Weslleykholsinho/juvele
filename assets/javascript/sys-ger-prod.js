async function carregarProdutos() {
    try {
        const response = await fetch('./data/produtos.json');
        if (!response.ok) throw new Error('Erro ao carregar produtos');

        let produtos = await response.json();
        // Garante compatibilidade com diferentes capitalizações e tipos do campo destaque
        const produtosDestaque = produtos.filter(p => {
            const destaque = p.Destaque ?? p.destaque;
            return destaque === true || destaque === "true";
        });
        // Embaralha os produtos em destaque
        shuffleArray(produtosDestaque);
        paginaAtual = 1;
        renderizarProdutosPaginados(produtosDestaque);
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

// Função para normalizar palavras (remove acentos, minúsculo, trata plural/singular simples)
function normalizarPalavra(palavra) {
    return palavra
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
        .toLowerCase()
        .replace(/(oes|aes|aos|is|ns|s)$/i, ''); // remove plurais comuns
}

// Nova função para buscar produtos por termo (singular/plural e ordem flexível)
async function buscarProdutosPorTermo(termo) {
    try {
        const response = await fetch('./data/produtos.json');
        if (!response.ok) throw new Error('Erro ao carregar produtos');

        let produtos = await response.json();
        // Divide termo em palavras e normaliza
        const palavrasBusca = termo.trim().split(/\s+/).map(normalizarPalavra);

        const resultados = produtos.filter(produto => {
            // Normaliza apenas o nome/título do produto
            const nomeProduto = (produto.nome || '')
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

            // Para cada palavra da busca, verifica se está presente no nome do produto
            return palavrasBusca.every(palavra => {
                return nomeProduto.includes(palavra) || nomeProduto.includes(palavra + 's');
            });
        });

        // Embaralha os resultados da busca
        shuffleArray(resultados);
        paginaAtual = 1;
        renderizarProdutosPaginados(resultados, true);
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarErro();
    }
}

// PAGINAÇÃO
const PRODUTOS_POR_PAGINA = 6;
let produtosAtuais = [];
let paginaAtual = 1;
let totalPaginas = 1;
let paginacaoAtiva = false;

function atualizarPaginacao() {
    if (!paginacaoAtiva) return;
    const pagInfo = document.getElementById('paginationInfo');
    const btnPrev = document.getElementById('prevPage');
    const btnNext = document.getElementById('nextPage');
    pagInfo.textContent = `${paginaAtual} de ${totalPaginas}`;
    btnPrev.disabled = paginaAtual <= 1;
    btnNext.disabled = paginaAtual >= totalPaginas;
}

function renderizarProdutosPaginados(produtos, isBusca = false) {
    if (!paginacaoAtiva) {
        renderizarProdutos(produtos, isBusca);
        return;
    }
    produtosAtuais = produtos || [];
    totalPaginas = Math.max(1, Math.ceil(produtosAtuais.length / PRODUTOS_POR_PAGINA));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    const inicio = (paginaAtual - 1) * PRODUTOS_POR_PAGINA;
    const fim = inicio + PRODUTOS_POR_PAGINA;
    const produtosPagina = produtosAtuais.slice(inicio, fim);

    renderizarProdutos(produtosPagina, isBusca);
    atualizarPaginacao();
}

function handlePaginationEvents() {
    if (!paginacaoAtiva) return;
    const btnPrev = document.getElementById('prevPage');
    const btnNext = document.getElementById('nextPage');
    if (!btnPrev || !btnNext) return;

    btnPrev.onclick = () => {
        if (paginaAtual > 1) {
            paginaAtual--;
            renderizarProdutosPaginados(produtosAtuais);
        }
    };
    btnNext.onclick = () => {
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            renderizarProdutosPaginados(produtosAtuais);
        }
    };
}

function renderizarProdutos(produtos, isBusca = false) {
    const container = document.getElementById('produtosContainer');
    const erroDiv = document.getElementById('produtosErro');

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
    const noResultsEl = document.getElementById('noResults');
    if (noResultsEl) noResultsEl.hidden = true;
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
                <h3 class="produto-nome">${produto.nome}</h3>
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

// Detecta a página e executa a função correta ao carregar
document.addEventListener('DOMContentLoaded', function () {
    const pathname = window.location.pathname;
    paginacaoAtiva = pathname.endsWith('search.html');
    handlePaginationEvents();
    if (paginacaoAtiva) {
        const urlParams = new URLSearchParams(window.location.search);
        const termo = urlParams.get('q') || '';
        buscarProdutosPorTermo(termo);
    } else {
        carregarProdutos();
    }
});

// Exemplo de uso para search.html:
// buscarProdutosPorTermo('termo pesquisado pelo usuário');