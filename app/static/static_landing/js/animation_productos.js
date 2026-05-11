(function () {
    'use strict';

    const CONFIG = {
        rootMargin: '0px 0px 100px 0px',   
        threshold: 0.08,
        staggerDelay: 70,                  
        batchSize: 10,                      
    };

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }


    function initImageFadeIn(card) {
        const imgArea = card.querySelector('.img-area');
        const img = imgArea?.querySelector('img');
        if (!img || !imgArea) return;

        if (img.complete && img.naturalWidth > 0) {
            imgArea.classList.add('img--loaded');
            return;
        }

        img.addEventListener('load', () => {
            imgArea.classList.add('img--loaded');
        }, { once: true });

        img.addEventListener('error', () => {
            imgArea.classList.add('img--loaded');
        }, { once: true });
    }


    let observer = null;

    function initRevealObserver() {
        // Seleccionar TODAS las .card-f de ambos grids
        const cards = document.querySelectorAll('.card-f');
        if (!cards.length) return;

        let pendingBatch = [];
        let batchScheduled = false;

        function processBatch() {
            const batch = pendingBatch.splice(0, CONFIG.batchSize);

            batch.forEach((card, index) => {
                card.style.animationDelay = `${index * CONFIG.staggerDelay}ms`;
                card.classList.add('card--visible');
                initImageFadeIn(card);
            });

            if (pendingBatch.length > 0) {
                requestAnimationFrame(processBatch);
            } else {
                batchScheduled = false;
            }
        }

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    pendingBatch.push(entry.target);
                    observer.unobserve(entry.target);
                }
            });

            if (pendingBatch.length > 0 && !batchScheduled) {
                batchScheduled = true;
                requestAnimationFrame(processBatch);
            }
        }, {
            rootMargin: CONFIG.rootMargin,
            threshold: CONFIG.threshold,
        });

        cards.forEach(card => observer.observe(card));
    }



    function reObserveVisibleCards() {
        if (!observer) return;

        document.querySelectorAll('.card-f').forEach(card => {
            if (card.style.display !== 'none' && !card.classList.contains('card--visible')) {
                observer.observe(card);
            }
        });
    }

    function resetAllCards() {
        if (!observer) return;

        document.querySelectorAll('.card-f').forEach(card => {
            card.classList.remove('card--visible');
            card.style.animationDelay = '';
            observer.observe(card);
        });
    }



    function patchFiltrar() {
        const originalFiltrar = window.filtrar;
        if (typeof originalFiltrar !== 'function') return;

        window.filtrar = function () {
            document.querySelectorAll('.card-f').forEach(card => {
                card.classList.remove('card--visible');
                card.style.animationDelay = '';
            });

            originalFiltrar.apply(this, arguments);

            // Después del timeout interno de filtrar() (200ms)
            setTimeout(reObserveVisibleCards, 250);
        };
    }

    function patchResetear() {
        const originalResetear = window.resetearFiltros;
        if (typeof originalResetear !== 'function') return;

        window.resetearFiltros = function () {
            originalResetear.apply(this, arguments);
            // Pequeño delay para que el DOM se actualice
            requestAnimationFrame(() => resetAllCards());
        };
    }



    function init() {
        initRevealObserver();
        // Parchear después de que productos.js defina las funciones globales
        setTimeout(() => {
            patchFiltrar();
            patchResetear();
        }, 0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();