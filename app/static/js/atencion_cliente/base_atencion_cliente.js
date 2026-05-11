

/* ----- Pin del sidebar contextual ------------------------- */
function togglePin() {
    const side = document.getElementById('sideContextual');
    const pin  = document.getElementById('sidePin');
    if (!side || !pin) return;

    const isOn = side.classList.toggle('is-open');
    pin.classList.toggle('is-on', isOn);
    pin.title = isOn ? 'Desfijar' : 'Fijar abierto';
}

function setupRail() {
    const sideBody  = document.getElementById('sideBody');
    const sideIcon  = document.getElementById('sideModIcon');
    const sideLabel = document.getElementById('sideModLabel');
    const shell     = document.querySelector('.v1-shell');

    const paginaActual = document.querySelector('.v1-rail-item.is-active[data-module]')?.dataset.module;

    const MODULES = {
        pagos: {
            label: 'Pagos',
            icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M16 14h.01"/><path d="M21 11V7a2 2 0 0 0-2-2H6"/></svg>`
        },
        formulacion: {
            label: 'Formulación',
            icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v6l4 9a3 3 0 0 1-3 4H8a3 3 0 0 1-3-4l4-9V3Z"/><path d="M5 12h14"/></svg>`
        },
        pedidos: {
            label: 'Pedidos',
            icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>`
        },
        atencion_cliente: {
            label: 'Atención al Cliente',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-headset-icon lucide-headset"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/></svg>`
        },
    };

    function loadModule(mod) {
        const tplId = `ctx-${mod.replace(/_/g, '-')}`;  
        const tpl   = document.getElementById(tplId);
        const meta  = MODULES[mod];
        if (!tpl || !sideBody) return;

        sideBody.innerHTML = '';
        sideBody.appendChild(tpl.content.cloneNode(true));

        if (sideIcon)  sideIcon.innerHTML   = meta.icon;
        if (sideLabel) sideLabel.textContent = meta.label;

        // Clicks en items del contexto → navegan
        sideBody.querySelectorAll('.v1-item[data-href]').forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = item.dataset.href;
            });
        });
    }

    document.querySelectorAll('.v1-rail-item[data-module]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.v1-rail-item').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            loadModule(btn.dataset.module);
        });
    });

    
    shell?.addEventListener('mouseleave', () => {
        const side = document.getElementById('sideContextual');
        const estaPinned = side?.classList.contains('is-open');
        if (estaPinned || !paginaActual) return;  

        document.querySelectorAll('.v1-rail-item').forEach(b => b.classList.remove('is-active'));
        document.querySelector(`.v1-rail-item[data-module="${paginaActual}"]`)?.classList.add('is-active');
        loadModule(paginaActual);
    });

    
    if (paginaActual) loadModule(paginaActual);

    
    const activeBtn = document.querySelector('.v1-rail-item.is-active[data-module]');
    console.log('Active btn:', activeBtn);
    if (activeBtn) loadModule(activeBtn.dataset.module);
}
/* ----- Dropdowns (notif y perfil) ------------------------- */
function setupDropdown(btnId, dropdownId, popId) {
    const btn = document.getElementById(btnId);
    const dd  = document.getElementById(dropdownId);
    const pop = document.getElementById(popId);
    if (!btn || !dd || !pop) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = dd.hasAttribute('hidden');

        // Cierra cualquier otro dropdown abierto
        document.querySelectorAll('.cm-dropdown').forEach(d => {
            if (d !== dd) {
                d.setAttribute('hidden', '');
                d.previousElementSibling?.classList.remove('is-active');
            }
        });

        if (willOpen) {
            dd.removeAttribute('hidden');
            btn.classList.add('is-active');
        } else {
            dd.setAttribute('hidden', '');
            btn.classList.remove('is-active');
        }
    });

    // Cerrar al hacer click afuera
    document.addEventListener('mousedown', (e) => {
        if (!pop.contains(e.target)) {
            dd.setAttribute('hidden', '');
            btn.classList.remove('is-active');
        }
    });
}

/* ----- Avatar — iniciales con gradiente derivado del nombre */
function paintAvatar(el, name) {
    if (!el) return;
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    el.style.background = `linear-gradient(135deg, hsl(${h} 55% 45%), hsl(${(h + 30) % 360} 60% 38%))`;
    el.textContent = initials;
}




// ============================================
// FLASH MESSAGES
// ============================================

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

// ============================================
// MENÚ MÓVIL (overlay del sidebar)
// ============================================

function setupMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const shell = document.querySelector('.v1-shell');
    const backdrop = document.getElementById('mobileBackdrop');

    if (!btn || !shell || !backdrop) return;

    function abrir() {
        shell.classList.add('is-mobile-open');
        backdrop.classList.add('is-visible');
        document.body.classList.add('has-mobile-menu-open');
        btn.setAttribute('aria-expanded', 'true');
    }

    function cerrar() {
        shell.classList.remove('is-mobile-open');
        backdrop.classList.remove('is-visible');
        document.body.classList.remove('has-mobile-menu-open');
        btn.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
        if (shell.classList.contains('is-mobile-open')) cerrar();
        else abrir();
    }

    // Click en hamburguesa
    btn.addEventListener('click', toggle);

    // Click en backdrop cierra
    backdrop.addEventListener('click', cerrar);

    // Click en cualquier link/item del sidebar cierra el menú
    shell.addEventListener('click', (e) => {
        const navega = e.target.closest('a[href], .v1-item[data-href]');    
        if (navega && window.innerWidth <= 1023) {
            cerrar();
        }
    });

    // Tecla Escape cierra
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && shell.classList.contains('is-mobile-open')) {
            cerrar();
        }
    });

    // Si el viewport cambia a desktop, asegurarnos de cerrar
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1023 && shell.classList.contains('is-mobile-open')) {
            cerrar();
        }
    });
}

/* ----- Init ----------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sidePin')?.addEventListener('click', togglePin);
    setupRail();
    setupDropdown('notifBtn',   'notifDropdown',   'notifPop');
    setupDropdown('profileBtn', 'profileDropdown', 'profilePop');
    setupFlashes();
    setupMobileMenu()
    const userName = document.querySelector('.cm-profile-name')?.textContent.trim() || 'U';
    paintAvatar(document.getElementById('avatarSmall'), userName);
    paintAvatar(document.getElementById('avatarLarge'), userName);
});


