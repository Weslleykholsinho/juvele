document.addEventListener('DOMContentLoaded', () => {
    // Menu elements
    const menuIcon = document.querySelector('.menu-icon');
    const menuList = document.getElementById('menuList') || document.querySelector('nav ul');
    // Adiciona referência ao overlay
    const menuOverlay = document.getElementById('menuOverlay');

    // Search elements
    const searchIcon = document.querySelector('.search-icon');
    const form = document.getElementById('siteSearch');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    // Restaurar referência ao botão submit
    const submit = document.getElementById('searchSubmit');

    // Products (loaded from produtos.json)
    let products = [];
    let productsLoaded = false;
    let menuJustOpened = false; // NOVO: flag para ignorar scroll logo após abrir menu

    async function loadProducts() {
        try {
            // ajuste o caminho se necessário
            const resp = await fetch('data/produtos.json', { cache: 'no-store' });
            if (!resp.ok) throw new Error('fetch error ' + resp.status);
            const data = await resp.json();
            // aceita array raiz ou { products: [...] }
            products = Array.isArray(data) ? data : (data.products || []);
        } catch (err) {
            console.error('Erro ao carregar produtos.json:', err);
            products = [];
        } finally {
            productsLoaded = true;
        }
    }

    // Safety checks
    if (!menuIcon || !menuList) {
        // still wire up search if menu missing
        loadProducts();
        initSearch();
        return;
    }

    const iconElement = menuIcon.querySelector('i');

    function setIconOpen(open) {
        if (iconElement) {
            iconElement.classList.toggle('fa-times', open);
            iconElement.classList.toggle('fa-bars', !open);
        } else {
            menuIcon.textContent = open ? '✕' : '≡';
        }
    }

    menuIcon.addEventListener('click', () => {
        const isOpen = menuList.classList.toggle('open');
        setIconOpen(isOpen);

        // Mostra ou esconde overlay em mobile
        if (menuOverlay) {
            if (isOpen && window.innerWidth <= 700) {
                // Sempre mostra overlay quando menu é aberto, mesmo se foi fechado antes
                menuOverlay.classList.add('menu-open');
                menuOverlay.style.display = 'block';
            } else {
                menuOverlay.classList.remove('menu-open');
                menuOverlay.style.display = 'none';
            }
        }

        if (isOpen) {
            // close search if open
            if (form) {
                form.classList.remove('open');
            }
            if (results) {
                results.classList.remove('open');
                results.setAttribute('aria-hidden', 'true');
            }
            menuJustOpened = true; // Sinaliza que menu foi aberto manualmente
            setTimeout(() => { menuJustOpened = false; }, 500); // Reseta após 500ms
        }
    });

    // Fecha menu ao clicar em um link
    menuList.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'a') {
            menuList.classList.remove('open');
            setIconOpen(false);
            // Esconde overlay
            if (menuOverlay) menuOverlay.classList.remove('menu-open');
        }
    });

    // Fecha menu ao clicar no overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            menuList.classList.remove('open');
            setIconOpen(false);
            menuOverlay.classList.remove('menu-open');
        });
    }

    // Initialize search handlers (also used if menu elements missing)
    function initSearch() {
        if (!form || !input || !results || !searchIcon) return;

        // start loading products once
        loadProducts();

        searchIcon.addEventListener('click', () => {
            const opened = form.classList.toggle('open');

            // when opening search, ensure menu is closed
            if (opened && menuList) {
                if (menuList.classList.contains('open')) {
                    menuList.classList.remove('open');
                    setIconOpen(false);
                }
            }

            // hide results when closing search
            if (!opened) {
                results.classList.remove('open');
                results.setAttribute('aria-hidden', 'true');
                input.blur(); // NOVO: força perder foco ao fechar, fecha teclado virtual
            } else {
                results.setAttribute('aria-hidden', 'false');
                input.focus();
            }
        });

        // Restaurar evento do botão submit
        if (submit) {
            submit.addEventListener('click', (e) => {
                const q = (input.value || '').trim();
                if (!q) return;
                window.location.href = `./search.html?q=${encodeURIComponent(q)}`;
            });
        }

        input.addEventListener('input', debounce(() => performProductSearch(input.value), 220));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                form.classList.remove('open');
                results.classList.remove('open');
                input.blur(); // NOVO: força perder foco ao fechar, fecha teclado virtual
                if (menuList) {
                    menuList.classList.remove('open');
                    setIconOpen(false);
                    if (menuOverlay) menuOverlay.classList.remove('menu-open');
                }
            }
        });

        // Adiciona botão de fechar na barra de pesquisa
        let closeBtn = form.querySelector('.search-close-btn');
        if (!closeBtn) {
            closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'search-close-btn';
            closeBtn.innerHTML = '✕';
            closeBtn.title = 'Fechar pesquisa';
            // Insere o botão no início ou onde preferir
            form.appendChild(closeBtn);
        }
        closeBtn.addEventListener('click', () => {
            form.classList.remove('open');
            results.classList.remove('open');
            results.setAttribute('aria-hidden', 'true');
            input.blur();
        });
    }

    // call to wire search handlers
    initSearch();

    // fechar menu / search ao rolar a página

    /* ---------- product-only search implementation (substituir por este) ---------- */
    // Função para normalizar para singular (simples, para português)
    function toSingular(word) {
        // Remove 's' ou 'es' finais, se houver, exceto palavras curtas
        if (word.length > 3) {
            if (word.endsWith('es')) return word.slice(0, -2);
            if (word.endsWith('s')) return word.slice(0, -1);
        }
        return word;
    }

    function normalizeText(s) {
        return (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    function normalizeName(p) {
        // retorna o nome original e a versão normalizada (sem acentos, minúscula)
        const raw = (p.name || p.nome || p.title || p.titulo || '').toString();
        return { raw, norm: normalizeText(raw) };
    }

    function getProductLink(p) {
        // tenta vários campos comuns; ajuste conforme seu JSON
        if (p.url) return p.url;
        if (p.link) return p.link;
        if (p.href) return p.href;
        if (p.slug) return `/produto/${p.slug}`;
        return null;
    }

    function performProductSearch(query) {
        results.innerHTML = '';

        if (!query || !query.trim()) {
            results.classList.remove('open');
            return;
        }

        const qRaw = query.trim();
        const qNorm = normalizeText(qRaw);

        // Dividir a pesquisa em termos, normalizar e singularizar
        const searchTerms = qNorm.split(/\s+/).filter(Boolean).map(toSingular);

        if (!productsLoaded) {
            results.innerHTML = '<div class="search-item">Carregando produtos...</div>';
            results.classList.add('open');
            return;
        }

        if (!products || products.length === 0) {
            results.innerHTML = '<div class="search-item">Nenhum produto disponível</div>';
            results.classList.add('open');
            return;
        }

        // Busca: todos os termos devem estar presentes em qualquer ordem, considerando singular/plural
        const foundMap = new Map();

        products.forEach((p, idx) => {
            const { raw, norm } = normalizeName(p);
            if (!norm) return;

            // Dividir nome do produto em palavras, normalizar e singularizar
            const productWords = norm.split(/\s+/).filter(Boolean).map(toSingular);

            // Verifica se todos os termos da pesquisa estão presentes nas palavras do produto
            let allTermsFound = true;
            let bestScore = 0;
            searchTerms.forEach((term) => {
                // Busca o termo em qualquer palavra do produto
                const wordMatchIndex = productWords.findIndex(w => w.includes(term));
                if (wordMatchIndex === -1) {
                    allTermsFound = false;
                } else {
                    // Score: soma do índice da palavra encontrada (menor é melhor)
                    bestScore += wordMatchIndex;
                }
            });

            if (allTermsFound) {
                // Score: menor soma de índices é melhor, desempate pelo idx
                foundMap.set(p, { p, rawName: raw, score: bestScore * 100 + idx });
            }
        });

        if (foundMap.size === 0) {
            results.innerHTML = '<div class="search-item">Nenhum resultado</div>';
            results.classList.add('open');
            return;
        }

        // transformar em array, ordenar por score e limitar a 10
        const matches = Array.from(foundMap.values())
            .sort((a, b) => a.score - b.score)
            .slice(0, 10);

        // construir itens de resultado
        matches.forEach(m => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.tabIndex = 0;
            div.innerHTML = highlight(m.rawName, qRaw);
            const link = getProductLink(m.p);
            // Altera: ao clicar, redireciona para search.html com o termo da sugestão
            div.addEventListener('click', () => {
                window.location.href = `./search.html?q=${encodeURIComponent(m.rawName)}`;
            });
            results.appendChild(div);
        });

        results.classList.add('open');
    }

    function highlight(text, qRaw) {
        if (!text) return '';
        // destacar todas as ocorrências dos termos da pesquisa
        let result = escapeHtml(text);
        const terms = qRaw.split(/\s+/).filter(Boolean);
        terms.forEach(term => {
            if (!term) return;
            // Regex para destacar ignorando acentos/maiúsculas
            const normTerm = normalizeText(term);
            result = result.replace(new RegExp(`(${term})`, 'gi'), '<mark>$1</mark>');
            // Se não encontrar, tenta destacar versão sem acento
            if (!result.includes('<mark>')) {
                result = result.replace(new RegExp(normTerm, 'gi'), '<mark>$&</mark>');
            }
        });
        return result;
    }

    function escapeHtml(s) {
        return (s || '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function debounce(fn, ms) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (menuList.classList.contains('open') && !menuList.contains(e.target) && !menuIcon.contains(e.target)) {
            menuList.classList.remove('open');
            setIconOpen(false);
            if (menuOverlay) {
                menuOverlay.classList.remove('menu-open');
                menuOverlay.style.display = 'none';
            }
        }
    });

    // Close menu when scrolling
    window.addEventListener('scroll', () => {
        if (menuJustOpened) {
            menuJustOpened = false;
            return;
        }
        if (menuList.classList.contains('open')) {
            menuList.classList.remove('open');
            setIconOpen(false);
            if (menuOverlay) {
                menuOverlay.classList.remove('menu-open');
                menuOverlay.style.display = 'none';
            }
        }
    });
});