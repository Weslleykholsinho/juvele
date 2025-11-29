document.addEventListener('DOMContentLoaded', () => {
    // Inject nav-related CSS (moved from styles.css)
    (function injectNavStyles() {
        const css = `
            /* variável para controlar altura da nav */
            :root { --nav-height: 70px; }

            /* mantém fluxo ao fixar a nav */
            body { padding-top: var(--nav-height); }

            /* tornar a nav fixa */
            nav {
                padding: 10px 30px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #FF5C8A;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: var(--nav-height);
                z-index: 1000;
                box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
                backdrop-filter: saturate(120%) blur(4px);
            }

            .logo {
                color: #fff;
                font-size: 24px;
            }

            nav .logo h1 {
                font-family: 'Bebas Neue', cursive;
                font-weight: 400;
                margin: 0;
            }

            nav ul {
                display: flex;
                gap: 30px;
                align-items: center;
            }

            nav ul li { list-style-type: none; }

            nav ul li a {
                text-decoration: none;
                color: #ffffff;
                cursor: pointer;
            }

            nav ul li a:hover {
                color: #94d1f4;
                transition: color 0.3s ease;
                text-decoration: underline;
            }

            .menu-icon {
                display: none;
                width: 44px;
                height: 44px;
                transition: transform 0.3s ease;
                transform-origin: center center;
                z-index: 1100;
            }

            .menu-icon i {
                color: #fff;
                font-size: 30px;
                cursor: pointer;
            }

            .search-icon {
                margin-right: 20px;
                cursor: pointer;
            }

            .search-icon i {
                color: #fff;
                font-size: 28px;
            }

            /* Search UI ajustado para respeitar a altura fixa */
            .search-bar {
                position: fixed;
                top: var(--nav-height);
                width: 100%;
                display: flex;
                gap: 8px;
                align-items: center;
                padding: 10px;
                background: #fff;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                z-index: 99;
                transform-origin: top right;
                transform: scaleY(0);
                opacity: 0;
                pointer-events: none;
                transition: transform .16s ease, opacity .16s ease;
            }

            .search-bar.open {
                transform: scaleY(1);
                opacity: 1;
                pointer-events: auto;
            }

            .search-bar input[type="search"] {
                flex: 1;
                border: 0;
                outline: none;
                font-size: 14px;
                padding: 8px;
                background: transparent;
                color: #222;
            }

            .search-bar button {
                border: #FF5C8A 1px solid;
                background: #ffffff;
                color: #FF5C8A;
                padding: 8px 10px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 300;
            }

            .search-results {
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                right: 0;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
                max-height: 280px;
                overflow: auto;
                z-index: 7;
                display: none;
            }

            .search-results.open { display: block; }

            .search-item {
                padding: 10px 12px;
                border-bottom: 1px solid #f2f2f2;
                cursor: pointer;
                font-size: 14px;
                color: #222;
            }

            .search-item:last-child { border-bottom: 0; }

            .search-item:hover,
            .search-item:focus {
                background: #faf7fb;
                outline: none;
            }

            /* mobile adjustments */
            @media (max-width:700px) {
                nav ul {
                    position: absolute;
                    top: var(--nav-height);
                    left: 0;
                    right: 0;
                    flex-direction: column;
                    text-align: center;
                    background: #FF5C8A;
                    gap: 0;
                    overflow: hidden;
                    z-index: 100;
                }

                nav ul li { padding: 20px; padding-top: 10px; }

                nav ul li a { color: #ffffff; }

                .menu-icon {
                    display: flex;
                    position: absolute;
                    right: 19px;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 1100;
                    transition: transform 0.3s ease;
                    width: 44px;
                    height: 44px;
                    align-items: center;
                    justify-content: center;
                    transform-origin: center center;
                }

                .search-icon {
                    display: block;
                    position: absolute;
                    right: calc(19px + 44px + 12px);
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 1100;
                    margin: 0;
                    cursor: pointer;
                }

                #menuList { transition: all 0.5s; }

                nav ul {
                    max-height: 0;
                    transition: max-height 0.35s ease, padding 0.35s ease;
                    pointer-events: none;
                }

                nav ul.open {
                    max-height: 600px;
                    pointer-events: auto;
                }

                nav ul li {
                    opacity: 0;
                    transform: translateX(-30px);
                    transition: opacity 0.25s ease, transform 0.25s ease;
                }

                nav ul.open li {
                    opacity: 1;
                    transform: translateY(0);
                }

                .search-bar { width: 100%; }
            }

            /* Overlay escurecido para menu mobile */
            .menu-overlay {
                display: none;
                position: fixed;
                top: var(--nav-height);
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.38);
                z-index: 99;
                transition: opacity 0.25s;
                opacity: 0;
                pointer-events: none;
            }

            /* Só mostra em mobile quando menu está aberto */
            @media (max-width:700px) {
                .menu-overlay.menu-open {
                    display: block;
                    opacity: 1;
                    pointer-events: auto;
                }
            }
        `;
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-injected-by', 'nav(globalcode).js');
        styleEl.appendChild(document.createTextNode(css));
        document.head.appendChild(styleEl);
    })();

    // Não reinjetar se já existir <nav> dentro do header
    let header = document.querySelector('header');
    if (!header) {
        header = document.createElement('header');
        document.body.insertBefore(header, document.body.firstChild);
    }
    if (header.querySelector('nav')) return;

    // Markup da nav (copiado do index.html)
    const navHtml = `
		<nav>
			<div class="logo">
				<h1>JUVELE</h1>
			</div>
			<ul id="menuList">
				<li><a href="./index.html" id="op1"></a></li>
				<li><a href="./index.html#ProdutosDestaque" id="op2"></a></li>
				<li><a href="" id="op3"></a></li>
				<li><a href="" id="op4"></a></li>
				<li><a href="" id="op5"></a></li>
			</ul>
			<div class="search-icon">
				<i class="fa-solid fa-search"></i>
			</div>
			<div class="menu-icon">
				<i class="fa-solid fa-bars" onclick="toggleMenu()"></i>
			</div>
		</nav>
		<!-- Overlay para escurecimento em mobile -->
		<div id="menuOverlay" class="menu-overlay"></div>
	`;

    // Inserir no header
    header.insertAdjacentHTML('afterbegin', navHtml);

    // Notifica outros scripts (pr-def.js) que o nav foi injetado
    document.dispatchEvent(new Event('navInjected'));
});
