fetch('./data/categorias.json')
    .then(response => response.json())
    .then(data => {
        const categoriasList = document.getElementById('categoriasList');
        categoriasList.innerHTML = '';
        data.categorias.forEach(cat => {
            const nomeLimpo = cat.nome.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
            const a = document.createElement('a');
            a.className = 'categoria';
            a.setAttribute('role', 'listitem');
            a.textContent = cat.nome.trim().toUpperCase();
            a.href = "#"; // previne navegação padrão
            a.addEventListener('click', function (e) {
                e.preventDefault();
                // Redireciona para search.html?q=<categoria>
                window.location.href = `search.html?q=${encodeURIComponent(cat.nome.trim())}`;
            });
            categoriasList.appendChild(a);
        });
        // Centralizar se poucas categorias
        if (data.categorias.length <= 5) {
            categoriasList.classList.add('few-categories');
        } else {
            categoriasList.classList.remove('few-categories');
        }
    })
    .catch(() => {
        const categoriasList = document.getElementById('categoriasList');
        categoriasList.innerHTML = '<span style="color:red;">Não foi possível carregar as categorias.</span>';
    });
