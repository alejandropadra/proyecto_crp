const FILTROS_CONFIG = {
    tipo:         { label: 'Tipo de Producto', icono: 'tag',        color: { bg: '#eef1fe', border: '#004BC2', text: '#004BC2', label: '#0062E6', hoverBg: '#F0F4F8', hoverBorder: '#1E88E5', xHover: '#C7D2FE' } },
    categoria:    { label: 'Categoría',        icono: 'layers',     color: { bg: '#F0FDF4', border: '#22c55e', text: '#22c55e', label: '#15803d', hoverBg: '#DCFCE7', hoverBorder: '#86EFAC', xHover: '#BBF7D0' } },
    acabado:      { label: 'Acabado',          icono: 'paintbrush', color: { bg: '#ffedd5', border: '#feefaa', text: '#9a6f12', label: '#F97316', hoverBg: '#FFEDD5', hoverBorder: '#FDBA74', xHover: '#FED7AA' } },
    calidad:      { label: 'Calidad',          icono: 'star',       color: { bg: '#FFFBEB', border: '#ea580c', text: '#ea580c', label: '#b45309', hoverBg: '#FEF3C7', hoverBorder: '#FCD34D', xHover: '#FDE68A' } },
    uso:          { label: 'Uso',              icono: 'home',       color: { bg: '#eef1fe', border: '#004BC2', text: '#004BC2', label: '#0062E6', hoverBg: '#F0F4F8', hoverBorder: '#1E88E5', xHover: '#C7D2FE' } },
    superficie:   { label: 'Superficie',       icono: 'square',     color: { bg: '#f0f9ff', border: '#0c4a6e', text: '#0c4a6e', label: '#0c4a6e', hoverBg: '#e0f2fe', hoverBorder: '#7dd3fc', xHover: '#bae6fd' } },
    marca_nombre: { label: 'Marca',            icono: 'bookmark',   color: { bg: '#FAF5FF', border: '#E9D5FF', text: '#6B21A8', label: '#A855F7', hoverBg: '#F3E8FF', hoverBorder: '#D8B4FE', xHover: '#E9D5FF' } },
};

// Variable para el debounce del buscador
let _searchTimeout = null;


function initMobileDrawer() {
    const sidebar = document.querySelector('.sidebar-v2');
    const rowContenedor = document.querySelector('.row-contenedor');

    if (!sidebar) return;

    crearElementosDrawer(sidebar, rowContenedor);

    const btnFiltrosMobile = document.querySelector('.btn-filtros-mobile');
    const overlay = document.querySelector('.filtros-overlay');
    const btnCerrar = document.querySelector('.btn-cerrar-filtros');
    const btnAplicar = document.querySelector('.btn-aplicar-filtros');

    if (btnFiltrosMobile) {
        btnFiltrosMobile.addEventListener('click', () => abrirDrawer(sidebar, overlay));
    }

    if (overlay) {
        overlay.addEventListener('click', () => cerrarDrawer(sidebar, overlay));
    }

    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => cerrarDrawer(sidebar, overlay));
    }

    if (btnAplicar) {
        btnAplicar.addEventListener('click', () => cerrarDrawer(sidebar, overlay));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('drawer-open')) {
            cerrarDrawer(sidebar, overlay);
        }
    });

    initSwipeToClose(sidebar, overlay);
}


function crearElementosDrawer(sidebar, rowContenedor) {
    if (!document.querySelector('.btn-filtros-mobile')) {
        const btnFlotante = document.createElement('button');
        btnFlotante.className = 'btn-filtros-mobile';
        btnFlotante.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filtrar
        `;
        document.body.appendChild(btnFlotante);
    }

    if (!document.querySelector('.filtros-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'filtros-overlay';
        document.body.appendChild(overlay);
    }

    if (!sidebar.querySelector('.filtros-header-mobile')) {
        const v2Body = sidebar.querySelector('.v2-body');

        const headerMobile = document.createElement('div');
        headerMobile.className = 'filtros-header-mobile';
        headerMobile.innerHTML = `
            <h3>Filtros</h3>
            <button class="btn-cerrar-filtros" aria-label="Cerrar filtros">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                </svg>
            </button>
        `;

        sidebar.insertBefore(headerMobile, v2Body);

        const btnAplicar = document.createElement('button');
        btnAplicar.className = 'btn-aplicar-filtros';
        btnAplicar.textContent = 'Aplicar filtros';
        sidebar.appendChild(btnAplicar);
    }
}


function abrirDrawer(drawer, overlay) {
    drawer.classList.add('drawer-open');
    overlay.classList.add('active');
    document.body.classList.add('filtros-open');
    drawer.style.transform = 'translateY(0)';
}


function cerrarDrawer(drawer, overlay) {
    drawer.classList.remove('drawer-open');
    overlay.classList.remove('active');
    document.body.classList.remove('filtros-open');
    drawer.style.transform = '';
}


function initSwipeToClose(drawer, overlay) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    drawer.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = drawer.getBoundingClientRect();

        if (touch.clientY - rect.top < 60) {
            startY = touch.clientY;
            isDragging = true;
            drawer.style.transition = 'none';
        }
    }, { passive: true });

    drawer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        if (deltaY > 0) {
            drawer.style.transform = `translateY(${deltaY}px)`;
        }
    }, { passive: true });

    drawer.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        drawer.style.transition = '';
        const deltaY = currentY - startY;

        if (deltaY > 100) {
            cerrarDrawer(drawer, overlay);
        } else {
            drawer.style.transform = drawer.classList.contains('drawer-open')
                ? 'translateY(0)'
                : '';
        }
        startY = 0;
        currentY = 0;
    });
}


function initBarraBusqueda() {
    const input = document.getElementById('v2SearchInput');
    const btnClear = document.getElementById('v2SearchClear');
    if (!input) return;

    input.addEventListener('input', () => {
        clearTimeout(_searchTimeout);
        btnClear.style.display = input.value.length > 0 ? 'flex' : 'none';
        _searchTimeout = setTimeout(() => filtrar(), 250);
    });

    btnClear.addEventListener('click', () => {
        input.value = '';
        btnClear.style.display = 'none';
        input.focus();
        filtrar();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.value = '';
            btnClear.style.display = 'none';
            input.blur();
            filtrar();
        }
    });
}

function obtenerTerminoBusqueda() {
    const input = document.getElementById('v2SearchInput');
    if (!input) return '';
    return normalizarTexto(input.value);
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}


function coincideBusqueda(contenedorTarjeta, termino) {
    if (!termino) return true;

    const tarjeta = contenedorTarjeta.dataset.infoProducto 
        ? contenedorTarjeta 
        : contenedorTarjeta.querySelector('.tarjeta-producto');
    
    if (!tarjeta) return false;

    try {
        const info = JSON.parse(tarjeta.dataset.infoProducto);
        const valoresInfo = Object.values(info)
            .filter(v => v !== null && v !== undefined)
            .map(v => normalizarTexto(String(v)))
            .join(' ');

        if (valoresInfo.includes(termino)) return true;
    } catch (e) { }

    const textoVisible = normalizarTexto(tarjeta.textContent || '');
    return textoVisible.includes(termino);
}



function parsearFiltros(filtrosStr) {
    try {
        return JSON.parse(filtrosStr);
    } catch {
        const jsonStr = filtrosStr
            .replace(/'/g, '"')   
            .replace(/None/g, 'null')
            .replace(/True/g, 'true')
            .replace(/False/g, 'false');
        return JSON.parse(jsonStr);
    }
}


// ============================================================================
// MENSAJE DE "SIN RESULTADOS" 
// ============================================================================

function showNoResults() {
    const container = document.querySelector('.grid-productos');
    if (!container || container.querySelector('.no-results')) return;

    const termino = obtenerTerminoBusqueda();
    const filtrosActivos = obtenerFiltrosActivos();
    const hayFiltros = Object.keys(filtrosActivos).length > 0;

    // Mensaje contextual según si hay búsqueda, filtros, o ambos
    let mensaje = 'No hay productos disponibles para los filtros seleccionados';
    if (termino && hayFiltros) {
        mensaje = `No se encontraron productos que coincidan con "<strong>${termino}</strong>" en los filtros seleccionados`;
    } else if (termino) {
        mensaje = `No se encontraron productos que coincidan con "<strong>${termino}</strong>"`;
    }

    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.style.cssText = `
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
    `;
    noResults.innerHTML = `
        <svg style="width: 4rem; height: 4rem; color: #9CA3AF; margin-bottom: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 style="color: #374151; font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
            No se encontraron resultados
        </h3>
        <p style="color: #6B7280; font-size: 0.875rem;">
            ${mensaje}
        </p>
    `;

    container.appendChild(noResults);
}

function hideNoResults() {
    const noResults = document.querySelector('.grid-productos .no-results');
    if (noResults) noResults.remove();
}


// ============================================================================
// CHIPS DE FILTROS ACTIVOS 
// ============================================================================

function renderizarFiltrosActivos() {
    const contenedor = document.querySelector('.filtrosActivos');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    const activos = obtenerFiltrosActivos();

    if (Object.keys(activos).length === 0) return;

    Object.entries(activos).forEach(([clave, valor]) => {
        const config = FILTROS_CONFIG[clave] || { label: clave };
        const c = config.color || { bg: '#EEF2FF', border: '#C7D2FE', text: '#4338CA', label: '#6366F1', hoverBg: '#E0E7FF', hoverBorder: '#A5B4FC', xHover: '#C7D2FE' };

        const chip = document.createElement('span');
        chip.className = 'filtroActivo';
        chip.style.cssText = `background: ${c.bg}; border-color: ${c.border}; color: ${c.text};`;
        chip.innerHTML = `
            <span class="filtroActivo-label" style="color: ${c.label};">${config.label}:</span>
            <strong style="color: ${c.text};">${valor}</strong>
            <button class="filtroActivo-x" data-clave="${clave}" aria-label="Quitar filtro ${config.label}"
                    style="color: ${c.label};" 
                    onmouseenter="this.style.background='${c.xHover}'" 
                    onmouseleave="this.style.background='transparent'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" 
                    fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" 
                    stroke-linejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
            </button>
        `;

        chip.addEventListener('mouseenter', () => {
            chip.style.background = c.hoverBg;
            chip.style.borderColor = c.hoverBorder;
        });
        chip.addEventListener('mouseleave', () => {
            chip.style.background = c.bg;
            chip.style.borderColor = c.border;
        });

        chip.querySelector('.filtroActivo-x').addEventListener('click', () => {
            const section = document.querySelector(`.v2-filtro-section[data-filtro-clave="${clave}"]`);
            if (section) {
                const radioTodos = section.querySelector('input[type="radio"][value="todos"]');
                if (radioTodos) {
                    radioTodos.checked = true;
                    filtrar();
                }
            }
        });

        contenedor.appendChild(chip);
    });
}


function generarSeccionFiltro(clave, valores, abierto = false) {
    const config = FILTROS_CONFIG[clave] || { label: clave, icono: 'filter' };
    const idTrigger = `v2Trigger_${clave}`;
    const idMenu = `v2Menu_${clave}`;
    const radioName = `v2-${clave}`;

    const radiosHTML = valores.map(val => `
        <label class="v2-radio">
            <input type="radio" name="${radioName}" value="${val}"/>
            <span>${val}</span>
        </label>
    `).join('');

    return `
        <div class="v2-filtro-section" data-filtro-clave="${clave}">
            <div class="v2-cat-trigger ${abierto ? 'open' : ''}" id="${idTrigger}">
                <div class="v2-cat-trigger-left">
                    <div class="v2-cat-trigger-dot"></div>
                    <span class="v2-cat-trigger-label">${config.label}</span>
                </div>
                <svg class="v2-cat-trigger-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                </svg>
            </div>

            <div class="v2-cat-menu ${abierto ? 'show' : ''}" id="${idMenu}">
                <div class="v2-radio-group">
                    <label class="v2-radio">
                        <input type="radio" name="${radioName}" value="todos" checked/>
                        <span>Todos</span>
                    </label>
                    ${radiosHTML}
                </div>
            </div>
        </div>
    `;
}


function renderizarFiltros(filtrosData) {
    const v2Body = document.querySelector('.sidebar-v2 .v2-body');
    if (!v2Body) return;

    const seccionHeader = v2Body.querySelector('.v2-section');

    v2Body.innerHTML = '';
    if (seccionHeader) {
        v2Body.appendChild(seccionHeader);
    } else {
        const header = document.createElement('div');
        header.className = 'v2-section';
        header.innerHTML = '<span class="v2-section-text">Categoría</span>';
        v2Body.appendChild(header);
    }

    const claves = Object.keys(filtrosData);
    claves.forEach((clave, index) => {
        const valores = filtrosData[clave];
        if (!valores || !valores.length) return;

        const abierto = index === 0;
        const seccionHTML = generarSeccionFiltro(clave, valores, abierto);

        v2Body.insertAdjacentHTML('beforeend', seccionHTML);
    });

    initTriggersFiltros();
    initRadiosFiltros();
}



function initTriggersFiltros() {
    document.querySelectorAll('.v2-filtro-section .v2-cat-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const section = trigger.closest('.v2-filtro-section');
            const menu = section.querySelector('.v2-cat-menu');

            trigger.classList.toggle('open');
            menu.classList.toggle('show');
        });
    });
}


function initRadiosFiltros() {
    document.querySelectorAll('.v2-filtro-section .v2-radio input[type="radio"]').forEach(input => {
        input.addEventListener('change', () => {
            filtrar();
        });
    });
}


function obtenerFiltrosActivos() {
    const activos = {};

    document.querySelectorAll('.v2-filtro-section').forEach(section => {
        const clave = section.dataset.filtroClave;
        const radioChecked = section.querySelector('input[type="radio"]:checked');

        if (radioChecked && radioChecked.value !== 'todos') {
            activos[clave] = radioChecked.value;
        }
    });

    return activos;
}


// ============================================================================
// FILTRADO PRINCIPAL (filtros de radio + búsqueda jerárquica)
// ============================================================================

function filtrar() {
    const tarjetas = document.querySelectorAll('.contenedor-tarjeta-producto');
    const filtrosActivos = obtenerFiltrosActivos();
    const termino = obtenerTerminoBusqueda();

    hideNoResults();

    const mostrar = [];
    const ocultar = [];
    const hayFiltros = Object.keys(filtrosActivos).length > 0;

    tarjetas.forEach(contenedorTarjeta => {
        const tarjeta = contenedorTarjeta.dataset.infoProducto 
            ? contenedorTarjeta 
            : contenedorTarjeta.querySelector('.tarjeta-producto');
        
        if (!tarjeta) return;

        const info = JSON.parse(tarjeta.dataset.infoProducto);

        let pasaFiltros = true;
        if (hayFiltros) {
            pasaFiltros = Object.entries(filtrosActivos).every(([clave, valor]) => {
                return info[clave] === valor;
            });
        }

        let pasaBusqueda = true;
        if (pasaFiltros && termino) {
            pasaBusqueda = coincideBusqueda(contenedorTarjeta, termino);
        }

        if (pasaFiltros && pasaBusqueda) {
            mostrar.push(contenedorTarjeta);
        } else {
            ocultar.push(contenedorTarjeta);
        }
    });

    if (mostrar.length === 0 && (hayFiltros || termino)) {
        showNoResults();
    }

    // Ocultar tarjetas que no coinciden
    ocultar.forEach(el => {
        el.classList.remove('tarjeta-visible');
        el.classList.add('tarjeta-oculta');
    });

    // Tras la transición de salida, ocultarlas con display:none
    // y luego mostrar las que sí coinciden con animación de entrada
    setTimeout(() => {
        ocultar.forEach(el => {
            el.style.display = 'none';
        });

        mostrar.forEach((el, i) => {
            el.style.display = '';
            el.classList.remove('tarjeta-oculta');
            el.classList.remove('tarjeta-visible');

            // Stagger: cada tarjeta entra con un pequeño retraso
            el.style.animationDelay = `${i * 20}ms`;
            el.classList.add('tarjeta-visible');
        });
    }, 200); // coincide con la duración de la transición de salida

    renderizarFiltrosActivos();
    actualizarContadorFiltros();
}

function actualizarContadorFiltros() {
    const filtrosActivos = obtenerFiltrosActivos();
    const total = Object.keys(filtrosActivos).length;

    const btnFlotante = document.querySelector('.btn-filtros-mobile');
    if (btnFlotante) {
        let badge = btnFlotante.querySelector('.filtros-badge');

        if (total > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'filtros-badge';
                badge.style.cssText = `
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #ef4444;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                btnFlotante.style.position = 'relative';
                btnFlotante.appendChild(badge);
            }
            badge.textContent = total;
        } else if (badge) {
            badge.remove();
        }
    }

    const v2Badge = document.querySelector('.v2-badge');
    const v2FooterCount = document.querySelector('.v2-footer-count');
    if (v2Badge) {
        v2Badge.textContent = total;
    }
    if (v2FooterCount) {
        v2FooterCount.innerHTML = `<span class="v2-badge">${total}</span> filtro${total !== 1 ? 's' : ''} activo${total !== 1 ? 's' : ''}`;
    }
}



function resetearFiltros() {
    const tarjetas = document.querySelectorAll('.contenedor-tarjeta-producto');

    hideNoResults();

    // Limpiar barra de búsqueda
    const searchInput = document.getElementById('v2SearchInput');
    const searchClear = document.getElementById('v2SearchClear');
    if (searchInput) {
        searchInput.value = '';
    }
    if (searchClear) {
        searchClear.style.display = 'none';
    }

    document.querySelectorAll('.v2-filtro-section').forEach((section, index) => {
        const trigger = section.querySelector('.v2-cat-trigger');
        const menu = section.querySelector('.v2-cat-menu');

        if (index === 0) {
            trigger.classList.add('open');
            menu.classList.add('show');
        } else {
            trigger.classList.remove('open');
            menu.classList.remove('show');
        }
    });

    document.querySelectorAll('.v2-filtro-section input[type="radio"][value="todos"]').forEach(input => {
        input.checked = true;
    });

    // Mostrar todas las tarjetas con animación CSS
    tarjetas.forEach((el, i) => {
        el.style.display = '';
        el.classList.remove('tarjeta-oculta', 'tarjeta-visible');
        el.style.animationDelay = `${i * 20}ms`;
        el.classList.add('tarjeta-visible');
    });

    renderizarFiltrosActivos();
    actualizarContadorFiltros();
}



function inicializaFiltros() {
    const filtrosInput = document.getElementById('filtros');
    if (!filtrosInput || !filtrosInput.value) return;

    const filtrosData = parsearFiltros(filtrosInput.value);
    console.log('Filtros cargados:', filtrosData);

    renderizarFiltros(filtrosData);
}


// ============================================================================
// INICIALIZACIÓN GENERAL
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {

    inicializaFiltros();

    initBarraBusqueda();

    initMobileDrawer();

    document.querySelector('.v2-btn-clear')?.addEventListener('click', () => {
        resetearFiltros();
    });
});