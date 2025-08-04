console.log('SE HIZO')
// Declaración de elementos del DOM
const check3 = document.getElementById('check3');
const check2 = document.getElementById('check2');
const check1 = document.getElementById('check1');
const actualizarDiv = document.getElementById('actualizar');
const actualizarDiv2 = document.getElementById('actualizar2');
const divInputmonto2 = document.getElementById('montoDescuento');
const inputMonto2 = document.getElementById('monto-descuento');
let betrsdiv = document.getElementById('betrsdiv');
let betrs = document.getElementById('betrs');




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

function extraerMonto(texto) {
    const soloNumeros = texto.replace(/[^\d.,-]/g, '');
    const sinComas = soloNumeros.replace(/,/g, '');
    const valorNumerico = parseFloat(sinComas);
    if (!isNaN(valorNumerico)) {
        return redondear(valorNumerico, 2);
    }
    
    console.warn('No se pudo extraer el monto de:', texto);
    return 0;
}


function monitorearActualizaciones(elemento, callback) { 
    if (!elemento) {
        console.error("actualizarDiv no está presente en el DOM.");
        return;
    }
    
    console.log("Iniciando el observador en actualizarDiv:", elemento);

    const observer = new MutationObserver(mutations => {
        console.log("MutationObserver activado.");
        mutations.forEach(mutation => {
            console.log("Mutation detectada:", mutation);
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                callback(elemento.textContent);
            }
        });
    });

    observer.observe(elemento, { childList: true, subtree: true, characterData: true });

    // No necesitamos detener el observador aquí.
    // detenerObservador = () => observer.disconnect();  // Eliminado
}

const actualizarTextoYResolver = () => {
    if (actualizarDiv){
        return new Promise((resolve, reject) => {
            // Aquí actualizamos directamente el valor de diferenciaActual y resolvemos la promesa.
            const texto = actualizarDiv.textContent;
            console.log("Texto actual en actualizarDiv:", texto);
    
            const match = texto.match(/(\d+(\.\d+)?)/);
            if (match) {
                diferenciaActual = parseFloat(match[0]);
                resolve(diferenciaActual); // Resolver la promesa con diferenciaActual
            } else {
                console.log("No se encontró un número válido en el texto:", texto);
                reject("No se encontró un número válido");
            }
        });
    }
}

function obtenerDiferenciaActual() {
    return diferenciaActual;
}

// Objeto de estado para manejar la transacción y los checkboxes
const estado = {
    transaccion: '',
    checkActivo: null,
    casoActivo: null,
    setTransaccion(tipo, checkbox, caso) {  
        this.transaccion = tipo;
        this.checkActivo = checkbox;
        this.casoActivo = caso;
        console.log('Transacción establecida a:', tipo, 'Caso:', caso);
    },
    reset() {
        this.transaccion = '';
        this.checkActivo = null;
        removeCustomEventListeners(this.casoActivo);  
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
        divInputmonto2.classList.add('d-none')

        
        estado.reset();
        [check1, check2, check3].forEach(check => check.disabled = false);
        restablecerEstado(bancoReceptor, mensaje, monto, checkboxes);
        restablecerEstado(bancoReceptorDolar, mensaje, monto, checkboxes);
        actualizarDiv2.textContent= ''
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
        
        casoDos.resultado = null;
    
        // Agregar event listeners

        monto.addEventListener('input', montoInputHandler);

    }


    async function montoInputHandler(event) {
        const monto = event.target;
        const montoValue = parseFloat(monto.value);
        const checkboxes = casoDos.checkboxes;
        const noVencidas = casoDos.noVencidas;
        const checkboxesDos = document.querySelectorAll('#check5');
        let sumaFacturas = 0;
    
        // Limpiar y resetear estados
        noVencidas.forEach(noVencida => noVencida.checked = false);
        eliminarInputs('input[id^="inputFactura"]', 'input[id^="inputfacturaMonto"]', 'input[id^="inputfkdat"]', 'input[id^="inputbelnr1"]', 'input[id^="inputbuzei"]', 'input[id^="inputblart"]');
        eliminarClaseEvaluando();
        checkboxes.forEach(resetCheckbox);
        checkboxesDos.forEach(resetCheckbox);
    
        if (monto.value === '') {
            limpiarYResetearEstados();
            actualizarDiv2.textContent= "";
            inputMonto2.value = '';
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

        casoDos.resultado = procesarFacturas(checkboxes, montoElements, montoValue, sumaFacturas, estado.transaccion);
        
        console.log( casoDos.resultado.facturasCompensadas.length);
        console.log(checkboxes.length)
        
        if (casoDos.resultado.facturasCompensadas.length == checkboxes.length) {
            // Actualizar manualmente actualizarDiv y resolver directamente la promesa
            
            console.log(actualizarDiv);
    
            await sYtActualizadosHandler();  // Llamada directa a la función en lugar de despachar un evento
        }
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
        eliminarInputs('input[id^="inputFactura"]', 'input[id^="inputfacturaMonto"]', 'input[id^="inputfkdat"]', 'input[id^="inputbelnr1"]', 'input[id^="inputbuzei"]', 'input[id^="inputblart"]');
        eliminarClaseEvaluando();
        actualizarDiv.textContent = "";
    }
    
    async function sYtActualizadosHandler(event) {
        console.log('Inicio sYtActualizadosHandler');
        
        console.log('Llamando a actualizarTextoYResolver...');
        await actualizarTextoYResolver();
        console.log('actualizarTextoYResolver finalizado');
        
        const valorActual = obtenerDiferenciaActual();
        console.log('Valor actual:', valorActual);
    
        const containerFacts = casoDos.containerFacts;
        const noVencidas = casoDos.noVencidas;
        const checkboxesDos = document.querySelectorAll('#check5');
        const resultado = casoDos.resultado;
        const lengthsIguales = resultado && containerFacts && resultado.facturasCompensadas.length === containerFacts.length;
        
        console.log('Lengths iguales:', lengthsIguales);
        
        if (!lengthsIguales) {
            console.log('Lengths no iguales, reseteando checkboxesDos');
            checkboxesDos.forEach(resetCheckbox);
        }
        
        if (lengthsIguales && valorActual > 0) {
            console.log('Lengths iguales y valor actual mayor que 0');
            
            quitarReadOnlyYDisabledFacturasCaso3(noVencidas);
            console.log("Habilitando selección de no vencidas");
            
            noVencidas.forEach(noVencida => noVencida.checked = false);
            
            console.log('Llamando a procesarFacturasCasoDos...');
            procesarFacturasCasoDos(checkboxesDos, valorActual, montodpp, montoNormal, estado.transaccion, resultado.contador);
            console.log('procesarFacturasCasoDos llamado');
        } else {
            console.log('Lengths no iguales o valor actual <= 0, colocando readonly facturas');
            colocarReadOnlyFacturas();
            checkboxesDos.forEach(resetCheckbox);
            noVencidas.forEach(noVencida => noVencida.checked = false);
        }
        
        console.log('Fin de sYtActualizadosHandler');
    }
    
    

    
function casoTres(bancoReceptor, mensaje, monto, checkboxes, transaccion) {
    estado.setTransaccion(transaccion, null, 3);
    
    // Configuración inicial
    if(bancoReceptor){
        bancoReceptor.removeAttribute('disabled');
        bancoReceptor.value = '';
    }

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
    eliminarInputs('input[id^="inputFactura"]', 'input[id^="inputfacturaMonto"]', 'input[id^="inputfkdat"]', 'input[id^="inputbelnr1"]', 'input[id^="inputbuzei"]', 'input[id^="inputblart"]');
    eliminarClaseEvaluando();
    checkboxes.forEach(checkbox => resetCheckbox(checkbox));

    if (monto.value === '') {
        limpiarDivs('.texto-faltante', 'facts');
        limpiarDivs('.texto-abono', 'abon');
        actualizarDiv.textContent = "";
        actualizarDiv2.textContent= "";
        if (divInputmonto2){
            divInputmonto2.value= '';
        }
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

    let betrsdiv = document.getElementById('betrsdiv');
    let betrs = document.getElementById('betrs');
    let descuento_div = document.getElementById('descuento_div');
    if (descuento_div){
        descuento_div = parseFloat(descuento_div.textContent);
    }
    facturasCompensadas = [];
    const containerFacts = document.querySelectorAll('.vencidos');
    const facturasSi = []
    
    if (estado.transaccion === "bs"){
        
        montoNormal="#montoBs";
        montodpp= "#montobsdpp";

    } else if(estado.transaccion === "$"){
        montoNormal="#Montodlr";
        montodpp= "#Montodlrdpp";
        divInputmonto2.classList.remove('d-none')

        if (descuento_div>0){
            descuento_div= descuento_div/100
            let montoValueX=0;
            
            //montoValueX = redondear(((montoValue/(1-descuento_div))*descuento_div), 2)
            montoValueX= montoValue*descuento_div;
            montoValue= montoValue+montoValueX;
            actualizarDiv.textContent= `${montoValue} ${transaccion}`;
        }
        inputMonto2.value= montoValue;
    }
    
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            facturasAnteriores.add(i);
        }
    }

    transaccion= estado.transaccion
    actualizarDiv2.textContent = ""
    for (let i = 0; i < checkboxes.length; i++) {
        
        const checkbox = checkboxes[i];
        const label = checkbox.closest('div.base-contenedor');;
        const montosElement = label.querySelector('.montos');
        montosElement.classList.add('evaluando');
        const elementoDiv = montoElements[i];
        console.log(elementoDiv)

        const textoDelElemento = elementoDiv ? elementoDiv.textContent.trim() : '';
        console.log(textoDelElemento);
            
        // Método mejorado para extraer el monto
        const montoFactura = extraerMonto(textoDelElemento);
        console.log(montoFactura);
        checkbox.checked = false;
        label.classList.remove('listo');

        const vblen = document.getElementById('vbeln' + (i + 1))?.textContent;
        const fkdat = document.getElementById('fkdat' + (i + 1))?.textContent;
        const belnr1 = document.getElementById('belnr1' + (i + 1))?.textContent;
        const buzei = document.getElementById('buzei' + (i + 1))?.textContent;
        const blart = document.getElementById('blart' + (i + 1))?.textContent;

        const dif = redondear(montoValue - sumaFacturas, 2); // Redondear a 2 decimales

        if (sumaFacturas + montoFactura <= montoValue) {
            
            gestionarInputs(label, montosElement, i, vblen, montoFactura, dif, fkdat, belnr1, buzei, blart);
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

            if (!facturasSi.includes(i)) {
                facturasSi.push(i);
            }

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
            let encontrado= false;
            for(let i = 0; i < facturasCompensadas.length; i++) {
                if(facturasCompensadas[i].vblen === vblen) {
                    encontrado = true;
                    break;
                }
            }
            if (encontrado== false){
                const montoFaltante = redondear(montoFactura - (montoValue - sumaFacturas), 2);
                console.log(`falta para compensar la factura ${i} un total de ${montoFaltante}`)
                betrs = parseFloat ( betrs.textContent )
                betrsdiv = parseFloat ( betrsdiv.textContent )
                
                if (estado.transaccion== "$"){
                    console.log('algo')
                

                    if (montoFaltante <= betrsdiv ){
                        gestionarInputs(label, montosElement, i, vblen, montoFactura, dif, fkdat, belnr1, buzei, blart);
                        sumaFacturas = redondear(sumaFacturas + montoFactura, 2); // Redondear sumaFacturas
                        /*console.log('se compenso la factura ' + vblen)
                        console.log('suma de facturas hasta ahora: ' + sumaFacturas)*/
                        checkbox.checked = true;
                        label.classList.add('listo');
                        
                        limpiarDivs('.texto-faltante', 'facts', label);
                        limpiarDivs('.texto-abono', 'abon', checkbox.closest('div.base-contenedor'));
                        diferenciass = redondear(montoValue-sumaFacturas, 2);
                        diferenciass = 0 // Actualizar dif correctamente
                        //console.log(diferenciass);
                        actualizarDiv.textContent = `${diferenciass.toFixed(2)}` + transaccion;

                        if (!facturasSi.includes(i)) {
                            facturasSi.push(i);
                        }

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
                    }else{
                        const index = facturasSi.indexOf(vblen);
                        if (index > -1) {
                            facturasSi.splice(index, 1);
                        }
                        console.log(facturasSi.length)
                    }
                }else if (estado.transaccion == "bs"){
                    if (montoFaltante <=betrs ){
                        gestionarInputs(label, montosElement, i, vblen, montoFactura, dif, fkdat, belnr1, buzei, blart);
                        sumaFacturas = redondear(sumaFacturas + montoFactura, 2); // Redondear sumaFacturas
                        /*console.log('se compenso la factura ' + vblen)
                        console.log('suma de facturas hasta ahora: ' + sumaFacturas)*/
                        checkbox.checked = true;
                        label.classList.add('listo');
                        
                        limpiarDivs('.texto-faltante', 'facts', label);
                        limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
                        diferenciass = redondear(montoValue-sumaFacturas, 2);
                        diferenciass = 0 // Actualizar dif correctamente
                        //console.log(diferenciass);
                        actualizarDiv.textContent = `${diferenciass.toFixed(2)}` + transaccion;

                        if (!facturasSi.includes(i)) {
                            facturasSi.push(i);
                        }

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
                    }else{
                        const index = facturasSi.indexOf(vblen);
                        if (index > -1) {
                            facturasSi.splice(index, 1);
                        }
                        console.log(facturasSi.length)
                    }
                }
            }
            
            
            const index = facturasSi.indexOf(vblen);
            if (index > -1) {
                facturasSi.splice(index, 1);
            }
            console.log(facturasSi.length)
            console.log(sumaFacturas)

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
            //actualizarDiv.textContent = `${diferenciass.toFixed(2)} ` + transaccion;
            break
        }
        
        
        
    }
    actualizarDiv2.textContent = facturasSi.length.toString();
     // Verificación final
    console.log("Número final de facturas seleccionadas:", facturasSi.length);
    console.log("Facturas seleccionadas:", facturasSi);
    return {
        facturasCompensadas: facturasCompensadas,
        contador: facturasSi.length
    };
}

// Función para redondear valores a n decimales
function redondear(valor, decimales) {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
}
// Función para procesar facturas en caso dos

function procesarFacturasCasoDos(checkboxes, montoValue,  montodpp, montoNormal, transaccion, variableConta) {
    console.log('se ejecuta el caso 2')

    let betrsdiv = document.getElementById('betrsdiv');
    let betrs = document.getElementById('betrs');
    let posicionHastaAhora =0;
    posicionHastaAhora= casoDos.checkboxes.length
    quitarReadOnlyYDisabledFacturas();
    const checksSeleccionados = [];
    let abonoRealizado = false;
    let facturaParcial = null;
    let sumaFacturasSeleccionadas = 0;
    let contador= variableConta;

    const checkboxesArray = Array.from(checkboxes);

    checkboxesArray.forEach(checkbox => {

        checkbox.removeEventListener('change', checkbox.changeHandler);

        checkbox.changeHandler = function() {
            const label = this.closest('div.base-contenedor');
            const montosElement = label.querySelector('.montos');
            if (this.checked) {
                if (!checksSeleccionados.includes(this)) {
                    checksSeleccionados.push(this);
                }

                if (montosElement) {
                    montosElement.classList.add('evaluando');
                }
            
        // Método mejorado para extraer el monto

        checkbox.checked = false;
        label.classList.remove('listo');
                const elementoMonto = obtenerElementoMontoDos(this, montodpp, montoNormal);
                const textoDelElemento = elementoMonto ? elementoMonto.textContent.trim() : '';

                const montoFactura = extraerMonto(textoDelElemento);
                console.log(montoFactura);
                const valorNumerico = montoFactura
                sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas + parseFloat(montoFactura)).toFixed(2));
                label.classList.remove('listo');
            
                let posicionArray = checkboxesArray.indexOf(checkbox);
                posicionArray = posicionArray + posicionHastaAhora;
                console.log(posicionArray)
                const vblen = document.getElementById('vbelnNV' + (posicionArray + 1 ))?.textContent;
                const fkdat = document.getElementById('fkdatNV' + (posicionArray +1 ))?.textContent;
                const belnr1 = document.getElementById('belnr1NV' + (posicionArray +1))?.textContent;
                const buzei = document.getElementById('buzeiNV' + (posicionArray +1 ))?.textContent;
                const blart = document.getElementById('blartNV' + (posicionArray+1 ))?.textContent;
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
                        
                        gestionarInputs(label, montosElement, posicionArray, vblen, montoFactura, diferenciaInput, fkdat, belnr1, buzei, blart);
                        console.log(transaccion)
                        checkbox.checked = true;
                        label.classList.add('listo');
                        limpiarDivs('.texto-faltante', 'facts', label);
                        limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
                        actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} `+ transaccion; // Actualizar el contenido del div
                        contador ++;
                        actualizarDiv2.textContent = contador;
                    } else {
                        console.log(betrsdiv.textContent)
                        
                            const montoFaltante = (sumaFacturasSeleccionadas - montoValue).toFixed(2);
                            console.log(`falta para compensar la factura  un total de ${montoFaltante}`)
                            if (estado.transaccion == "$"){
                                //
                                if (montoFaltante <= parseFloat(betrsdiv.textContent)){
                                    console.log('entro en la tolerancia pa')
                                    gestionarInputs(label, montosElement, posicionArray, vblen, montoFactura, diferenciaInput, fkdat, belnr1, buzei, blart);
                                    console.log(transaccion)
                                    checkbox.checked = true;
                                    label.classList.add('listo');
                                    limpiarDivs('.texto-faltante', 'facts', label);
                                    limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
                                    actualizarDiv.textContent = `0.00 `+ transaccion; // Actualizar el contenido del div
                                    contador ++;
                                    actualizarDiv2.textContent = contador;
                                    facturaParcial = posicionArray;
                                    colocarReadOnlyFacturasDos(facturaParcial)
                                }else {
                                    showAlertGrandes('El monto de esta factura es mayor al monto disponible para abonar, por lo tanto no se puede seleccionar', 'error')
                                    checkbox.checked= false;
                                    sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                                    
                                    actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} ` + transaccion; // Actualizar el contenido del div
                                    console.log("La selección de esta factura hace que la suma exceda el monto permitido. La suma se ha anulado.");
                                    console.log(sumaFacturasSeleccionadas)
                                    facturaParcial = posicionArray;
                                    colocarReadOnlyFacturastres(facturaParcial)
                                    
                                }
                            }else if (estado.transaccion == "bs"){
                                //
                                if (montoFaltante <= parseFloat(betrs.textContent)){
                                    console.log('entro en la tolerancia pa')
                                    gestionarInputs(label, montosElement, posicionArray, vblen, montoFactura, diferenciaInput, fkdat, belnr1, buzei, blart);
                                    console.log(transaccion)
                                    checkbox.checked = true;
                                    label.classList.add('listo');
                                    limpiarDivs('.texto-faltante', 'facts', label);
                                    limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
                                    actualizarDiv.textContent = `0.00 `+ transaccion; // Actualizar el contenido del div
                                    contador ++;
                                    actualizarDiv2.textContent = contador;
                                    facturaParcial = posicionArray;
                                    colocarReadOnlyFacturastres(facturaParcial)
                                }else {
                                    showAlertGrandes('El monto de esta factura es mayor al monto disponible para abonar, por lo tanto no se puede seleccionar', 'error')
                                    checkbox.checked= false;
                                    sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                                    
                                    actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} ` + transaccion; // Actualizar el contenido del div
                                    console.log("La selección de esta factura hace que la suma exceda el monto permitido. La suma se ha anulado.");
                                    console.log(sumaFacturasSeleccionadas)
                                    facturaParcial = posicionArray;
                                    colocarReadOnlyFacturastres(facturaParcial)
                                    
                                }
                            }
                            
                        //checkbox.checked= false;
                        /*sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                        
                        actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} ` + transaccion; // Actualizar el contenido del div
                        console.log("La selección de esta factura hace que la suma exceda el monto permitido. La suma se ha anulado.");
                        console.log(sumaFacturasSeleccionadas)
                        facturaParcial = posicionArray;
                        colocarReadOnlyFacturastres(facturaParcial)
                        contador--;
                        if (contador < 0 ){
                            actualizarDiv2.textContent = "0";
                        }else{
                            actualizarDiv2.textContent = contador;
                        }*/
                        
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
                    let posicionArray = checkboxesArray.indexOf(checkbox);
                    let posicionHastaAhora =0;
                    posicionHastaAhora= casoDos.checkboxes.length
                    posicionArray = posicionArray + posicionHastaAhora;
                    console.log(posicionArray)
                    
                    eliminarInputsDos(posicionArray+1);
                    checksSeleccionados.splice(index, 1);
                    const elementoMonto = obtenerElementoMontoDos(this, montodpp, montoNormal);
                    const textoDelElemento = elementoMonto ? elementoMonto.textContent : '';
                    const valorSinSimbolo = textoDelElemento.slice(0, -2);
                    const valorNumerico = parseFloat(valorSinSimbolo.replace(',', ''));
                    const montoFactura = valorNumerico;
                    sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                    actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} `+ transaccion; // Actualizar el contenido del div
                    console.log(`Diferencia actual: ${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} `+ transaccion);

                    contador--;
                        if (contador < 0 ){
                            actualizarDiv2.textContent = "0";
                        }else{
                            actualizarDiv2.textContent = contador;
                        }
                    resetCheckbox(this);
                    
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


function procesarFacturasCasoTres(checkboxes, montoValue,  montodpp, montoNormal, transaccion) {
    quitarReadOnlyYDisabledFacturas();
    const checksSeleccionados = [];
    let abonoRealizado = false;
    let facturaParcial = null;
    let sumaFacturasSeleccionadas = 0;
    let contador= 0
    let betrsdiv = document.getElementById('betrsdiv');
    let betrs = document.getElementById('betrs');
    let descuento_div = document.getElementById('descuento_div');
    if (descuento_div){
        descuento_div = parseFloat(descuento_div.textContent);
    }
    facturasCompensadas = [];

    console.log(montoValue)
    if (estado.transaccion === "bs"){
        
        montoNormal="#montoBs";
        montodpp= "#montobsdpp";

    } else if(estado.transaccion === "$"){
        montoNormal="#Montodlr";
        montodpp= "#Montodlrdpp";
        divInputmonto2.classList.remove('d-none')

        if (descuento_div>0){
            descuento_div= descuento_div/100
            let montoValueX=0;
            
            //montoValueX = redondear(((montoValue/(1-descuento_div))*descuento_div), 2)
            montoValueX= montoValue*descuento_div;
            montoValue= montoValue+montoValueX;
            actualizarDiv.textContent = `${montoValue} ${transaccion}`
            
        }
        inputMonto2.value= montoValue;
    }
    
    const checkboxesArray = Array.from(checkboxes);

    checkboxesArray.forEach(checkbox => {
        checkbox.removeEventListener('change', checkbox.changeHandler);

        checkbox.changeHandler = function() {
            const label = this.closest('div.base-contenedor');;
            const montosElement = label.querySelector('.montos');
            if (this.checked) {
                if (!checksSeleccionados.includes(this)) {
                    checksSeleccionados.push(this);
                }

                if (montosElement) {
                    montosElement.classList.add('evaluando');
                }

                const elementoMonto = obtenerElementoMontoDos(this, montodpp, montoNormal);
                if (!elementoMonto) {
                    console.warn("No se encontró el elemento monto para el checkbox seleccionado.");
                    return; // Si no hay elemento, salir de la función para evitar errores
                }
                const textoDelElemento = elementoMonto ? elementoMonto.textContent.trim() : '';
                const montoFactura = extraerMonto(textoDelElemento);
                console.log(montoFactura);
                const valorNumerico = montoFactura
                sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas + parseFloat(montoFactura)).toFixed(2));
                label.classList.remove('listo');
            
                const posicionArray = checkboxesArray.indexOf(checkbox);
                
                const vblen = document.getElementById('vbelnNV' + (posicionArray +1))?.textContent;
                const fkdat = document.getElementById('fkdatNV' + (posicionArray +1))?.textContent;
                const belnr1 = document.getElementById('belnr1NV' + (posicionArray +1))?.textContent;
                const buzei = document.getElementById('buzeiNV' + (posicionArray +1))?.textContent;
                const blart = document.getElementById('blartNV' + (posicionArray +1))?.textContent;
                const dif =  sumaFacturasSeleccionadas - montoValue ;
                if (dif < 0){
                    dif==0.00
                }
                const diferenciaInput = redondear(montoValue - (sumaFacturasSeleccionadas - montoFactura), 2)
                ///actualizarDiv.textContent = `${parseFloat(dif).toFixed(2)} ` + transaccion; // Actualizar el contenido del div
                console.log("Se seleccionó la factura: " + vblen + " con un monto de " + valorNumerico);
                console.log("Suma total hasta ahora: " + sumaFacturasSeleccionadas);
                

                if (!abonoRealizado) {

                    
                    console.log(montoValue)
                    if (sumaFacturasSeleccionadas <= montoValue) {
                        
                        gestionarInputs(label, montosElement, posicionArray, vblen, montoFactura, diferenciaInput, fkdat, belnr1, buzei, blart);
                        console.log(transaccion)
                        checkbox.checked = true;
                        label.classList.add('listo');
                        limpiarDivs('.texto-faltante', 'facts', label);
                        limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
                        actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} `+ transaccion; // Actualizar el contenido del div
                        contador ++;
                        actualizarDiv2.textContent = contador;
                    } else {
                        
                            if (estado.transaccion == ""){
                                estado.transaccion= transaccion;
                            }
                            const montoFaltante = (sumaFacturasSeleccionadas - montoValue).toFixed(2);
                            console.log(`falta para compensar la factura  un total de ${montoFaltante}`)
                            if (estado.transaccion == "$"){
                                if (montoFaltante <= parseFloat(betrsdiv.textContent) ){
                                    console.log('si')
                                    console.log('entro en la tolerancia pa')
                                    gestionarInputs(label, montosElement, posicionArray, vblen, montoFactura, diferenciaInput, fkdat, belnr1, buzei, blart);
                                    console.log(transaccion)
                                    checkbox.checked = true;
                                    label.classList.add('listo');
                                    limpiarDivs('.texto-faltante', 'facts', label);
                                    limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
                                    actualizarDiv.textContent = `0.00 `+ transaccion; // Actualizar el contenido del div
                                    contador ++;
                                    actualizarDiv2.textContent = contador;
                                    facturaParcial = posicionArray;
                                    colocarReadOnlyFacturasDos(facturaParcial)
                                    showAlertGrandes('Monto agotado, no podrá seleccionar más documentos', 'atencion')
                                }else {
                                    showAlertGrandes('El monto de esta factura es mayor al monto disponible para abonar, por lo tanto no se puede seleccionar', 'error')
                                    console.log('no')
                                    checkbox.checked= false;
                                    sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                                    
                                    actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} ` + transaccion; // Actualizar el contenido del div
                                    console.log("La selección de esta factura hace que la suma exceda el monto permitido. La suma se ha anulado.");
                                    console.log(sumaFacturasSeleccionadas)
                                    facturaParcial = posicionArray;
                                    colocarReadOnlyFacturastres(facturaParcial)
                                    
                                }
                            }else if (estado.transaccion == "bs"){
                                console.log(betrs)
                                if (montoFaltante <= parseFloat(betrs.textContent) ){
                                    
                                    console.log('entro en la tolerancia pa')
                                    gestionarInputs(label, montosElement, posicionArray, vblen, montoFactura, diferenciaInput, fkdat, belnr1, buzei, blart);
                                    console.log(transaccion)
                                    checkbox.checked = true;
                                    label.classList.add('listo');
                                    limpiarDivs('.texto-faltante', 'facts', label);
                                    limpiarDivs('.texto-abono', 'abon', checkbox.parentNode);
                                    actualizarDiv.textContent = `0.00 `+ transaccion; // Actualizar el contenido del div
                                    contador ++;
                                    actualizarDiv2.textContent = contador;
                                    facturaParcial = posicionArray;
                                    colocarReadOnlyFacturasDos(facturaParcial)
                                    showAlertGrandes('Monto agotado, no podrá seleccionar más documentos', 'atencion')
                                }else {
                                    showAlertGrandes('El monto de esta factura es mayor al monto disponible para abonar, por lo tanto no se puede seleccionar', 'error')
                                    console.log('no')
                                    checkbox.checked= false;
                                    sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                                    
                                    actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} ` + transaccion; // Actualizar el contenido del div
                                    console.log("La selección de esta factura hace que la suma exceda el monto permitido. La suma se ha anulado.");
                                    console.log(sumaFacturasSeleccionadas)
                                    facturaParcial = posicionArray;
                                    colocarReadOnlyFacturastres(facturaParcial)
                                    
                                }
                            }
                            
                            
                            
                            
                            
                            
                     
                        //checkbox.checked= false;
                        /*sumaFacturasSeleccionadas = parseFloat((sumaFacturasSeleccionadas - montoFactura).toFixed(2));
                        
                        actualizarDiv.textContent = `${(montoValue - sumaFacturasSeleccionadas).toFixed(2)} ` + transaccion; // Actualizar el contenido del div
                        console.log("La selección de esta factura hace que la suma exceda el monto permitido. La suma se ha anulado.");
                        console.log(sumaFacturasSeleccionadas)
                        facturaParcial = posicionArray;
                        colocarReadOnlyFacturastres(facturaParcial)
                        contador--;
                        if (contador < 0 ){
                            actualizarDiv2.textContent = "0";
                        }else{
                            actualizarDiv2.textContent = contador;
                        }*/
                        
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

                    contador--;
                        if (contador < 0 ){
                            actualizarDiv2.textContent = "0";
                        }else{
                            actualizarDiv2.textContent = contador;
                        }
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

// Función mejorada para obtener el elemento del monto
function obtenerElementoMontoDos(checkbox, montodpp, montoNormal) {
    // Obtener el contenedor del checkbox
    const label = checkbox.closest('div.base-contenedor');
    console.log(label)

    // Verificar si el label existe antes de proceder
    if (!label) {
        console.warn("El checkbox seleccionado no tiene un elemento padre (label) válido.");
        return null;
    }

    // Intentar buscar el elemento de monto con los selectores dados
    const montoElement = label.querySelector(montodpp) || label.querySelector(montoNormal);

    // Si no se encuentra el elemento de monto, mostrar un mensaje de advertencia para facilitar la depuración
    if (!montoElement) {
        console.warn(`No se encontró un elemento de monto usando los selectores "${montodpp}" o "${montoNormal}" para el checkbox con ID: ${checkbox.id}`);
    }

    return montoElement; // Devuelve el elemento encontrado o null si no existe
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
                input.setAttribute('readonly', 'true');
                input.setAttribute('disabled', 'true');
            });
        } else {
            inputs.forEach(input => {
                input.removeAttribute('readonly');
                input.removeAttribute('disabled');
            });
        }
    });
}



// Funcion para inicializar reseteando los botones
function resetCheckbox(checkbox) {
    checkbox.checked = false;
    checkbox.disabled = true;
    checkbox.closest('div.base-contenedor').classList.remove('listo');

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
    eliminarInputs('input[id^="inputFactura"]', 'input[id^="inputfacturaMonto"]', 'input[id^="inputfkdat"]', 'input[id^="inputbelnr1"]', 'input[id^="inputbuzei"]', 'input[id^="inputblart"]');
    eliminarClaseEvaluando();
    limpiarDivs('.texto-faltante', 'facts');
    limpiarDivs('.texto-abono', 'abon');
    desmarcarCheckboxes(checkboxes);
    const baseContenedores = document.querySelectorAll('.base-contenedor');

    baseContenedores.forEach(i => {
        i.classList.remove('listo');
    });
    const labels = document.querySelectorAll('label');
        labels.forEach(label => {
        label.classList.remove('listo');
    });
    actualizarDiv.textContent = ""; // Actualizar el contenido del div




    const referenceriafValue = document.getElementById('referenceriafValue');
    const fechaInmodal = document.getElementById('fechaInmodal');
    const BancoInmodal = document.getElementById ('BancoInmodal');
    const MontoInmodal = document.getElementById('MontoInmodal');
    const referenciaInmodal = document.getElementById ('referenciaInmodal');
    const disponibleInmodal = document.getElementById('disponibleInmodal');

    referenceriafValue.textContent= '';
    fechaInmodal.textContent = '';
    BancoInmodal.textContent ='';
    MontoInmodal.textContent ='';
    referenciaInmodal.textContent = '';
    disponibleInmodal.textContent ='';

    const columnaFacturas = document.getElementById('columna-facturas');
    const facturasCreadas = columnaFacturas.querySelectorAll('.factss');
    facturasCreadas.forEach(div => div.remove());

    const columnaMontos = document.getElementById('columna-montos');
    const montosCreados = columnaMontos.querySelectorAll('.montoss');
    montosCreados.forEach(div => div.remove());

}



// Función para resetear el estado del checkbox
function resetCheckboxDos(checkbox) {
    checkbox.checked = false;
    checkbox.disabled = true; // Añade disabled para evitar interacción
    checkbox.closest('div.base-contenedor').classList.remove('listo');

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
function gestionarInputs(label, montosElement, i, vblen, montoFactura, dif, fkdat, belnr1, buzei, blart) {
    // Seleccionar elementos de entrada existentes
    
    let inputElement = label.querySelector(`#inputFactura${i}`);
    let inputElementMonto = label.querySelector(`#inputfacturaMonto${i}`);
    let inputElementfkdat = label.querySelector(`#inputfkdat${i}`);
    let inputElementbelnr1 = label.querySelector(`#inputbelnr1${i}`);
    let inputElementbuzei = label.querySelector(`#inputbuzei${i}`);
    let inputElementblart = label.querySelector(`#inputblart${i}`);
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

        if (!inputElementblart) {
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.name = `inputblart${i}`;
            inputElement.className = 'd-none';
            inputElement.value = blart.toString();
            inputElement.id = `inputblart${i}`;
            label.appendChild(inputElement);
        }

        // Crear y agregar input de monto si no existe
        if (!inputElementMonto) {
            inputElementMonto = document.createElement('input');
            inputElementMonto.type = 'text';
            inputElementMonto.name = `inputfacturaMonto${i}`;
            inputElementMonto.className = 'd-none';

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
        if (inputElement) {
            label.removeChild(inputElementblart);
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
function eliminarInputs(inputFacturaIds, inputFacturaMontoIds, inputFkdatIds, inputBelnr1Ids, inputBuzeiIds, inputblartiIds) {
    // Obtener elementos de entrada por su ID
    const inputFacturaElements = document.querySelectorAll(inputFacturaIds);
    const inputFacturaMontoElements = document.querySelectorAll(inputFacturaMontoIds);
    const inputFkdatElements = document.querySelectorAll(inputFkdatIds);
    const inputBelnr1Elements = document.querySelectorAll(inputBelnr1Ids);
    const inputBuzeiElements = document.querySelectorAll(inputBuzeiIds);
    const inputElementblart = document.querySelectorAll(inputblartiIds);

    // Eliminar elementos de entrada
    inputFacturaElements.forEach(inputElement => {
        inputElement.parentNode.removeChild(inputElement);
    });

    inputElementblart.forEach(inputElementblart => {
        inputElementblart.parentNode.removeChild(inputElementblart);
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
    const inputblartiId = `input[id="inputblart${posicionArray}"]`;

    // Obtener y eliminar los elementos específicos
    const inputFactura = document.querySelector(inputFacturaId);
    const inputFacturaMonto = document.querySelector(inputFacturaMontoId);
    const inputFkdat = document.querySelector(inputFkdatId);
    const inputBelnr1 = document.querySelector(inputBelnr1Id);
    const inputBuzei = document.querySelector(inputBuzeiId);
    const inputblart = document.querySelector(inputblartiId);

    if (inputFactura) inputFactura.remove();
    if (inputFacturaMonto) inputFacturaMonto.remove();
    if (inputFkdat) inputFkdat.remove();
    if (inputBelnr1) inputBelnr1.remove();
    if (inputBuzei) inputBuzei.remove();
    if (inputblart) inputblart.remove();
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


document.addEventListener('DOMContentLoaded', function() {//->Esto verifica si se ha ingresado un monto para mostrar el mensaje de indicación
    const monto = document.getElementById('monto_iva');
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

function verifyInput() {
    const nComprobante = document.getElementById('n_comprobante');
    

    if (nComprobante.value.length >= nComprobante.minLength) {
        document.querySelector("form").submit();
        console.log("Enviando papa");
    } else {
        showAlert("Debe ser mayor de 12 Dígitos");
    }
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




function showAlert(message) {
    const alertContainer = document.getElementById('alert');
    const alertMessage = document.getElementById('alert-message');
    alertMessage.textContent = message;
    alertContainer.style.display = 'flex';
    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 3000); // Ocultar después de 3 segundos
}




function validateMonto(input) {
    // Verifica si el input es nulo o vacío
    if (!input || input.value.trim() === "") {
        console.warn('Input is empty or not defined');
        return;
    }

    const value = parseFloat(input.value);

    if (isNaN(value) || value <= 0) {
        input.value = '';
        showAlert('El monto debe ser mayor a 0');
        return;
    }

    if (input.value.includes(',')) {
        input.value = '';
        showAlert('Para colocar decimales utilice ".", no la ","');
    }

    if (!/^\d*\.?\d*$/.test(input.value)) {
        showAlert('Por favor, ingrese un valor numérico válido');
        input.value = ''; 
    }
}


/*

procesarFacturasCasoTres(checkboxes, montoValue, montodpp, montoNormal, estado.transaccion);

*/

function iva() {
    const bancoReceptor = document.getElementById('banco_receptor');
    const mensaje = document.querySelector('.mensajeDos');
    const monto = document.getElementById('monto_iva');
    const checkboxes = document.querySelectorAll('.cheket');

    // Configurar la transacción (por ejemplo, 'bs' o '$')
    const transaccion = 'bs'; // Cambia este valor si deseas iniciar con otra transacción

    // Llamar a casoTres con los elementos relevantes
    casoTres(bancoReceptor, mensaje, monto, checkboxes, transaccion);

}

// Llamar a la función para inicializar

const tituloIva = document.getElementById('titulo');
document.addEventListener('DOMContentLoaded', function() {

    if (tituloIva){
        iva()
        const buton_iva = document.getElementById('buton_iva');
        buton_iva.addEventListener('click', (event)=>{
            event.preventDefault()
            const listos = document.querySelectorAll('.listo');
            if (listos.length == 0){
                showAlertGrandes("Debe seleccionar un IVA para poder continuar con el proceso", "atencion")
                return;
            }else{
                openModal()
            }
        })
    }


})



document.addEventListener('DOMContentLoaded', function() {

    const fechaInput = document.getElementById('fecha_iva');
    if (fechaInput) {

        const today = new Date().toISOString().split('T')[0];

        fechaInput.max = today;

        fechaInput.addEventListener('focus', function() {
            this.showPicker(); 
        });
    }
});


/*
function showInputValue() {
    const referencerif = document.getElementById('rif')?.value || '';
    const fechaValor = document.getElementById("fecha")?.value || '';
    const bancoValor = document.getElementById("banco_receptor")?.value || '';
    const bancoDosValor = document.getElementById("banco_receptor_dolar")?.value || '';
    const montoValor = document.getElementById('monto')?.value || document.getElementById('monto_iva')?.value || '';
    const montoDescuentoValor = document.getElementById('monto-descuento')?.value || '';
    const referenciaValor =document.getElementById('ref')?.value ||'';
    const montoDisponibleValor = document.getElementById('actualizar')?.textContent || '';

    const checkbs = document.getElementById('check3')?.checked || false;
    const checkdolar = document.getElementById('check2')?.checked || false;
    const checkeuro = document.getElementById('check1')?.checked || false;


    document.getElementById('referenceriafValue').textContent = referencerif;
    document.getElementById('fechaInmodal').textContent = fechaValor;
    document.getElementById('referenciaInmodal').textContent = referenciaValor;
    document.getElementById('disponibleInmodal').textContent = montoDisponibleValor;
    let facturasListas = document.querySelectorAll('.listo');
    let facturas = [];
    let montos = [];
    for (let i = 0; i < facturasListas.length; i++) {

        const facturaListo = document.getElementById('inputFactura' + i)?.value || ''; 
        const montoListo = document.getElementById('inputfacturaMonto' + i)?.value || '';
        if (facturaListo) {
            facturas.push(facturaListo); 
        }
        if (montoListo){
            montos.push(montoListo); 
        }
    }
    console.log(facturas)



    document.getElementById('BancoInmodal').textContent = bancoValor || bancoDosValor;


    let montoTexto = montoDescuentoValor || montoValor;
    if (checkbs) {
        montoTexto += ' Bs';
    } else if (checkdolar || checkeuro) {
        montoTexto += ' $';
    } else{
        montoTexto +=' Bs'
    }
    document.getElementById('MontoInmodal').textContent = montoTexto;



    const columnaFacturas = document.getElementById('columna-facturas');

    facturas.forEach(factura => {
        
        const divFactura = document.createElement('div');
        divFactura.classList.add('factss'); 
        divFactura.textContent = factura;   
        console.log('sasd')

        columnaFacturas.appendChild(divFactura);
        console.log('sasd')
    });



const columnaMontos = document.getElementById('columna-montos');
    montos.forEach(factura => {

        const divFactura = document.createElement('div');
        divFactura.classList.add('montoss'); 
        divFactura.textContent = factura;   

        columnaMontos.appendChild(divFactura);
    });
}*/

function submitForm() {

    const requiredFields = document.querySelectorAll("form .inputField[required]");
    let allFilled = true;
    let firstEmptyField = null;

    requiredFields.forEach(field => {

        let existingAlert = field.parentElement.querySelector(".field-alert");
        if (existingAlert) existingAlert.remove();

        if (!field.value.trim()) {
            allFilled = false;
            field.classList.add("border-danger");  
            showFieldAlert(field, "Este campo es obligatorio");

            if (!firstEmptyField) {
                firstEmptyField = field;
            }
        } else {
            field.classList.remove("border-danger");  
        }
    });

    if (allFilled) {
        document.querySelector("form").submit();
        console.log("Enviando papa")

    } else {
        console.log('faltan campos pa')
        console.log(requiredFields)
        closeModal();

        if (firstEmptyField) {
            firstEmptyField.scrollIntoView({ behavior: "smooth", block: "center" });
            firstEmptyField.focus();  
        }
    }
}



/*
const modal = document.getElementById('myModal');
modal.addEventListener('hidden.bs.modal', limpiarModal);*/

function showFieldAlert(field, message) {

    let existingAlert = field.parentElement.querySelector(".field-alert");
    if (existingAlert) existingAlert.remove();


    const alertDiv = document.createElement("div");
    alertDiv.className = "field-alert bg-warning text-dark p-1 mt-1 rounded";
    alertDiv.innerHTML = `
        <i class="bi bi-exclamation-circle"></i> ${message}
    `;


    field.parentElement.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 10000);  
}





















function openModal() {
    console.log("Iniciando función openModal...");
    document.getElementById('customModal').classList.remove('hidden');

    let facturasListas = document.querySelectorAll('.cheket');

    if (facturasListas.length === 0) {
        console.log("No se encontraron elementos con la clase .cheket");
    }

    let facturasListasFiltradas = Array.from(facturasListas)
        .map((element, index) => {
            let baseContenedor = element.closest('.base-contenedor');
            if (baseContenedor && baseContenedor.classList.contains('listo')) {
                return { element, index };
            }
            return null;
        })
        .filter(item => item !== null); 

    // Mostrar la información general del modal independientemente de facturas seleccionadas
    const referencerif = document.getElementById('rif')?.value || '';
    const fechaValor = document.getElementById("fecha")?.value || document.getElementById('fecha_iva')?.value || '';
    const bancoValor = document.getElementById("banco_receptor")?.value || '';
    const bancoDosValor = document.getElementById("banco_receptor_dolar")?.value || '';
    const montoValor = document.getElementById('monto')?.value || document.getElementById('monto_iva')?.value || '';
    const montoDescuentoValor = document.getElementById('monto-descuento')?.value || '';
    const referenciaValor = document.getElementById('ref')?.value || '';
    let montoDisponibleValor = document.getElementById('actualizar')?.textContent || '';

    const checkbs = document.getElementById('check3')?.checked || false;
    const checkdolar = document.getElementById('check2')?.checked || false;
    const checkeuro = document.getElementById('check1')?.checked || false;

    document.getElementById('referenceriafValue').textContent = referencerif;
    document.getElementById('fechaInmodal').textContent = fechaValor;
    document.getElementById('referenciaInmodal').textContent = referenciaValor;
    montoDisponibleValor = montoDisponibleValor.replace(/b/g, ' B');
    document.getElementById('disponibleInmodal').textContent = montoDisponibleValor;
    document.getElementById('BancoInmodal').textContent = bancoValor || bancoDosValor;

    let montoTexto = montoDescuentoValor || montoValor;
    if (checkbs) {
        montoTexto += ' Bs';
    } else if (checkdolar || checkeuro) {
        montoTexto += ' $';
    } else {
        montoTexto += ' Bs';
    }
    document.getElementById('MontoInmodal').textContent = montoTexto;

    // Continuar solo si hay facturas filtradas
    if (facturasListasFiltradas.length === 0) {
        console.log("No se encontraron facturas con el estado listo");
        return;
    } else {
        console.log("Se encontraron facturas con el estado listo");
    }

    let facturas = [];
    let montos = [];

    facturasListasFiltradas.forEach(({ element, index }) => {
        let facturaListo;
        if (tituloIva){
            facturaListo = document.getElementById('sgtxt'+ (index +1))?.textContent || '';
        }else{
            facturaListo = document.getElementById('inputFactura' + index)?.value || '';
        }

        const montoListo = document.getElementById('inputfacturaMonto' + index)?.value || '';
        
        console.log(`Factura #${index}:`, facturaListo);
        console.log(`Monto #${index}:`, montoListo);

        if (facturaListo) {
            facturas.push(facturaListo);
        }
        if (montoListo) {
            montos.push(montoListo);
        }
    });

    const columnaFacturas = document.getElementById('columna-facturas');
    facturas.forEach(factura => {
        const divFactura = document.createElement('div');
        divFactura.classList.add('factss');
        divFactura.textContent = factura;
        columnaFacturas.appendChild(divFactura);
    });

    const columnaMontos = document.getElementById('columna-montos');
    montos.forEach(monto => {
        const divMonto = document.createElement('div');
        divMonto.classList.add('montoss');
        divMonto.textContent = monto;
        columnaMontos.appendChild(divMonto);
    });
}





function limpiarModal() {

    const columnaFacturas = document.getElementById('columna-facturas');
    const facturasCreadas = columnaFacturas.querySelectorAll('.factss');
    facturasCreadas.forEach(div => div.remove());

    const columnaMontos = document.getElementById('columna-montos');
    const montosCreados = columnaMontos.querySelectorAll('.montoss');
    montosCreados.forEach(div => div.remove());
}

function closeModal() {
    document.getElementById('customModal').classList.add('hidden');
    limpiarModal()
}