document.addEventListener('DOMContentLoaded', function() {

    const divisas = document.querySelectorAll('.divisa');
    console.log('Habilitando selección de divisas');
    divisas.forEach(divisa => {
        divisa.disabled = false;
    });
    
    // Referencias de divisas
    const check3 = document.getElementById('check3'); // bs
    const check2 = document.getElementById('check2'); // $
    const check1 = document.getElementById('check1'); // €

    // Referencia al monto
    const montoInput = document.getElementById('monto');
    const elementosSeleccionados = document.getElementById('contadorElementos');
    const montoAbono = document.getElementById('montoRestante');
    const monedaSpan = document.getElementById('moneda');

    // Referencia a las facturas
    const facturas = document.querySelectorAll('.factura');

    // Bancos y mensaje
    const bancoBs = document.getElementById('banco_receptor');
    const bancoUsd = document.getElementById('banco_receptor_dolar');
    const mensaje = document.querySelector('.mensaje');


    // Estado global mejorado
    const estado = {
        transaccion: '',
        checkActivo: null,
        montoDisponible: 0,
        facturasSeleccionadas: [],
        facturaAbonada: null, 
        montoRestante: 0,
        sumaTotal: 0,

        setTransaccion(tipo, checkbox) {
            this.transaccion = tipo;
            this.checkActivo = checkbox;
            console.log(`Transacción activa: ${tipo}`);
            this.aplicarCambiosUI(tipo);
            
            if (mensaje) mensaje.classList.add('d-none');
            seleccionarFacturasAutomaticamente();
        },

        reset() {
            this.transaccion = '';
            if (this.checkActivo) this.checkActivo.checked = false;
            this.checkActivo = null;
            this.montoDisponible = 0;
            this.facturasSeleccionadas = [];
            this.facturaAbonada = null;
            this.montoRestante = 0;
            this.sumaTotal = 0;
            montoInput.value = '';
            
            this.restablecerUI();
            deseleccionarTodasLasFacturas();
            limpiarAbonos(); 

            if (mensaje) mensaje.classList.remove('d-none');

            actualizarResumen();
        
        },

        aplicarCambiosUI(tipo) {
            if (tipo === 'bs') {
                bancoBs.classList.remove('d-none');
                bancoBs.required = true;
                bancoBs.disabled = false;

                bancoUsd.classList.add('d-none');
                bancoUsd.required = false;
                
            
                console.log('Banco Bs activo');
            } else if (tipo === '$' || tipo === '€') {
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
        
            console.log("UI restablecida");
        },

        actualizarEstado() {
            this.facturasSeleccionadas = [];
            this.sumaTotal = 0;

            facturas.forEach(factura => {
                if (factura.classList.contains('checked')) {
                    const datos = obtenerDatosFactura(factura);
                    this.facturasSeleccionadas.push(datos);
                    
                    // Si es abonada, sumar solo el abono
                    if (factura.classList.contains('abonada') && this.facturaAbonada) {
                        this.sumaTotal += this.facturaAbonada.montoAbono;
                    } else {
                        this.sumaTotal += datos.monto;
                    }
                }
            });

            this.montoRestante = this.montoDisponible - this.sumaTotal;
        }
    };

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



    function limpiarAbonos() {
        facturas.forEach(factura => {
            const contenedorAbonado = factura.querySelector('.CasoAbonado');
            if (contenedorAbonado) {
                contenedorAbonado.classList.add('d-none');
            }
            factura.classList.remove('abonada');
        });
        
        estado.facturaAbonada = null; 
    }

    // Función para marcar una factura como abonada
    function marcarFacturaAbonada(factura, montoAbono) {
        limpiarAbonos();

        factura.classList.add('checked');
        factura.classList.add('abonada');

        const contenedorAbonado = factura.querySelector('.CasoAbonado');
        contenedorAbonado.classList.remove('d-none')

        const spanMontoAbonado = contenedorAbonado.querySelector('.ValorAbonado');

        spanMontoAbonado.textContent=  `${formatearMonto(montoAbono)} ${estado.transaccion} `;
        const datos = obtenerDatosFactura(factura);
        estado.facturaAbonada = {
            ...datos,
            montoAbono: montoAbono,
            montoTotal: datos.monto
        };
    }

    // Funciones auxiliares para facturas
    function obtenerSeleccionados() {
        const seleccionados = [];
        const facturasChecked = document.querySelectorAll('.factura.checked');
        
        facturasChecked.forEach(factura => {
            try {
                const encabezadoData = factura.getAttribute('data-encabezado');
                const encabezadoObj = JSON.parse(encabezadoData);
            
                const esFacturaAbonada = estado.facturaAbonada && 
                                        estado.facturaAbonada.encabezado.documento === encabezadoObj.documento &&
                                        estado.facturaAbonada.encabezado.item === encabezadoObj.item;
                
                if (esFacturaAbonada) {
                    seleccionados.push({
                        ...encabezadoObj,
                        montodoc: estado.facturaAbonada.montoAbono,  
                        montodocOriginal: encabezadoObj.montodoc,   
                        esAbono: true
                    });
                } else {

                    seleccionados.push(encabezadoObj);
                }
                
            } catch (error) {
                console.error('Error parsing JSON en factura:', error);
            }
        });
        
        return seleccionados;
    }

    // Función para obtener datos de la factura según la moneda
    function obtenerDatosFactura(factura) {
        try {
            const encabezado = JSON.parse(factura.dataset.encabezado);
            const numeroDoc = encabezado.documento;
            let moneda_permitida = ''
            let monto = 0;
            if (estado.transaccion === 'bs') {
                monto = parseFloat(encabezado.mbsautor) || 0;
            } else if (estado.transaccion === '$' || estado.transaccion === '€') {
                monto = parseFloat(encabezado.montodoc) || 0;
            }

            if (encabezado.autopagobs == ""){
                moneda_permitida = "$"
            }else if (encabezado.autopagobs =="X"){
                moneda_permitida = "bs"
            }
            return {
                numero: numeroDoc,
                monto: monto,
                moneda: estado.transaccion,
                encabezado: encabezado,
                monedaPermitida: moneda_permitida
            };
        } catch (error) {
            console.error('Error al obtener datos de factura:', error);
            return { numero: 'N/A', monto: 0, moneda: estado.transaccion };
        }
    }

    // Función para validar si la factura permite la moneda de los bolos
    function validarMonedaPermitidaParaBS(factura) {
        try {
            const encabezado = JSON.parse(factura.dataset.encabezado);
            
            if (estado.transaccion === 'bs' &&  encabezado.autopagobs ==='X') {
                return true;
            } 
            return false;

        } catch (error) {
            console.error('Error al validar moneda:', error);
            return false;
        }
    }

    // Función para deseleccionar todas las facturas
    function deseleccionarTodasLasFacturas() {
        facturas.forEach(factura => {
            factura.classList.remove('checked');
            const checkbox = factura.querySelector('.hidden-checkbox');
            if (checkbox) checkbox.checked = false;
        });
        estado.facturasSeleccionadas = [];
        estado.sumaTotal = 0;
    }

    // Función principal de actualización de resumen
    function actualizarResumen() {
        estado.actualizarEstado();
        
        const totalElementos = estado.facturasSeleccionadas.length;
        elementosSeleccionados.textContent = totalElementos;
        
        const montoMostrar = Math.max(0, estado.montoRestante);
        montoAbono.textContent = montoMostrar.toFixed(2);
        
        if (monedaSpan) {
            monedaSpan.textContent = estado.transaccion;
        }

        console.log('📊 Resumen actualizado:', {
            moneda: estado.transaccion,
            cantidadFacturas: estado.facturasSeleccionadas.length,
            facturaAbonada: estado.facturaAbonada ? `${estado.facturaAbonada.numero} (${estado.facturaAbonada.montoAbono.toFixed(2)})` : 'No',
            sumaTotal: estado.sumaTotal.toFixed(2),
            montoDisponible: estado.montoDisponible.toFixed(2),
            montoRestante: estado.montoRestante.toFixed(2),
            detalles: estado.facturasSeleccionadas
        });
    }

    function seleccionarFacturasAutomaticamente() {
        if (!estado.transaccion) {
            showAlertGrandes('Para continuar, seleccione una moneda primero')
            montoInput.value = '';
            return;
        }
        
        const montoBase = parseFloat(montoInput.value) || 0;
        estado.montoDisponible = montoBase;

        if (montoBase <= 0) {
            deseleccionarTodasLasFacturas();
            limpiarAbonos();
            estado.facturaAbonada = null;
            actualizarResumen();
            return;
        }

        // Deseleccionar todas y limpiar abonos
        deseleccionarTodasLasFacturas();
        limpiarAbonos();
        estado.facturaAbonada = null;

        let montoAcumulado = 0;
        let facturasSeleccionadasTemp = [];
        let procesoDetenido = false;
        let index = 0;

        for (const factura of facturas) {
            if (procesoDetenido) break; 
            
            const datos = obtenerDatosFactura(factura);
            const permiteMoneda = validarMonedaPermitidaParaBS(factura);


            if (estado.transaccion === "bs" && permiteMoneda === false) {

                if (facturasSeleccionadasTemp.length > 0) {
                    console.log(`⚠️ Factura ${datos.numero} no permite Bs - Deteniendo proceso`);
                    console.log(`✅ Se mantienen ${facturasSeleccionadasTemp.length} facturas ya seleccionadas`);
                    
                    showAlertGrandes(
                        `Proceso detenido: La siguiente factura no permite pagos en Bs.\n` +
                        `Se han seleccionado ${facturasSeleccionadasTemp.length} factura(s) válida(s).`,
                        'atencion'
                    );
                    
                    procesoDetenido = true;
                    break; 
                } else {

                    showAlertGrandes('La primera factura a pagar no está permitida en pagos en Bs', 'error');
                    deseleccionarTodasLasFacturas();
                    limpiarAbonos();
                    estado.facturaAbonada = null;
                    montoInput.value = '';
                    montoInput.focus();
                    actualizarResumen();
                    return; 
                }
            }

            const montoRestanteActual = estado.montoDisponible - montoAcumulado;

            console.log(`\n📄 Evaluando Factura ${index + 1}/${facturas.length}:`);
            console.log(`   Número: ${datos.numero}`);
            console.log(`   Monto: ${datos.monto.toFixed(2)} ${estado.transaccion}`);
            console.log(`   Permite ${estado.transaccion}: ${permiteMoneda ? '✅ Sí' : '❌ No'}`);
            console.log(`   Monto restante: ${montoRestanteActual.toFixed(2)} ${estado.transaccion}`);

            // Si la factura cabe completa
            if (datos.monto <= montoRestanteActual) {
                factura.classList.add('checked');
                const checkbox = factura.querySelector('.hidden-checkbox');
                if (checkbox) checkbox.checked = true;
                
                montoAcumulado += datos.monto;
                facturasSeleccionadasTemp.push(datos);
                
                console.log(`   ✅ SELECCIONADA COMPLETA`);
                console.log(`   Acumulado: ${montoAcumulado.toFixed(2)} ${estado.transaccion}`);
            } 
            // Si no cabe completa pero queda saldo
            else if (montoRestanteActual > 0) {
                // Si el monto restante es mayor que el monto de la factura,
                // pagar la factura completa (no hacer abono parcial)
                const montoPagar = Math.min(montoRestanteActual, datos.monto);
                
                if (montoPagar >= datos.monto) {
                    // El monto disponible cubre toda la factura
                    factura.classList.add('checked');
                    const checkbox = factura.querySelector('.hidden-checkbox');
                    if (checkbox) checkbox.checked = true;
                    
                    montoAcumulado += datos.monto;
                    facturasSeleccionadasTemp.push(datos);
                    
                    console.log(`   ✅ SELECCIONADA COMPLETA (Monto sobrante)`);
                    console.log(`   Acumulado: ${montoAcumulado.toFixed(2)} ${estado.transaccion}`);
                } else {
                    // Hacer abono parcial
                    marcarFacturaAbonada(factura, montoRestanteActual);
                    montoAcumulado += montoRestanteActual;
                    procesoDetenido = true;
                    
                    console.log(`   💰 ABONADA con ${montoRestanteActual.toFixed(2)} ${estado.transaccion}`);
                    console.log(`   Monto total factura: ${datos.monto.toFixed(2)} ${estado.transaccion}`);
                    console.log(`   PROCESO DETENIDO - Monto agotado`);
                }
            }
            // Si no queda saldo, detener
            else {
                console.log(`   ⏹️ RECHAZADA: No queda saldo disponible`);
                procesoDetenido = true;
            }
            
            index++;
        }

        console.log(`\n✨ Selección completada:`);
        console.log(`   Total facturas procesadas: ${index}`);
        console.log(`   Facturas seleccionadas completas: ${facturasSeleccionadasTemp.length}`);
        console.log(`   Factura abonada: ${estado.facturaAbonada ? 'Sí' : 'No'}`);
        console.log(`   Monto total utilizado: ${montoAcumulado.toFixed(2)} ${estado.transaccion}`);
        console.log(`   Monto restante: ${(estado.montoDisponible - montoAcumulado).toFixed(2)} ${estado.transaccion}`);

        actualizarResumen();
    }

    // Manejador de checks
    function manejarCheck(event, tipo) {
        let checkbox = event.target;
        if (tipo === '€') tipo = '$';

        if (checkbox.checked) {
            [check1, check2, check3].forEach(ch => {
                if (ch !== checkbox) ch.checked = false;
            });

            estado.setTransaccion(tipo, checkbox);
        } else {
            estado.reset();
        }
    }

    // Event listeners para los checks
    if (check1 && check2 && check3) {
        check1.addEventListener('change', e => manejarCheck(e, '€'));
        check2.addEventListener('change', e => manejarCheck(e, '$'));
        check3.addEventListener('change', e => manejarCheck(e, 'bs'));
    }

    // Evento para cuando cambie el monto
    if (montoInput) {
        montoInput.addEventListener('input', function() {
            if (estado.transaccion) {
                seleccionarFacturasAutomaticamente();
            }
        });
    }

    // Click manual en facturas individuales
    facturas.forEach(factura => {
        factura.addEventListener('click', function(e) {
            showAlertGrandes('La selección es automática', 'atencion');
        });
    });

    // Inicialización
    if (check1 && check1.checked) manejarCheck({ target: check1 }, '€');
    else if (check2 && check2.checked) manejarCheck({ target: check2 }, '$');
    else if (check3 && check3.checked) manejarCheck({ target: check3 }, 'bs');




    /*AQUI ESTAN LAS COSAS DEL MODALLLLLL */

    function modalVerificacion(facturas) {
        const modal = document.getElementById('invoiceModalVerificacion');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        actualizarResumenGeneral(facturas);
        console.log(facturas)
        renderizarDocumentos(facturas);
    }

    function actualizarResumenGeneral(facturas) {
        const totalDocumentos = facturas.length;

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


        document.getElementById('totalDocumentos').textContent = totalDocumentos;
        document.getElementById('text-icon').textContent = estado.transaccion;
        document.getElementById('total').textContent = `${formatearMonto(montoInput.value)}`;
    }


    function renderizarDocumentos(facturas) {
        const container = document.getElementById('listaEntregas');
        container.innerHTML = '';
        
        if (!facturas || facturas.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-3">No hay facturas seleccionadas</p>';
            return;
        }

        facturas.forEach((factura, index) => {
            // Determinar si es un abono
            const esAbono = factura.esAbono === true;
            const montoMostrar = esAbono ? factura.montodoc : factura.montodoc;
            const montoOriginal = factura.montodocOriginal || null;

            const entregaHTML = `
                <div class="factura-item ${esAbono ? 'factura-abonada' : ''}" data-index="${index}">
                    <div class="factura-header">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="factura-numero mb-0">
                                <i class="bi bi-file-earmark-text me-2"></i>
                                Documento: ${factura.documento}
                            </h5>
                            ${esAbono ? '<span class="badge bg-warning text-dark">ABONO PARCIAL</span>' : '<span class="badge bg-success">COMPLETA</span>'}
                        </div>
                    </div>

                    <div class="factura-body">
                        <div class="row g-2">
                            <!-- Item -->
                            <div class="col-6 col-md-4">
                                <div class="detalle-item">
                                    <span class="detalle-label">Item:</span>
                                    <span class="detalle-value">${factura.item}</span>
                                </div>
                            </div>

                            <!-- Fecha Documento -->
                            <div class="col-6 col-md-4">
                                <div class="detalle-item">
                                    <span class="detalle-label">Fecha Doc:</span>
                                    <span class="detalle-value">${formatearFecha(factura.fechadoc)}</span>
                                </div>
                            </div>

                            <!-- Fecha Vencimiento -->
                            <div class="col-6 col-md-4">
                                <div class="detalle-item">
                                    <span class="detalle-label">Vencimiento:</span>
                                    <span class="detalle-value">${formatearFecha(factura.fechavenc)}</span>
                                </div>
                            </div>

                            <!-- Descripción -->
                            <div class="col-12">
                                <div class="detalle-item">
                                    <span class="detalle-label">Descripción:</span>
                                    <span class="detalle-value">${factura.sgtxt}</span>
                                </div>
                            </div>

                            <!-- Moneda -->
                            <div class="col-6 col-md-4">
                                <div class="detalle-item">
                                    <span class="detalle-label">Moneda:</span>
                                    <span class="detalle-value">${factura.moneda}</span>
                                </div>
                            </div>

                            ${esAbono ? `
                                <!-- Monto Original (solo si es abono) -->
                                <div class="col-6 col-md-4">
                                    <div class="detalle-item">
                                        <span class="detalle-label">Monto Total:</span>
                                        <span class="detalle-value text-muted text-decoration-line-through">
                                            ${estado.transaccion === 'bs' ? 'Bs.' : '$'} ${formatearMonto(montoOriginal)}
                                        </span>
                                    </div>
                                </div>

                                <!-- Monto Abonado -->
                                <div class="col-6 col-md-4">
                                    <div class="detalle-item abono-destacado">
                                        <span class="detalle-label fw-bold">Monto a Abonar:</span>
                                        <span class="detalle-value monto-abonado fw-bold">
                                            ${estado.transaccion === 'bs' ? 'Bs.' : '$'} ${formatearMonto(montoMostrar)}
                                        </span>
                                    </div>
                                </div>

                                <!-- Saldo Pendiente -->
                                <div class="col-12">
                                    <div class="detalle-item saldo-pendiente">
                                        <span class="detalle-label"> Saldo Pendiente:</span>
                                        <span class="detalle-value text-dark fw-bold">
                                            ${estado.transaccion === 'bs' ? 'Bs.' : '$'} ${formatearMonto(montoOriginal - montoMostrar)}
                                        </span>
                                    </div>
                                </div>
                            ` : `
                                <!-- Monto Total (si es completa) -->
                                <div class="col-6 col-md-4">
                                    <div class="detalle-item">
                                        <span class="detalle-label">Monto:</span>
                                        <span class="detalle-value fw-bold">
                                            ${estado.transaccion === 'bs' ? 'Bs.' : '$'} ${formatearMonto(montoMostrar)}
                                        </span>
                                    </div>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            container.insertAdjacentHTML('beforeend', entregaHTML);
        });
    }

    // Función auxiliar para formatear fechas
    function formatearFecha(fecha) {
        if (!fecha) return 'N/A';
        
        try {
            const [año, mes, dia] = fecha.split('-');
            return `${dia}/${mes}/${año}`;
        } catch (error) {
            return fecha;
        }
    }


    
    


    const activarModal= document.getElementById('activarModal');

    activarModal.addEventListener('click', ()=>{
        const facturasSeleccionadas = obtenerSeleccionados();
        if (facturasSeleccionadas.length <=0){
            showAlertGrandes('Debes de seleccionar al menos una entrega para enviar', 'atencion')
            return;
        }

        if (!validarCampos()) {
            return; 
        }

        modalVerificacion(facturasSeleccionadas)
    })


    function cerrarModalVerificacion() {
        const modal = document.getElementById('invoiceModalVerificacion');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

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



    /*Para el picker de la fecha pa */
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
        
        fetch('/letra_cambio_post', {
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
                    ocultarLoader();
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
