# JUVELE - Moda Feminina

Este projeto é um site de moda feminina com busca de produtos, categorias dinâmicas e vitrine de destaques.

## Estrutura de Pastas

- `/index.html` — Página principal do site.
- `/pages/` — Páginas secundárias (ex: busca).
- `/assets/` — Imagens, ícones e outros arquivos estáticos.
- `/src/` — Scripts JavaScript organizados por funcionalidade.
- `/src/utils/` — Funções utilitárias compartilhadas.
- `/data/` — Dados estáticos em formato JSON (produtos, categorias).
- `/styles/` — Arquivos CSS organizados por área.
- `/fav.ico` — Ícone do site.

## Principais Funcionalidades

- **Menu responsivo** com overlay para mobile ([`src/nav.js`](src/nav.js)).
- **Busca de produtos** instantânea e por página ([`pages/search-page/search-results.js`](pages/search-page/search-results.js)).
- **Vitrine de produtos em destaque** carregada dinamicamente ([`src/produto-destaque.js`](src/produto-destaque.js)).
- **Categorias dinâmicas** carregadas de [`data/categorias.json`](data/categorias.json).
- **Faixa promocional animada** ([`src/faixatop.js`](src/faixatop.js)).
- **Estilos modernos e responsivos** ([`styles/styles.css`](styles/styles.css), [`styles/produtos-destaques.css`](styles/produtos-destaques.css)).

## Como rodar

1. Clone o repositório.
2. Abra o arquivo `index.html` em seu navegador.
3. Para desenvolvimento local, recomenda-se usar um servidor HTTP simples (ex: [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code).

## Personalização

- Adicione produtos em [`data/produtos.json`](data/produtos.json).
- Adicione categorias em [`data/categorias.json`](data/categorias.json).
- Edite estilos em [`styles/`](styles/).

## Licença

Projeto aberto para fins educacionais.

---

Dúvidas ou sugestões? Abra uma issue!