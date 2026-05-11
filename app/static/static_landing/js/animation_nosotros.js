if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// ============================================
// GSAP EFFECT: Counter animado
// ============================================

if (typeof gsap !== 'undefined') {
    gsap.registerEffect({
        name: 'counter',
        extendTimeline: true,
        defaults: {
            end: 0,
            duration: 1.2,
            ease: 'power2.out',
            increment: 1,
            suffix: ''
        },
        effect: (targets, config) => {
            const tl = gsap.timeline();
            targets[0].innerText = '0';
            tl.to(targets, {
                duration: config.duration,
                innerText: config.end,
                modifiers: {
                    innerText: (val) => {
                        return gsap.utils.snap(config.increment, val)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            + config.suffix;
                    }
                },
                ease: config.ease
            }, 0);
            return tl;
        }
    });
}


// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) {
        showInstantly();
        return;
    }



    initDescEntryAnimation();
    initImageParallax();
    initValoresCards();
    initMarcasSlides();


    function initBrochazoReveal() {
        if (typeof ScrollTrigger === 'undefined') return;

        const brochazo = document.querySelector('.brochazo-underline');
        if (!brochazo) return;

        gsap.to(brochazo, {
            opacity: 0.12,
            clipPath: 'inset(0 0% 0 0)',
            ease: 'power2.out',
            duration: 1.2,
            scrollTrigger: {
                trigger: '.marcas-header',
                start: 'top 75%',
                once: true
            }
        });
    }

    initBrochazoReveal();
});


// ============================================
// DESCRIPCIÓN — Animación de entrada al cargar
// ============================================

function initDescEntryAnimation() {
    const badge = document.querySelector('.nosotros-desc-texto .nosotros-badge');
    const titulo = document.querySelector('.nosotros-desc-texto h2');
    const parrafos = document.querySelectorAll('.nosotros-desc-texto .anim-texto-fade');
    const imagen = document.querySelector('.nosotros-desc-imagen');

    const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.2
    });

    if (badge) {
        tl.fromTo(badge,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5 }
        );
    }

    if (titulo) {
        gsap.set(titulo, { visibility: 'visible' });
        tl.fromTo(titulo,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7 },
            '-=0.2'
        );
    }

    parrafos.forEach((p) => {
        gsap.set(p, { visibility: 'visible' });
        tl.fromTo(p,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5 },
            '-=0.2'
        );
    });

    if (imagen) {
        tl.fromTo(imagen,
            { opacity: 0, x: 40 },
            { opacity: 1, x: 0, duration: 0.7 },
            '-=0.4'
        );
    }
}


// ============================================
// PARALLAX — Imagen descripción
// ============================================

function initImageParallax() {
    if (window.innerWidth <= 1024) return;

    const container = document.querySelector('.nosotros-desc-imagen');
    if (!container) return;

    const img = container.querySelector('img');
    const acento = container.querySelector('.imagen-acento');
    if (!img) return;

    gsap.set(container, { perspective: 600 });

    const imgRY = gsap.quickTo(img, 'rotationY', { ease: 'power3', duration: 0.5 });
    const imgRX = gsap.quickTo(img, 'rotationX', { ease: 'power3', duration: 0.5 });
    const imgX  = gsap.quickTo(img, 'x', { ease: 'power3', duration: 0.7 });
    const imgY  = gsap.quickTo(img, 'y', { ease: 'power3', duration: 0.7 });

    let acentoRY, acentoRX;
    if (acento) {
        acentoRY = gsap.quickTo(acento, 'rotationY', { ease: 'power3', duration: 0.8 });
        acentoRX = gsap.quickTo(acento, 'rotationX', { ease: 'power3', duration: 0.8 });
    }

    container.addEventListener('pointermove', (e) => {
        const rect = container.getBoundingClientRect();
        const rx = (e.clientX - rect.left) / rect.width;
        const ry = (e.clientY - rect.top) / rect.height;

        imgRY((rx - 0.5) * 12);
        imgRX((ry - 0.5) * -8);
        imgX((rx - 0.5) * 10);
        imgY((ry - 0.5) * 8);

        if (acento) {
            acentoRY((rx - 0.5) * 6);
            acentoRX((ry - 0.5) * -4);
        }
    });

    container.addEventListener('pointerleave', () => {
        imgRY(0); imgRX(0); imgX(0); imgY(0);
        if (acento) { acentoRY(0); acentoRX(0); }
    });
}


// ============================================
// VALORES CARDS — Entrada con ScrollTrigger
// ============================================

function initValoresCards() {
    if (typeof ScrollTrigger === 'undefined') return;

    const cards = gsap.utils.toArray('.valor-grid-card');
    if (!cards.length) return;

    gsap.fromTo(cards,
        { opacity: 0, y: 40 },
        {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.nosotros-valores-grid',
                start: 'top 85%',
                once: true
            }
        }
    );
}


// ============================================
// MARCAS — Pinned scroll sections
// ============================================

function initMarcasSlides() {
    if (typeof ScrollTrigger === 'undefined') return;

    var panels = gsap.utils.toArray('.marca-slide');
    if (!panels.length) return;

    var panelsToAnimate = panels.slice(0, -1);
    var isMobile = window.innerWidth <= 1024;

    panelsToAnimate.forEach(function(panel) {
        var innerPanel = panel.querySelector('.marca-slide-inner');
        if (!innerPanel) return;

        var panelHeight = panel.offsetHeight;
        var contentHeight = innerPanel.offsetHeight;
        var windowHeight = window.innerHeight;

        var difference = contentHeight - windowHeight;

        var fakeScrollRatio = difference > 0
            ? (difference / (difference + windowHeight))
            : 0;

        if (fakeScrollRatio) {
            panel.style.marginBottom = contentHeight * fakeScrollRatio + 'px';
        } else {
            // Sin fake scroll — limpiar cualquier margin residual
            panel.style.marginBottom = '0px';
        }

        var tl = gsap.timeline({
            scrollTrigger: {
                trigger: panel,
                start: 'bottom bottom',
                end: function() {
                    return fakeScrollRatio
                        ? '+=' + contentHeight
                        : 'bottom top';
                },
                pinSpacing: false,
                pin: true,
                scrub: true
            }
        });

        if (fakeScrollRatio) {
            tl.to(innerPanel, {
                yPercent: -100,
                y: window.innerHeight,
                duration: 1 / (1 - fakeScrollRatio) - 1,
                ease: 'none'
            });
        }

        var scaleTarget = isMobile ? 0.92 : 0.85;

        tl.fromTo(panel,
            { scale: 1, opacity: 1 },
            { scale: scaleTarget, opacity: 0.4, duration: 0.9, ease: 'power1.in' }
        );
        tl.to(panel, { opacity: 0, duration: 0.1 });
    });
}


// ============================================
// FALLBACK — Reduced motion
// ============================================

function showInstantly() {
    gsap.set([
        '.nosotros-desc-texto .nosotros-badge',
        '.nosotros-desc-imagen',
        '.valor-grid-card'
    ], { opacity: 1, clearProps: 'all' });

    document.querySelectorAll('.anim-titulo, .anim-texto-fade').forEach(function(el) {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
    });
}