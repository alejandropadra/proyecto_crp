document.addEventListener("DOMContentLoaded", () => {

    const elements = document.querySelectorAll('.animacionEntrada-Fade');

    elements.forEach((element, index) => {
        const delay = index * 0.5; 
        element.style.animationDelay = `${delay}s`;
    });
});

document.addEventListener("DOMContentLoaded", () => {

    const elements = document.querySelectorAll('.animacionEntrada-Fade2');

    elements.forEach((element, index) => {
        const delay = index * 0.5; 
        element.style.animationDelay = `${delay}s`;
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const botonSortear = document.getElementById("sortear");
    const backButtonCubrir = document.querySelector("#section-cubrir #backButton");
    const backButtonGanadores = document.querySelector("#tabla_ganadores #backButton");
    const siguenteButton = document.getElementById("siguenteButton");

    const sectionInicial = document.querySelector(".inicial");
    const sectionCubrir = document.getElementById("section-cubrir");
    const tablaGanadores = document.getElementById("tabla_ganadores");
    const loader = document.getElementById("loader");

    // Mostrar la vista `section-cubrir`
    botonSortear.addEventListener("click", () => {
        loader.style.display = "block";
        setTimeout(() => {
            loader.style.display = "none";
            sectionInicial.style.display = "none"; // Ocultar inicial
            sectionCubrir.classList.add("active"); // Mostrar section-cubrir
        }, 1000);
    });

    // Volver a la vista inicial desde `section-cubrir`
    backButtonCubrir.addEventListener("click", () => {
        sectionCubrir.classList.remove("active"); // Ocultar section-cubrir
        setTimeout(() => {
            sectionInicial.style.display = "flex"; // Mostrar inicial
        }, 500);
    });

    // Mostrar la vista `tabla_ganadores`
    siguenteButton.addEventListener("click", () => {
        loader.style.display = "block";
        setTimeout(() => {
            loader.style.display = "none";
            sectionCubrir.classList.remove("active"); // Ocultar section-cubrir
            tablaGanadores.classList.add("active"); // Mostrar tabla_ganadores
        }, 1000);
    });

    // Volver a la vista `section-cubrir` desde `tabla_ganadores`
    backButtonGanadores.addEventListener("click", () => {
        tablaGanadores.classList.remove("active"); // Ocultar tabla_ganadores
        setTimeout(() => {
            sectionCubrir.classList.add("active"); // Mostrar section-cubrir
        }, 500);
    });
});


// Datos de regiones
const regiones = {
    "oriente_sur": ['Bolívar'],
    "capital": ['Miranda', 'La Guaira', 'Distrito Capital'],
    "Centro": ['Aragua', 'Carabobo', 'Cojedes', 'Guárico'],
    "centroOccidente": ['Lara', 'Yaracuy', 'Portuguesa', 'Barinas' ],
    "occidente": ['Zulia', 'Falcón'],
    "occidenteAndes": ['Trujillo', 'Mérida', 'Táchira'],
    "orienteCentro": ['Monagas'],
    "oriente_norte": ['Anzoátegui', 'Sucre', ],
    "oriente_insular": ['Nueva Esparta']
};

// Obtén el contenido del div y convierte a objeto JavaScript
const datosDiv = document.getElementById('datos').textContent;
const participantes = JSON.parse(datosDiv);

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


// Filtra participantes por región
function personasPorRegion(region = null) {
    return participantes.filter(participante => {
        const regionParticipante = determinarRegion(participante['Estado']);
        return region === null || regionParticipante === region;
    });
}

function seleccionarGanadores(participantes, numGanadores) {
    // Copia los participantes para no modificar el arreglo original
    const copiaParticipantes = [...participantes];

    // Mezcla aleatoriamente los participantes usando el algoritmo de Fisher-Yates
    for (let i = copiaParticipantes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copiaParticipantes[i], copiaParticipantes[j]] = [copiaParticipantes[j], copiaParticipantes[i]];
    }

    return copiaParticipantes.slice(0, numGanadores);
}



function obtenerCedulasGanadoresExistentes(tablasIds) {
    const cedulas = new Set(); // Usamos un Set para evitar duplicados

    tablasIds.forEach(tablaId => {
        const tabla = document.getElementById(tablaId);
        if (tabla) {
            const filas = tabla.querySelectorAll('.tabla_ganadores__table tbody tr');
            filas.forEach(fila => {
                const celdas = fila.querySelectorAll('td');
                if (celdas.length > 1) {
                    const cedula = celdas[1].textContent.trim(); 
                    cedulas.add(cedula);
                }
            });
        }
    });

    return cedulas;
}

let cedulasSeleccionadasEnEsteSorteo = new Set();
function setupButtonAction(buttonId, inputId) {
    document.getElementById(buttonId).addEventListener('click', async () => {
        const parametro = document.getElementById(inputId).textContent;
        let parametroEnviar= ""
        /*
        if (parametro === "carro"){
            parametroEnviar= "Changan - New Alsvin Sincrónico 2024 Sedan"
        }else if (parametro === "AIWA"){
            parametroEnviar ='AIWA 32" HD" Smart TV'
        }else if (parametro === "tablet"){
            parametroEnviar = "Samsung Galaxy Tab A7Lite"
        }else if (parametro === "telefono"){
            parametroEnviar ="Samsung Galaxy A15 6GB/128GB"
        }else if (parametro === "jvc"){
            parametroEnviar = 'JVC 32" HD Smart TV'
        }*/

        if (parametro === "Capital"){
            parametroEnviar = "Región Capital"
        }else if (parametro === "Centro"){
            parametroEnviar = "Región Centro"
        }else if (parametro === "Centro Occidente"){
            parametroEnviar = "Región Centro Occidente"
        }else if (parametro === "Occidente"){
            parametroEnviar = "Región Occidente"
        }else if (parametro === "Occidente Andes"){
            parametroEnviar = "Región Occidente Andes"
        }else if (parametro === "Oriente Centro"){
            parametroEnviar = "Región Oriente Centro"
        }else if (parametro === "Oriente Norte"){
            parametroEnviar = "Región Oriente Norte"
        }else if (parametro === "Oriente Sur"){
            parametroEnviar = "Región Oriente Sur"
        }else if (parametro === "Oriente Insular"){
            parametroEnviar = "Región Oriente Insular"
        }
        // Recolectar cédulas existentes en las tablas
        const tablasIds = [
            "tablacapital",
            "tablaGanadoresAiwa",
            "tablaGanadoresTab",
            "tablaGanadoresA15",
            "tablaGanadoresJvc",
            "tablaGanadoresCarro"
        ];
        const cedulasExistentes = obtenerCedulasGanadoresExistentes(tablasIds);

        const todasLasCedulasExcluidas = new Set([...cedulasExistentes, ...cedulasSeleccionadasEnEsteSorteo]);
        
        //console.log("Cédulas existentes en las tablas:", cedulasExistentes);

        // Filtrar considerando todas las cédulas excluidas
        const filtrarParticipantes = (participantes) => {
            const coincidencias = [];
            const filtrados = participantes.filter(participante => {
                if (todasLasCedulasExcluidas.has(participante.Cédula)) {
                    coincidencias.push(participante);
                    return false;
                }
                return true;
            });
            return filtrados;
        };
        

        const participantesEnOrienteSur = filtrarParticipantes(personasPorRegion('oriente_sur'));
        
        const participantesEnCapital = filtrarParticipantes(personasPorRegion('capital'));
        const participantesEnCentro = filtrarParticipantes(personasPorRegion('Centro'));
        const participantesEnCentroOccidente = filtrarParticipantes(personasPorRegion('centroOccidente'));
        const participantesEnOccidente = filtrarParticipantes(personasPorRegion('occidente'));
        const participantesEnAndes = filtrarParticipantes(personasPorRegion('occidenteAndes'));
        const participantesEnOrienteCentro = filtrarParticipantes(personasPorRegion('orienteCentro'));
        const participantesEnOrienteNorte = filtrarParticipantes(personasPorRegion('oriente_norte'));
        const participantesEnOrienteInsular = filtrarParticipantes(personasPorRegion('oriente_insular'));
        const todosLosParticipantes = filtrarParticipantes(personasPorRegion());

        const participantesOccidenteGeneral =[
            ... participantesEnOccidente,
            ... participantesEnAndes
        ]

        const participantesrienteGeneral =[
            ...participantesEnOrienteSur,
            ...participantesEnOrienteNorte
        ]
/*
        console.log( `Personas de Occidente:  ${participantesOccidenteGeneral.length}` );
        console.log( `Personas en capital:  ${personasPorRegion('capital').length}` );
        console.log( `Personas en centro:  ${personasPorRegion('Centro').length}` );
        console.log( `Personas en centro Occidente:  ${personasPorRegion('centroOccidente').length}` );
        console.log( `Personas en Oriente Sur:  ${personasPorRegion('oriente_sur').length}` );
        console.log( `Personas en Occidente Andes:  ${personasPorRegion('occidenteAndes').length}` );
        console.log( `Personas en oriente Centro:  ${personasPorRegion('orienteCentro').length}` );
        console.log( `Personas en oriente norte:  ${personasPorRegion('oriente_norte').length}` );
        console.log( `Personas en oriente insular:  ${personasPorRegion('oriente_insular').length}` );
        console.log(` Total = ${personasPorRegion('occidente').length + personasPorRegion('capital').length + personasPorRegion('Centro').length + personasPorRegion('centroOccidente').length + personasPorRegion('oriente_sur').length + personasPorRegion('occidenteAndes').length + personasPorRegion('orienteCentro').length + personasPorRegion('oriente_norte').length + personasPorRegion('oriente_insular').length } `)
*/

        let todosLosGanadores = [];
        /*
        let participantesOriente = [
            ...participantesEnOrienteNorte,
            ...participantesEnOrienteSur
        ];*/

        if (parametro === "Capital") {
            let ganadoresCapital = seleccionarGanadores(participantesEnCapital, 1);
        
            todosLosGanadores = [
                ...ganadoresCapital,
            ];
        }else if (parametro === "Centro"){
            let ganadoresCentro = seleccionarGanadores(participantesEnCentro, 5);
            todosLosGanadores = [
                ...ganadoresCentro,
            ];
        } else if (parametro === "Centro Occidente"){
            let ganadoresCentroOccidente = seleccionarGanadores(participantesEnCentroOccidente, 3);
            todosLosGanadores = [
                ...ganadoresCentroOccidente,
            ];
        } else if (parametro === "Occidente"){

            let ganadoresOccidente = seleccionarGanadores(participantesOccidenteGeneral, 6);
            todosLosGanadores = [
                ...ganadoresOccidente,
            ];
        } /*else if (parametro === "Occidente Andes"){
            let ganadoresOccidenteAndes = seleccionarGanadores(participantesEnAndes, 2);
            todosLosGanadores = [
                ...ganadoresOccidenteAndes,
            ];
        }*/ else if (parametro === "Oriente Centro"){
            let ganadoresOrienteCentro = seleccionarGanadores(participantesEnOrienteCentro, 3);
            todosLosGanadores = [
                ...ganadoresOrienteCentro,
            ];
        }else if (parametro === "Oriente Norte"){
            let ganadoresOrienteNorte = seleccionarGanadores(participantesrienteGeneral, 3);
            todosLosGanadores = [
                ...ganadoresOrienteNorte,
            ];
        }/*else if (parametro === "Oriente Sur"){
            let ganadoresOrienteSur = seleccionarGanadores(participantesEnOrienteSur, 3);
            todosLosGanadores = [
                ...ganadoresOrienteSur,
            ];
        }*/ else if (parametro === "Oriente Insular"){
            let ganadoresOrienteInsular = seleccionarGanadores(participantesEnOrienteInsular, 4);
            todosLosGanadores = [
                ...ganadoresOrienteInsular,
            ];
        } 
        
        
        
        /*else if (parametro === "jvc") {
            let ganadoresCapital = seleccionarGanadores(participantesEnCapital, 2);
            let ganadoresCentro = seleccionarGanadores(participantesEnCentro, 2);
            let ganadoresOccidente = seleccionarGanadores(participantesEnOccidente, 2);
            let ganadoresOriente = seleccionarGanadores(participantesOriente, 2);

            todosLosGanadores = [
                ...ganadoresOriente,
                ...ganadoresCapital,
                ...ganadoresCentro,
                ...ganadoresOccidente
            ];
        } else if (parametro === "carro") {
            let ganadoresCarro = seleccionarGanadores(todosLosParticipantes, 1);

            todosLosGanadores = [
                ...ganadoresCarro
            ];
        }*/

        if (todosLosGanadores.length > 0) {
            //mostrarGanadoresEnModal(todosLosGanadores, parametroEnviar);
            todosLosGanadores.forEach(ganador => {
                cedulasSeleccionadasEnEsteSorteo.add(ganador.Cédula);
            });
            mostrarGanadoresEnTabla(todosLosGanadores, parametro);
        } else {
            console.warn("No se seleccionaron ganadores.");
        }
    });
}
// Función para mostrar los ganadores en el modal
function mostrarGanadoresEnModal(ganadores, parametro) {
    const modal = document.getElementById('modal');
    const modalContenido = modal.querySelector('.modal-contenido');
    const modalTitle = document.getElementById('modalTittle');
    const contenedorTarjetas = modal.querySelector('.contenedor_tarjetas');

    // Generar título dinámico basado en el parámetro
    const descripcionModal = parametro ? parametro.charAt(0).toUpperCase() + parametro.slice(1).toLowerCase() : null;
    let textoModal; 
    if (parametro=== "carro"){
        textoModal = descripcionModal
        ? `Ganador del "${descripcionModal}"`
        : 'Información no disponible';
    }else{
        textoModal = descripcionModal
        ? `Ganadores del "${descripcionModal}"`
        : 'Información no disponible';
    }


    modalTitle.textContent = textoModal;

    contenedorTarjetas.innerHTML = '';

    
    ganadores.forEach((ganador, index) => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('card');

        tarjeta.innerHTML = `
            <section class="content">

                <div class="info">
                    <h3 class="name">${ganador.Nombre} ${ganador.Apellido}</h3>
                        <div class="card-datos">
                            <h3 class="role">C.I: ${ganador.Cédula}</h3>
                            <h3 class="role"><strong>Factura N°</strong>${ganador['# Factura']}</h3>
                        </div
                    
                    <p>Tienda ${ganador.Tienda}, estado ${ganador.Estado}<p>
                </div>
            </section>
        `;

        if (ganadores.length === 1){
            tarjeta.classList.add('card1');
            modalContenido.classList.add('modal-contenido1')
            contenedorTarjetas.classList.add('contenedor_tarjetas1');
        }else{
            tarjeta.classList.remove('card1');
            modalContenido.classList.remove('modal-contenido1')
            contenedorTarjetas.classList.remove('contenedor_tarjetas1');
        }

        contenedorTarjetas.appendChild(tarjeta);
    });
    cerrarModal.addEventListener('click', () => {
        console.log('Cerrar modal clicado');
        modalContenido.classList.remove('activo');
        setTimeout(() => {
            modal.classList.remove('mostrar');
        }, 300);
    });

    // Mostrar el modal
    modal.classList.add('mostrar');
    setTimeout(() => {
        modalContenido.classList.add('activo');
    }, 10);
}


// Mejorar la función mostrarGanadoresEnTabla para verificar duplicados
function mostrarGanadoresEnTabla(ganadores, parametro) {
    console.log(ganadores);
    let tablaId = "tablacapital"; // Simplificado ya que todos usan la misma tabla
    
    const tabla = document.getElementById(tablaId).querySelector('.tabla_ganadores__table tbody');
    
    // Verificación adicional: obtener todas las cédulas ya en la tabla
    const cedulasEnTablaActual = new Set();
    const filasExistentes = tabla.querySelectorAll('tr');
    filasExistentes.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length > 1) {
            const cedula = celdas[1].textContent.trim();
            cedulasEnTablaActual.add(cedula);
        }
    });
    
    // Filtrar los ganadores para excluir los que ya están en la tabla
    const ganadoresFiltrados = ganadores.filter(ganador => 
        !cedulasEnTablaActual.has(ganador.Cédula)
    );
    
    if (ganadoresFiltrados.length < ganadores.length) {
        console.warn(`Se detectaron ${ganadores.length - ganadoresFiltrados.length} ganadores duplicados que no se añadirán a la tabla.`);
    }
    
    // Añadir solo los ganadores no duplicados
    ganadoresFiltrados.forEach((ganador, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${ganador.Nombre} ${ganador.Apellido}</td>
            <td>${ganador.Cédula}</td>
            <td>${ganador['# Factura']}</td>
            <td>${ganador.Tienda}</td>
            <td>${ganador.Estado}</td>
        `;
        tabla.appendChild(fila);
    });
}
async function activarTodosLosBotonesYNotificar() {
    const tablaId = "tablacapital";
    const tabla = document.getElementById(tablaId).querySelector('.tabla_ganadores__table tbody');
    const loader = document.getElementById("loader");
    loader.style.display = "block";
    
    setTimeout(() => {
        loader.style.display = "none";
    }, 3500);

    tabla.innerHTML = '';
    cedulasSeleccionadasEnEsteSorteo = new Set();
    
    setupButtonAction('activar_botonRC', 'capital');
    //setupButtonAction('activar_botonRCentro', 'centro');
    //setupButtonAction('activar_botonRCentOccidente', 'centroOccidente');
    //setupButtonAction('activar_botonROccidente', 'occidente');
    // setupButtonAction('activar_botonROccidenteAndes', 'occidenteAndes');
    //setupButtonAction('activar_botonROrienteCent', 'orienteCentro');
    //setupButtonAction('activar_botonROrientenort', 'orienteNorte');
    //setupButtonAction('activar_botonROrientesur', 'orienteSur');
    //setupButtonAction('activar_botonROrienteInsular', 'orienteInsular');

    await new Promise(resolve => setTimeout(resolve, 200));

    const botones = [
        'activar_botonRC',
        'activar_botonRCentro',
        'activar_botonRCentOccidente',
        'activar_botonROccidente',
        // 'activar_botonROccidenteAndes',
        'activar_botonROrienteCent',
        'activar_botonROrientenort',
        //'activar_botonROrientesur',
        'activar_botonROrienteInsular'
    ];

    for (const id of botones) {
        const boton = document.getElementById(id);
        if (boton) {
            boton.click();
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    mezclarFilasDeTabla(tabla);
    
    alert("Sorteo Realizado Exitosamente");
}

// Función para mezclar aleatoriamente las filas de una tabla
function mezclarFilasDeTabla(tbody) {
    const filas = Array.from(tbody.querySelectorAll('tr'));
    if (filas.length <= 1) return;
    for (let i = filas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        
        if (i !== j) {
            if (j > i) {
                tbody.insertBefore(filas[j], filas[i]);
                tbody.insertBefore(filas[i], filas[j].nextSibling);
            } else {
                tbody.insertBefore(filas[i], filas[j]);
                tbody.insertBefore(filas[j], filas[i].nextSibling);
            }
            
            [filas[i], filas[j]] = [filas[j], filas[i]];
        }
    }
    
}

document.addEventListener('DOMContentLoaded', function() {

    const botonSortear = document.getElementById('SortearElbeta');

    if (botonSortear) {
        botonSortear.addEventListener('click', activarTodosLosBotonesYNotificar);
    }
    
});






/*
// Seleccionar todos los elementos con la clase .activar
const activarElementos = document.querySelectorAll('.activar');
const modal = document.getElementById('modal');
const modalContenido = modal.querySelector('.modal-contenido');
const cerrarModal = document.getElementById('cerrarModal');
const modalTitle = document.getElementById('modalTittle');
const contenedorTarjetas = modal.querySelector('.contenedor_tarjetas');

activarElementos.forEach((elemento) => {
    elemento.addEventListener('click', () => {

        const descripcionElemento = elemento.querySelector('.descripcion, .descripcion-col');

        const numero = descripcionElemento.querySelector('h1')?.textContent.trim();

        const descripcion = descripcionElemento 
            ? descripcionElemento.textContent.replace(/\d+/g, '').trim()
            : null;


        const textoModal = descripcion 
            ? `Ganador(es) del "${descripcion}"`
            : 'Información no disponible';


        modalTitle.textContent = textoModal;
        
        contenedorTarjetas.innerHTML = '';

        const cantidad = parseInt(numero, 10) || 0;
        for (let i = 0; i < cantidad; i++) {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('card');

            tarjeta.innerHTML = `
                <section class="icon-container">
                    <svg viewBox="0 0 15 15" class="icon">
                        <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.075 12.975 13.8623 12.975 13.6C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z"></path>
                    </svg>
                </section>
                <section class="content">
                    <div class="info">
                        <h3 class="name">Usuario ${i + 1}</h3>
                        <h3 class="role"><strong>Factura N°</strong>#########</h3>
                    </div>
                </section>
            `;
            contenedorTarjetas.appendChild(tarjeta);
        }

        modal.classList.add('mostrar');
        setTimeout(() => {
            modalContenido.classList.add('activo');
        }, 10);
    });
});
*/



/*
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modalContenido.classList.remove('activo'); 
        setTimeout(() => {
            modal.classList.remove('mostrar'); 
        }, 300);
    }
});*/
