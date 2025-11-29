 fetch('./data/categorias.json')
            .then(response => response.json())
            .then(data => {
                const categoriasList = document.getElementById('categoriasList');
                categoriasList.innerHTML = '';
                data.categorias.forEach(cat => {
                    const nomeLimpo = cat.nome.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
                    const href = `categoria-${nomeLimpo}.html`;
                    const a = document.createElement('a');
                    a.className = 'categoria';
                    a.setAttribute('role', 'listitem');
                    a.href = href;
                    a.textContent = cat.nome.trim().toUpperCase();
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
