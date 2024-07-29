// Declaración de elementos del DOM
const check3 = document.getElementById('check3');
const check2 = document.getElementById('check2');
const check1 = document.getElementById('check1');
const actualizarDiv = document.getElementById('actualizar');
let detenerObservador;
let facturasCompensadas = [];
let diferenciaActual = 0;


// Asegurarse de que la función esté definida antes de llamarla
if (typeof colocarReadOnlyFacturas === "function") {
    colocarReadOnlyFacturas();
}

let dif = 0;

function reiniciarObservador() {
    monitorearActualizaciones(actualizarDiv, texto => {
        const match = texto.match(/(\d+(\.\d+)?)/);
        if (match) {
            diferenciaActual = parseFloat(match[0]);
            console.log('diferencia ' + diferenciaActual);
        }
    });
}


function monitorearActualizaciones(elemento, callback) {//observador para analizar el div que cambia de la diferencai
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                callback(elemento.textContent);
            }
        });
    });

    observer.observe(elemento, { childList: true });

    detenerObservador = () => observer.disconnect();
}

const actualizarTextoYResolver = () => {//->Promesa para actualizar los datos consultados en consola
    return new Promise((resolve, reject) => {
        monitorearActualizaciones(actualizarDiv, (texto) => {
            ///console.log("Texto capturado:", texto);
            const match = texto.match(/(\d+(\.\d+)?)/);
            if (match) {
                diferenciaActual = parseFloat(match[0]);

                resolve(diferenciaActual); // Resolver la promesa con diferenciaActual
            } else {
                console.log("No se encontró un número válido en el texto:", texto);
                reject("No se encontró un número válido");
            }
        });
    });
}

function obtenerDiferenciaActual() {//->Funcion a la que llamar para obtener el valor del observador
    return diferenciaActual;
}


// Objeto de estado para manejar la transacción y los checkboxes
const estado = {
    transaccion: '',
    checkActivo: null,
    casoActivo: null,
    setTransaccion(tipo, checkbox, caso) {  // Añadimos 'caso' como parámetro
        this.transaccion = tipo;
        this.checkActivo = checkbox;
        this.casoActivo = caso;
        console.log('Transacción establecida a:', tipo, 'Caso:', caso);
    },
    reset() {
        this.transaccion = '';
        this.checkActivo = null;
        removeCustomEventListeners(this.casoActivo);  // Pasamos el caso activo
        this.casoActivo = null;
    }
};

function removeCustomEventListeners(caso) {
    const monto = document.getElementById('monto');
    
    switch(caso) {
        case 1:
            monto.removeEventListener('input', casoUnoTresInputHandler);
            break;
        case 3:
            monto.removeEventListener('input', casoUnoTresInputHandler);
            break;
        case 2:
            monto.removeEventListener('input', montoInputHandler);
            document.removeEventListener('sYtActualizados', sYtActualizadosHandler);
            break;
        default:
            console.log('No hay listeners específicos para eliminar');
    }
}
    // Función común para manejar los cambios en los checkboxes
function handleCheckChange(event, tipo) {
    const checkbox = event.target;
    
    if (checkbox.checked) {
        // Desactivar los otros checkboxes
        [check1, check2, check3].forEach(check => {
            if (check !== checkbox) {
                check.disabled = true;
                check.checked = false;
            }
        });
        
        // Configurar elementos del DOM
        const bancoReceptor = tipo === 'bs' ? 
            document.getElementById('banco_receptor') : 
            document.getElementById('banco_receptor_dolar');
        const bancoReceptorAlt = tipo === 'bs' ? 
            document.getElementById('banco_receptor_dolar') : 
            document.getElementById('banco_receptor');
        
        bancoReceptor.classList.remove('d-none');
        bancoReceptorAlt.classList.add('d-none');
        bancoReceptorAlt.required = false;
        bancoReceptor.required = true;
        
        // Obtener elementos necesarios
        const checkboxes = document.querySelectorAll('#check5Ven');
        const checkboxesDos = document.querySelectorAll('#check5');
        const mensaje = document.querySelector('.mensaje');
        const monto = document.getElementById('monto');
        const containerFacts = document.querySelectorAll('.vencidos');
        const noVencidas = document.querySelectorAll('.NOvencidos');
        // Lógica de casos
        let caso;
        if (containerFacts.length > 0 && noVencidas.length === 0) {
            console.log('El cliente solo tiene facturas vencidas, por lo tanto no puede escoger la que quiera');
            colocarReadOnlyFacturas();
            caso = 1;
            casoUno(bancoReceptor, mensaje, monto, checkboxes, estado.transaccion);
        } else if (containerFacts.length > 0 && noVencidas.length > 0) {
            console.log('El cliente tiene facturas vencidas y también no vencidas');
            colocarReadOnlyFacturas();
            caso = 2;
            casoDos(bancoReceptor, mensaje, monto, checkboxes, containerFacts, noVencidas, estado.transaccion);
        } else if (containerFacts.length === 0 && noVencidas.length > 0) {
            console.log('El cliente no tiene facturas vencidas, por lo tanto puede escoger la que quiera');
            caso = 3;
            casoTres(bancoReceptor, mensaje, monto, checkboxesDos, estado.transaccion);
        }else if(containerFacts.length === 0 && noVencidas.length === 0){
            console.log( 'El cliente no tiene  facturas ')
            caso= 4;
            casoCuatro(bancoReceptor, mensaje, estado.transaccion)
        }
        
        // Establecer la transacción con el caso determinado
        estado.setTransaccion(tipo, checkbox, caso);
    } else {
        // Restablecer el estado
        const bancoReceptor = document.getElementById('banco_receptor');
        const bancoReceptorDolar = document.getElementById('banco_receptor_dolar');
        const mensaje = document.querySelector('.mensaje');
        const monto = document.getElementById('monto');
        const checkboxes = document.querySelectorAll('#check5Ven, #check5');
        estado.reset();
        [check1, check2, check3].forEach(check => check.disabled = false);
        restablecerEstado(bancoReceptor, mensaje, monto, checkboxes);
        restablecerEstado(bancoReceptorDolar, mensaje, monto, checkboxes);
    }
}
    
    // Asignar los event listeners
    document.addEventListener('DOMContentLoaded', function() {
        if (check1 && check2 && check3) {
        check1.addEventListener('change', (e) => handleCheckChange(e, '$'));
        check2.addEventListener('change', (e) => handleCheckChange(e, '$'));
        check3.addEventListener('change', (e) => handleCheckChange(e, 'bs'));
        }else{
            
        }
    });
    function casoUno(bancoReceptor, mensaje, monto, checkboxes, transaccion) {
        estado.setTransaccion(transaccion, null, 1);
        
        // Configuración inicial
        bancoReceptor.removeAttribute('disabled');
        bancoReceptor.value = '';
        mensaje.classList.add('d-none');
    
        // Asignar el event listener
        monto.addEventListener('input', casoUnoTresInputHandler);
    }

    function casoCuatro(bancoReceptor, mensaje, transaccion) {
        estado.setTransaccion(transaccion, null, 1);
        
        // Configuración inicial
        bancoReceptor.removeAttribute('disabled');
        bancoReceptor.value = '';
        mensaje.classList.add('d-none');

    }
    function montoInputHandler(event) {
        const monto = event.target;
        const montoValue = parseFloat(monto.value);
        const checkboxes = casoDos.checkboxes;
        const noVencidas = casoDos.noVencidas;
        const checkboxesDos = document.querySelectorAll('#check5');
        let sumaFacturas = 0;
    
        // Limpiar y resetear estados
        noVencidas.forEach(noVencida => noVencida.checked = false);
        eliminarInputs('input[id^="inputFactura"]', 'input[id^="inputfacturaMonto"]', 'input[id^="inputfkdat"]', 'input[id^="inputbelnr1"]', 'input[id^="inputbuzei"]');
        eliminarClaseEvaluando();
        checkboxes.forEach(resetCheckbox);
        checkboxesDos.forEach(resetCheckbox);
    
        if (monto.value === '') {
            limpiarYResetearEstados();
            return;
        }
    
        // Manejar cambios negativos o significativos en el monto
        if (montoValue <= 0) {
            limpiarYResetearEstados();
            facturasCompensadas = [];
            console.log('Monto negativo o cero detectado, lista de facturas compensadas vaciada');
            return;
        }
    
        const montodpp = estado.transaccion === "bs" ? "#montobsdpp" : "#Montodlrdpp";
        const montoNormal = estado.transaccion === "bs" ? "#montoBs" : "#Montodlr";
        const montoElements = obtenerElementosMonto(checkboxes, montodpp, montoNormal);
        s = procesarFacturas(checkboxes, montoElements, montoValue, sumaFacturas, estado.transaccion);
        document.dispatchEvent(new CustomEvent('sYtActualizados'));
    }
    
    function limpiarYResetearEstados() {
        const checkboxes = casoDos.checkboxes;
        const noVencidas = casoDos.noVencidas;
        const checkboxesDos = document.querySelectorAll('#check5');
    
        noVencidas.forEach(noVencida => noVencida.checked = false);
        checkboxes.forEach(resetCheckbox);
        checkboxesDos.forEach(resetCheckbox);
        limpiarDivs('.texto-faltante', 'facts');
        limpiarDivs('.texto-abono', 'abon');
        eliminarInputs('input[id^="inputFactura"]', 'input[id^="inputfacturaMonto"]', 'input[id^="inputfkdat"]', 'input[id^="inputbelnr1"]', 'input[id^="inputbuzei"]');
        eliminarClaseEvaluando();
        actualizarDiv.textContent = "";
    }
    
    async function sYtActualizadosHandler(event) {
        await actualizarTextoYResolver();
        const valorActual = obtenerDiferenciaActual();
        console.log(valorActual);
    
        const containerFacts = casoDos.containerFacts;
        const noVencidas = casoDos.noVencidas;
        const checkboxesDos = document.querySelectorAll('#check5');
        
        const lengthsIguales = s && containerFacts && s.length === containerFacts.length;
    
        if (!lengthsIguales) {
            checkboxesDos.forEach(resetCheckbox);
        }
    
        if (lengthsIguales && valorActual > 0) {
            quitarReadOnlyYDisabledFacturasCaso3(noVencidas);
            console.log("ya puede escoger");
            noVencidas.forEach(noVencida => noVencida.checked = false);
            detenerObservador();
            console.log('se detuvo el observador');
    
            const montodpp = estado.transaccion === "bs" ? "#montobsdpp" : "#Montodlrdpp";
            const montoNormal = estado.transaccion === "bs" ? "#montoBs" : "#Montodlr";
            
            procesarFacturasCasoTres(checkboxesDos, valorActual, montodpp, montoNormal, estado.transaccion);
        } else {
            colocarReadOnlyFacturas();
            checkboxesDos.forEach(resetCheckbox);
            noVencidas.forEach(noVencida => noVencida.checked = false);
        }
    }
    
    function casoDos(bancoReceptor, mensaje, monto, checkboxes, containerFacts, noVencidas) {
        // Establecer el estado
        estado.setTransaccion(estado.transaccion, null, 2);
    
        // Configuración inicial
        bancoReceptor.removeAttribute('disabled');
        bancoReceptor.value = '';
        mensaje.classList.add('d-none');
    
        // Guardar referencias para uso en los handlers
        casoDos.checkboxes = checkboxes;
        casoDos.containerFacts = containerFacts;
        casoDos.noVencidas = noVencidas;
    
        // Agregar event listeners
        monto.addEventListener('input', montoInputHandler);
        document.addEventListener('sYtActualizados', sYtActualizadosHandler);
    }
    
function casoTres(bancoReceptor, mensaje, monto, checkboxes, transaccion) {
    estado.setTransaccion(transaccion, null, 3);
    
    // Configuración inicial
    bancoReceptor.removeAttribute('disabled');
    bancoReceptor.value = '';
    mensaje.classList.add('d-none');

    // Asignar el event listener
    monto.addEventListener('input', casoUnoTresInputHandler);
}


function casoUnoTresInputHandler(event) {
    const monto = event.target;
    const montoValue = parseFloat(monto.value);
    const checkboxes = document.querySelectorAll('#check5, #check5Ven');
    let sumaFacturas = 0;

    // Determinar montodpp y montoNormal basado en estado.transaccion
    const montodpp = estado.transaccion === "bs" ? "#montobsdpp" : "#Montodlrdpp";
    const montoNormal = estado.transaccion === "bs" ? "#montoBs" : "#Montodlr";

    // Limpiar y resetear elementos
    eliminarInputs('input[id^="inputFactura"]', 'input[id^="inputfacturaMonto"]', 'input[id^="inputfkdat"]', 'input[id^="inputbelnr1"]', 'input[id^="inputbuzei"]');
    eliminarClaseEvaluando();
    checkboxes.forEach(checkbox => resetCheckbox(checkbox));

    if (monto.value === '') {
        limpiarDivs('.texto-faltante', 'facts');
        limpiarDivs('.texto-abono', 'abon');
        actualizarDiv.textContent = "";
        facturasCompensadas = [];
        console.log('Lista de facturas compensadas vaciada');
        return;
    }

    // Lógica específica para cada caso
    if (estado.casoActivo === 1) {
        const montoElements = obtenerElementosMonto(checkboxes, montodpp, montoNormal);
        procesarFacturas(checkboxes, montoElements, montoValue, sumaFacturas, estado.transaccion);
    } else if (estado.casoActivo === 3) {
        actualizarDiv.textContent = `${montoValue} ${estado.transaccion}`;
        quitarReadOnlyYDisabledFacturas();
        procesarFacturasCasoTres(checkboxes, montoValue, montodpp, montoNormal, estado.transaccion);
    }
}



//----------------------> A partir de aquí se describen las funciones para procesar las facturas  




function procesarFacturas(checkboxes, montoElements, montoValue, sumaFacturas , transaccion) {
    const actualizarDiv = document.getElementById('actualizar');
    facturasCompensadas = [];
    const containerFacts = document.querySelectorAll('.vencidos');
    
    if (estado.transaccion === "bs"){
        
        montoNormal="#montoBs";
        montodpp= "#montobsdpp";

    } else if(estado.transaccion === "$"){
        montoNormal="#Montodlr";
        montodpp= "#Montodlrdpp";


    }
    transaccion= estado.transaccion
    for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        const label = checkbox.parentNode;
        const montosElement = label.querySelector('.montos');
        montosElement.classList.add('evaluando');
        const elementoDiv = montoElements[i];
        const textoDelElemento = elementoDiv ? elementoDiv.textContent : '';
        const valorSinSimbolo = textoDelElemento.slice(0, -2);
        const valorNumerico = parseFloat(valorSinSimbolo.replace(',', ''));
        const montoFactura = redondear(valorNumerico, 2); // Redondear a 2 decimales

        checkbox.checked = false;
        label.classList.remove('listo');

        const vblen = document.getElementById('vbeln' + (i + 1))?.textContent;
        const fkdat = document.getElementById('fkdat' + (i + 1))?.textContent;
        const belnr1 = document.getElementById('belnr1' + (i + 1))?.textContent;
        const buzei = document.getElementById('buzei' + (i + 1))?.textContent;
        const dif = redondear(montoValue - sumaFacturas, 2); // Redondear a 2 decimales

        
        

        if (sumaFacturas + montoFactura <= montoValue) {
            gestionarInputs(label, montosElement, i, vblen, montoFactura, dif, fkdat, belnr1, buzei);
            sumaFacturas = redondear(sumaFacturas + montoFactura, 2); // Redondear sumaFacturas
            /*console.log('se compenso la factura ' + vblen)
            console.log('suma de facturas hasta ahora: ' + sumaFacturas)*/
            checkbox.checked = true;
            label.classList.add('listo');
            limpiarDivs('.texto-faltante', 'facts', label);
            limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
            diferenciass = redondear(montoValue-sumaFacturas, 2); // Actualizar dif correctamente
            //console.log(diferenciass);
            actualizarDiv.textContent = `${diferenciass.toFixed(2)}` + transaccion;

            facturasCompensadas.push({
                vblen: vblen,
                fkdat: fkdat,
                belnr1: belnr1,
                buzei: buzei,
                monto: montoFactura
            });

            if (facturasCompensadas.length == containerFacts.length){
                break;
            }
        } else {
            console.log(transaccion)
            
            const montoFaltante = redondear(montoFactura - (montoValue - sumaFacturas), 2);
            const montoAbono = redondear(montoValue - sumaFacturas, 2);
            const textoFaltanteDiv = label.querySelector('.texto-faltante');
            ///textoFaltanteDiv.textContent = `Monto pendiente: ${montoFaltante} `+ transaccion;
            const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');
            ///textoAbonoDiv.textContent = `Monto abonado: ${montoAbono.toFixed(2)} `+ transaccion;
            //textoFaltanteDiv.classList.add('facts'); ->Comentado para abonos
            //textoAbonoDiv.classList.add('abon'); ->Comentado para abonos
            diferenciass = redondear(montoValue-sumaFacturas, 2); // Actualizar dif correctamente
            //console.log(diferenciass);
            actualizarDiv.textContent = `${diferenciass.toFixed(2)} ` + transaccion;

            
        }
    }
    return facturasCompensadas;
}

// Función para redondear valores a n decimales
function redondear(valor, decimales) {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
}
// Función para procesar facturas en caso dos
function procesarFacturasCasoDos(checkboxes, montoValue, montodpp, montoNormal, transaccion) {
    quitarReadOnlyYDisabledFacturas();
    const checksSeleccionados = [];
    let abonoRealizado = false;
    let facturaParcial = null;
    let sumaFacturasSeleccionadas = 0;
    const checkboxesArray = Array.from(checkboxes);

    checkboxesArray.forEach(checkbox => {
        checkbox.removeEventListener('change', checkbox.changeHandler);

        checkbox.changeHandler = function() {
            const label = this.parentNode;
            const montosElement = label.querySelector('.montos');
            const elementoMonto = obtenerElementoMontoDos(this, montodpp, montoNormal);
            const textoDelElemento = elementoMonto ? elementoMonto.textContent : '';
            const valorSinSimbolo = textoDelElemento.slice(0, -2);
            const valorNumerico = parseFloat(valorSinSimbolo.replace(',', ''));
            const montoFactura = valorNumerico;
            console.log(transaccion)
            if (this.checked) {
                if (!checksSeleccionados.includes(this)) {
                    checksSeleccionados.push(this);
                }

                if (montosElement) {
                    montosElement.classList.add('evaluando');
                }

                sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas + montoFactura).toFixed(2));
                label.classList.remove('listo');


                const posicionArray = checkboxesArray.indexOf(checkbox);
                const vblen = document.getElementById('vbeln' + (posicionArray + 1))?.textContent;
                const fkdat = document.getElementById('fkdat' + (posicionArray + 1))?.textContent;
                const belnr1 = document.getElementById('belnr1' + (posicionArray + 1))?.textContent;
                const buzei = document.getElementById('buzei' + (posicionArray + 1))?.textContent;
                const dif = sumaFacturasSeleccionadas - montoValue;

                if (dif < 0) {
                    dif == 0.00;
                }


                if (!abonoRealizado) {
                    gestionarInputs(label, montosElement, posicionArray, vblen, montoFactura, dif, fkdat, belnr1, buzei);
                    console.log(transaccion)
                    if (sumaFacturasSeleccionadas <= montoValue) {
                        console.log(transaccion)
                        checkbox.checked = true;
                        label.classList.add('listo');
                        limpiarDivs('.texto-faltante', 'facts', label);
                        limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
                        const diferenciaDos = (parseFloat(montoValue) - sumaFacturasSeleccionadas).toFixed(2);
                        actualizarDiv.textContent = `${diferenciaDos} ` + transaccion;

                    } else {
                        console.log(transaccion)
                        const montoFaltante = (sumaFacturasSeleccionadas - montoValue).toFixed(2);
                        const montoAbono = (montoValue - (sumaFacturasSeleccionadas - montoFactura)).toFixed(2);
                        const textoFaltanteDiv = label.querySelector('.texto-faltante');
                        textoFaltanteDiv.textContent = `Monto pendiente: ${montoFaltante} ` + transaccion;
                        const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');
                        textoAbonoDiv.textContent = `Monto abonado: ${montoAbono} ` + transaccion;
                        actualizarDiv.textContent = `${0.00} ` + transaccion;
                        textoFaltanteDiv.classList.add('facts');
                        textoAbonoDiv.classList.add('abon');
                        abonoRealizado = true;

                        facturaParcial = posicionArray;
                        colocarReadOnlyFacturasDos(facturaParcial);

                    }
                } else {
                    colocarReadOnlyFacturasDos(facturaParcial);
                }
            } else {
                const index = checksSeleccionados.indexOf(this);
                if (index > -1) {
                    const elementoMonto = obtenerElementoMontoDos(this, montodpp, montoNormal);
                    const textoDelElemento = elementoMonto ? elementoMonto.textContent : '';
                    const valorSinSimbolo = textoDelElemento.slice(0, -2);
                    const valorNumerico = parseFloat(valorSinSimbolo.replace(',', ''));
                    const montoFactura = valorNumerico;

                    checksSeleccionados.splice(index, 1);
                    sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                    actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} ` + transaccion;
                    resetCheckbox(this);
                    const posicionArray = checkboxesArray.indexOf(checkbox);
                    const vblen = document.getElementById('vbeln' + (posicionArray + 1))?.textContent;
                    eliminarClaseEvaluando(montosElement);
                    eliminarInputsDos(posicionArray);
                }
                abonoRealizado = false;
                quitarReadOnlyYDisabledFacturas();
                eliminarClaseEvaluando(montosElement);
            }
        };

        checkbox.addEventListener('change', checkbox.changeHandler);
    });
}


function procesarFacturasCasoTres(checkboxes, montoValue,  montodpp, montoNormal, transaccion) {
    console.log('sssssss')
    quitarReadOnlyYDisabledFacturas();
    const checksSeleccionados = [];
    let abonoRealizado = false;
    let facturaParcial = null;
    let sumaFacturasSeleccionadas = 0;

    const checkboxesArray = Array.from(checkboxes);

    checkboxesArray.forEach(checkbox => {
        checkbox.removeEventListener('change', checkbox.changeHandler);

        checkbox.changeHandler = function() {
            const label = this.parentNode;
            const montosElement = label.querySelector('.montos');
            if (this.checked) {
                if (!checksSeleccionados.includes(this)) {
                    checksSeleccionados.push(this);
                }

                if (montosElement) {
                    montosElement.classList.add('evaluando');
                }
                const elementoMonto = obtenerElementoMontoDos(this, montodpp, montoNormal);
                const textoDelElemento = elementoMonto ? elementoMonto.textContent : '';
                const valorSinSimbolo = textoDelElemento.slice(0, -2);
                const valorNumerico = parseFloat(valorSinSimbolo.replace(',', ''));
                const montoFactura = valorNumerico;
                sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas + parseFloat(montoFactura)).toFixed(2));
                label.classList.remove('listo');
            
                const posicionArray = checkboxesArray.indexOf(checkbox);
                const vblen = document.getElementById('vbeln' + (posicionArray + 1))?.textContent;
                const fkdat = document.getElementById('fkdat' + (posicionArray + 1))?.textContent;
                const belnr1 = document.getElementById('belnr1' + (posicionArray + 1))?.textContent;
                const buzei = document.getElementById('buzei' + (posicionArray + 1))?.textContent;
                const dif =  sumaFacturasSeleccionadas - montoValue ;
                if (dif < 0){
                    dif==0.00
                }

                const diferenciaInput = redondear(montoValue - (sumaFacturasSeleccionadas - montoFactura), 2)
                ///actualizarDiv.textContent = `${parseFloat(dif).toFixed(2)} ` + transaccion; // Actualizar el contenido del div
                console.log("Se seleccionó la factura: " + vblen + " con un monto de " + valorNumerico);
                console.log("Suma total hasta ahora: " + sumaFacturasSeleccionadas);
                

                if (!abonoRealizado) {

                    

                    if (sumaFacturasSeleccionadas <= montoValue) {
                        
                        gestionarInputs(label, montosElement, posicionArray, vblen, montoFactura, diferenciaInput, fkdat, belnr1, buzei);
                        console.log(transaccion)
                        checkbox.checked = true;
                        label.classList.add('listo');
                        limpiarDivs('.texto-faltante', 'facts', label);
                        limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
                        actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} `+ transaccion; // Actualizar el contenido del div
                    } else {
                        checkbox.checked= false;
                        sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                        
                        actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} ` + transaccion; // Actualizar el contenido del div
                        console.log("La selección de esta factura hace que la suma exceda el monto permitido. La suma se ha anulado.");
                        console.log(sumaFacturasSeleccionadas)
                        facturaParcial = posicionArray;
                        colocarReadOnlyFacturastres(facturaParcial)
                        
                        /*
                        
                        const montoFaltante = (sumaFacturasSeleccionadas - montoValue).toFixed(2);
                        const montoAbono = (montoValue - (sumaFacturasSeleccionadas - montoFactura)).toFixed(2);
                        const textoFaltanteDiv = label.querySelector('.texto-faltante');
                        textoFaltanteDiv.textContent = `Monto pendiente: ${montoFaltante} `+ transaccion;
                        const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');
                        textoAbonoDiv.textContent = `Monto abonado: ${montoAbono} `+ transaccion;
                        actualizarDiv.textContent = `${0.00} ` + transaccion; // Actualizar el contenido del div
                        ///textoFaltanteDiv.classList.add('facts');->Comentado para los abonos
                        ///textoAbonoDiv.classList.add('abon'); ->Comentado para los abonos
                        abonoRealizado = true;

                        facturaParcial = posicionArray;
                        colocarReadOnlyFacturasDos(facturaParcial)*/
                    }
                } else {
                    colocarReadOnlyFacturasDos(facturaParcial)
                }
            } else {
                const index = checksSeleccionados.indexOf(this);
                if (index > -1) {
                    checksSeleccionados.splice(index, 1);
                    const elementoMonto = obtenerElementoMontoDos(this, montodpp, montoNormal);
                    const textoDelElemento = elementoMonto ? elementoMonto.textContent : '';
                    const valorSinSimbolo = textoDelElemento.slice(0, -2);
                    const valorNumerico = parseFloat(valorSinSimbolo.replace(',', ''));
                    const montoFactura = valorNumerico;
                    sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                    actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} `+ transaccion; // Actualizar el contenido del div
                    console.log(`Diferencia actual: ${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} `+ transaccion);

                    resetCheckbox(this);
                    const posicionArray = checkboxesArray.indexOf(checkbox);
                    const vblen = document.getElementById('vbeln' + (posicionArray + 1))?.textContent;
                    console.log("Se desmarcó la factura: " + vblen + " con un monto de " + valorNumerico);
                    console.log("Suma total hasta ahora: " + sumaFacturasSeleccionadas);
                    eliminarClaseEvaluando(montosElement);
                    eliminarInputsDos(posicionArray);
                }
                abonoRealizado = false;
                quitarReadOnlyYDisabledFacturas();
                eliminarClaseEvaluando(montosElement);
            }
        };

        checkbox.addEventListener('change', checkbox.changeHandler);
    });
}


function obtenerElementoMontoDos(checkbox, montodpp, montoNormal) {
    const label = checkbox.parentNode;
    const montobsdppElement = label.querySelector(montodpp);
    if (montobsdppElement) {
        return montobsdppElement;
    } else {
        const montoBsElement = label.querySelector(montoNormal);
        if (montoBsElement) {
            return montoBsElement;
        }
    }
    return null; // Devuelve null si no se encuentra ningún elemento de monto
}



//------------------> A partir de aquí se describen las funciones para reestablecer estados de las facturas 


function colocarReadOnlyFacturas() {
    // Selecciona los elementos con la clase 'divisa'
    const facturas = document.querySelectorAll('.cheket');
    facturas.forEach(factura => {
        // Añade el atributo 'readonly'
        factura.setAttribute('readonly', '');
        // Añade el atributo 'disabled'
        factura.setAttribute('disabled', '');
    });
}


function eliminarClaseEvaluando() {
    const montosElements = document.querySelectorAll('.montos');
    montosElements.forEach(montosElement => {
        montosElement.classList.remove('evaluando');
    });
}

function limpiarDivs(selector, clase, parent = document) {
    const divs = parent.querySelectorAll(selector);
    divs.forEach(div => {
        div.textContent = '';
        div.classList.remove(clase);
    });
}


function desmarcarCheckboxes(checkboxes) {
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}


function quitarReadOnlyYDisabledFacturas() {
    // Selecciona los elementos con la clase 'divisa'
    const facturas = document.querySelectorAll('.cheket');
    
    // Itera sobre cada elemento seleccionado
    facturas.forEach(factura => {
        // Elimina el atributo 'readonly'
        factura.removeAttribute('readonly');
        // Elimina el atributo 'disabled'
        factura.removeAttribute('disabled');
    });
}


function colocarReadOnlyFacturasDos(posicion) {
    const facturas = document.querySelectorAll('.NOvencidos');


    facturas.forEach((factura, index) => {
        const inputs = factura.querySelectorAll('input, select, textarea');
        if (index === posicion) {
            inputs.forEach(input => {
                input.removeAttribute('readonly');
                input.removeAttribute('disabled');
            });
        } else {
            inputs.forEach(input => {
                input.setAttribute('readonly', 'true');
                input.setAttribute('disabled', 'true');
            });
        }
    });
}

function colocarReadOnlyFacturastres(posicion) {
    const facturas = document.querySelectorAll('.NOvencidos');


    facturas.forEach((factura, index) => {
        const inputs = factura.querySelectorAll('input, select, textarea');
        if (index === posicion) {
            inputs.forEach(input => {
                input.setAttribute('readonly');
                input.setAttribute('disabled');
            });
        } else {
            inputs.forEach(input => {
                input.removeAttribute('readonly', 'true');
                input.removeAttribute('disabled', 'true');
            });
        }
    });
}



// Funcion para inicializar reseteando los botones
function resetCheckbox(checkbox) {
    checkbox.checked = false;
    checkbox.disabled = true;
    checkbox.parentNode.classList.remove('listo');

    const textoFaltanteDiv = checkbox.parentNode.querySelector('.texto-faltante');
    textoFaltanteDiv.textContent = '';
    textoFaltanteDiv.classList.remove('facts');

    const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');
    textoAbonoDiv.textContent = '';
    textoAbonoDiv.classList.remove('abon');
}


function quitarReadOnlyYDisabledFacturasCaso3(containerFacts) {
    const inputsEncontrados = [];
    containerFacts.forEach(container => {
        const inputs = container.querySelectorAll('input');
        inputsEncontrados.push(...inputs);
    });

    // Itera sobre cada input encontrado
    inputsEncontrados.forEach(input => {
        // Elimina el atributo 'readonly'
        input.removeAttribute('readonly');
        // Elimina el atributo 'disabled'
        input.removeAttribute('disabled');
    });
}



function habilitarCheckboxesNoVencidos(noVencidas) {
    // Asumiendo que noVencidas es un NodeList de elementos div que contienen los checkboxes
    noVencidas.forEach(div => {
        const checkbox = div.querySelector('.cheket');
        if (checkbox) {
            checkbox.removeAttribute('readonly');
            checkbox.removeAttribute('disabled');
        }
    });
}

//Esta funcion  es para ir pasando los datos de montos
function obtenerElementosMonto(checkboxes, dpp, normal) {
    const montoElements = [];
    for (let i = 0; i < checkboxes.length; i++) {
        const label = checkboxes[i].parentNode;
        const montobsdppElement = label.querySelector(dpp);
        if (montobsdppElement) {
            montoElements.push(montobsdppElement);
        } else {
            const montoBsElement = label.querySelector(normal);
            if (montoBsElement) {
                montoElements.push(montoBsElement);
            }
        }
    }
    return montoElements;
}



//Función para eliminar la clase de guia evaluando
function eliminarClaseEvaluandoDos(element) {
    if (element) {
        element.classList.remove('evaluando');
    }
}

function desmarcarTodosCheckboxes() {
    // Selecciona todos los checkboxes con la clase 'checket'
    const checkboxes = document.querySelectorAll('.divisa');

    // Itera sobre cada checkbox y establece su propiedad 'checked' a 'false'
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Opcional: Log para verificar cuántos checkboxes fueron desmarcados
    console.log(`${checkboxes.length} checkboxes desmarcados.`);
}


///Funcion para reestablacer toodo 
function restablecerEstado(bancoReceptor, mensaje, monto, checkboxes) {
    desmarcarTodosCheckboxes()
    bancoReceptor.setAttribute('disabled', 'disabled');
    bancoReceptor.value = '';
    mensaje.classList.remove('d-none');
    check1.disabled = false;
    check2.disabled = false;
    check3.disabled = false;
    monto.value = '';
    eliminarInputs('input[id^="inputFactura"]', 'input[id^="inputfacturaMonto"]', 'input[id^="inputfkdat"]', 'input[id^="inputbelnr1"]', 'input[id^="inputbuzei"]');
    eliminarClaseEvaluando();
    limpiarDivs('.texto-faltante', 'facts');
    limpiarDivs('.texto-abono', 'abon');
    desmarcarCheckboxes(checkboxes);
    const labels = document.querySelectorAll('label');
        labels.forEach(label => {
        label.classList.remove('listo');
    });
    actualizarDiv.textContent = ""; // Actualizar el contenido del div
}



// Función para resetear el estado del checkbox
function resetCheckboxDos(checkbox) {
    checkbox.checked = false;
    checkbox.disabled = true; // Añade disabled para evitar interacción
    checkbox.parentNode.classList.remove('listo');

    const textoFaltanteDiv = checkbox.parentNode.querySelector('.texto-faltante');
    if (textoFaltanteDiv) {
        textoFaltanteDiv.textContent = '';
        textoFaltanteDiv.classList.remove('facts');
    }

    const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');
    if (textoAbonoDiv) {
        textoAbonoDiv.textContent = '';
        textoAbonoDiv.classList.remove('abon');
    }
}


//Funcion para insertar inputs
function gestionarInputs(label, montosElement, i, vblen, montoFactura, dif, fkdat, belnr1, buzei) {
    // Seleccionar elementos de entrada existentes
    let inputElement = label.querySelector(`#inputFactura${i}`);
    let inputElementMonto = label.querySelector(`#inputfacturaMonto${i}`);
    let inputElementfkdat = label.querySelector(`#inputfkdat${i}`);
    let inputElementbelnr1 = label.querySelector(`#inputbelnr1${i}`);
    let inputElementbuzei = label.querySelector(`#inputbuzei${i}`);
    const valorSinComa = montoFactura.toString().replace(',', '.');

    // Verificar si la clase 'evaluando' está presente
    if (montosElement.classList.contains('evaluando')) {
        // Crear y agregar input de número de factura si no existe
        if (!inputElement) {
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.name = `inputFactura${i}`;
            inputElement.className = 'd-none';
            inputElement.value = vblen.toString();
            inputElement.id = `inputFactura${i}`;
            label.appendChild(inputElement);
        }

        // Crear y agregar input de monto si no existe
        if (!inputElementMonto) {
            inputElementMonto = document.createElement('input');
            inputElementMonto.type = 'text';
            inputElementMonto.name = `inputfacturaMonto${i}`;
            inputElementMonto.className = 'd-none';
            console.log(dif)
            console.log(valorSinComa)
            // Determinar el valor del input de monto
            if (dif >= montoFactura) {
                inputElementMonto.value = valorSinComa;
            } else {
                inputElementMonto.value = dif.toFixed(2).toString();
            }

            inputElementMonto.id = `inputfacturaMonto${i}`;
            label.appendChild(inputElementMonto);
        }

        // Crear y agregar input de fecha si no existe
        if (!inputElementfkdat) {
            inputElementfkdat = document.createElement('input');
            inputElementfkdat.type = 'text';
            inputElementfkdat.name = `inputfkdat${i}`;
            inputElementfkdat.className = 'd-none';
            inputElementfkdat.value = fkdat.toString();
            inputElementfkdat.id = `inputfkdat${i}`;
            label.appendChild(inputElementfkdat);
        }

        // Crear y agregar input belnr1 si no existe
        if (!inputElementbelnr1) {
            inputElementbelnr1 = document.createElement('input');
            inputElementbelnr1.type = 'text';
            inputElementbelnr1.name = `inputbelnr1${i}`;
            inputElementbelnr1.className = 'd-none';
            inputElementbelnr1.value = belnr1.toString();
            inputElementbelnr1.id = `inputbelnr1${i}`;
            label.appendChild(inputElementbelnr1);
        }

        // Crear y agregar input buzei si no existe
        if (!inputElementbuzei) {
            inputElementbuzei = document.createElement('input');
            inputElementbuzei.type = 'text';
            inputElementbuzei.name = `inputbuzei${i}`;
            inputElementbuzei.className = 'd-none';
            inputElementbuzei.value = buzei.toString();
            inputElementbuzei.id = `inputbuzei${i}`;
            label.appendChild(inputElementbuzei);
        }

    } else {
        // Eliminar los inputs si existen y ya no se está evaluando
        if (inputElement) {
            label.removeChild(inputElement);
        }
        if (inputElementMonto) {
            label.removeChild(inputElementMonto);
        }
        if (inputElementfkdat) {
            label.removeChild(inputElementfkdat);
        }
        if (inputElementbelnr1) {
            label.removeChild(inputElementbelnr1);
        }
        if (inputElementbuzei) {
            label.removeChild(inputElementbuzei);
        }
        console.log('eliminado');
    }
}


//Funcion para eliminar inputs
function eliminarInputs(inputFacturaIds, inputFacturaMontoIds, inputFkdatIds, inputBelnr1Ids, inputBuzeiIds) {
    // Obtener elementos de entrada por su ID
    const inputFacturaElements = document.querySelectorAll(inputFacturaIds);
    const inputFacturaMontoElements = document.querySelectorAll(inputFacturaMontoIds);
    const inputFkdatElements = document.querySelectorAll(inputFkdatIds);
    const inputBelnr1Elements = document.querySelectorAll(inputBelnr1Ids);
    const inputBuzeiElements = document.querySelectorAll(inputBuzeiIds);

    // Eliminar elementos de entrada
    inputFacturaElements.forEach(inputElement => {
        inputElement.parentNode.removeChild(inputElement);
    });

    inputFacturaMontoElements.forEach(inputElementMonto => {
        inputElementMonto.parentNode.removeChild(inputElementMonto);
    });

    inputFkdatElements.forEach(inputElementFkdat => {
        inputElementFkdat.parentNode.removeChild(inputElementFkdat);
    });

    inputBelnr1Elements.forEach(inputElementBelnr1 => {
        inputElementBelnr1.parentNode.removeChild(inputElementBelnr1);
    });

    inputBuzeiElements.forEach(inputElementBuzei => {
        inputElementBuzei.parentNode.removeChild(inputElementBuzei);
    });
}

function eliminarInputsDos(posicionArray) {
    // Construir los selectores para los inputs específicos
    const inputFacturaId = `input[id="inputFactura${posicionArray}"]`;
    const inputFacturaMontoId = `input[id="inputfacturaMonto${posicionArray}"]`;
    const inputFkdatId = `input[id="inputfkdat${posicionArray}"]`;
    const inputBelnr1Id = `input[id="inputbelnr1${posicionArray}"]`;
    const inputBuzeiId = `input[id="inputbuzei${posicionArray}"]`;

    // Obtener y eliminar los elementos específicos
    const inputFactura = document.querySelector(inputFacturaId);
    const inputFacturaMonto = document.querySelector(inputFacturaMontoId);
    const inputFkdat = document.querySelector(inputFkdatId);
    const inputBelnr1 = document.querySelector(inputBelnr1Id);
    const inputBuzei = document.querySelector(inputBuzeiId);

    if (inputFactura) inputFactura.remove();
    if (inputFacturaMonto) inputFacturaMonto.remove();
    if (inputFkdat) inputFkdat.remove();
    if (inputBelnr1) inputBelnr1.remove();
    if (inputBuzei) inputBuzei.remove();
}



document.addEventListener('DOMContentLoaded', function() {//->Esto verifica si se ha ingresado un monto para mostrar el mensaje de indicación
    const monto = document.getElementById('monto');
    const atention = document.querySelector('.atention');
    const mensajeDos = document.querySelector('.mensajeDos');

    if (atention && mensajeDos) {  // Verificar si los elementos existen
        atention.addEventListener('mouseover', function() {
            if (monto && monto.value === '') {
                mensajeDos.classList.add('d-block');
                mensajeDos.classList.remove('d-none');
            }
        });

        atention.addEventListener('mouseout', function() {
            mensajeDos.classList.remove('d-block');
            mensajeDos.classList.add('d-none');
        });
    }
});



document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById('fecha');

    if (inputField) {
        inputField.addEventListener('focus', async () => {
            try {
                await inputField.showPicker();
            } catch (error) {
                console.log('Failed to open date picker');
            }
        });
    }
});

var flecha = document.getElementById('flecha-up');

document.addEventListener("DOMContentLoaded", function() {
flecha.addEventListener('click', function() {
    var flechaUp = document.querySelector('.bi-arrow-up-circle');
    var flechaCerrar = document.querySelector('.bi-arrow-down-circle');
    var activador = document.querySelector('.activador');

    if (activador.classList.contains('expandido')) {
        activador.classList.remove('expandido');
        flechaUp.classList.remove('d-none');
        flechaCerrar.classList.add('d-none');
        
    } else {
        activador.classList.add('expandido');
        flechaUp.classList.add('d-none');
        flechaCerrar.classList.remove('d-none');


    }
});
});



///Este Script  a continuacion es para que los alerts se desbanescan luego de 5 segundos 
setTimeout(function() {
    document.querySelectorAll('.alert').forEach(function(alert) {
        alert.remove();
    });
}, 3000);



const actElement = document.getElementById('act');
if (actElement) {
    actElement.addEventListener('click', async function(event) {
    event.preventDefault();
    var tamaño = document.getElementById('tamaño').value;
    var fechaIngresada = new Date(tamaño);
    var fechaActual = new Date();
    var diferenciaEnMeses = (fechaActual.getFullYear() - fechaIngresada.getFullYear()) * 12 + (fechaActual.getMonth() - fechaIngresada.getMonth());
    if (fechaActual.getDate() < fechaIngresada.getDate()) {
        diferenciaEnMeses--;
    }
    console.log(diferenciaEnMeses);
    const url = '/ejemplo' + Number(diferenciaEnMeses);
    const data = await hacerSolicitudAsincronica(url);
    console.log(data)
    const table = $('#example').DataTable();
    table.clear();
    data.forEach(objeto => {
        table.row.add([
        objeto.belnr1,
        objeto.blart === 'DZ' ? 'Abono' : objeto.blart === 'RV' ? 'Factura' : '',
        objeto.fkdat, Math.abs(objeto.dmbtr).toFixed(2), objeto.kurrf,
        Math.abs(objeto.totfactbs).toFixed(2), ''
        ]);
    });
    table.draw();
    });
} else {
    
}

async function hacerSolicitudAsincronica(url) {
    try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    return datos;
    } catch (error) {
    console.error('Error al hacer la solicitud:', error);
    }
}



///↓↓↓↓Chart1↓↓↓↓
document.addEventListener('DOMContentLoaded', function () {
    var factsChart;

    // Inicializar el gráfico de ECharts
    function initializeChart() {
        try {
            return echarts.init(document.getElementById('factsChart'));
        } catch (error) {

            return null;
        }
    }

    // Obtener y parsear un número desde un elemento
    function getNumberFromElement(selector) {
        var element = document.querySelector(selector);
        return element ? parseInt(element.textContent) || 0 : 0;
    }

    // Configurar los datos del gráfico
    function getChartData() {
        return [
            {
                value: getNumberFromElement('#cantidadfacts'),
                name: 'Facts Pendientes',
                itemStyle: { color: '#D50000' }
            },
            {
                value: getNumberFromElement('#cantidadAbon'),
                name: 'Abonos por consolidar',
                itemStyle: { color: '#fbf451' }
            },
            {
                value: getNumberFromElement('#cantidadver'),
                name: 'Facts Verificando',
                itemStyle: { color: '#005c00' }
            }
        ];
    }

    // Configuración del gráfico
    function configureChart(chart, data) {
        if (!chart) return;

        var option = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                top: '5%',
                left: '10%'
            },
            series: [
                {
                    top: '10%',
                    name: 'Estado de cuenta',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: { show: false },
                    labelLine: { show: false },
                    data: data
                }
            ]
        };

        chart.setOption(option);
    }

    // Lógica principal
    factsChart = initializeChart();
    var chartData = getChartData();
    configureChart(factsChart, chartData);
});


///Chart2
document.addEventListener('DOMContentLoaded', function () {
    var certsChart;

    // Inicializar el gráfico de ECharts
    function initializeChart(chartId) {
        try {
            return echarts.init(document.getElementById(chartId));
        } catch (error) {

            return null;
        }
    }

    // Obtener y parsear un número desde un elemento
    function getNumberFromElement(selector) {
        var element = document.querySelector(selector);
        return element ? parseInt(element.textContent) || 0 : 0;
    }

    // Configurar los datos del gráfico
    function getChartData() {
        return [
            {
                value: getNumberFromElement('#factspend'),
                name: 'Facts Pendientes',
                itemStyle: { color: '#D50000' }
            },
            {
                value: getNumberFromElement('#certpend'),
                name: 'Certificado Pendiente',
                itemStyle: { color: '#fbf451' }
            },
            {
                value: getNumberFromElement('#certsaprob'),
                name: 'Certificados Aprobados',
                itemStyle: { color: '#005c00' }
            },
            {
                value: getNumberFromElement('#certrechz'),
                name: 'Certificados Rechazados',
                itemStyle: { color: '#B22222' } // Cambié el color para diferenciar
            }
        ];
    }

    // Configuración del gráfico
    function configureChart(chart, data) {
        if (!chart) return;

        var option = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                top: '5%',
                left: '10%'
            },
            series: [
                {
                    top: '10%',
                    name: 'Estado de cuenta',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: { show: false },
                    labelLine: { show: false },
                    data: data
                }
            ]
        };

        chart.setOption(option);
    }

    // Lógica principal
    certsChart = initializeChart('certsChart');
    var chartData = getChartData();
    configureChart(certsChart, chartData);
});



document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('paymentForm');
    const checkbase = document.getElementById('checkbase');
    const checkiva = document.getElementById('checkiva');
    const errorMessage = document.getElementById('error-message');

    if (checkbase) {
        checkbase.addEventListener('change', function() {
            if (this.checked) {
                checkiva.checked = false;
                checkiva.required = false;
            }
        });
    }

    if (checkiva) {
        checkiva.addEventListener('change', function() {
            if (this.checked) {
                checkbase.checked = false;
                checkbase.required = false;
            }
        });
    }
    if (checkiva && checkbase){
        form.addEventListener('submit', function(event) {
            if (!checkbase.checked && !checkiva.checked) {
                errorMessage.classList.remove('d-none');
                errorMessage.classList.add('d-block');
                event.preventDefault();
            } else {
                errorMessage.classList.add('d-none');
            }
        });

    }
    
});


function maxLengthCheck(object)
{
    if (object.value.length > object.maxLength)
        object.value = object.value.slice(0, object.maxLength)
}

/*
document.addEventListener('DOMContentLoaded', function() {
    const downdos = document.querySelector('.downdos');
    let hoverTimeout;

    downdos.addEventListener('mouseenter', function() {
        clearTimeout(hoverTimeout);
        downdos.classList.add('hovered');
    });

    downdos.addEventListener('mouseleave', function() {
        hoverTimeout = setTimeout(function() {
            downdos.classList.remove('hovered');
        }, 300); // Ajusta el tiempo en milisegundos según sea necesario
    });
});*/
