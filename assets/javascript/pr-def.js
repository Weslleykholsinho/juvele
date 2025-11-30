/* Início da definição dos valores das opções do Menu*/
(function () {
    // Aplica os textos do menu se os elementos existirem; retorna true se aplicou.
    function applyMenuLabels() {
        const op1 = document.getElementById('op1');
        const op2 = document.getElementById('op2');
        const op3 = document.getElementById('op3');
        const op4 = document.getElementById('op4');
        const op5 = document.getElementById('op5');

        // se pelo menos op1 não existir, não tenta aplicar (ainda)
        if (!op1 && !op2 && !op3 && !op4 && !op5) return false;

        try {
            if (op1) op1.innerText = "Início";
            if (op2) op2.innerText = "Produtos em Destaque";
            if (op3) op3.innerText = "Categorias";
            if (op4) op4.innerText = "Sobre Nós";
            if (op5) op5.innerText = "Contato";
            return true;
        } catch (e) {
            // falha ao aplicar, não lança para não quebrar outros scripts
            return false;
        }
    }

    // Expor para chamadas manuais (útil para debug)
    window.applyMenuLabels = applyMenuLabels;

    // Tentativa imediata se elementos já presentes
    if (applyMenuLabels()) return;

    // Listener para evento customizado quando o nav for injetado
    document.addEventListener('navInjected', () => {
        applyMenuLabels();
    });

    // Também tentar após DOMContentLoaded com pequenos retries para casos em que injection ocorre depois
    function tryWithRetries(maxRetries = 20, interval = 100) {
        let tries = 0;
        const id = setInterval(() => {
            tries += 1;
            if (applyMenuLabels() || tries >= maxRetries) {
                clearInterval(id);
            }
        }, interval);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!applyMenuLabels()) tryWithRetries();
        });
    } else {
        // já pronto, mas não aplicou: tenta com retries
        if (!applyMenuLabels()) tryWithRetries();
    }
})();