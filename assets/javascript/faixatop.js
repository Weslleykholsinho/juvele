(function () {
    const items = document.querySelectorAll('.faixatop .faixa-item');
    if (!items.length) return;
    let i = 0;
    const delay = 3500; // ms
    if (items.length === 1) return;
    setInterval(() => {
        items[i].classList.remove('active');
        i = (i + 1) % items.length;
        items[i].classList.add('active');
    }, delay);
})();