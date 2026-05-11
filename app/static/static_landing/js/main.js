document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('header');
    const burgerButton = document.querySelector('.hamburger');

    let isMenuOpen = false;

    const scrollThreshold = 50;

    function handleNavbarScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const isMobile = window.innerWidth <= 1024;

        if (isMobile) {
            if (scrollTop > scrollThreshold) {
                header.classList.add('navbar-scrolled-mobile');
                header.classList.remove('navbar-transparent');
            } else {
                header.classList.remove('navbar-scrolled-mobile');
                header.classList.add('navbar-transparent');
            }
        } else {
            if (scrollTop > scrollThreshold) {
                header.classList.add('navbar-scrolled');
                header.classList.remove('navbar-transparent');
            } else {
                header.classList.remove('navbar-scrolled');
                header.classList.add('navbar-transparent');
            }
        }
    }

    handleNavbarScroll();

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleNavbarScroll();
                ticking = false;
            });
            ticking = true;
        }
    });


    // ============================================
    // 2. CREAR MENÚ 
    // ============================================

    function createMobileMenu() {
        if (document.querySelector('.navbar-menu-mobile')) return;

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'navbar-overlay';
        document.body.appendChild(overlay);

        // Panel del menú
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'navbar-menu-mobile';

        const desktopMenu = document.querySelector('.navbar-menu.menu-xls');
        const desktopCta = document.querySelector('.navbar-cta.menu-xls');

        let menuHTML = `
            <button class="navbar-menu-close" aria-label="Cerrar menú">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <ul>
        `;

        if (desktopMenu) {
            desktopMenu.querySelectorAll('li a').forEach(link => {
                menuHTML += `<li><a href="${link.getAttribute('href')}">${link.textContent}</a></li>`;
            });
        }

        menuHTML += '</ul>';

        if (desktopCta) {
            const ctaLink = desktopCta.querySelector('a');
            if (ctaLink) {
                menuHTML += `
                    <div class="navbar-menu-mobile-cta">
                        <a href="${ctaLink.getAttribute('href')}" class="btn">${ctaLink.textContent}</a>
                    </div>
                `;
            }
        }

        menuHTML += `
            <div class="navbar-menu-mobile-footer">
                <p>Corimon Pinturas<br>75+ años de experiencia</p>
            </div>
        `;

        mobileMenu.innerHTML = menuHTML;
        document.body.appendChild(mobileMenu);

        return { overlay, mobileMenu };
    }

    if (window.innerWidth <= 1024) {
        createMobileMenu();
    }


    // ============================================
    // 3. ABRIR / CERRAR MENÚ
    // ============================================

    function openMobileMenu() {
        const overlay = document.querySelector('.navbar-overlay');
        const mobileMenu = document.querySelector('.navbar-menu-mobile');
        if (!overlay || !mobileMenu) return;

        isMenuOpen = true;
        
        // Guardar posición de scroll ANTES de fijar el body
        document.body.dataset.scrollY = window.scrollY;
        document.body.style.top = `-${window.scrollY}px`;
        
        overlay.classList.add('active');
        mobileMenu.classList.add('active');
        header.classList.add('menu-open');
        document.body.classList.add('menu-mobile-open');

        if (burgerButton) burgerButton.classList.add('active');
    }

    function closeMobileMenu() {
        const overlay = document.querySelector('.navbar-overlay');
        const mobileMenu = document.querySelector('.navbar-menu-mobile');
        if (!overlay || !mobileMenu) return;

        isMenuOpen = false;
        
        // Recuperar posición de scroll guardada
        const scrollY = parseInt(document.body.dataset.scrollY || '0');
        
        overlay.classList.remove('active');
        mobileMenu.classList.remove('active');
        header.classList.remove('menu-open');
        document.body.classList.remove('menu-mobile-open');
        
        // Restaurar posición DESPUÉS de quitar fixed
        document.body.style.top = '';
        window.scrollTo(0, scrollY);

        if (burgerButton) burgerButton.classList.remove('active');
    }

    function toggleMobileMenu() {
        isMenuOpen ? closeMobileMenu() : openMobileMenu();
    }


    // ============================================
    // 4. EVENT LISTENERS
    // ============================================

    if (burgerButton) {
        burgerButton.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMobileMenu();
        });
    }


    function setupMobileMenuListeners() {
        const overlay = document.querySelector('.navbar-overlay');
        const closeButton = document.querySelector('.navbar-menu-close');
        const mobileMenuLinks = document.querySelectorAll('.navbar-menu-mobile a');

        if (overlay) {
            overlay.addEventListener('click', closeMobileMenu);
        }

        if (closeButton) {
            closeButton.addEventListener('click', closeMobileMenu);
        }

        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    closeMobileMenu();
                }
            });
        });
    }

    setTimeout(setupMobileMenuListeners, 100);

    // ============================================
    // 6. SMOOTH SCROLL
    // ============================================

    function setupSmoothScroll() {
        document.querySelectorAll('.navbar-menu a, .navbar-menu-mobile a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetSection = document.getElementById(href.substring(1));

                    if (targetSection) {
                        const headerHeight = header.offsetHeight;
                        window.scrollTo({
                            top: targetSection.offsetTop - headerHeight,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    setupSmoothScroll();
    setTimeout(setupSmoothScroll, 100);


    // ============================================
    // 7. RESIZE HANDLER
    // ============================================

    let resizeTimer;

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const w = window.innerWidth;

            if (w > 1024) {
                // Cerrar menú si cambiamos a desktop
                closeMobileMenu();
                header.classList.remove('navbar-scrolled-mobile');
            }

            if (w <= 1024 && !document.querySelector('.navbar-menu-mobile')) {
                // Crear menú si no existe y pasamos a mobile
                createMobileMenu();
                setupMobileMenuListeners();
                setupSmoothScroll();
            }

            handleNavbarScroll();
        }, 250);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }
    });

});



// ============================================
// FLASH MESSAGES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    


function setupFlashes() {
    const flashes = document.querySelectorAll('.flash');
    if (flashes.length === 0) return;

    flashes.forEach((flash, index) => {
        inicializarFlash(flash, index);
    });
}

function inicializarFlash(flashEl, index) {
    const duracionTotal = parseInt(flashEl.dataset.duration, 10) || 5000;
    const closeBtn = flashEl.querySelector('.flash-close');
    const progressFill = flashEl.querySelector('.flash-progress-fill');
    const secondsEl = flashEl.querySelector('.flash-seconds');

    const delayInicial = 200 * index;

    let inicio = null;
    let pausadoEn = null;
    let tiempoTotalPausado = 0;
    let animacionId = null;
    let cerrado = false;
    let isPaused = false;

    function cerrar() {
        if (cerrado) return;
        cerrado = true;
        cancelAnimationFrame(animacionId);
        flashEl.classList.add('closing');
        flashEl.addEventListener('animationend', () => flashEl.remove(), { once: true });
    }

    function tick(timestamp) {
        if (cerrado) return;

        if (inicio === null) inicio = timestamp;

        const transcurrido = timestamp - inicio - tiempoTotalPausado;
        const progreso = Math.min(transcurrido / duracionTotal, 1);
        const segundosRestantes = Math.max(Math.ceil((duracionTotal - transcurrido) / 1000), 0);

        progressFill.style.width = (progreso * 100) + '%';

        if (secondsEl) {
            secondsEl.textContent = segundosRestantes;
        }

        if (progreso < 1) {
            animacionId = requestAnimationFrame(tick);
        } else {
            cerrar();
        }
    }

    function pausar() {
        if (isPaused || cerrado) return;
        isPaused = true;
        pausadoEn = performance.now();
        cancelAnimationFrame(animacionId);
        flashEl.classList.add('is-paused');
    }

    function reanudar() {
        if (!isPaused || cerrado) return;
        isPaused = false;
        tiempoTotalPausado += performance.now() - pausadoEn;
        pausadoEn = null;
        flashEl.classList.remove('is-paused');
        animacionId = requestAnimationFrame(tick);
    }

    // ─── Eventos ─────────────────────────────────
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrar);
    }

    // Pausa con hover sobre el flash entero
    flashEl.addEventListener('mouseenter', pausar);
    flashEl.addEventListener('mouseleave', reanudar);

    // Inicio con delay escalonado
    setTimeout(() => {
        if (!cerrado) {
            animacionId = requestAnimationFrame(tick);
        }
    }, delayInicial);
}

setupFlashes();
});