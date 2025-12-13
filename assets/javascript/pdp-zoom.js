(function () {
    const zoomBtn = document.querySelector('.pdp-zoom');
    const mainImg = document.getElementById('pdpMainImage');
    if (!zoomBtn || !mainImg) return;

    zoomBtn.addEventListener('click', openZoom);

    function openZoom() {
        const src = mainImg.getAttribute('data-large') || mainImg.src;
        const overlay = document.createElement('div');
        overlay.className = 'pdp-zoom-overlay';
        overlay.tabIndex = 0;
        overlay.innerHTML = `
			<div class="pdp-zoom-inner">
				<img src="./assets/images/dev/cp000x02.png" class="pdp-zoom-img" alt="zoom">
				<button class="pdp-zoom-close" aria-label="Fechar">&times;</button>
			</div>`;
        document.body.appendChild(overlay);

        const zimg = overlay.querySelector('.pdp-zoom-img');
        const closeBtn = overlay.querySelector('.pdp-zoom-close');
        let scale = 1;
        const MIN = 1, MAX = 4;

        function setScale(s) {
            scale = Math.max(MIN, Math.min(MAX, s));
            zimg.style.transform = `scale(${scale})`;
            if (scale > 1) zimg.classList.add('zoomed'); else zimg.classList.remove('zoomed');
        }

        function updateOrigin(clientX, clientY) {
            const rect = zimg.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width) * 100;
            const y = ((clientY - rect.top) / rect.height) * 100;
            zimg.style.transformOrigin = `${x}% ${y}%`;
        }

        overlay.addEventListener('wheel', function (e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale(scale + delta);
            updateOrigin(e.clientX, e.clientY);
        }, { passive: false });

        overlay.addEventListener('mousemove', function (e) {
            if (scale <= 1) return;
            updateOrigin(e.clientX, e.clientY);
        });

        // close when clicking outside inner or on close button
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target === closeBtn) {
                overlay.remove();
            }
        });

        closeBtn.addEventListener('click', function () { overlay.remove(); });
        overlay.addEventListener('keydown', function (e) { if (e.key === 'Escape') overlay.remove(); });
    }

})();
