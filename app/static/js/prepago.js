document.addEventListener('DOMContentLoaded', () => {
    
    (function(){const s=document.createElement('style');s.textContent=`.loader-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;justify-content:center;align-items:center;z-index:99999;opacity:0;visibility:hidden;transition:all .3s}.loader-overlay.active{opacity:1;visibility:visible}.loader-container{text-align:center;animation:fadeInUp .5s}.loader{width:64px;height:64px;border-radius:50%;position:relative;animation:rotate 1s linear infinite;margin:0 auto 24px}.loader::before,.loader::after{content:"";box-sizing:border-box;position:absolute;inset:0;border-radius:50%;border:5px solid #FFF;animation:prixClipFix 2s linear infinite}.loader::after{transform:rotate3d(90,90,0,180deg);border-color:#c53030}.loader-text{color:#fff;font-size:20px;font-weight:600;margin:0 0 8px}.loader-subtext{color:rgba(255,255,255,.7);font-size:14px;margin:0}@keyframes rotate{to{transform:rotate(360deg)}}@keyframes prixClipFix{0%{clip-path:polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)}50%{clip-path:polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)}75%,to{clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)}}@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.btn-primary.enviando,.btn-primary:disabled,.btn-secondary:disabled{opacity:.7;cursor:not-allowed;pointer-events:none}`;document.head.appendChild(s)})();


    const divisas = document.querySelectorAll('.divisa');
    console.log(' Habilitando selección de divisas');
    divisas.forEach(divisa => {

        divisa.disabled = false;
    });
    const descuentoDiv = document.getElementById('descuentoDiv').value
    const descuentoDivValor = descuentoDiv/100
    // -----------------------------
    //  Referencias de divisas
    const check3 = document.getElementById('check3'); // bs
    const check2 = document.getElementById('check2'); // $
    const check1 = document.getElementById('check1'); // €

    // Referencia al monto
    const montoInput = document.getElementById('monto');
    const elementosSeleccionados = document.getElementById('contadorElementos');
    const montoAbono = document.getElementById('montoRestante');

    // Referencia a las facturas
    const facturas = document.querySelectorAll('.factura');

    // Bancos y mensaje
    const bancoBs = document.getElementById('banco_receptor');
    const bancoUsd = document.getElementById('banco_receptor_dolar');
    const mensaje = document.querySelector('.mensaje');

    // -----------------------------
    //  Funciones auxiliares para facturas
    function obtenerSeleccionados() {
        const seleccionados = [];
        const facturasChecked = document.querySelectorAll('.factura.checked');
        
        facturasChecked.forEach(factura => {
            try {
                const encabezadoData = factura.getAttribute('data-encabezado');
                const encabezadoObj = JSON.parse(encabezadoData);
                const itemsData = factura.getAttribute('data-items');
                const itemsObjs = JSON.parse(itemsData);
                
                // Agregar tanto encabezado como items en un objeto
                seleccionados.push({
                    encabezado: encabezadoObj,
                    items: itemsObjs
                });
            } catch (error) {
                console.error('Error parsing JSON en factura:', error);
            }
        });
        
        return seleccionados;
    }

    function calcularMontoConDescuento(montoBase) {
        if (estado.transaccion === '$') {
            const montoAjustado = montoBase * descuentoDivValor;
            return montoBase + montoAjustado;
        }
        return montoBase;
    }

    function deseleccionarTodasLasFacturas() {
        facturas.forEach(factura => {
            factura.classList.remove('checked');
            factura.classList.remove('abonado');
            const input = factura.querySelector('.hidden-checkbox');
            if (input) input.checked = false;
            let encabezadoObj = null;
            try {
                const encabezadoData = factura.getAttribute('data-encabezado');
                encabezadoObj = JSON.parse(encabezadoData);
            } catch (error) {
                console.error(' Error parsing JSON:', error);
                console.log(' Contenido problemático:', factura.getAttribute('data-encabezado'));
                showAlertGrandes('Error al procesar los datos de la factura', 'error');
                return;
            }
            encabezadoObj.monto_abonado = 0;
            encabezadoObj.moneda_abonada = null;
            factura.setAttribute('data-encabezado', JSON.stringify(encabezadoObj));

        });
    
    }


    function calcularSumaTotalFacturas() {
        const facturasSeleccionadas = obtenerSeleccionados();
        let sumaTotal = 0;

        facturasSeleccionadas.forEach(factura => {
            if (estado.transaccion === 'bs') {
                sumaTotal += parseFloat(factura.encabezado.total_bolivares) || 0;
            } else if (estado.transaccion === '$') {
                sumaTotal += parseFloat(factura.encabezado.total_dolares) || 0;
            }
        });

        return sumaTotal;
    }

function validarSeleccionFactura(encabezadoObj) {
    const sumaActual = calcularSumaTotalFacturas();
    const montoBase = parseFloat(montoInput.value) || 0;
    const montoDisponible = calcularMontoConDescuento(montoBase);
    const toleranciaDiv = parseFloat(document.getElementById('toleranciaDiv').value) || 0;
    const toleranciaBs = parseFloat(document.getElementById('toleranciaBs').value) || 0;
    let abonado = false;

    const montoFactura = estado.transaccion === 'bs' 
        ? parseFloat(encabezadoObj.total_bolivares) || 0
        : parseFloat(encabezadoObj.total_dolares) || 0;

    const nuevoTotal = sumaActual + montoFactura;
    
    if (nuevoTotal <= montoDisponible) {
        return { validacion: true, abonado: false };
    }

    const diferencia = nuevoTotal - montoDisponible;
    const config = getConfiguracionTolerancia(estado.transaccion, diferencia, montoDisponible, toleranciaBs, toleranciaDiv);
    
    if (diferencia > config.tolerancia) {
        if (estado.montoDisponible > 0) {
            abonado = true;
            return { validacion: true, abonado: true };
        } else {
            showAlertGrandes(config.mensajeRechazo, 'atencion');
            return { validacion: false, abonado: false };
        }
    }

    showAlertGrandes(config.mensajeAdvertencia, 'advertencia');
    return { validacion: true, abonado: false };
}

function getConfiguracionTolerancia(tipoTransaccion, diferencia, montoDisponible, toleranciaBs, toleranciaDiv) {
    if (tipoTransaccion === 'bs') {
        return {
            tolerancia: toleranciaBs,
            simbolo: 'Bs',
            moneda: 'el monto disponible en Bs',
            mensajeRechazo: `No puedes seleccionar esta factura. Excedería el monto disponible de ${montoDisponible} Bs ` +
                            `por ${diferencia.toFixed(2)} `,
            mensajeAdvertencia: `Advertencia: Esta selección excede el monto disponible por ${diferencia.toFixed(2)} Bs`
        };
    } else if (tipoTransaccion === '$') {
        return {
            tolerancia: toleranciaDiv,
            simbolo: '$',
            moneda: 'el monto disponible en dólares',
            mensajeRechazo: `No puedes seleccionar esta factura. Excedería el monto disponible de $${montoDisponible} ` +
                            `por $${diferencia.toFixed(2)}`,
            mensajeAdvertencia: `Advertencia: Esta selección excede el monto disponible por $${diferencia.toFixed(2)}`
        };
    } else {
        
        return {
            tolerancia: 0,
            simbolo: '',
            moneda: 'el monto disponible',
            mensajeRechazo: `No puedes seleccionar esta factura. Excedería el monto disponible de ${montoDisponible}`,
            mensajeAdvertencia: ''
        };
    }
}
    function actualizarResumen() {
        const facturasSeleccionadas = obtenerSeleccionados();
        const sumaTotal = calcularSumaTotalFacturas();
        const montoBase = parseFloat(montoInput.value) || 0;
        const montoDisponible = calcularMontoConDescuento(montoBase);
        const montoMostrarDescuentoDivisa = document.querySelector('#montoMostrarDescuentoDivisa');
        if (montoMostrarDescuentoDivisa){
            montoMostrarDescuentoDivisa.value=montoDisponible.toFixed(2)
        }

        const montoRestante = montoDisponible - sumaTotal;
        const montoRestanteMostrar = montoRestante < 0 ? 0 : montoRestante;
        estado.montoDisponible = montoRestanteMostrar;
        const moneda = document.getElementById('moneda');
        
        elementosSeleccionados.textContent = facturasSeleccionadas.length;
        montoAbono.textContent = formatearMonto(montoDisponible);

        
        const sumaTotalElement = document.getElementById('sumaTotal');
        const montoRestanteElement = document.getElementById('montoRestante');
        
        if (sumaTotalElement) {
            sumaTotalElement.textContent = sumaTotal.toFixed(2);
        }
        
        if (montoRestanteElement) {
            montoRestanteElement.textContent = montoRestanteMostrar.toFixed(2);
        }
        if (moneda){
            moneda.textContent = estado.transaccion;
        }

        console.log('Resumen actualizado:', {
            moneda: estado.transaccion,
            facturas: facturasSeleccionadas.length,
            sumaTotal: sumaTotal,
            montoDisponible: montoDisponible,
            montoRestante: montoRestanteMostrar,
            detalles: facturasSeleccionadas
        });
    }

    // -----------------------------
    //  Estado de la transacción (MEJORADO)
    const estado = {
        transaccion: '',
        checkActivo: null,
        montoDisponible: 0,

        setTransaccion(tipo, checkbox) {
            this.transaccion = tipo;
            this.checkActivo = checkbox;
            console.log(` Transacción activa: ${tipo}`);
            this.aplicarCambiosUI(tipo);
            if (tipo === '$') {
                mostarInformacionDivisas();
            }

            if (mensaje) mensaje.classList.add('d-none');

            actualizarResumen();
        },

        reset() {
            this.transaccion = '';
            if (this.checkActivo) this.checkActivo.checked = false;
            this.checkActivo = null;
            this.montoDisponible =0
            montoInput.value= 0
            
            this.restablecerUI();
            deseleccionarTodasLasFacturas();
            ocultarInformacionDivisas();

            if (mensaje) mensaje.classList.remove('d-none');

            actualizarResumen();
            console.log(' Reset completo terminado');
        },

        aplicarCambiosUI(tipo) {
            if (tipo === 'bs') {
                bancoBs.classList.remove('d-none');
                bancoBs.required = true;
                bancoBs.disabled = false;

                bancoUsd.classList.add('d-none');
                bancoUsd.required = false;
                ocultarInformacionDivisas()
                
                console.log(' Banco Bs activo');
            } else if (tipo === '$') {
                bancoUsd.classList.remove('d-none');
                bancoUsd.required = true;

                bancoBs.classList.add('d-none');
                bancoBs.required = false;
                
                console.log('Banco USD activo');
            }
        },

        restablecerUI() {
            bancoBs.classList.remove('d-none');
            bancoBs.required = false;
            bancoBs.disabled = true;

            bancoUsd.classList.add('d-none');
            bancoUsd.required = false;

            console.log(" UI restablecida");
        }
    };


    function mostarInformacionDivisas() {
        const factura = document.querySelectorAll('.factura');
        const divMontoNormal = document.querySelector('#divMontoNormal');  
        const montoDescuentoDivisa = document.querySelector('#montoDescuentoDivisa');

        divMontoNormal.classList.add('w-50');
        divMontoNormal.classList.remove('w-100');
        montoDescuentoDivisa.classList.remove('d-none');
        

        factura.forEach(factura => {
            factura.querySelector('.arrowMostrarDivisas').classList.remove('d-none');
            factura.querySelector('.textoMostrarDivisas').classList.add('text-decoration-line-through', 'text-muted', 'mb-0');
        }); 

    }

    function ocultarInformacionDivisas() {
        const factura = document.querySelectorAll('.factura');
        const divMontoNormal = document.querySelector('#divMontoNormal');  
        const montoDescuentoDivisa = document.querySelector('#montoDescuentoDivisa');

        divMontoNormal.classList.add('w-100');
        divMontoNormal.classList.remove('w-50');
        montoDescuentoDivisa.classList.add('d-none');
        factura.forEach(factura => {
            factura.querySelector('.arrowMostrarDivisas').classList.add('d-none');
            factura.querySelector('.textoMostrarDivisas').classList.remove('text-decoration-line-through', 'text-muted', 'mb-0');
        });
    }
    // -----------------------------

    function manejarCheck(event, tipo) {
        let checkbox = event.target;
        if (tipo === '€') tipo = '$'; // euro → dólar

        if (checkbox.checked) {
            // Desmarcar otros checkboxes
            [check1, check2, check3].forEach(ch => {
                if (ch !== checkbox) ch.checked = false;
            });

            estado.setTransaccion(tipo, checkbox);
            console.log("Moneda activa:", tipo);
        } else {
            estado.reset();
        }
    }


    if (check1 && check2 && check3) {
        check1.addEventListener('change', e => manejarCheck(e, '€'));
        check2.addEventListener('change', e => manejarCheck(e, '$'));
        check3.addEventListener('change', e => manejarCheck(e, 'bs'));
    }


    if (check1 && check1.checked) manejarCheck({ target: check1 }, '€');
    else if (check2 && check2.checked) manejarCheck({ target: check2 }, '$');
    else if (check3 && check3.checked) manejarCheck({ target: check3 }, 'bs');

    // -----------------------------
    facturas.forEach(factura => {
        factura.addEventListener('click', () => {
            
            if (!estado.transaccion) {
                console.warn(' Debes seleccionar una moneda primero');
                showAlertGrandes('Debes seleccionar un tipo de moneda primero', 'atencion');
                return;
            }

            const montoBase = parseFloat(montoInput.value) || 0;
            const montoDisponible = calcularMontoConDescuento(montoBase);
            if (montoDisponible <= 0) {
                console.warn(' Debes Ingresar un monto para empezar a validar');
                showAlertGrandes('Debes ingresar un monto para empezar a validar', 'atencion');
                return;
            }

            const input = factura.querySelector('.hidden-checkbox'); 
            const isChecked = factura.classList.contains('checked');
            
            let encabezadoObj = null;
            try {
                const encabezadoData = factura.getAttribute('data-encabezado');
                encabezadoObj = JSON.parse(encabezadoData);
            } catch (error) {
                console.error(' Error parsing JSON:', error);
                console.log(' Contenido problemático:', factura.getAttribute('data-encabezado'));
                showAlertGrandes('Error al procesar los datos de la factura', 'error');
                return;
            }

            if (isChecked) {
                factura.classList.remove('checked');
                factura.classList.remove('abonado');
                input.checked = false;
                encabezadoObj.monto_abonado = 0;
                encabezadoObj.moneda_abonada = null;
                factura.setAttribute('data-encabezado', JSON.stringify(encabezadoObj));
                        
                console.log(' DESELECCIONADO:', encabezadoObj);
            } else {
                const { validacion, abonado } = validarSeleccionFactura(encabezadoObj);
                if (validacion) {
                    if (abonado){
                        factura.classList.add('abonado')
                        if (estado.transaccion === 'bs') {
                            encabezadoObj.monto_abonado = estado.montoDisponible;
                            encabezadoObj.tipo_moneda_abono = 'bs';
                        } else {
                            encabezadoObj.monto_abonado = estado.montoDisponible;
                            encabezadoObj.tipo_moneda_abono = '$';
                        }
                        factura.setAttribute('data-encabezado', JSON.stringify(encabezadoObj));
                        
                        showAlertGrandes(`Se abonó ${formatearMonto(estado.montoDisponible)} ${estado.transaccion} a la factura ${encabezadoObj.numero_entrega}`, 'exito');
                    } else {
                        // Si no fue abonado, puedes establecer monto_abonado en 0 o null
                        encabezadoObj.monto_abonado = 0;
                        encabezadoObj.moneda_abonada = null;
                    }
                    
                    factura.classList.add('checked');
                    input.checked = true;
                    console.log('SELECCIONADO:', encabezadoObj);
                } else {
                    return; 
                }
            }
            
            const totalSeleccionados = obtenerSeleccionados();
            console.log('TOTAL SELECCIONADOS:', totalSeleccionados.length);
            
            // Actualizar resumen después de cada cambio
            actualizarResumen();
        });
    });

    // Función para validar y limpiar el input de monto
    function validarMontoNumerico(input) {
        let valor = input.value;
        valor = valor.replace(/[^0-9.,]/g, '');
        valor = valor.replace(/,/g, '.');
        const partes = valor.split('.');
        if (partes.length > 2) {
            valor = partes[0] + '.' + partes.slice(1).join('');
        }
        if (partes[1] && partes[1].length > 2) {
            valor = partes[0] + '.' + partes[1].substring(0, 2);
        }

        if (input.value !== valor) {
            input.value = valor;
        }
        
        return valor;
    }

    // Evento principal para el input de monto
    montoInput.addEventListener('input', (e) => {
        const valorLimpio = validarMontoNumerico(e.target);
        
        if (valorLimpio && parseFloat(valorLimpio) >= 0) {
            deseleccionarTodasLasFacturas();
            actualizarResumen();
        } else if (valorLimpio === '' || valorLimpio === '0') {
            deseleccionarTodasLasFacturas();
            actualizarResumen();
        }
    });







    /* A PARTIR DE AQUÍ SON SOLO FUNCIONES CORRESPONDIENTE AL MODAL DE DETALLES PA */
    const btnDetalles = document.querySelectorAll('.details');
    btnDetalles.forEach(detalles => {
        detalles.addEventListener('click', function(event){
            event.stopPropagation();
            let objetoEntrega = null;
            try {
                const encabezadoData = detalles.getAttribute('data-encabezado');
                objetoEntrega = JSON.parse(encabezadoData);
            } catch (error) {
                console.error(' Error parsing JSON:', error);
                console.log(' Contenido problemático:', detalles.getAttribute('data-encabezado'));
                showAlertGrandes('Error al procesar los datos de la factura', 'error');
                return;
            }
            abrirModal(objetoEntrega)

        } )
    });



function modalVerificacion(facturas) {
    const modal = document.getElementById('invoiceModalVerificacion');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    actualizarResumenGeneral(facturas);
    renderizarEntregas(facturas);
}

function actualizarResumenGeneral(facturas) {
    const totalEntregas = facturas.length;
    const totalDolares = facturas.reduce((sum, f) => sum + parseFloat(f.encabezado.total_dolares || 0), 0);
    const totalBolivares = facturas.reduce((sum, f) => sum + parseFloat(f.encabezado.total_bolivares || 0), 0);
    

    const rifinput = document.getElementById('rif').value;
    const fechaDeposito = document.getElementById('fecha').value;
    const cuentaInput = estado.transaccion == "bs" 
        ? document.getElementById('banco_receptor').value 
        : document.getElementById('banco_receptor_dolar').value;
    const referenciaInput = document.getElementById('ref').value

    document.getElementById('RifValidacion').textContent = rifinput;
    document.getElementById('fechaValidacion').textContent = fechaDeposito;
    document.getElementById('cuentaValidacion').textContent = cuentaInput;
    document.getElementById('refValidacion').textContent = referenciaInput


    document.getElementById('totalEntregas').textContent = totalEntregas;
    document.getElementById('text-icon').textContent = estado.transaccion;
    document.getElementById('total').textContent = `${formatearMonto(montoInput.value)}`;
}


    
const formatearMonto = (monto) => {
        const numero = Number(monto);
        
        if (isNaN(numero)) {
            return '0,00';
        }
        
        try {
            return numero.toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
            });
        } catch (e) {
            return numero.toFixed(2).replace('.', ',');
        }
    };


function renderizarEntregas(facturas) {
    const container = document.getElementById('listaEntregas');
    container.innerHTML = '';
    
    function generarHTMLAbono(encabezado) {
        if (!encabezado.monto_abonado) return '';

        const monto = formatearMonto(encabezado.monto_abonado);
        const montoFormateado = encabezado.tipo_moneda_abono === 'bs'
            ? `Bs. ${monto}`
            : `$${monto}`;
        return `
            <div class="detalle-item abono-destacado">
                <span class="detalle-label"> Monto Abonado</span>
                <span class="detalle-value monto-abonado">${montoFormateado}</span>
            </div>
        `;
    }

    facturas.forEach(factura => {
        const enc = factura.encabezado; 
        const entregaHTML = `
            <div class="entrega-item ${enc.monto_abonado ? 'con-abono' : ''}">
                <div class="entrega-header">
                    <div class="entrega-numero">
                        <strong>Entrega: ${enc.numero_entrega}</strong>
                        <small>Pedido: ${enc.numero_pedido}</small>
                        <small>Fecha de Emisión: ${formatearFecha(enc.fecha_emision)}</small>
                    </div>
                </div>
                
                <div class="entrega-detalles">
                    <div class="detalle-item">
                        <span class="detalle-label">Monto USD</span>
                        <span class="detalle-value ">$${parseFloat(enc.monto_dolares).toFixed(2)}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">IVA USD</span>
                        <span class="detalle-value">$${parseFloat(enc.iva_dolares).toFixed(2)}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Total USD</span>
                        <span class="detalle-value ">$${parseFloat(enc.total_dolares).toFixed(2)}</span>
                    </div>
                    ${enc.tipo_moneda_abono === '$' ? generarHTMLAbono(enc) : ''}
                </div>

                <div class="entrega-detalles">
                    <div class="detalle-item">
                        <span class="detalle-label">Monto Bs.</span>
                        <span class="detalle-value">Bs. ${parseFloat(enc.monto_bolivares).toLocaleString('es-VE', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">IVA Bs.</span>
                        <span class="detalle-value">Bs. ${parseFloat(enc.iva_bolivares).toLocaleString('es-VE', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="detalle-item">
                        <span class="detalle-label">Total Bs.</span>
                        <span class="detalle-value">Bs. ${parseFloat(enc.total_bolivares).toLocaleString('es-VE', {minimumFractionDigits: 2})}</span>
                    </div>
                    ${enc.tipo_moneda_abono === 'bs' ? generarHTMLAbono(enc) : ''}
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', entregaHTML);
    });
}

function formatearFecha(fecha) {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function cerrarModalVerificacion() {
    const modal = document.getElementById('invoiceModalVerificacion');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

    const activarModal= document.getElementById('activarModal');

    activarModal.addEventListener('click', ()=>{
        const toleranciaDiv = parseFloat(document.getElementById('toleranciaDiv').value) || 0;
        const toleranciaBs = parseFloat(document.getElementById('toleranciaBs').value) || 0;
        const facturasSeleccionadas = obtenerSeleccionados();
        if (facturasSeleccionadas.length <=0){
            showAlertGrandes('Debes de seleccionar al menos una entrega para enviar', 'atencion')
            return;
        }

        if (estado.montoDisponible >0  && (facturasSeleccionadas.length !== facturas.length) ){
            if (estado.transaccion =="$"){
                if (estado.montoDisponible < toleranciaDiv){
                    console.log('continuando')
                }else{
                    showAlertGrandes('Aún tiene monto disponible para abonar. Por favor, seleccione una entrega')
                    return;
                }
            }
            if (estado.transaccion =="bs"){
                if (estado.montoDisponible < toleranciaBs){
                    console.log('continuando')
                }else{
                    showAlertGrandes('Aún tiene monto disponible para abonar. Por favor, seleccione una entrega')
                    return;
                }
            }

        }

        if (!validarCampos()) {
            return; 
        }
        if (facturasSeleccionadas.length== 0){
            showAlertGrandes('Debe seleccionar al menos una entrega para continuar', 'atencion')
            return;
        }
        modalVerificacion(facturasSeleccionadas)
    })



    function abrirModal(json) {
        const modal = document.getElementById('invoiceModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log(json);

        const numeroEntregaModal = document.getElementById('numeroEntregaModal');
        numeroEntregaModal.textContent = json.encabezado.numero_entrega;

        const numeroPedidoModal = document.getElementById('numeroPedidoModal');
        numeroPedidoModal.textContent = json.encabezado.numero_pedido;

        const fechaEmisionModal = document.getElementById('fechaEmisionModal');
        fechaEmisionModal.textContent = json.encabezado.fecha_emision;

        const tasaCambioModal = document.getElementById('tasaCambioModal');
        tasaCambioModal.textContent = json.encabezado.tasa_cambio;


        const numeroItemsModal = document.getElementById('numeroItemsModal');
        numeroItemsModal.textContent = json.detalle.total_items;

        const condicionPagoModal = document.getElementById('condicionPagoModal');
        condicionPagoModal.textContent = json.encabezado.condicion_pago;

        const bonificacionPagoDivisaDiv = document.getElementById('bonificacionPagoDivisaDiv');

        if(estado.transaccion === '$'){
            bonificacionPagoDivisaDiv.classList.remove('d-none');
            const bonificacionPagoDivisaModal = document.getElementById('bonificacionPagoDivisaModal');
            if (json.encabezado.TieneDPP){
                console.log(' Tiene DPP');
                bonificacionPagoDivisaModal.textContent = `$${formatearMonto(json.encabezado.bonificacion_pago_divisa_condpp)}`;
            } else{
                console.log(' No tiene DPP');
                bonificacionPagoDivisaModal.textContent = `$${formatearMonto(json.encabezado.bonificacion_pago_divisa_sindpp)}`;
            }  
            
        }else{
            bonificacionPagoDivisaDiv.classList.add('d-none');
        }
        const tableContainer = document.getElementById('tableConatiner');

        generarTablaItems(json.detalle.items, tableContainer, json.encabezado, json.detalle);

        setTimeout(animateTableRows, 100);
    }

    function generarTablaItems(items, container, encabezado, detallegeneral) {
        // Limpiar contenido previo
        container.innerHTML = '';

        // Crear la estructura de la tabla
        const table = document.createElement('table');
        table.className = 'invoice-table';

        // Crear encabezado de la tabla
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th class="text-center">Material</th>
                <th>Descripción</th>
                <th class="text-center">Precio Unit</th>
                <th class="text-right">Descuento Comercial</th>
                <th class="text-center">Precio UniT Desc</th>
                <th class="text-center">Cantidad de Articulos</th>
                <th class="text-right">Total</th>
            </tr>
        `;
        table.appendChild(thead);

        // Crear cuerpo de la tabla
        const tbody = document.createElement('tbody');
        

        
        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = 'invoice-row';
            row.style.animationDelay = `${index * 0.1}s`;
            
            // Formatear números para mostrar con 2 decimales y separadores de miles
            const precio = parseFloat(item.precio).toFixed(2);
            const precioUnitario = parseFloat(item.precio_unitario).toFixed(2);
            const descuento = parseFloat(item.descuento).toFixed(2);
            const montoTotal = parseFloat(item.monto_total_item).toFixed(2);
            

            
            row.innerHTML = `
                <td class="text-center font-weight-bold">${item.material}</td>
                <td class="product-description">${item.descripcion}</td>
                <td class="text-right">$${Number(precio).toLocaleString()}</td>
                <td class="text-right">$${Number(descuento).toLocaleString()}</td>
                <td class="text-right">$${Number(precioUnitario).toLocaleString()}</td>
                <td class="text-center">${item.cantidad}</td>
                <td class="text-right font-weight-bold">$${Number(montoTotal).toLocaleString()}</td>
            `;
            
            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        // Crear fila de total
        const tfoot = document.createElement('tfoot');
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td colspan="6" class="text-right font-weight-bold">Total General:</td>
            <td class="text-right  total-amount">$${formatearMonto(detallegeneral.monto_total_detalle)}</td>
        
        
            `;

        const abonadoRow = document.createElement('tr');
        abonadoRow.className = 'iva';
        abonadoRow.innerHTML = `
            <td colspan="6" class="text-right font-weight-bold">Monto Abonado:</td>
            <td class="text-right abonadoTexto">$-${ formatearMonto(encabezado.monto_abonado_dolares)}</td>
        
        
            `;

        const Total = document.createElement('tr');
        Total.className = 'totalItems';
        Total.innerHTML = `
            <td colspan="6" class="text-right font-weight-bold">Total Pendiente por Pagar:</td>
            <td class="text-right  total-amount">$${ formatearMonto(encabezado.total_dolares)}</td>
        
        
            `;


        //crear fila de iva
        tfoot.appendChild(totalRow);
        tfoot.appendChild(abonadoRow)
        tfoot.appendChild(Total)
        
        table.appendChild(tfoot);

        
        // Agregar tabla al contenedor
        container.appendChild(table);
    }


    function cerrarModal() {
        const modal = document.getElementById('invoiceModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function animateTableRows() {
        const rows = document.querySelectorAll('.items-table tbody tr');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                row.style.transition = 'all 0.6s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
        });
    }


    document.getElementById('invoiceModal').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModal();
        }
    });

    
    document.querySelector('.close-btn-modal').addEventListener('click', ()=>{
        cerrarModal();
    })

    // Cerrar modal con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('invoiceModal');
            if (modal.classList.contains('active')) {
                cerrarModal();
            }
        }
    });



    document.getElementById('invoiceModalVerificacion').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModalVerificacion();
        }
    });

    const cerrarModales = document.querySelectorAll('.close-modal-verificacion');
    cerrarModales.forEach(boton => {
        boton.addEventListener('click', ()=>{
        cerrarModalVerificacion();
        })
    });

    // Cerrar modal con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('invoiceModalVerificacion');
            if (modal.classList.contains('active')) {
                cerrarModalVerificacion();
            }
        }
    });

    /*HASTA AQUI LAS FUNCIONES PARA EL MODAL */




    /*AQUI ES LA FUNCIONALIDAD PARA ENVIAR */

    function limpiarAlertas() {
        const alertasExistentes = document.querySelectorAll('.alerta-campo');
        alertasExistentes.forEach(alerta => alerta.remove());
        const camposConError = document.querySelectorAll('.campo-error');
        camposConError.forEach(campo => campo.classList.remove('campo-error'));
    }

    function validarCampos() {

        limpiarAlertas();
        
        const campos = [
            { id: 'rif', nombre: 'RIF' },
            { id: 'empresa', nombre: 'Empresa' },
            { id: 'empresa_beneficiaria', nombre: 'Empresa Beneficiaria' },
            { id: 'fecha', nombre: 'Fecha' },
            { id: 'ref', nombre: 'Referencia' },
            { id: 'monto', nombre: 'Monto' },
            { id: 'archivo', nombre: 'Archivo de soporte', esArchivo: true }
        ];

        const bancoReceptorId = estado.transaccion === "bs" ? 'banco_receptor' : 'banco_receptor_dolar';
        campos.push({ id: bancoReceptorId, nombre: 'Banco Receptor' });

        let primerCampoVacio = null;
        let hayErrores = false;

        for (let campo of campos) {
            const elemento = document.getElementById(campo.id);
            
            if (!elemento) {
                console.warn(`Campo con ID '${campo.id}' no encontrado`);
                continue;
            }

            let valor;
            
            if (campo.esArchivo) {
                valor = elemento.files && elemento.files.length > 0;
            } else {
                valor = elemento.value.trim();
            }

            if (!valor) {
                hayErrores = true;
                const contenedorAlerta = document.createElement('div');
                contenedorAlerta.className = 'alertaRequired';
                contenedorAlerta.textContent = `El campo ${campo.nombre} es obligatorio`;
                elemento.classList.add('campo-error');
                elemento.parentElement.appendChild(contenedorAlerta);
                if (!primerCampoVacio) {
                    primerCampoVacio = elemento;
                }
            }
        }

        if (hayErrores) {
            if (primerCampoVacio) {
                primerCampoVacio.focus();
                if (primerCampoVacio.type === 'file') {
                    primerCampoVacio.click();
                }
            }
            showAlertGrandes('Por favor completa todos los campos obligatorios', 'atencion');
            
            return false;
        }

        return true;
}
let formEnviando = false;
const enviarBoton = document.getElementById('enviarBoton');
const csrf = document.getElementById('csrf').value;

enviarBoton.addEventListener('click', function(event) {
    event.preventDefault();
    
    // Prevenir doble envío
    if (formEnviando) {
        return;
    }
    
    // Marcar como enviando
    formEnviando = true;
    
    // Mostrar loader
    mostrarLoader();
    
    // Deshabilitar botón de envío
    enviarBoton.disabled = true;
    enviarBoton.classList.add('enviando');
    
    // Deshabilitar botones de cancelar
    const botonesCancelar = document.querySelectorAll('.close-modal-verificacion');
    botonesCancelar.forEach(btn => btn.disabled = true);
    
    // Bloquear cierre del modal por click fuera
    const modal = document.getElementById('invoiceModalVerificacion');
    if (modal) {
        modal.style.pointerEvents = 'none';
    }
    
    const facturasSeleccionadas = obtenerSeleccionados();
    
    /* DATOS PARA EL PAGO */
    const rif = document.getElementById('rif').value;
    const empresa = document.getElementById('empresa').value;
    const empresa_beneficiaria = document.getElementById('empresa_beneficiaria').value;
    const fecha = document.getElementById('fecha').value;
    let banco_receptor = estado.transaccion === "bs" 
        ? document.getElementById('banco_receptor').value
        : document.getElementById('banco_receptor_dolar').value;
    const ref = document.getElementById('ref').value;
    const monto = document.getElementById('monto').value;
    const soportePagoFile = document.getElementById('archivo').files[0];
    
    const formData = new FormData();
    
    formData.append('data', JSON.stringify({
        facturasSeleccionadas: facturasSeleccionadas,
        rif: rif,
        empresa: empresa,
        empresa_beneficiaria: empresa_beneficiaria,
        fecha: fecha,
        banco_receptor: banco_receptor,
        ref: ref,
        tipoPago: estado.transaccion,
        monto: monto
    }));
    
    if (soportePagoFile) {
        formData.append('soporte_pago', soportePagoFile);
    }
    
    console.log(facturasSeleccionadas);
    
    fetch('/prepagoPost', {
        method: "POST",
        headers: {
            "X-CSRFToken": csrf 
        },
        body: formData
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("Respuesta:", data);
        
        if (data.success) {
            console.log(data);
            
            setTimeout(() => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    ocultarLoader();
                }
            }, 1500);
        } else {
            ocultarLoader();
            showAlertGrandes(data.message || 'Error al procesar el pago', 'error');
        }
    })
    .catch(err => {
        console.error('Fetch error:', err);
        ocultarLoader();
        showAlertGrandes(
            'Error de conexión: No se pudo procesar el pago. Por favor, verifica tu conexión e intenta nuevamente.', 
            'error'
        );
    });
});


document.querySelectorAll('input[type="date"]').forEach(input => {
    input.addEventListener('click', () => {

        input.showPicker?.(); 
    });
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {

        const today = new Date().toISOString().split('T')[0];

        fechaInput.max = today;
    }
});

function mostrarLoader() {
    let loaderOverlay = document.getElementById('loaderOverlay');
    
    if (!loaderOverlay) {
        loaderOverlay = document.createElement('div');
        loaderOverlay.id = 'loaderOverlay';
        loaderOverlay.className = 'loader-overlay';
        loaderOverlay.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
                <p class="loader-text">Procesando pago...</p>
                <p class="loader-subtext">Por favor espere, no cierre esta ventana</p>
            </div>
        `;
        document.body.appendChild(loaderOverlay);
    }
    
    // Asegurar que el loader esté visible
    setTimeout(() => {
        loaderOverlay.classList.add('active');
    }, 10);
}

function ocultarLoader() {
    const loaderOverlay = document.getElementById('loaderOverlay');
    
    if (loaderOverlay) {
        loaderOverlay.classList.remove('active');
        
        // Esperar a que termine la animación antes de remover
        setTimeout(() => {
            if (loaderOverlay && loaderOverlay.parentNode) {
                loaderOverlay.remove();
            }
        }, 300);
    }
    
    // Resetear estado del formulario
    formEnviando = false;
    
    // Rehabilitar botón de envío
    const botonEnviar = document.getElementById('enviarBoton');
    if (botonEnviar) {
        botonEnviar.disabled = false;
        botonEnviar.classList.remove('enviando');
    }
    
    // Rehabilitar botones de cancelar
    const botonesCancelar = document.querySelectorAll('.close-modal-verificacion');
    botonesCancelar.forEach(btn => btn.disabled = false);
    
    // Desbloquear modal
    const modal = document.getElementById('invoiceModalVerificacion');
    if (modal) {
        modal.style.pointerEvents = 'auto';
    }
}




































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




});




/*
function obtenerSeleccionados() {
    const seleccionados = [];
    const facturasChecked = document.querySelectorAll('.factura.checked');
    
    facturasChecked.forEach(factura => {
        const encabezadoData = factura.getAttribute('data-encabezado');
        const encabezadoObj = JSON.parse(encabezadoData);
        seleccionados.push(encabezadoObj);
    });
    
    return seleccionados;
}/*/



