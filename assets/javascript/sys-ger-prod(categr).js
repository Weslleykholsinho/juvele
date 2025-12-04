// Sistema exclusivo para categorias.html: exibe produtos agrupados por categoria

async function carregarCategoriasEProdutos() {
    try {
        // Carrega categorias
        const catRes = await fetch('./data/categorias.json');
        if (!catRes.ok) throw new Error('Erro ao carregar categorias');
        const categoriasData = await catRes.json();
        const categorias = categoriasData.categorias;

        // Carrega produtos
        const prodRes = await fetch('./data/produtos.json');
        if (!prodRes.ok) throw new Error('Erro ao carregar produtos');
        let produtos = await prodRes.json();
        produtos = shuffleArray(produtos);

        // Renderiza produtos por categoria
        renderizarProdutosPorCategoria(categorias, produtos);
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarErroCategorias();
    }
}

// Embaralha array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Renderiza produtos agrupados por categoria
function renderizarProdutosPorCategoria(categorias, produtos) {
    const container = document.getElementById('categorias-sections');
    if (!container) return;

    container.innerHTML = '';

    categorias.forEach(cat => {
        // Normaliza nome para comparação
        const nomeCat = cat.nome.trim().toLowerCase();

        // Filtra produtos da categoria
        const produtosCat = produtos.filter(p => {
            // Considera campo categoria ou categorias (array ou string)
            if (Array.isArray(p.categorias)) {
                return p.categorias.map(c => c.trim().toLowerCase()).includes(nomeCat);
            }
            if (typeof p.categoria === 'string') {
                return p.categoria.trim().toLowerCase() === nomeCat;
            }
            return false;
        });

        // Cria seção só se houver produtos
        if (produtosCat.length > 0) {
            const section = document.createElement('section');
            section.className = 'categoria-section';
            section.id = `categoria-${cat.id || nomeCat.replace(/\s+/g, '-')}`;

            section.innerHTML = `
                <h2>${cat.nome.trim()}</h2>
                ${cat.descricao ? `<p>${cat.descricao}</p>` : ''}
                <div class="produtos-categoria-list">
                    ${produtosCat.map(produto => renderizarProdutoCard(produto)).join('')}
                </div>
            `;
            container.appendChild(section);
        }
    });
}

// Renderiza um card de produto (HTML)
function renderizarProdutoCard(produto) {
    const precoNum = parseFloat(String(produto.preco).replace(',', '.'));
    const dataPrice = Number.isFinite(precoNum) ? precoNum : '';
    return `
        <article class="produto-card" data-price="${dataPrice}">
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
}

// Limita o tamanho do título
function limitarTitulo(titulo, limite = 30) {
    if (typeof titulo !== 'string') return '';
    return titulo.length > limite ? titulo.slice(0, limite - 1) + '…' : titulo;
}

// Formata preço
function formatarPreco(preco) {
    return parseFloat(preco).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Mostra erro genérico
function mostrarErroCategorias() {
    const container = document.getElementById('categorias-sections');
    if (container) {
        container.innerHTML = `<div class="erro-categorias">Erro ao carregar categorias ou produtos.</div>`;
    }
}

// Adiciona ao carrinho (placeholder)
function adicionarAoCarrinho(produtoId) {
    console.log('Produto adicionado:', produtoId);
    // Implemente a lógica do carrinho se necessário
}

// Inicializa ao carregar a página categorias.html
document.addEventListener('DOMContentLoaded', function () {
    carregarCategoriasEProdutos();
});