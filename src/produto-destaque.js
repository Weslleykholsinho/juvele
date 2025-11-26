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

function renderizarProdutos(produtos) {
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
                ${produto.desconto ? `<div class="desconto-badge">${produto.desconto}% OFF</div>` : ''}
            </div>
            <div class="produto-info">
                <h3 class="produto-nome">${produto.nome}</h3>
                <div class="produto-preco-wrapper">
                    ${produto.precoOriginal ? `<div class="produto-preco-original">R$ ${formatarPreco(produto.precoOriginal)}</div>` : ''}
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

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', carregarProdutos);