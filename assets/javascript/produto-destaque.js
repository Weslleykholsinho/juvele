async function carregarProdutos() {
    try {
        const response = await fetch('./data/produtos.json');
        if (!response.ok) throw new Error('Erro ao carregar produtos');

        const produtos = await response.json();
        renderizarProdutos(produtos);
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarErro();
    }
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

        const produtos = await response.json();
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

        renderizarProdutos(resultados, true); // true indica que é resultado de busca
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarErro();
    }
}

function renderizarProdutos(produtos, isBusca = false) {
    const container = document.getElementById('produtosContainer');
    const erroDiv = document.getElementById('produtosErro');

    if (!produtos || produtos.length === 0) {
        mostrarErro();
        return;
    }

    container.innerHTML = produtos.map(produto => `
        <article class="produto-card" role="listitem">
            <div class="produto-imagem-wrapper">
                <img src="${produto.imagem}" alt="${produto.nome}" class="produto-imagem" loading="lazy" />
                ${!isBusca && produto.desconto ? `<div class="desconto-badge">${produto.desconto}% OFF</div>` : ''}
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
    `).join('');

    erroDiv.hidden = true;
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
    container.innerHTML = '';
    erroDiv.hidden = false;
}

function adicionarAoCarrinho(produtoId) {
    console.log('Produto adicionado:', produtoId);
    // Implementar lógica do carrinho aqui
}

// Detecta a página e executa a função correta ao carregar
document.addEventListener('DOMContentLoaded', function () {
    const pathname = window.location.pathname;
    if (pathname.endsWith('search.html')) {
        // Pegue o termo de busca do input ou da URL
        const urlParams = new URLSearchParams(window.location.search);
        const termo = urlParams.get('q') || ''; // Exemplo: ?q=camisa
        buscarProdutosPorTermo(termo);
    } else {
        carregarProdutos();
    }
});

// Exemplo de uso para search.html:
// buscarProdutosPorTermo('termo pesquisado pelo usuário');