document.addEventListener('DOMContentLoaded', function() {
    const itemsPerPage = 18;
    const paginationElement = document.getElementById('mi-paginacion');
    const jsonString = paginationElement.dataset.paginationData;
    const paginationData = JSON.parse(jsonString);

    let currentPage = paginationData.currentPage;
    let totalPages = paginationData.totalPages;
    let totalGroups = paginationData.totalGroups;
    let totalRecords = paginationData.totalRecords;

    const container = document.getElementById('productos-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const pageNumbersContainer = document.getElementById('page-numbers');

    let isFilterActive = false;  
    let handlePrevClickFilter = null;  
    let handleNextClickFilter = null;
    

    /*==============================
        Color Utilities
    ==============================*/
    function inicializarColores() {
        const colorTarjetas = document.querySelectorAll('.color');
        
        colorTarjetas.forEach(tarjeta => {
            const r = tarjeta.dataset.r;
            const g = tarjeta.dataset.g;
            const b = tarjeta.dataset.b;
            tarjeta.style.background = `rgb(${r}, ${g}, ${b})`;
        });
    }

    /*==============================
        Group Handlers
    ==============================*/

    function inicializarGrupos() {
        const tarjetas = document.querySelectorAll('.tarjeta-color');
        
        tarjetas.forEach(tarjeta => {
            tarjeta.addEventListener('click', function() {
                const grupoData = JSON.parse(this.dataset.datos);
                window.openColorModal(grupoData);
            });
        });
    }



    /*==============================
        Pagination Logic
    ==============================*/
    async function loadPage(page) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        loadingSpinner.style.display = 'flex';
        container.style.opacity = '0.5';

        try {
            const response = await fetch(`/formulacion?page=${page}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) throw new Error('Error al cargar datos');

            const data = await response.json();
            
            currentPage = data.page;
            totalPages = data.total_paginas;
            totalGroups = data.total_grupos;
            totalRecords = data.total_registros;

            renderGroups(data.grupos);
            updatePaginationControls();
            initializeCategoryFilter();
            


        } catch (error) {
            console.error('Error:', error);
            showAlertGrandes('Error al cargar los productos. Por favor intenta de nuevo.', "error");
        } finally {
            loadingSpinner.style.display = 'none';
            container.style.opacity = '1';
        }
    }

    function renderGroups(grupos) {
        container.innerHTML = '';
        
        grupos.forEach((grupo, index) => {
            const grupoDiv = createGroupElement(grupo);
            container.appendChild(grupoDiv);
        });

        //inicializarColores();
        inicializarGrupos();
        updateRangeDisplay(grupos.length);
    }

    function createGroupElement(grupo) {
        const grupoDiv = document.createElement('div');
        grupoDiv.className = 'grupo-color';
        
        const tarjeta = createGroupCard(grupo);
        const listaDiv = createProductsList(grupo.datos);
        
        tarjeta.addEventListener('click', function() {
            const grupoData = JSON.parse(this.dataset.datos);
            window.openColorModal(grupoData);
        });
        
        grupoDiv.appendChild(tarjeta);
        grupoDiv.appendChild(listaDiv);
        
        return grupoDiv;
    }

    function createGroupCard(grupo) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-color';
        tarjeta.style.cursor = 'pointer';
        
        tarjeta.dataset.nombre = grupo.name_color;
        tarjeta.dataset.r = grupo.rgb.r;
        tarjeta.dataset.g = grupo.rgb.g;
        tarjeta.dataset.b = grupo.rgb.b;
        
        tarjeta.dataset.datos = JSON.stringify(grupo);
        
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color';
        colorDiv.dataset.r = grupo.rgb.r;
        colorDiv.dataset.g = grupo.rgb.g;
        colorDiv.dataset.b = grupo.rgb.b;

        colorDiv.style.background = `rgb(${grupo.rgb.r}, ${grupo.rgb.g}, ${grupo.rgb.b})`;
    
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'color-info';
        infoDiv.innerHTML = `${grupo.name_color}`;
        
        tarjeta.appendChild(colorDiv);
        tarjeta.appendChild(infoDiv);
        
        return tarjeta;
    }

    function createProductsList(productos) {
        const listaDiv = document.createElement('div');
        listaDiv.className = 'productos-list';
        listaDiv.style.display = 'none';
        
        productos.forEach(producto => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'producto-item';
            itemDiv.innerHTML = `<strong>${producto.name_product}</strong>`;
            listaDiv.appendChild(itemDiv);
        });
        
        return listaDiv;
    }

    function updateRangeDisplay(groupsCount) {
        const rangeStart = (currentPage - 1) * itemsPerPage + 1;
        const rangeEnd = (currentPage - 1) * itemsPerPage + groupsCount;
        
        document.getElementById('range-start').textContent = rangeStart;
        document.getElementById('range-end').textContent = rangeEnd;
        document.getElementById('total-grupos').textContent = totalGroups;
        document.getElementById('total').textContent = totalRecords;
    }

    function updatePaginationControls() {
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;
        renderPageNumbers();
    }

    function renderPageNumbers() {
        pageNumbersContainer.innerHTML = '';
        const pagesToShow = calculatePagesToShow();
        
        let lastPage = 0;
        pagesToShow.forEach(pageNum => {
            if (pageNum - lastPage > 1) {
                appendEllipsis();
            }
            appendPageButton(pageNum);
            lastPage = pageNum;
        });
    }

    function calculatePagesToShow() {
        const pages = [1];
        
        for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
            pages.push(i);
        }
        
        if (totalPages > 1) {
            pages.push(totalPages);
        }
        
        return pages;
    }

    function appendEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'page-ellipsis';
        ellipsis.textContent = '...';
        pageNumbersContainer.appendChild(ellipsis);
    }

    function appendPageButton(pageNum) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-number';
        pageBtn.textContent = pageNum;
        
        if (pageNum === currentPage) {
            pageBtn.classList.add('active');
        }
        
        pageBtn.addEventListener('click', () => loadPage(pageNum));
        pageNumbersContainer.appendChild(pageBtn);
    }


    /*==============================
        Filter Page Numbers
    ==============================*/
    function appendPageButtonFilter(pageNum) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-number';
        pageBtn.textContent = pageNum;
        
        if (pageNum === currentPage) {
            pageBtn.classList.add('active');
        }
        
        pageBtn.addEventListener('click', () => aplicarFiltro(pageNum));
        pageNumbersContainer.appendChild(pageBtn);
    }

    function renderPageNumbersFilter() {
        pageNumbersContainer.innerHTML = '';
        
        // Si solo hay una página, no mostrar números
        if (totalPages <= 1) {
            return;
        }
        
        const pagesToShow = calculatePagesToShow();
        
        let lastPage = 0;
        pagesToShow.forEach(pageNum => {
            if (pageNum - lastPage > 1) {
                appendEllipsis();
            }
            appendPageButtonFilter(pageNum);  // Usar la versión para filtro
            lastPage = pageNum;
        });
    }


    
    /*==============================
        Event Listeners
    ==============================*/
    const handlePrevClick = () => {
        if (currentPage > 1) {
            loadPage(currentPage - 1);
        }
    };

    btnPrev.addEventListener('click', handlePrevClick);

    const handlenextClick = () => {
        if (currentPage < totalPages) {
            loadPage(currentPage + 1);
        }
    };

    btnNext.addEventListener('click', handlenextClick);

    function removeOriginalListeners() {
        btnPrev.removeEventListener('click', handlePrevClick);
        btnNext.removeEventListener('click', handlenextClick);
        console.log('✓ Listeners originales removidos');
    }

    function restoreOriginalListeners() {
        // Remover listeners del filtro si existen
        if (handlePrevClickFilter) {
            btnPrev.removeEventListener('click', handlePrevClickFilter);
            handlePrevClickFilter = null;
        }
        if (handleNextClickFilter) {
            btnNext.removeEventListener('click', handleNextClickFilter);
            handleNextClickFilter = null;
        }
        
        // Restaurar listeners originales
        btnPrev.addEventListener('click', handlePrevClick);
        btnNext.addEventListener('click', handlenextClick);
        
        renderPageNumbers();
        
        isFilterActive = false;
    }


    /*==============================
        Initialize
    ==============================*/
    inicializarColores();
    inicializarGrupos();
    updatePaginationControls();



    let categorySelectInstance = null;

    async function loadColorNames() {
        try {
            const response = await fetch('/api/colores');
            const colores = await response.json();
            
            const select = document.getElementById('filter-category');
            select.innerHTML = '<option value="">Todos los colores</option>';
            
            // Insertar opciones de forma eficiente
            const fragment = document.createDocumentFragment();
            colores.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                fragment.appendChild(option);
            });
            select.appendChild(fragment);
            select.disabled = false;

            // Inicializar Tom Select después de cargar las opciones
            initializeCategoryFilter();
            
        } catch (error) {
            console.error('Error cargando colores:', error);
            select.disabled = true;
            document.getElementById('filter-category').innerHTML = 
                '<option value="">Error al cargar colores</option>';
        }
    }

    function initializeCategoryFilter() {
        if (categorySelectInstance) {
            categorySelectInstance.destroy();
        }
        
        categorySelectInstance = new TomSelect('#filter-category', {
            allowEmptyOption: true,
            create: false,
            maxOptions: null,
            closeAfterSelect: true,
            hidePlaceholder: false,
            openOnFocus: true,        
            selectOnTab: true,
            searchField: ['text'],

            render: {
                option: function(data, escape) {
                    return '<div class="option">' + escape(data.text) + '</div>';
                },
                item: function(data, escape) {
                    return '<div class="item">' + escape(data.text) + '</div>';
                },
                no_results: function(data, escape) {
                    return '<div class="no-results">No se encontraron resultados para "' + escape(data.input) + '"</div>';
                }
            },

            plugins: [],

            preload: false
        });
    }

    loadColorNames();

    function initializeClearFilters() {
        const btnClearFilters = document.getElementById('btnClearFilters');

        btnClearFilters.addEventListener('click', function() {
            categorySelectInstance.clear();
            
            // Restaurar listeners originales si había filtro activo
            if (isFilterActive) {
                restoreOriginalListeners();
            }
            
            loadPage(1);
            
            const paginationControls = document.querySelector('.pagination-controls');
            if (paginationControls) {
                paginationControls.style.display = 'flex';
            }
            
            console.log('✓ Filtros limpiados y navegación restaurada');
        });
    }

    const btnBuscar = document.getElementById('btn-buscar');
    btnBuscar.addEventListener('click', () => {
        applyFilters();
    });

    function applyFilters() {

        const nombreColor = categorySelectInstance.getValue();

        if (!nombreColor || nombreColor === '') {
            showAlertGrandes('No ha seleccionado el nombre del color');
            return;
        }

        sendDataFilter(nombreColor);
    }

    async function sendDataFilter(nombreColor) {
        // Mostrar spinner y ocultar contenido
        window.scrollTo({ top: 0, behavior: 'smooth' });
        loadingSpinner.style.display = 'flex';
        container.style.opacity = '0.5';
        
        try {
            // Preparar los datos a enviar
            const dataToSend = {
                nombreColor: nombreColor,
            };

            console.log('Enviando datos al servidor:', dataToSend);
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                console.error('No se encontró el token CSRF');
                throw new Error('Token CSRF no disponible');
            }

            const formData = new FormData();
            formData.append('data', JSON.stringify(dataToSend));
            
            const response = await fetch('/api/filtrarNombre', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken  
                },
                body: formData
            });
            
            console.log('Código de respuesta:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            console.log('Respuesta del servidor:', result);
            
            if (result.success) {
                console.log('✓ Datos recibidos correctamente');
                
                if (result.data && result.data.productos && result.data.productos.length > 0) {
                    renderFilteredResults(result.data);
            
                    updateFilterInfo(result.data);
                } else {
                    // No hay resultados
                    showNoResults(nombreColor);
                }
                
            } else {
                showAlertGrandes("Hubo un error en el servidor", "error");
                console.error('✗ Error en el servidor:', result.message);
            }

        } catch (error) {
            console.error('═══════════════════════════════════════');
            console.error('ERROR AL ENVIAR DATOS:');
            console.error('Mensaje:', error.message);
            console.error('═══════════════════════════════════════');
            showAlertGrandes('Error al filtrar. Por favor intenta de nuevo.', "error");
            
        } finally {
            // Ocultar spinner y restaurar opacidad
            loadingSpinner.style.display = 'none';
            container.style.opacity = '1';
        }
    }

    function renderFilteredResults(data) {
        container.innerHTML = '';
        
        const productos = data.productos || [];
        
        // Crear el grupo del color filtrado
        const grupo = {
            name_color: data.name_color,
            rgb: data.rgb,
            rgb_string: data.rgb_string,
            base_color: data.base_color || 'Sin base',
            count: productos.length,
            datos: productos
        };
        
        const grupoDiv = createGroupElement(grupo);
        container.appendChild(grupoDiv);

        inicializarGrupos();
        
        console.log(`✓ Renderizados ${productos.length} productos para el color ${data.name_color}`);
    }

    function updateFilterInfo(data) {
        const totalProductos = data.productos ? data.productos.length : 0;
        
        document.getElementById('range-start').textContent = totalProductos > 0 ? 1 : 0;
        document.getElementById('range-end').textContent = totalProductos;
        document.getElementById('total-grupos').textContent = totalProductos > 0 ? 1 : 0;
        document.getElementById('total').textContent = totalProductos;
        
        const paginationControls = document.querySelector('.pagination-controls');
        if (paginationControls) {
            paginationControls.style.display = 'none';
        }
    }

    function showNoResults(nombreColor) {
        container.innerHTML = `
            <div class="no-results" style="
                grid-column: 1 / -1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                text-align: center;
            ">
                <svg style="width: 4rem; height: 4rem; color: #9CA3AF; margin-bottom: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 style="color: #374151; font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
                    No se encontraron resultados
                </h3>
                <p style="color: #6B7280; font-size: 0.875rem;">
                    No hay productos disponibles para el color "<strong>${nombreColor}</strong>"
                </p>
            </div>
        `;
        
        // Actualizar info de paginación
        document.getElementById('range-start').textContent = 0;
        document.getElementById('range-end').textContent = 0;
        document.getElementById('total-grupos').textContent = 0;
        document.getElementById('total').textContent = 0;
        
        // Ocultar controles de paginación
        const paginationControls = document.querySelector('.pagination-controls');
        if (paginationControls) {
            paginationControls.style.display = 'none';
        }
    }

    initializeClearFilters();










    // ==========================================
    // VARIABLES GLOBALES DEL COLOR PICKER
    // ==========================================
    let baseColor = { r: 104, g: 34, b: 34 }; // Color base inicial
    let currentTolerance = (52 / 100) * 8; // Tolerancia inicial
    let currentRanges = null; // Rangos calculados actuales

    // ==========================================
    // INICIALIZAR COLOR PICKER
    // ==========================================
    function initializeColorPicker() {
        const backgroundElement = document.getElementById('color-background');
        const rgbText = document.getElementById('rgb-base-text');
        const customButton = document.getElementById('custom-color-button');
        const filterSteps = document.querySelectorAll('.filter-step');
        
        // Inicializar Pickr en el elemento oculto
        const pickr = Pickr.create({
            el: '#color-base-display', 
            theme: 'monolith', 
            default: 'rgb(104, 34, 34)',
            
            swatches: [
                'rgb(244, 67, 54)',
                'rgb(233, 30, 99)',
                'rgb(156, 39, 176)',
                'rgb(103, 58, 183)',
                'rgb(63, 81, 181)',
                'rgb(33, 150, 243)',
                'rgb(3, 169, 244)',
                'rgb(0, 188, 212)',
                'rgb(0, 150, 136)',
                'rgb(76, 175, 80)',
                'rgb(139, 195, 74)',
                'rgb(205, 220, 57)',
                'rgb(255, 235, 59)',
                'rgb(255, 193, 7)'
            ],
            
            components: {
                preview: true,
                opacity: false, 
                hue: true,
                interaction: {
                    hex: true,
                    rgba: false,
                    hsla: false,
                    hsva: false,
                    cmyk: false,
                    input: true,
                    clear: false,
                    save: true
                }
            },
            
            strings: {
                save: 'Aplicar',  
                clear: 'Limpiar'
            }
        });

        // Al hacer clic en el botón custom, abrir Pickr
        if (customButton) {
            customButton.addEventListener('click', () => {
                filterSteps.forEach(step => {
                    const dataStep = step.getAttribute('data-step');
                    if (dataStep === "1") {
                        step.classList.add('active');
                    } else {
                        step.classList.remove('active');
                    }
                });
                pickr.show();
            });
        }
        
        // Evento cuando se cambia el color
        pickr.on('change', (color, instance) => {
            const rgbColor = color.toRGBA();
            const rgbString = `rgb(${Math.round(rgbColor[0])}, ${Math.round(rgbColor[1])}, ${Math.round(rgbColor[2])})`;
            
            // Actualizar color base global
            baseColor = {
                r: Math.round(rgbColor[0]),
                g: Math.round(rgbColor[1]),
                b: Math.round(rgbColor[2])
            };
            
            console.log(`Nuevo color base:`, baseColor);
            
            // Cambiar el fondo
            if (backgroundElement) {
                backgroundElement.style.backgroundColor = rgbString;
            }
            
            // Actualizar texto RGB
            if (rgbText) {
                rgbText.textContent = rgbString;
            }

            // Recalcular rangos con la tolerancia actual
            updateColorRanges();
        });
        
        pickr.on('save', (color, instance) => {
            const rgbColor = color.toRGBA();
            const rgbString = `rgb(${Math.round(rgbColor[0])}, ${Math.round(rgbColor[1])}, ${Math.round(rgbColor[2])})`;
            
            console.log(`Color guardado: ${rgbString}`);

            // Cambiar al step 2 (Tolerancia)
            filterSteps.forEach(step => {
                const dataStep = step.getAttribute('data-step');
                if (dataStep === "2") {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
            
            pickr.hide();
        });
        
        // Color inicial
        pickr.setColor('rgb(104, 34, 34)');
        
        // Aplicar color inicial 
        if (backgroundElement) {
            backgroundElement.style.backgroundColor = 'rgb(104, 34, 34)';
        }
    }

    // ==========================================
    // INICIALIZAR SLIDER DE TOLERANCIA
    // ==========================================
    function initializeToleranceSlider() {
        const slider = document.getElementById('tolerance-slider');
        const valueDisplay = document.getElementById('tolerance-value');
        const filterSteps = document.querySelectorAll('.filter-step');

        if (!slider || !valueDisplay) {
            console.error('Slider o display de tolerancia no encontrado');
            return;
        }

        const initialSliderValue = parseInt(slider.value); 
        const initialRealValue = (initialSliderValue / 100) * 8; 
        valueDisplay.textContent = initialRealValue.toFixed(2); 
        currentTolerance = initialRealValue;

        slider.addEventListener('input', function() {
            const sliderValue = parseInt(this.value);
            const realValue = (sliderValue / 100) * 8; 
            
            valueDisplay.textContent = realValue.toFixed(2); 
            currentTolerance = realValue; 
            

            updateColorRanges();
        });

        // Al soltar el slider, pasar al step 3
        slider.addEventListener('change', function() {
            console.log(`Tolerancia final: ${currentTolerance}%`);
            
            // Cambiar al step 3 (Rangos RGB)
            filterSteps.forEach(step => {
                const dataStep = step.getAttribute('data-step');
                if (dataStep === "3") {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        });
    }

    // ==========================================
    // CALCULAR Y ACTUALIZAR RANGOS DE COLOR
    // ==========================================
    function updateColorRanges() {
        // Calcular el factor de tolerancia (0-100% -> 0-255)
        const toleranceFactor = (currentTolerance / 100) * 255;

        // Calcular rangos Min y Max para cada canal
        const ranges = {
            r: {
                min: Math.max(0, Math.round(baseColor.r - toleranceFactor)),
                max: Math.min(255, Math.round(baseColor.r + toleranceFactor))
            },
            g: {
                min: Math.max(0, Math.round(baseColor.g - toleranceFactor)),
                max: Math.min(255, Math.round(baseColor.g + toleranceFactor))
            },
            b: {
                min: Math.max(0, Math.round(baseColor.b - toleranceFactor)),
                max: Math.min(255, Math.round(baseColor.b + toleranceFactor))
            }
        };

        // Guardar rangos actuales para usarlos después
        currentRanges = ranges;

        // Actualizar los swatches de preview
        const previewMin = document.getElementById('preview-min');
        const previewBase = document.getElementById('preview-base');
        const previewMax = document.getElementById('preview-max');

        if (previewMin) {
            previewMin.style.backgroundColor = `rgb(${ranges.r.min}, ${ranges.g.min}, ${ranges.b.min})`;
        }
        if (previewBase) {
            previewBase.style.backgroundColor = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        }
        if (previewMax) {
            previewMax.style.backgroundColor = `rgb(${ranges.r.max}, ${ranges.g.max}, ${ranges.b.max})`;
        }

        // Actualizar los textos de rangos
        const rRangeText = document.getElementById('r-range');
        const gRangeText = document.getElementById('g-range');
        const bRangeText = document.getElementById('b-range');

        if (rRangeText) rRangeText.textContent = `${ranges.r.min} - ${ranges.r.max}`;
        if (gRangeText) gRangeText.textContent = `${ranges.g.min} - ${ranges.g.max}`;
        if (bRangeText) bRangeText.textContent = `${ranges.b.min} - ${ranges.b.max}`;
    }

    // ==========================================
    // APLICAR FILTRO DE COLOR (LLAMAR AL API)
    // ==========================================
    async function aplicarFiltro(page) {
        if (!currentRanges) {
            showAlertGrandes('Por favor, primero selecciona un color y ajusta la tolerancia', 'warning');
            return;
        }

        const filterSteps = document.querySelectorAll('.filter-step');
        const btnApply = document.querySelector('.btn-apply');
        
        // Mostrar spinner y ocultar contenido (igual que en el otro filtro)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        loadingSpinner.style.display = 'flex';
        container.style.opacity = '0.5';
        
        // Deshabilitar botón
        btnApply.disabled = true;
        btnApply.innerHTML = '<span>Aplicando...</span>';

        try {
            const dataToSendRange = {
                r_min: currentRanges.r.min,
                r_max: currentRanges.r.max,
                g_min: currentRanges.g.min,
                g_max: currentRanges.g.max,
                b_min: currentRanges.b.min,
                b_max: currentRanges.b.max,
                page: page,
                per_page: 50
            };
            
            console.log(' Enviando datos al servidor:', dataToSendRange);
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                console.error(' No se encontró el token CSRF');
                throw new Error('Token CSRF no disponible');
            }

            const formData = new FormData();
            formData.append('data', JSON.stringify(dataToSendRange));
            
            const response = await fetch('/api/filtrarRango', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken  
                },
                body: formData
            });
            
            console.log('Código de respuesta:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                currentPage = result.page;
                totalPages = result.total_pages;
            
                if (result.grupos && result.grupos.length > 0) {
                    renderMultipleGroups(result.grupos);
                    updateFilterInfoRange(result);
                } else {
                    const rangoTexto = `el rango RGB (R:${currentRanges.r.min}-${currentRanges.r.max}, G:${currentRanges.g.min}-${currentRanges.g.max}, B:${currentRanges.b.min}-${currentRanges.b.max})`;
                    showNoResults(rangoTexto);
                }
                
                // Cerrar los steps del filtro
                filterSteps.forEach(step => {
                    step.classList.remove('active');
                });

                if (!isFilterActive) {
                    removeOriginalListeners();
                    isFilterActive = true;
                } else {

                    if (handlePrevClickFilter) {
                        btnPrev.removeEventListener('click', handlePrevClickFilter);
                    }
                    if (handleNextClickFilter) {
                        btnNext.removeEventListener('click', handleNextClickFilter);
                    }
                }

                handleNextClickFilter = () => {
                    console.log(` Navegando a página ${currentPage + 1} (filtro activo)`);
                    if (currentPage < result.total_pages) {
                        aplicarFiltro(currentPage + 1);
                    }
                };

                handlePrevClickFilter = () => {
                    console.log(`⬅ Navegando a página ${currentPage - 1} (filtro activo)`);
                    if (currentPage > 1) {
                        aplicarFiltro(currentPage - 1);
                    }
                };

                // Agregar los nuevos listeners
                btnNext.addEventListener('click', handleNextClickFilter);
                btnPrev.addEventListener('click', handlePrevClickFilter);
                
                // Actualizar estado de los botones
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage === result.total_pages;
                
                renderPageNumbersFilter();
                
            } else {
                showAlertGrandes("Hubo un error en el servidor", "error");
                console.error('Error en el servidor:', result.message);
            }

        } catch (error) {
            console.error('═══════════════════════════════════════');
            console.error(' ERROR AL ENVIAR DATOS:');
            console.error('Mensaje:', error.message);
            console.error('═══════════════════════════════════════');
            showAlertGrandes('Error al filtrar. Por favor intenta de nuevo.', "error");
            
        } finally {
            // Ocultar spinner y restaurar opacidad
            loadingSpinner.style.display = 'none';
            container.style.opacity = '1';
            
            // Restaurar botón
            btnApply.disabled = false;
            btnApply.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Aplicar Filtro
            `;
        }
    }

    // ==========================================
    // RENDERIZAR MÚLTIPLES GRUPOS 
    // ==========================================
    function renderMultipleGroups(grupos) {
        container.innerHTML = '';
        
        if (!grupos || grupos.length === 0) {
            showNoResults('el rango seleccionado');
            return;
        }
        
        // Renderizar cada grupo usando createGroupElement existente
        grupos.forEach(grupo => {
            const grupoDiv = createGroupElement(grupo);
            container.appendChild(grupoDiv);
        });

        inicializarGrupos();
        
        console.log(`✓ Renderizados ${grupos.length} grupos de colores`);
    }


    function updateFilterInfoRange(responseData) {
        const { total, page, per_page, grupos } = responseData;
        
        const start = (page - 1) * per_page + 1;
        const end = Math.min(start + grupos.length - 1, total);
        
        document.getElementById('range-start').textContent = total > 0 ? start : 0;
        document.getElementById('range-end').textContent = total > 0 ? end : 0;
        document.getElementById('total-grupos').textContent = total;
        
        // Calcular total de fórmulas (suma de todos los count)
        const totalFormulas = grupos.reduce((sum, grupo) => sum + grupo.count, 0);
        document.getElementById('total').textContent = totalFormulas;
        
        const paginationControls = document.querySelector('.pagination-controls');
        if (paginationControls) {

            paginationControls.style.display = responseData.total_pages > 1 ? 'flex' : 'none';
        }
    }

    // ==========================================
    // LIMPIAR FILTRO
    // ==========================================
    window.limpiarFiltro = function() {
        const filterSteps = document.querySelectorAll('.filter-step');
        
        // Resetear variables globales
        baseColor = { r: 104, g: 34, b: 34 };
        currentTolerance = (52 / 100) * 8;
        currentRanges = null;

        // Resetear slider
        const slider = document.getElementById('tolerance-slider');
        const valueDisplay = document.getElementById('tolerance-value');
        if (slider) slider.value = currentTolerance;
        if (valueDisplay) valueDisplay.textContent = currentTolerance;

        // Resetear color picker
        const backgroundElement = document.getElementById('color-background');
        const rgbText = document.getElementById('rgb-base-text');
        
        if (backgroundElement) {
            backgroundElement.style.backgroundColor = 'rgb(104, 34, 34)';
        }
        if (rgbText) {
            rgbText.textContent = 'rgb(104, 34, 34)';
        }

        // Recalcular rangos con valores iniciales
        updateColorRanges();

        // Volver al step 1
        filterSteps.forEach(step => {
            const dataStep = step.getAttribute('data-step');
            if (dataStep === "1") {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // *** NUEVO: Restaurar listeners originales ***
        if (isFilterActive) {
            restoreOriginalListeners();
        }
        
        // Recargar la primera página con datos normales
        loadPage(1);

        console.log(' Filtro reiniciado y navegación restaurada');
    };

    // ==========================================
    // INICIALIZAR TODO
    // ==========================================
    if (typeof Pickr !== 'undefined') {
        initializeColorPicker();
        initializeToleranceSlider();
        updateColorRanges(); // Calcular rangos iniciales
        
        const applyButton = document.querySelector('.btn-apply');
        if (applyButton) {
            applyButton.addEventListener('click', () => aplicarFiltro(1));  
        }
    } else {
        console.error('Pickr no está cargado');
    }
});






/*==============================
    Modal Module
==============================*/
document.addEventListener('DOMContentLoaded', function() {
    const modalElements = {
        overlay: document.getElementById('modalOverlay'),
        close: document.getElementById('modalClose'),
        btnCopy: document.getElementById('btnCopyColor'),
        colorName: document.getElementById('modalColorName'),
        colorRGB: document.getElementById('modalColorRGB'),
        colorPreview: document.getElementById('modalColorPreview'),
        productosList: document.getElementById('modalProductosList')
    };

    let currentColorData = null;
    let productosSelectInstance = null;
    let presentacionIntance = null;

    /*==============================
        Modal Core Functions
    ==============================*/
    function openModal(grupoData) {

        const baseName= document.querySelector('.base-name');
        baseName.textContent = grupoData.base_color;

        const colorCodeDisplay = document.getElementById('colorCodeDisplay');
        colorCodeDisplay.textContent= grupoData.name_color;

        currentColorData = grupoData;
        updateColorPreview(grupoData.rgb);
        if (grupoData.datos && grupoData.datos.length > 0) {
            initializeProductsSelect(grupoData.datos);
        } else {
            console.warn('No hay productos disponibles para este color');
        }
        initializeProductsSelect(grupoData.datos);
        
        showModal();
    }

    function closeModal() {
        hideModal();
        reiniziarGridTintas()
        if (productosSelectInstance) {
            productosSelectInstance.clear();
        }
        
        if (presentacionIntance) {
            presentacionIntance.clear();
        }
        /*setTimeout(() => {
            cleanupModal();
        }, 300);*/
    }

    function showModal() {
        modalElements.overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modalElements.overlay.classList.remove('show');
        document.body.style.overflow = '';
    }


    /*==============================
        Modal UI Updates
    ==============================*/
    function updateColorPreview(rgb) {
        const { r, g, b } = rgb;
        modalElements.colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }



    /*==============================
    Products Select Initialization
==============================*/
    function initializeProductsSelect(productos) {
        const selectElement = document.getElementById('filterProductos');
        const selectGalonElement = document.getElementById('filterGalon');
        
        if (productosSelectInstance) {
            productosSelectInstance.destroy();
        }

        if (presentacionIntance) {
            presentacionIntance.destroy();
        }
        
        populateSelectOptions(selectElement, productos);
        productosSelectInstance = createTomSelectProductosInstance(selectElement);
        presentacionIntance = createTomSelectGalonesInstance(selectGalonElement);
    }

    function populateSelectOptions(selectElement, productos) {
        selectElement.innerHTML = '<option value="">Selecciona un producto</option>';
        
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.name_product;
            option.textContent = producto.name_product;
            selectElement.appendChild(option);
        });
    }

    function createTomSelectProductosInstance(selectElement) {
        return new TomSelect('#filterProductos', {
            placeholder: 'Selecciona un producto',
            allowEmptyOption: true,
            create: false,
            maxOptions: null,
            closeAfterSelect: true,
            hidePlaceholder: false,
            openOnFocus: true,
            selectOnTab: true,
            searchField: ['text'],
            
            render: {
                option: function(data, escape) {
                    return '<div class="option">' + escape(data.text) + '</div>';
                },
                item: function(data, escape) {
                    return '<div class="item">' + escape(data.text) + '</div>';
                },
                no_results: function(data, escape) {
                    return '<div class="no-results">No se encontraron resultados</div>';
                }
            },
            
            plugins: [],
            preload: false,
            
            onChange: function(value) {
                if (value) {
                    setTimeout(() => {
                        this.close();
                        this.blur();
                    }, 50);
                }
                
                // Llamar al handler
                handleSelectionChange('producto');
            }
        });
    }

    function createTomSelectGalonesInstance(selectElement) {
        return new TomSelect('#filterGalon', {
            placeholder: 'Selecciona una presentación',
            allowEmptyOption: true,
            create: false,
            maxOptions: null,
            closeAfterSelect: true,
            hidePlaceholder: false,
            openOnFocus: true,
            selectOnTab: true,
            searchField: ['text'],
            
            render: {
                option: function(data, escape) {
                    return '<div class="option">' + escape(data.text) + '</div>';
                },
                item: function(data, escape) {
                    return '<div class="item">' + escape(data.text) + '</div>';
                },
                no_results: function(data, escape) {
                    return '<div class="no-results">No se encontraron resultados</div>';
                }
            },
            
            plugins: [],
            preload: false,
            

            onChange: function(value) {
                if (value) {
                    setTimeout(() => {
                        this.close();
                        this.blur();
                    }, 50);
                }
                
                handleSelectionChange('galon');
            }
        });
    }

    /*==============================
        Handle Selection Change
    ==============================*/
    function handleSelectionChange(changedSelect) {
        console.log(`Cambió el select: ${changedSelect}`);
    
        const productoValue = productosSelectInstance.getValue();
        const galonValue = presentacionIntance.getValue();
        
        console.log('Producto actual:', productoValue);
        console.log('Galón actual:', galonValue);
        
        if (!productoValue || productoValue === '') {
            console.warn(' Falta seleccionar un producto');
            return;
        }
        
        if (!galonValue || galonValue === '') {
            console.warn('Falta seleccionar una presentación');
            return;
        }
        
        const productoCompleto = currentColorData.datos.find(
            producto => producto.name_product === productoValue
        );
        
        if (!productoCompleto) {
            console.error(' No se encontró el producto en los datos actuales');
            showAlertGrandes(' No se encontró el producto en los datos actuales', 'error')
            return;
        }
        
        sendDataToServer(productoCompleto, galonValue);
    }

/*==============================
    Send Data to Server
==============================*/
    async function sendDataToServer(productoData, presentacion) {
        try {
            // Preparar los datos a enviar
            const dataToSend = {
                producto: {
                    name_product: productoData.name_product,
                    name_color: productoData.name_color || currentColorData.name_color,
                    name_base: productoData.name_base
                },
                presentacion: presentacion,
                color_grupo: {
                    name_color: currentColorData.name_color,
                    rgb: currentColorData.rgb
                }
            };

            console.log('Enviando datos al servidor:', dataToSend);
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                console.error('No se encontró el token CSRF');
                throw new Error('Token CSRF no disponible');
            }

            const formData = new FormData();
            formData.append('data', JSON.stringify(dataToSend));
            
            const response = await fetch('/formyPost', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken  
                },
                body: formData
            });
            
            console.log('Código de respuesta:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            console.log('Respuesta del servidor:', result);
            
            if (result.success) {
                const colores = result.colores;
                const datos = result.datos;
                renderizarFormula(colores, datos)
            } else {
                showAlertGrandes("Hubo un error en el servidor", "error")
                console.error('✗ Error en el servidor:', result.message);
            }

        } catch (error) {
            console.error('═══════════════════════════════════════');
            console.error('ERROR AL ENVIAR DATOS:');
            console.error('Mensaje:', error.message);
            console.error('═══════════════════════════════════════');
        }
    }

    function reiniziarGridTintas(){
        const tintasGrid = document.getElementById('tintasGrid');
            tintasGrid.innerHTML = `
                <div class="formula-empty-state" style="grid-column: 1 / -1;">
                    <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="empty-state-text">Seleccione un producto para ver la fórmula</p>
                </div>
            `;
    }

    function renderizarFormula(colores, datos) {
        const tintasGrid = document.getElementById('tintasGrid');

        // Limpiar el grid antes de renderizar
        tintasGrid.innerHTML = '';
        
        // Mapeo de códigos a colores hexadecimales
        const coloresMap = {
            'BLK': { rgb: 'rgb(14, 19, 12)', name: 'Negro' },
            'YOX': { rgb: 'rgb(170, 60, 23)', name: 'Naranja Óxido' },
            'OXR': { rgb: 'rgb(50, 25, 18)', name: 'Óxido Rojo' },
            'TBL': { rgb: 'rgb(14, 49, 131)', name: 'Azul Tinte' },
            'GRN': { rgb: 'rgb(27, 113, 76)', name: 'Verde' },
            'LFY': { rgb: 'rgb(238, 157, 65)', name: 'Amarillo Limón' },
            'MAG': { rgb: 'rgb(166, 48, 96)', name: 'Magenta' },
            'FFR': { rgb: 'rgb(219, 71, 57)', name: 'Rojo Fuego' },
            'WHT': { rgb: 'rgb(255, 255, 255)', name: 'Blanco' },

            'LB': { rgb: 'rgb(65, 105, 225)', name: 'Azul Claro' },
            'MY': { rgb: 'rgb(220, 20, 60)', name: 'Rojo Medio' },
            'OY': { rgb: 'rgb(255, 165, 0)', name: 'Naranja Amarillo' },
            'PB': { rgb: 'rgb(75, 0, 130)', name: 'Púrpura Azul' },
            'PG': { rgb: 'rgb(139, 71, 137)', name: 'Púrpura Gris' },
            'QV': { rgb: 'rgb(102, 51, 153)', name: 'Violeta' },
            'RO': { rgb: 'rgb(205, 92, 92)', name: 'Rojo Óxido' },
            'QR': { rgb: 'rgb(178, 34, 34)', name: 'Rojo Quemado' },
            'TW': { rgb: 'rgb(245, 222, 179)', name: 'Trigo' },
            'UO': { rgb: 'rgb(255, 140, 0)', name: 'Naranja Oscuro' },
            'YO': { rgb: 'rgb(255, 223, 0)', name: 'Amarillo Oro' }
        };
        
        if (!colores || colores.length === 0) {
            tintasGrid.innerHTML = `
                <div class="formula-empty-state" style="grid-column: 1 / -1;">
                    <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="empty-state-text">Seleccione un producto para ver la fórmula</p>
                </div>
            `;
            return;
        }
        

        const coloresClaros = ['WHT', 'LFY', 'TW', 'YO', 'OY'];

        colores.forEach(color => {
            const codigo = color.codigo;
            const colorData = coloresMap[codigo] || { hex: '#CCCCCC', rgb: 'rgb(204, 204, 204)', name: codigo };
            const medida = color.medida_calculada; // Objeto con onzas, partes_64, partes_128
            

            const isLightColor = coloresClaros.includes(codigo);
            const labelColor = isLightColor ? '#333333' : '#ffffff';

            const borderStyle = codigo === 'WHT' ? 'border: 2px solid #e5e7eb;' : '';
            

            let medidasHTML = '';
            
            if (medida.onzas > 0) {
                medidasHTML += `
                    <div class="tinta-medida">
                        <span class="tinta-parts">${medida.onzas} Onzas</span>
                    </div>
                `;
            }
            
            if (medida.partes_64 > 0) {
                medidasHTML += `
                    <div class="tinta-medida">
                        <span class="tinta-parts">${medida.partes_64} Partes</span>
                        <span class="tinta-fraction">(1/64)</span>
                    </div>
                `;
            }
            
            if (medida.partes_128 > 0) {
                medidasHTML += `
                    <div class="tinta-medida">
                        <span class="tinta-parts">${medida.partes_128} Partes</span>
                        <span class="tinta-fraction">(1/128)</span>
                    </div>
                `;
            }
            
            // Si no hay medidas, mostrar 0
            if (medidasHTML === '') {
                medidasHTML = `
                    <div class="tinta-medida">
                        <span class="tinta-parts">0</span>
                    </div>
                `;
            }
            
            const tintaCard = document.createElement('div');
            tintaCard.className = 'tinta-card';
            
            tintaCard.innerHTML = `
                <div class="tinta-color" style="background-color: ${colorData.rgb}; ${borderStyle}">
                    <span class="tinta-label" style="color: ${labelColor};">${codigo}</span>
                </div>
                <div class="tinta-info">
                    ${medidasHTML}
                </div>
            `;
            
            tintasGrid.appendChild(tintaCard);
        });
    }


    /*==============================
        Event Listeners
    ==============================*/
    function initializeModalEvents() {
        modalElements.close.addEventListener('click', closeModal);

        
        modalElements.overlay.addEventListener('click', function(e) {
            if (e.target === modalElements.overlay) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalElements.overlay.classList.contains('show')) {
                closeModal();
            }
        });
    }

    /*==============================
        Initialize
    ==============================*/
    initializeModalEvents();
    window.openColorModal = openModal;



    
});


// Funcionalidad de tabs
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remover active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar active al botón clickeado y su contenido
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });


});

























function showAlertGrandes(message, category = 'success') {

    const alertContainer = document.createElement('div');
    alertContainer.className = 'contenedor-ShowAlert ';
    alertContainer.style.zIndex = '100000';
    alertContainer.style.left = '50%';
    alertContainer.style.transform = 'translateX(-50%)';

    if (category === 'error') {
        alertContainer.classList.add('error');

    } else if (category === 'atencion') {
        alertContainer.classList.add('atencion');

    } else {
        alertContainer.classList.add('bien');
    }
    
    const alertWrapper = document.createElement('div');
    alertWrapper.className = 'd-flex flex-column gap-2';
    alertWrapper.style.width = 'auto';
    alertWrapper.style.maxWidth = '24rem'; 
    alertWrapper.style.fontSize = '0.625rem'; 
    

    if (window.innerWidth >= 576) {
        alertWrapper.style.maxWidth = '32rem'; 
        alertWrapper.style.fontSize = '0.75rem'; 
    }
    
    const alertBox = document.createElement('div');
    alertBox.className = 'error-alert d-flex align-items-start w-100 rounded-3 px-2 py-3';
    alertBox.style.cursor = 'default';
    alertBox.style.minHeight = '3rem'; // min-h-12 (48px)
    alertBox.style.backgroundColor = 'var(--azul-dark)'; // Mantener color personalizado
    
    // Media query para sm breakpoint
    if (window.innerWidth >= 576) {
        alertBox.style.minHeight = '3.5rem'; // min-h-14 (56px)
    }
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'd-flex gap-3 align-items-start justify-content-between w-100';
    
    // Contenedor del icono (fijo en la parte superior)
    const iconContainer = document.createElement('div');
    let iconClasses = 'flex-shrink-0 mt-1 p-1 rounded-2';
    let iconStyles = 'background: rgba(255, 255, 255, 1); backdrop-filter: blur(12px);';
    
    if (category === 'error') {
        iconContainer.className = iconClasses;
        iconContainer.style.cssText = iconStyles + 'color: #d65563;';
    } else if (category === 'atencion') {
        iconContainer.className = iconClasses;
        iconContainer.style.cssText = iconStyles + 'color: #ffc107;';
    } else {
        iconContainer.className = iconClasses;
        iconContainer.style.cssText = iconStyles + 'color: #4caf50;';
    }
    
    const iconSpan = document.createElement('span');
    if (category === 'error') {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert-icon lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
    } else if (category === 'atencion') {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
    } else {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
    }
    
    // Contenido del mensaje (expandible)
    const messageContainer = document.createElement('div');
    messageContainer.className = 'd-flex flex-column flex-grow-1';
    messageContainer.style.minWidth = '0';
    
    const titleDiv = document.createElement('div');
    const titleText = document.createElement('h4');
    titleText.className = 'text-white fw-medium mb-2';
    
    if (category === 'error') {
        titleText.textContent = 'Error:';
    } else if (category === 'atencion') {
        titleText.textContent = 'Atención:';
    } else {
        titleText.textContent = 'Proceso Exitoso:';
    }
    
    const messageDiv = document.createElement('div');
    const messageText = document.createElement('p');
    messageText.className = 'text-white';
    messageText.style.fontSize = '0.875rem'; // text-sm
    messageText.style.lineHeight = '1.625'; // leading-relaxed
    messageText.style.whiteSpace = 'pre-line';
    messageText.style.wordBreak = 'break-word';
    messageText.textContent = message;
    
    // Botón de cerrar (fijo en la esquina superior)
    const closeButton = document.createElement('button');
    closeButton.className = 'd-flex close-btn flex-shrink-0 btn p-0 border-0 text-white';
    
    const closeIconContainer = document.createElement('div');
    let closeIconClasses = 'p-1 rounded-2 text-white';
    let closeIconStyles = 'background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); transition: background-color 0.15s ease-in-out;';
    
    if (category === 'error') {
        closeIconContainer.className = closeIconClasses;
        closeIconContainer.style.cssText = closeIconStyles + 'color: #d65563;';
    } else if (category === 'atencion') {
        closeIconContainer.className = closeIconClasses;
        closeIconContainer.style.cssText = closeIconStyles + 'color: #ffc107;';
    } else {
        closeIconContainer.className = closeIconClasses;
        closeIconContainer.style.cssText = closeIconStyles + 'color: #4caf50;';
    }
    
    // Hover effect
    closeIconContainer.addEventListener('mouseenter', () => {
        closeIconContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    closeIconContainer.addEventListener('mouseleave', () => {
        closeIconContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    });
    
    const closeIconSpan = document.createElement('span');
    closeIconSpan.className = 'material-symbols-rounded';
    closeIconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    
    // Ensamblar los elementos
    iconContainer.appendChild(iconSpan);
    titleDiv.appendChild(titleText);
    messageDiv.appendChild(messageText);
    messageContainer.appendChild(titleDiv);
    messageContainer.appendChild(messageDiv);
    closeIconContainer.appendChild(closeIconSpan);
    closeButton.appendChild(closeIconContainer);
    
    contentWrapper.appendChild(iconContainer);
    contentWrapper.appendChild(messageContainer);
    contentWrapper.appendChild(closeButton);
    
    alertBox.appendChild(contentWrapper);
    alertWrapper.appendChild(alertBox);
    alertContainer.appendChild(alertWrapper);
    
    // Agregar al DOM
    document.body.appendChild(alertContainer);
    
    // Animación de entrada
    alertContainer.style.opacity = '0';
    alertContainer.style.transform = 'translateX(-50%) translateY(-20px)';
    alertContainer.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    
    setTimeout(() => {
        alertContainer.style.opacity = '1';
        alertContainer.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Event listener para cerrar
    closeButton.addEventListener('click', () => {
        alertContainer.style.opacity = '0';
        alertContainer.style.transform = 'translateX(100%) translateY(0)';
        setTimeout(() => {
            if (document.body.contains(alertContainer)) {
                document.body.removeChild(alertContainer);
            }
        }, 300);
    });
    
    // Auto-cerrar después de 8 segundos (más tiempo para mensajes largos)
    setTimeout(() => {
        if (document.body.contains(alertContainer)) {
            alertContainer.style.opacity = '0';
            alertContainer.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (document.body.contains(alertContainer)) {
                    document.body.removeChild(alertContainer);
                }
            }, 300);
        }
    }, 8000);
}





