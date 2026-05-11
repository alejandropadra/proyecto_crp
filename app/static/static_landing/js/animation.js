
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function isMobileView() { return window.innerWidth <= 1024; }
function isDesktopView() { return window.innerWidth > 1024; }

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
// INICIALIZACIÓN PRINCIPAL
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loading-lock');
    initProductosSwiper();
    function unlockScroll() {
        document.body.classList.remove('loading-lock');
        window.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);

    const elements = {
        heroSection:     document.querySelector('.hero-section'),
        heroTitulo:      document.querySelector('.hero-titulo'),
        posicionamiento: document.querySelector('.posicionamiento'),
        heroSubtitulo:   document.querySelector('.hero-subtitulo'),
        heroCtas:        document.querySelector('.hero-ctas'),
        heroImagen:      document.querySelector('.hero-image') || document.querySelector('.hero-imagen img')
    };

    if (!elements.heroSection) return;
    if (!elements.heroTitulo || !elements.heroSubtitulo || !elements.heroCtas) return;
    if (typeof gsap === 'undefined') return;

    if (prefersReducedMotion) {
        showContentInstantly(elements);
        return;
    }

    playEntryAnimation(elements);


    function initStatsCounter() {
        if (typeof ScrollTrigger === 'undefined') return;

        const statsContainer = document.querySelector('.post-hero-stats');
        if (!statsContainer) return;

        const stats = statsContainer.querySelectorAll('.stat-numero');
        if (!stats.length) return;


        const counterTl = gsap.timeline({
            scrollTrigger: {
                trigger: statsContainer,
                start: 'top 80%',
                once: true
            }
        });

        stats.forEach((stat, i) => {
            const end = parseFloat(stat.dataset.end) || 0;
            const suffix = stat.dataset.suffix || '';
            const increment = parseFloat(stat.dataset.increment) || 1;

            // Fade in del stat-item padre
            counterTl.from(stat.closest('.stat-item'), {
                opacity: 0,
                y: 20,
                duration: 0.4,
                ease: 'power2.out'
            }, i * 0.15);

            // Counter
            counterTl.counter(stat, {
                end: end,
                suffix: suffix,
                increment: increment,
                duration: 1 + (i * 0.2),
                ease: 'power2.out'
            }, '<');
        });
    }

    initStatsCounter();


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

    function initProductosSwiper() {
        const swiperEl = document.querySelector('.productos-swiper');
        if (!swiperEl || typeof Swiper === 'undefined') return;

        const swiper = new Swiper('.productos-swiper', {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: true,
            speed: 600,
            grabCursor: true,

            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },

            pagination: {
                el: '.productos-swiper .swiper-pagination',
                clickable: true
            },

            navigation: {
                nextEl: '.productos-swiper .swiper-button-next',
                prevEl: '.productos-swiper .swiper-button-prev'
            },

            breakpoints: {
                480: { slidesPerView: 2, spaceBetween: 12 },
                1024: { slidesPerView: 3, spaceBetween: 20 },
                1536: { slidesPerView: 3, spaceBetween: 24 }
            }
        });

        swiper.autoplay.stop();

        const contenidoNuevo = document.querySelector('.hero-content-nuevo');
        if (!contenidoNuevo) return;

        let autoplayTimer = null;
        let swiperRunning = false;

        const observer = new MutationObserver(() => {
            const isActive = contenidoNuevo.classList.contains('is-active');

            if (isActive && !swiperRunning) {
                autoplayTimer = setTimeout(() => {
                    swiper.autoplay.start();
                    swiperRunning = true;
                }, 800);
            } else if (!isActive && swiperRunning) {
                clearTimeout(autoplayTimer);
                swiper.autoplay.stop();
                swiperRunning = false;
            }
        });

        observer.observe(contenidoNuevo, {
            attributes: true,
            attributeFilter: ['class']
        });
    }



    // ============================================
    // PARALLAX — Imagen post-hero
    // ============================================

    function initImageParallax() {
        if (isMobileView()) return;

        const container = document.querySelector('.post-hero-imagen');
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

    initImageParallax();


    // ============================================
    // ANIMACIÓN DE ENTRADA (on load)
    // ============================================

    function playEntryAnimation(els) {
        const mobile = isMobileView();
        const duration = mobile ? 0.4 : 0.7;

        const tl = gsap.timeline({
            defaults: {
                ease: 'power3.out',
                force3D: !mobile
            }
        });

        if (els.posicionamiento) {
            tl.fromTo(els.posicionamiento,
                { opacity: 0, y: mobile ? 30 : 80 },
                { opacity: 1, y: 0, duration: duration, clearProps: 'transform' }
            );
        }

        tl.fromTo(els.heroTitulo,
            { opacity: 0, y: mobile ? 20 : 50 },
            { opacity: 1, y: 0, duration: duration * 1.1, clearProps: 'transform' },
            els.posicionamiento ? '-=0.2' : 0
        );

        tl.fromTo(els.heroSubtitulo,
            { opacity: 0, y: mobile ? 15 : 30 },
            { opacity: 1, y: 0, duration: duration * 0.8, clearProps: 'transform' },
            '-=0.3'
        );

        tl.fromTo(els.heroCtas,
            { opacity: 0, y: mobile ? 10 : 20 },
            { opacity: 1, y: 0, duration: duration * 0.7, clearProps: 'transform' },
            '-=0.2'
        );

        if (els.heroImagen) {
            tl.fromTo(els.heroImagen,
                { opacity: 0, scale: mobile ? 0.95 : 0.8 },
                { opacity: 1, scale: 1, duration: duration * 1.1 },
                '-=0.4'
            );
        }

        const flotantes = els.heroSection.querySelectorAll('.flotando');
        if (flotantes.length) {
            tl.to(flotantes, {
                opacity: 1,
                duration: 0.01
            }, '-=0.2');
        }

        const splashBg = els.heroSection.querySelector('.hero-splash-bg');
        if (splashBg) {
            if (!mobile) {
                tl.fromTo(splashBg,
                    { opacity: 1, scaleX: 0 },
                    { opacity: 1, scaleX: 1, duration: 0.8, ease: 'power2.out' },
                    0.2
                );
            } else {
                tl.fromTo(splashBg,
                    { opacity: 1, scaleY: 0 },
                    { opacity: 1, scaleY: 0.6, duration: 0.8, ease: 'power2.out' },
                    0.2
                );
            }
        }

        initScrollAnimation(els);
        tl.eventCallback('onComplete', () => {
            setTimeout(unlockScroll, 100);
        });
    }


    // ============================================
    // ROUTER
    // ============================================

    function initScrollAnimation(els) {
        if (typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        if (isDesktopView()) {
            initDesktopReveal(els);
        } else {
            initMobileReveal(els);
        }
    }



    function initDesktopReveal(els) {
        const heroSection = els.heroSection;
        const contenidoInicial = document.querySelector('.hero-content-inicial');
        const contenidoNuevo = document.querySelector('.hero-content-nuevo');
        const splashBg = heroSection.querySelector('.hero-splash-bg');

        if (!splashBg) {
            return initDesktopFallback(els);
        }

        if (!contenidoInicial || !contenidoNuevo) return;

        contenidoInicial.style.pointerEvents = 'auto';
        contenidoNuevo.style.pointerEvents = 'none';

        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: '+=100%',
                scrub: 1,
                pin: heroSection,
                pinSpacing: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                id: 'hero',
                onUpdate: (self) => {
                    if (self.progress < 0.4) {
                        contenidoInicial.style.pointerEvents = 'auto';
                        contenidoNuevo.classList.remove('is-active');
                    } else {
                        contenidoInicial.style.pointerEvents = 'none';
                        contenidoNuevo.classList.add('is-active');
                    }
                }
            }
        });

        // 1) Splash SVG se expande hasta cubrir toda la pantalla
        masterTl.to(splashBg, {
            scaleX: 2,
            ease: 'power2.out'
        }, 0);

        // 2) Contenido inicial se desvanece
        masterTl.to(contenidoInicial, {
            opacity: 0,
            y: -30,
            ease: 'power2.in'
        }, 0);

        // 4) Contenido nuevo aparece
        masterTl.fromTo(contenidoNuevo,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, ease: 'power2.out' },
            0.4
        );

        // Dots interactivos
        const splashSvg = splashBg.querySelector('.splash-svg--desktop');
        initSplashDots(heroSection, splashSvg);
    }

    // Fallback desktop (sin SVG, crea div con clip-path recto)
    function initDesktopFallback(els) {
        const heroSection = els.heroSection;
        const contenidoInicial = document.querySelector('.hero-content-inicial');
        const contenidoNuevo = document.querySelector('.hero-content-nuevo');

        const redBg = document.createElement('div');
        redBg.className = 'hero-red-background';
        redBg.style.cssText = `
            position: absolute; top: 0; right: 0;
            width: 55%; height: 100vh;
            background: linear-gradient(135deg, #E50914 0%, #B00710 100%);
            clip-path: polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%);
            z-index: 0; pointer-events: none;
        `;
        heroSection.style.position = 'relative';
        heroSection.insertBefore(redBg, heroSection.firstChild);

        if (!contenidoInicial || !contenidoNuevo) return;

        contenidoInicial.style.pointerEvents = 'auto';
        contenidoNuevo.style.pointerEvents = 'none';

        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: heroSection, start: 'top top', end: '+=100%',
                scrub: 1, pin: heroSection, pinSpacing: true,
                anticipatePin: 1, invalidateOnRefresh: true, id: 'hero',
                onUpdate: (self) => {
                    if (self.progress < 0.4) {
                        contenidoInicial.style.pointerEvents = 'auto';
                        contenidoNuevo.classList.remove('is-active');
                    } else {
                        contenidoInicial.style.pointerEvents = 'none';
                        contenidoNuevo.classList.add('is-active');
                    }
                }
            }
        });

        masterTl.to(redBg, {
            width: '100%',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            ease: 'power2.out'
        }, 0);
        masterTl.to(contenidoInicial, { opacity: 0, y: -30, ease: 'power2.in' }, 0);
        masterTl.fromTo(contenidoNuevo, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out' }, 0.4);
    }


    // ============================================
    // MÓVIL: SVG reveal con clip-path: inset()
    // ============================================

    function initMobileReveal(els) {
        const heroSection = els.heroSection;
        const heroContenedor = document.querySelector('.hero-contenedor');
        const contenidoInicial = document.querySelector('.hero-content-inicial');
        const contenidoNuevo = document.querySelector('.hero-content-nuevo');

        if (!contenidoInicial || !contenidoNuevo) return;

        const vh = window.innerHeight;

        heroSection.style.cssText = `
            position: relative !important;
            height: ${vh}px !important;
            min-height: ${vh}px !important;
            max-height: ${vh}px !important;
            overflow: hidden !important;
            background-color: #FEFEFE;
        `;

        if (heroContenedor) {
            heroContenedor.style.cssText = `
                position: relative;
                width: 100%;
                height: 100%;
            `;
        }

        // Buscar SVG mobile
        const splashSvg = heroSection.querySelector('.splash-svg--mobile');

        // Si no hay SVG, fallback con div
        let redBg;
        const usingSvg = !!splashSvg;

        if (!usingSvg) {
            redBg = document.createElement('div');
            redBg.className = 'hero-red-background-mobile';
            redBg.style.cssText = `
                position: absolute; bottom: 0; left: 0;
                width: 100%; height: 40%;
                background: linear-gradient(135deg, #E50914 0%, #B00710 100%);
                clip-path: polygon(0% 30%, 100% 0%, 100% 100%, 0% 100%);
                z-index: 0; pointer-events: none;
            `;
            heroSection.insertBefore(redBg, heroSection.firstChild);
        }

        contenidoInicial.style.cssText = `
            position: relative;
            z-index: 2;
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        `;

        contenidoNuevo.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0;
            z-index: 2;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            padding: 80px 1.5rem 2rem;
        `;

        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: heroSection,
                start: 'top top',
                end: '+=100%',
                scrub: 0.5,
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                id: 'hero-mobile',
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const p = self.progress;

                    if (p < 0.35) {
                        contenidoInicial.style.visibility = 'visible';
                        contenidoInicial.style.pointerEvents = 'auto';
                        contenidoNuevo.style.visibility = 'hidden';
                        contenidoNuevo.classList.remove('is-active');
                    } else {
                        contenidoInicial.style.visibility = 'hidden';
                        contenidoInicial.style.pointerEvents = 'none';
                        contenidoNuevo.style.visibility = 'visible';
                        contenidoNuevo.classList.add('is-active');
                    }
                }
            }
        });

        // 1) Splash crece
        if (usingSvg) {
            const splashBg = heroSection.querySelector('.hero-splash-bg');
            if (splashBg) {
                masterTl.fromTo(splashBg,
                    { scaleY: 0.6 },
                    { scaleY: 2.6, ease: 'power2.inOut', duration: 0.5 },
                    0
                );
            }
        } else {
            masterTl.to(redBg, {
                height: '100%',
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                ease: 'power2.inOut',
                duration: 0.5
            }, 0);
        }

        // 2) Contenido inicial se desvanece
        masterTl.fromTo(contenidoInicial,
            { opacity: 1, y: 0 },
            { opacity: 0, y: -40, ease: 'power2.in', duration: 0.4 },
            0
        );

        // 3) Contenido nuevo aparece
        masterTl.fromTo(contenidoNuevo,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 },
            0.45
        );

        // 4) Stagger de elementos internos
        const elementosNuevos = [
            contenidoNuevo.querySelector('.hero-imagen'),
            contenidoNuevo.querySelector('.posicionamiento'),
            contenidoNuevo.querySelector('.hero-titulo'),
            contenidoNuevo.querySelector('.hero-subtitulo'),
            contenidoNuevo.querySelector('.hero-ctas')
        ].filter(Boolean);

        if (elementosNuevos.length) {
            masterTl.fromTo(elementosNuevos,
                { opacity: 0, y: 30, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: 'back.out(1.2)'
                },
                0.55
            );
        }

        setTimeout(() => ScrollTrigger.refresh(true), 100);
    }


    // ============================================
    // DOTS INTERACTIVOS — Reaccionan al cursor
    // ============================================

    function initSplashDots(heroSection, svg) {
        if (!svg) return;

        const dots = svg.querySelectorAll('.splash-dot');
        if (dots.length === 0) return;

        const INFLUENCE = 100;  // radio de influencia en unidades SVG
        const PUSH = 30;        // fuerza de empuje
        const LERP = 0.08;      // suavizado del retorno

        let mouseIn = false;
        let mouse = { x: -9999, y: -9999 };

        function toSVG(e) {
            const rect = svg.getBoundingClientRect();
            const vb = svg.viewBox.baseVal;
            return {
                x: ((e.clientX - rect.left) / rect.width) * vb.width,
                y: ((e.clientY - rect.top) / rect.height) * vb.height
            };
        }

        heroSection.addEventListener('mousemove', e => { mouseIn = true; mouse = toSVG(e); });
        heroSection.addEventListener('mouseleave', () => { mouseIn = false; });

        // Esperar a que las animaciones de entrada terminen
        setTimeout(() => {
            const state = Array.from(dots).map(dot => ({
                el: dot,
                originX: parseFloat(dot.getAttribute('cx')),
                originY: parseFloat(dot.getAttribute('cy')),
                x: parseFloat(dot.getAttribute('cx')),
                y: parseFloat(dot.getAttribute('cy'))
            }));

            function tick() {
                state.forEach(d => {
                    let tx = d.originX;
                    let ty = d.originY;

                    if (mouseIn) {
                        const dx = d.originX - mouse.x;
                        const dy = d.originY - mouse.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < INFLUENCE && dist > 0) {
                            const force = (1 - dist / INFLUENCE) * PUSH;
                            tx += (dx / dist) * force;
                            ty += (dy / dist) * force;
                        }
                    }

                    d.x += (tx - d.x) * LERP;
                    d.y += (ty - d.y) * LERP;

                    d.el.setAttribute('cx', d.x.toFixed(2));
                    d.el.setAttribute('cy', d.y.toFixed(2));
                });

                requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
        }, 2500);
    }




    // ============================================
    // FALLBACK: sin animación
    // ============================================

    function showContentInstantly(els) {
        gsap.set([
            els.posicionamiento,
            els.heroTitulo,
            els.heroSubtitulo,
            els.heroCtas,
            els.heroImagen,
            els.heroSection.querySelector('.hero-splash-bg')
        ].filter(Boolean), {
            opacity: 1,
            clearProps: 'all'
        });
        unlockScroll();
    }
});


// ============================================
// POST-CARGA
// ============================================

window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        setTimeout(() => {
            if (typeof ScrollTrigger !== 'undefined') {
                try { ScrollTrigger.refresh(true); } catch (e) {}
            }
        }, 200);
    }, 100);
});


// ============================================
// CLEANUP
// ============================================

window.addEventListener('beforeunload', () => {
    if (typeof ScrollTrigger !== 'undefined') {
        try {
            ScrollTrigger.getAll().forEach(t => t.kill(false));
        } catch (e) {}
    }
    window.scrollTo(0, 0);
});


// ============================================
// RESIZE
// ============================================

let resizeTimer;
let previousWidth = window.innerWidth;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const currentWidth = window.innerWidth;
        const crossedBreakpoint =
            (previousWidth <= 1024 && currentWidth > 1024) ||
            (previousWidth > 1024 && currentWidth <= 1024);

        if (crossedBreakpoint) {
            location.reload();
        } else if (typeof ScrollTrigger !== 'undefined') {
            try { ScrollTrigger.refresh(); } catch (e) {}
        }

        previousWidth = currentWidth;
    }, 250);
});