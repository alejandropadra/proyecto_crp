// Variables globales
const pages = ['inicial', 'segundo', 'final'];
let currentPage = 0;
let isAnimating = false;
let datosParticipantes = [];
let ganadoresSeleccionados = [];
let tablaParticipantes = null;
let tablaGanadoresAuto = null;
let tablaGanadoresTablet = null;
let tablaGanadoresTelefono = null;
let tablaGanadoresTV = null;


const regiones = {
    "capital": ['Miranda', 'La Guaira', 'Distrito Capital'],
    "Centro": ['Aragua', 'Carabobo', 'Cojedes', 'Guárico', 'Lara', 'Yaracuy', 'Portuguesa', 'Barinas'],
    "occidente": ['Zulia', 'Falcón', 'Trujillo', 'Mérida', 'Táchira'],
    "oriente_norte": ['Anzoátegui', 'Sucre', 'Nueva Esparta'],
    "oriente_sur": ['Bolívar', 'Monagas']
};

// ========================================
// Inicialización al cargar la página
// ========================================
$(document).ready(function() {

    
    // Cargar datos UNA SOLA VEZ
    $.ajax({
        url: window.location.pathname + '?get_data=true',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            datosParticipantes = data;
            //inicializar la tabla con los datos
            inicializarTabla();
            inicializarPremios();
        },
        error: function(xhr, status, error) {
            console.error(' Error al cargar datos:', error);
            alert('Error al cargar los datos. Por favor recarga la página.');
        }
    });
    
    // Inicializar tabla de ganadores
    const configTablaGanadores = {
        language: {
            emptyTable: "No hay ganadores seleccionados aún",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            lengthMenu: "Mostrar _MENU_ registros",
            search: "Buscar:",
            zeroRecords: "No se encontraron registros coincidentes",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            }
        },
        pageLength: 10,
        order: [[0, 'asc']],
        responsive: true
    };

    // Inicializar las 4 tablas de ganadores
    tablaGanadoresAuto = $('#tablaGanadoresAuto').DataTable(configTablaGanadores);
    tablaGanadoresTablet = $('#tablaGanadoresTablet').DataTable(configTablaGanadores);
    tablaGanadoresTelefono = $('#tablaGanadoresTelefono').DataTable(configTablaGanadores);
    tablaGanadoresTV = $('#tablaGanadoresTV').DataTable(configTablaGanadores);

    $('.ui.dropdown').dropdown();

    // Inicializar sistema de navegación
    initNavigation();

    // Event listeners para botones de sorteo
    $('#btnSortear').on('click', realizarSorteo);

});

// ========================================
// Inicializar DataTable con datos cargados
// ========================================
function inicializarTabla() {
    tablaParticipantes = $('#tablaParticipantes').DataTable({
        data: datosParticipantes,
        columns: [
            { 
                data: null,
                render: function(data, type, row) {
                    return row['Fec. Factura'] || 'N/A';
                }
            },
            { data: 'Nombre' },
            { data: 'Apellido' },
            { data: 'Email' },
            { data: 'Cédula' },
            { 
                data: null,
                render: function(data, type, row) {
                    return row['# Factura'] || 'N/A';
                }
            },
            { 
                data: null,
                render: function(data, type, row) {
                    return row['Tel.'] || 'N/A';
                }
            },
            { 
                data: 'Estado',
                render: function(data) {
                    const colorClass = data === 'Distrito Capital' ? 'blue' : 
                                        data === 'Monagas' ? 'green' : 'teal';
                    return `<span class="ui label ${colorClass}">${data}</span>`;
                }
            }
        ],
        language: {
            processing: "Procesando...",
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron registros coincidentes",
            emptyTable: "No hay datos disponibles",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            }
        },
        pageLength: 15,
        lengthMenu: [[15, 50, 100, -1], [15, 50, 100, "Todos"]],
        order: [[0, 'desc']], // Ordenar por fecha descendente
        deferRender: true,
        responsive: true
    });

}

// ========================================
// Sistema de Navegación entre Páginas
// ========================================
function initNavigation() {
    document.getElementById('btn-next-1').addEventListener('click', () => navigateTo(1));
    document.getElementById('btn-prev-2').addEventListener('click', () => navigateTo(0));
    document.getElementById('btn-next-2').addEventListener('click', () => navigateTo(2));
    document.getElementById('btn-prev-3').addEventListener('click', () => navigateTo(1));

    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', () => navigateTo(index));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && currentPage < pages.length - 1) {
            navigateTo(currentPage + 1);
        } else if (e.key === 'ArrowLeft' && currentPage > 0) {
            navigateTo(currentPage - 1);
        }
    });

    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold && currentPage < pages.length - 1) {
            navigateTo(currentPage + 1);
        }
        if (touchEndX > touchStartX + swipeThreshold && currentPage > 0) {
            navigateTo(currentPage - 1);
        }
    }
}

function navigateTo(pageIndex) {
    if (pageIndex < 0 || pageIndex >= pages.length || isAnimating || pageIndex === currentPage) return;

    isAnimating = true;

    const currentPageElement = document.getElementById(pages[currentPage]);
    const newPageElement = document.getElementById(pages[pageIndex]);

    if (pageIndex > currentPage) {
        currentPageElement.classList.remove('active');
        currentPageElement.classList.add('left');
        
        newPageElement.classList.remove('right');
        newPageElement.classList.add('active');
    } else {
        currentPageElement.classList.remove('active');
        currentPageElement.classList.add('right');
        
        newPageElement.classList.remove('left');
        newPageElement.classList.add('active');
    }

    updateIndicators(pageIndex);
    currentPage = pageIndex;

    setTimeout(() => {
        if (pageIndex === 0 && tablaParticipantes) {
            tablaParticipantes.columns.adjust().draw();
        } else if (pageIndex === 2) {
            if (tablaGanadoresAuto) tablaGanadoresAuto.columns.adjust().draw();
            if (tablaGanadoresTablet) tablaGanadoresTablet.columns.adjust().draw();
            if (tablaGanadoresTelefono) tablaGanadoresTelefono.columns.adjust().draw();
            if (tablaGanadoresTV) tablaGanadoresTV.columns.adjust().draw();
        }
        isAnimating = false;
    }, 800);
}

function updateIndicators(activeIndex) {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        if (index === activeIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}



// ========================================
// Sistema de Sorteo
// ========================================




const premiosInfo = {
    auto: {
        nombre: "Changan Auto",
        ganadores: 1,
        descripcion: "Durante este sorteo, se seleccionará <span>1</span> ganador al azar entre los participantes de <span>todas las zonas </span> registradas.",
        
    },
    tablet: {
        nombre: "Tablet Samsung",
        ganadores: 10,
        descripcion: "Durante este sorteo, se seleccionarán <span>10</span> ganadores al azar entre los participantes de <span>todas las zonas</span> registradas.",
        
    },
    telefono: {
        nombre: "Teléfono Celular",
        ganadores: 20,
        descripcion: "Durante este sorteo, se seleccionarán <span>20</span> ganadores al azar entre los participantes de <span>todas las zonas</span> registradas.",
        
    },
    televisor: {
        nombre: "Televisor Smart TV",
        ganadores: 10,
        descripcion: "Durante este sorteo, se seleccionarán <span>10</span> ganadores al azar entre los participantes de <span>todas las zonas</span> registradas.",
        
    }
};


let premioActual = null;


function inicializarPremios() {
    const radioInputs = document.querySelectorAll('input[name="premio"]');
    radioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                // Ocultar resultados previos con animación
                ocultarResultadosConAnimacion();
                
                // Actualizar el premio seleccionado
                actualizarInfoPremio(this.value);
            }
        });
    });
    
    const radioChecked = document.querySelector('input[name="premio"]:checked');
    if (radioChecked) {
        actualizarInfoPremio(radioChecked.value);
    } else {
        document.getElementById('premioSeleccionado').textContent = 'Ninguno';
    }
}


function ocultarResultadosConAnimacion() {
    const resultadoDiv = document.getElementById('resultadoSorteo');
    
    if (resultadoDiv && resultadoDiv.style.display !== 'none') {
        resultadoDiv.classList.add('fade-out-result');
    
        setTimeout(() => {
            resultadoDiv.style.display = 'none';
            resultadoDiv.classList.remove('fade-out-result');
            
            document.getElementById('nombreGanador').innerHTML = '';
        }, 400); 
    }
}

function actualizarInfoPremio(premioValue) {
    console.log('Actualizando info para premio:', premioValue);
    const premio = premiosInfo[premioValue];
    
    if (!premio) {
        console.error('Premio no encontrado:', premioValue);
        return;
    }
    
    premioActual = {
        value: premioValue,
        ...premio
    };
    
    document.getElementById('premioSeleccionado').textContent = premio.nombre;
    
    const infoParrafo = document.querySelector('.informacion p');
    if (infoParrafo) {
        infoParrafo.innerHTML = premio.descripcion;
    }
    
    const condicionSorteo = document.querySelector('.condicion-sorteo');
    if (condicionSorteo) {
        condicionSorteo.classList.remove('premio-actualizado');
        void condicionSorteo.offsetWidth;
        condicionSorteo.classList.add('premio-actualizado');
    }

}


// Determina la región de un estado
function determinarRegion(estado) {
    const estadoNormalizado = estado.trim().toLowerCase();
    for (const [regionNombre, estados] of Object.entries(regiones)) {
        if (estados.some(e => e.toLowerCase() === estadoNormalizado)) {
            return regionNombre;
        }
    }
    return 'Región no especificada';
}

function personasPorRegion(region = null) {
    return datosParticipantes.filter(participante => {
        const regionParticipante = determinarRegion(participante['Estado']);
        return region === null || regionParticipante === region;
    });
}

const ganadores={
    ganador_carro:[],
    ganador_tablet:[],
    ganador_telefono:[],
    ganador_tv:[]
}

function realizarSorteo() {

    
    if (!premioActual) {
            alert('Por favor selecciona un premio antes de realizar el sorteo.');
            return;
        }
        
    if (datosParticipantes.length === 0) {
        alert('Los datos aún se están cargando. Por favor espera un momento.');
        return;
    }


    const participantesEnCapital = personasPorRegion('capital');
    const participantesEnCentro = personasPorRegion('Centro');
    const participantesEnOccidente = personasPorRegion('occidente');
    const participantesEnOrienteNorte = personasPorRegion('oriente_norte');
    const participantesEnOrienteSur = personasPorRegion('oriente_sur');
    const todosLosParticipantes = personasPorRegion();

    if (premioActual.value === "auto") {
        realizarSorteoMultiple('auto', 1, todosLosParticipantes, 'ganador_carro');
        mostrarResultadoSorteo(ganadores.ganador_carro, 'auto', ganadores.ganador_carro.length, premioActual.ganadores);
        actualizarTablaGanadores(tablaGanadoresAuto, ganadores.ganador_carro)
    
    }else if (premioActual.value === "tablet") {
        // Verificar una sola vez al inicio
        if (ganadores.ganador_tablet.length > 0) {
            const respuesta = confirm(` Ya hay ${ganadores.ganador_tablet.length} ganador(es) de Tablets. ¿Deseas realizar un nuevo sorteo? Esto reemplazará a los ganadores anteriores.`);
            if (!respuesta) {
                return;
            }
            ganadores.ganador_tablet = [];
        }
        
        realizarSorteoMultiple('tablet', 2, participantesEnCapital, 'ganador_tablet', true);
        realizarSorteoMultiple('tablet', 2, participantesEnCentro, 'ganador_tablet', true);
        realizarSorteoMultiple('tablet', 2, participantesEnOccidente, 'ganador_tablet', true);
        realizarSorteoMultiple('tablet', 2, participantesEnOrienteNorte, 'ganador_tablet', true);
        realizarSorteoMultiple('tablet', 2, participantesEnOrienteSur, 'ganador_tablet', true);
        console.log(` Sorteo completo! ${ganadores.ganador_tablet.length} `);
        mostrarResultadoSorteo(ganadores.ganador_tablet, 'tablet', ganadores.ganador_tablet.length, premioActual.ganadores);
        actualizarTablaGanadores(tablaGanadoresTablet, ganadores.ganador_tablet);
    
    }else if (premioActual.value === "telefono") {
        // Verificar una sola vez al inicio
        if (ganadores.ganador_telefono.length > 0) {
            const respuesta = confirm(` Ya hay ${ganadores.ganador_telefono.length} ganador(es) de Teléfonos. ¿Deseas realizar un nuevo sorteo? Esto reemplazará a los ganadores anteriores.`);
            if (!respuesta) {
                return;
            }
            ganadores.ganador_telefono = [];
        }

        realizarSorteoMultiple('telefono', 4, participantesEnCapital, 'ganador_telefono', true);
        realizarSorteoMultiple('telefono', 4, participantesEnCentro, 'ganador_telefono', true);
        realizarSorteoMultiple('telefono', 4, participantesEnOccidente, 'ganador_telefono', true);
        realizarSorteoMultiple('telefono', 4, participantesEnOrienteNorte, 'ganador_telefono', true);
        realizarSorteoMultiple('telefono', 4, participantesEnOrienteSur, 'ganador_telefono', true);
        console.log(` Sorteo completo! ${ganadores.ganador_telefono.length} `);
        mostrarResultadoSorteo(ganadores.ganador_telefono, 'telefono', ganadores.ganador_telefono.length, premioActual.ganadores);
        actualizarTablaGanadores(tablaGanadoresTelefono, ganadores.ganador_telefono);

    }else if (premioActual.value === "televisor") {
        // Verificar una sola vez al inicio
        if (ganadores.ganador_tv.length > 0) {
            const respuesta = confirm(` Ya hay ${ganadores.ganador_tv.length} ganador(es) de Televisores. ¿Deseas realizar un nuevo sorteo? Esto reemplazará a los ganadores anteriores.`);
            if (!respuesta) {
                return;
            }
            ganadores.ganador_tv = [];
        }

        realizarSorteoMultiple('televisor', 2, participantesEnCapital, 'ganador_tv', true);
        realizarSorteoMultiple('televisor', 2, participantesEnCentro, 'ganador_tv', true);
        realizarSorteoMultiple('televisor', 2, participantesEnOccidente, 'ganador_tv', true);
        realizarSorteoMultiple('televisor', 2, participantesEnOrienteNorte, 'ganador_tv', true);
        realizarSorteoMultiple('televisor', 2, participantesEnOrienteSur, 'ganador_tv', true);
        console.log(` Sorteo completo! ${ganadores.ganador_tv.length} `);
        mostrarResultadoSorteo(ganadores.ganador_tv, 'televisor', ganadores.ganador_tv.length, premioActual.ganadores);
        actualizarTablaGanadores(tablaGanadoresTV, ganadores.ganador_tv);
        
    }

}


function realizarSorteoMultiple(tipoPremio, numeroGanadores, participantesSortear, nombreArray, esMultipleRegional = false) {
    // Solo verificar ganadores previos si NO es un sorteo multi-regional
    if (!esMultipleRegional && ganadores[nombreArray].length > 0) {
        const respuesta = confirm(`⚠️ Ya hay ${ganadores[nombreArray].length} ganador(es) de ${premioActual.nombre}. ¿Deseas realizar un nuevo sorteo? Esto reemplazará a los ganadores anteriores.`);
        if (!respuesta) {
            console.log('Sorteo cancelado por el usuario');
            return;
        }
        
        ganadores[nombreArray] = [];
        console.log('Ganadores anteriores eliminados. Realizando nuevo sorteo...');
    }
    
    // Excluir ganadores previos de OTROS premios (no del premio actual porque ya lo limpiamos)
    let participantesElegibles = participantesSortear.filter(p => {
        return !estaEnOtrosPremios(p.Cédula, nombreArray);
    });
    

    // Sortear TODOS los ganadores del premio (o los disponibles)
    const ganadoresASortear = Math.min(numeroGanadores, participantesElegibles.length);
    
    console.log(` Sorteando ${ganadoresASortear} ${premioActual.nombre} entre ${participantesElegibles.length} participantes elegibles`);
    
    const nuevosGanadores = [];

    const participantesTemp = [...participantesElegibles];
    
    // Seleccionar TODOS los ganadores aleatorios
    for (let i = 0; i < ganadoresASortear; i++) {
        const indiceAleatorio = Math.floor(Math.random() * participantesTemp.length);
        const ganador = participantesTemp.splice(indiceAleatorio, 1)[0];
        
        // Agregar información del sorteo
        ganador.premio = tipoPremio;
        ganador.nombrePremio = premioActual.nombre;
        ganador.fechaSorteo = new Date().toLocaleString('es-ES');
        ganador.ordenGanador = i + 1;
        
        // Guardar en arrays
        nuevosGanadores.push(ganador);
        ganadores[nombreArray].push(ganador);
        
    }
    
}

// Función auxiliar para verificar si una cédula ya está en OTROS premios (no en el actual)
function estaEnOtrosPremios(cedula, premioActualArray) {
    const todosLosPremios = ['ganador_carro', 'ganador_tablet', 'ganador_telefono', 'ganador_tv'];
    
    for (const premio of todosLosPremios) {
        if (premio === premioActualArray) continue;
        
        if (ganadores[premio].some(g => g.Cédula === cedula)) {
            return true;
        }
    }
    
    return false;
}

function estaEnGanadores(cedula) {
    return ganadores.ganador_carro.some(g => g.Cédula === cedula) ||
            ganadores.ganador_tablet.some(g => g.Cédula === cedula) ||
            ganadores.ganador_telefono.some(g => g.Cédula === cedula) ||
            ganadores.ganador_tv.some(g => g.Cédula === cedula);
}

function mostrarResultadoSorteo(ganadoresArray, tipoPremio, ganadoresActuales, totalGanadores) {
    let htmlGanadores = '';
    
    // Determinar el ícono según el premio
    let iconoPremio = '🎁';
    if (tipoPremio === 'auto') iconoPremio = '🚗';
    else if (tipoPremio === 'tablet') iconoPremio = '📱';
    else if (tipoPremio === 'telefono') iconoPremio = '📞';
    else if (tipoPremio === 'tv') iconoPremio = '📺';
    
    if (ganadoresArray.length === 1) {
        // UN SOLO GANADOR (ejemplo: carro)
        const ganador = ganadoresArray[0];
        
        htmlGanadores = `
            <div class="ganador-unico" style="text-align: center; padding: 20px;">
                <div style="font-size: 4rem; margin-bottom: 15px; animation: bounce 1s ease infinite;">${iconoPremio}</div>
                <h2 style="color: var(--azul-tmo); margin-bottom: 20px; font-size: 2rem;">¡Felicidades!</h2>
                <div style="background: linear-gradient(135deg, #e8f0ff, #d4e4ff); padding: 20px; border-radius: 15px; margin-bottom: 15px;">
                    <strong style="font-size: 1.6rem; color: var(--azul-tmo);">${ganador.Nombre} ${ganador.Apellido}</strong>
                </div>
                <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                    <p style="margin: 8px 0;"><strong>📋 Cédula:</strong> ${ganador.Cédula}</p>
                    <p style="margin: 8px 0;"><strong>📍 Estado:</strong> ${ganador.Estado}</p>
                    <p style="margin: 8px 0;"><strong>📞 Teléfono:</strong> ${ganador['Tel.']}</p>
                </div>
                <div style="margin-top: 20px;">
                    <span class="ui huge orange label">${iconoPremio} ${ganador.nombrePremio}</span>
                </div>
            </div>
        `;
    } else {
        // MÚLTIPLES GANADORES (tablets, celulares, tvs)
        htmlGanadores = `
            <div style="text-align: center; padding: 15px;">
                <div style="font-size: 3rem; margin-bottom: 10px; animation: bounce 1s ease infinite;">${iconoPremio}</div>
                <h2 style="color: var(--azul-tmo); margin-bottom: 10px;">¡${ganadoresArray.length} Ganadores Seleccionados!</h2>
                <div class="ui orange label" style="margin-bottom: 20px; font-size: 1.1rem;">${ganadoresArray[0].nombrePremio}</div>
                ${ganadoresActuales < totalGanadores ? `
                    <div class="ui yellow message" style="text-align: center;">
                        <i class="info circle icon"></i>
                        Se sortearon ${ganadoresActuales} de ${totalGanadores} ganadores posibles (participantes insuficientes)
                    </div>
                ` : ''}
            </div>
            <div class="ui relaxed divided list" style="text-align: left; max-height: 500px; overflow-y: auto; padding: 0 20px;">
        `;
        
        ganadoresArray.forEach((ganador, index) => {
            htmlGanadores += `
                <div class="item ganador-item" style="padding: 15px; background: ${index % 2 === 0 ? '#f9f9f9' : 'white'}; border-radius: 8px; margin-bottom: 8px; transition: all 0.3s ease;" onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none';">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="background: linear-gradient(135deg, var(--azul-tmo), #0f4580); color: white; min-width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; flex-shrink: 0; box-shadow: 0 2px 8px rgba(19, 87, 160, 0.3);">
                            ${index + 1}
                        </div>
                        <div style="flex: 1;">
                            <strong style="color: var(--azul-tmo); font-size: 1.15rem;">${ganador.Nombre} ${ganador.Apellido}</strong><br>
                            <small style="color: #666; line-height: 1.5;">
                                <strong>CI:</strong> ${ganador.Cédula} | 
                                <strong>Estado:</strong> ${ganador.Estado} | 
                                <strong>Tel:</strong> ${ganador['Tel.']}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        });
        
        htmlGanadores += '</div>';
    }
    
    // Insertar el HTML
    $('#nombreGanador').html(htmlGanadores);
    
    const resultadoDiv = document.getElementById('resultadoSorteo');
    resultadoDiv.style.display = 'block';
    resultadoDiv.classList.add('fade-in-result');

    setTimeout(() => {
        resultadoDiv.classList.remove('fade-in-result');
    }, 500);

    lanzarConfeti(ganadoresArray.length);

    setTimeout(() => {
        document.getElementById('resultadoSorteo').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 100);
}

// Función para lanzar confeti según el número de ganadores
function lanzarConfeti(numeroGanadores) {
    if (numeroGanadores === 1) {

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1357A0', '#FF6B35', '#FFD700', '#4ECDC4']
        });
        
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 100,
                origin: { y: 0.7 },
                colors: ['#1357A0', '#FF6B35', '#FFD700', '#4ECDC4']
            });
        }, 300);
        
    } else {
        // Confeti continuo para múltiples ganadores
        const duracion = 5000; // 5 segundos
        const fin = Date.now() + duracion;
        
        const intervalo = setInterval(() => {
            if (Date.now() > fin) {
                clearInterval(intervalo);
                return;
            }
            
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#1357A0', '#FF6B35', '#FFD700', '#4ECDC4']
            });
            
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#1357A0', '#FF6B35', '#FFD700', '#4ECDC4']
            });
        }, 50);
    }
}

function actualizarTablaGanadores(tablaDataTable, arrayGanadores) {

    tablaDataTable.clear();
    
    if (!arrayGanadores || arrayGanadores.length === 0) {
        tablaDataTable.draw();
        return;
    }
    
    arrayGanadores.forEach((ganador, index) => {
        tablaDataTable.row.add([
            index + 1, 
            `${ganador.Nombre} ${ganador.Apellido}`, // Nombre Completo
            ganador.Cédula, // Cédula
            ganador['Tel.'], // Teléfono
            ganador.Estado, // Estado
            ganador.fechaSorteo || 'N/A' // Fecha Sorteo
        ]);
    });
    
    // Redibujar la tabla con los nuevos datos
    tablaDataTable.draw();
}







// ========================================
// Sistema de Descarga PDF
// ========================================

function descargarPDFGanadores() {
    const { jsPDF } = window.jspdf;
    
    // Verificar si hay ganadores
    const hayGanadores = ganadores.ganador_carro.length > 0 || 
                            ganadores.ganador_tablet.length > 0 || 
                            ganadores.ganador_telefono.length > 0 || 
                            ganadores.ganador_tv.length > 0;
    
    if (!hayGanadores) {
        alert('No hay ganadores para descargar. Realiza al menos un sorteo primero.');
        return;
    }
    
    // Crear documento PDF en orientación vertical
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Colores corporativos
    const azulTMO = [19, 87, 160];
    const naranjaTMO = [255, 187, 51];
    const grisOscuro = [51, 51, 51];
    
    let currentY = 20; // Posición Y inicial
    const pageHeight = doc.internal.pageSize.height;
    const marginBottom = 20;
    
    // ========================================
    // ENCABEZADO DEL DOCUMENTO
    // ========================================
    doc.setFillColor(...azulTMO);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PROMOCIÓN MONTANA', 105, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Listado Oficial de Ganadores', 105, 23, { align: 'center' });
    
    // Fecha de generación
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${fechaActual}`, 105, 35, { align: 'center' });
    
    currentY = 45;
    
    // ========================================
    // CONFIGURACIÓN DE TABLAS
    // ========================================
    const tablasConfig = [
        {
            titulo: ' GANADORES DE CHANGAN AUTO',
            data: ganadores.ganador_carro,
            color: [41, 128, 185] // Azul
        },
        {
            titulo: 'GANADORES DE TABLETS SAMSUNG',
            data: ganadores.ganador_tablet,
            color: [46, 204, 113] // Verde
        },
        {
            titulo: ' GANADORES DE TELÉFONOS CELULARES',
            data: ganadores.ganador_telefono,
            color: [155, 89, 182] // Morado
        },
        {
            titulo: ' GANADORES DE TELEVISORES SMART TV',
            data: ganadores.ganador_tv,
            color: [230, 126, 34] // Naranja
        }
    ];
    
    // ========================================
    // GENERAR CADA TABLA
    // ========================================
    tablasConfig.forEach((tabla, index) => {
        // Saltar si no hay ganadores para este premio
        if (tabla.data.length === 0) {
            return;
        }
        
        if (currentY > pageHeight - marginBottom - 40) {
            doc.addPage();
            currentY = 20;
        }
        
        // Título de la sección
        doc.setFillColor(...tabla.color);
        doc.rect(10, currentY - 5, 190, 12, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(tabla.titulo, 15, currentY + 3);
        
        // Contador de ganadores
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total: ${tabla.data.length} ganador${tabla.data.length !== 1 ? 'es' : ''}`, 195, currentY + 3, { align: 'right' });
        
        currentY += 15;
        
        const tableData = tabla.data.map((ganador, idx) => [
            (idx + 1).toString(),
            `${ganador.Nombre} ${ganador.Apellido}`,
            ganador.Cédula,
            ganador['Tel.'] || 'N/A',
            ganador.Estado,
            ganador.fechaSorteo || 'N/A'
        ]);
        
        doc.autoTable({
            startY: currentY,
            head: [['#', 'Nombre Completo', 'Cédula', 'Teléfono', 'Estado', 'Fecha Sorteo']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: tabla.color,
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: grisOscuro
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },  // #
                1: { cellWidth: 50 },                     // Nombre
                2: { cellWidth: 30 },                     // Cédula
                3: { cellWidth: 28 },                     // Teléfono
                4: { cellWidth: 35 },                     // Estado
                5: { cellWidth: 37, fontSize: 8 }        // Fecha
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { left: 10, right: 10 },
            didDrawPage: function(data) {
                // Pie de página
                const pageCount = doc.internal.getNumberOfPages();
                const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
                
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Página ${currentPage} de ${pageCount}`,
                    105,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }
        });
        
        currentY = doc.lastAutoTable.finalY + 15;
    });
    
    // ========================================
    // PIE DE PÁGINA FINAL (solo en última página)
    // ========================================
    const totalPaginas = doc.internal.getNumberOfPages();
    doc.setPage(totalPaginas);
    
    // Línea separadora
    doc.setDrawColor(...azulTMO);
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 25, 200, pageHeight - 25);
    
    // Texto de validación
    doc.setFontSize(9);
    doc.setTextColor(...grisOscuro);
    doc.setFont('helvetica', 'italic');
    doc.text('Este documento es un registro oficial del sorteo realizado.', 105, pageHeight - 18, { align: 'center' });
    doc.text('Promoción Montana - Todos los derechos reservados', 105, pageHeight - 13, { align: 'center' });
    
    // ========================================
    // DESCARGAR ARCHIVO
    // ========================================
    const nombreArchivo = `Ganadores_Promocion_Montana_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
    
}

// Event listener para el botón de descarga
document.addEventListener('DOMContentLoaded', function() {

    setTimeout(() => {
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', descargarPDFGanadores);
        }
    }, 1000); 
});
