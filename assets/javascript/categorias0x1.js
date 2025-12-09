fetch('./data/categorias.json')
    .then(response => response.json())
    .then(data => {
        const categoriasList = document.getElementById('categoriasList');
        categoriasList.innerHTML = '';
        // Limita a 6 categorias
        const maxCategorias = 6;
        const categoriasExibir = data.categorias.slice(0, maxCategorias);
        categoriasExibir.forEach(cat => {
            const nomeLimpo = cat.nome.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
            const a = document.createElement('a');
            a.className = 'categoria';
            a.setAttribute('role', 'listitem');
            a.textContent = cat.nome.trim().toUpperCase();
            a.href = "#"; // previne navegação padrão
            a.addEventListener('click', function (e) {
                e.preventDefault();
                // Redireciona para search.html?q=<categoria>&categoria=1
                window.location.href = `search.html?q=${encodeURIComponent(cat.nome.trim())}&categoria=1`;
            });
            categoriasList.appendChild(a);
        });
        // Adiciona botão "Ver mais" se houver mais categorias
        if (data.categorias.length > maxCategorias) {
            const verMaisBtn = document.createElement('a');
            verMaisBtn.className = 'categoria ver-mais-btn';
            verMaisBtn.setAttribute('role', 'button');
            verMaisBtn.textContent = 'Ver mais >';
            verMaisBtn.href = 'categorias.html';
            verMaisBtn.style.marginLeft = '0';
            verMaisBtn.style.padding = '6px 18px';
            verMaisBtn.style.borderRadius = '20px';
            verMaisBtn.style.color = '#1976d2';
            verMaisBtn.style.background = 'transparent';
            verMaisBtn.style.border = '1px solid #1976d2';
            verMaisBtn.style.fontWeight = '500';
            verMaisBtn.style.fontSize = '15px';
            verMaisBtn.style.textDecoration = 'none';
            verMaisBtn.style.transition = 'background 0.2s, color 0.2s';
            verMaisBtn.addEventListener('mouseover', function () {
                verMaisBtn.style.background = '#1976d2';
                verMaisBtn.style.color = '#fff';
            });
            verMaisBtn.addEventListener('mouseout', function () {
                verMaisBtn.style.background = 'transparent';
                verMaisBtn.style.color = '#1976d2';
            });
            categoriasList.appendChild(verMaisBtn);
        }
        // Centralizar se poucas categorias
        if (categoriasExibir.length <= 5) {
            categoriasList.classList.add('few-categories');
        } else {
            categoriasList.classList.remove('few-categories');
        }
    })
    .catch(() => {
        const categoriasList = document.getElementById('categoriasList');
        categoriasList.innerHTML = '<span style="color:red;">Não foi possível carregar as categorias.</span>';
    });
