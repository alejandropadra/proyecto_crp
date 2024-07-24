var check3 = document.getElementById('check3');
var check2 = document.getElementById('check2');
var check1 = document.getElementById('check1');


// controlador de eventos a check3 (Para bolos)
document.addEventListener('DOMContentLoaded', function() {
    if (check3 && check2 && check1) {
        check3.addEventListener('change', function() {
            ///Buscando elementos por clases e id
            var bancoReceptor = document.getElementById('banco_receptor');
            var checkboxes = document.querySelectorAll('#check5');
            var mensaje = document.querySelector('.mensaje');
            var monto = document.getElementById('monto');
            
            ///condicional de estado de Checkeado del Booleanfield, si esta check
            /// se hará todo lo que se especifíca partir de aquí   
            if (this.checked) {
                bancoReceptor.removeAttribute('disabled');
                bancoReceptor.value = '';
                mensaje.classList.add('d-none');
                check2.disabled = true;
                check1.disabled = true;
                const bancoReceptorInput = document.getElementById('banco_receptor');
                const bancoReceptorInput1 = document.getElementById('banco_receptor_dolar');
                bancoReceptorInput.classList.remove('d-none')
                bancoReceptorInput1.classList.add('d-none')
                ///Quitar la propiedad required
                bancoReceptorInput1.required =false;
                /// Agregar la propiedad required
                bancoReceptorInput.required = true;

                ///Listener para el input donde se ingresa el monto
                monto.addEventListener('input', function() {
                    const montoValue = parseFloat(monto.value);///Valor del input de ingreso de monto
                    let sumaFacturas = 0;
                    
                    
                ///Funcion para eliminar los inputs de envío de datos para el backend
                const eliminarInputs = () => {
                    ///Estas siguientes tres líneas de codigo es para identificar los inputs que se insertan mas abajo por el ciclo for(2) 
                    const inputFacturaElements = document.querySelectorAll('input[id^="inputFactura"]');
                    const inputFacturaMontoElements = document.querySelectorAll('input[id^="inputfacturaMonto"]');
                    const inputFacturafkdatElements = document.querySelectorAll('input[id^="inputfkdat"]');
                    const inputFacturabelnr1Elements = document.querySelectorAll('input[id^="inputbelnr1"]');
                    const inputFacturabuzeiElements = document.querySelectorAll('input[id^="inputbuzei"]');
                    inputFacturaElements.forEach(inputElement => {
                        inputElement.parentNode.removeChild(inputElement);
                    });
                    
                    inputFacturaMontoElements.forEach(inputElementMonto => {
                        inputElementMonto.parentNode.removeChild(inputElementMonto);
                    });

                    inputFacturafkdatElements.forEach(inputElementfkdat => {
                        inputElementfkdat.parentNode.removeChild(inputElementfkdat);
                    });

                    inputFacturabelnr1Elements.forEach(inputElementbelnr1 => {
                        inputElementbelnr1.parentNode.removeChild(inputElementbelnr1);
                    });

                    inputFacturabuzeiElements.forEach(inputElementbuzei => {
                        inputElementbuzei.parentNode.removeChild(inputElementbuzei);
                    });
                };
                
                // Llamar a la función para eliminar los elementos input
                eliminarInputs();
                    
                
                // Función para eliminar la clase '.evaluando'
                const eliminarClaseEvaluando = () => {
                    const montosElements = document.querySelectorAll('.montos');
                    montosElements.forEach(montosElement => {
                        montosElement.classList.remove('evaluando');
                    });
                };
            
                // Llamar a la función para eliminar la clase '.evaluando'
                eliminarClaseEvaluando();
                ///For para captar los checks
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.disabled = true;
                    checkbox.parentNode.classList.remove('listo');
                    const textoFaltanteDiv = checkbox.parentNode.querySelector('.texto-faltante');
                    textoFaltanteDiv.textContent = '';
                    textoFaltanteDiv.classList.remove('facts');
                    const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');
                    textoAbonoDiv.textContent = '';
                    textoAbonoDiv.classList.remove('abon');
                });
                ///Si el monto.value no tiene nada, se borra absolutamente todo (los textos y los inputs de envío de datos)
                if (monto.value === '') {
                    const textoFaltanteDivs = document.querySelectorAll('.texto-faltante');
                    const textoAbonoDivs = document.querySelectorAll('.texto-abono');

                    textoFaltanteDivs.forEach(div => {
                        div.textContent = '';
                        div.classList.remove('facts');
                    });

                    textoAbonoDivs.forEach(div => {
                        div.textContent = '';
                        div.classList.remove('abon');
                    });

                    
                    eliminarInputs(); // Llamada a la función para eliminar los elementos input
                    eliminarClaseEvaluando(); // Llamada a la función para eliminar la clase '.evaluando'

                    return;
                }

                const montoBsElements = [];
                ///↓Ciclo For(1): Este ciclo es para ir pasando los datos de montos
                for (let i = 0; i < checkboxes.length; i++) {
                    const label = checkboxes[i].parentNode;
                    const montobsdppElement = label.querySelector('#montobsdpp');
                    if (montobsdppElement) {
                        montoBsElements.push(montobsdppElement);
                    } else {
                        const montoBsElement = label.querySelector('#montoBs');
                        if (montoBsElement) {
                            montoBsElements.push(montoBsElement);
                        }
                    }
                }
                ///↓ Ciclo for(2): A partir de aqui funcionan las evaluaciones por factura
                for (let i = 0; i < checkboxes.length; i++) {
                    const checkbox = checkboxes[i];///Posiciones de los checks
                    const label = checkbox.parentNode;
                    const montosElement = label.querySelector('.montos');///Busco en el html el div cuya clase es .montos
                    montosElement.classList.add('evaluando');
                    const elementoDiv = montoBsElements[i];///Monto por posicion
                    const textoDelElemento = elementoDiv? elementoDiv.textContent : '';
                    const valorSinSimbolo = textoDelElemento.slice(0, -2);
                    const valorNumerico = parseFloat(valorSinSimbolo.replace(',', ''));///Eliminar las comas y puntos del formato que aparece en el html
                    const montoFactura = valorNumerico;
                    
                    checkbox.checked = false;
                    label.classList.remove('listo');///Inicializo la clase sin listo

                    ///Las variables de la factura
                    const vblen = document.getElementById('vbeln' + (i + 1))?.textContent;///n° de factura vbeln
                    const fkdat = document.getElementById('fkdat' + (i + 1))?.textContent;/// fecha fkdat
                    const belnr1 = document.getElementById('belnr1' + (i + 1))?.textContent;///  belnr1
                    const buzei = document.getElementById('buzei' + (i + 1))?.textContent;///  buzei
                    const dif = montoValue - sumaFacturas
                    
                        let inputElement = label.querySelector('#inputFactura' + i);///input para vbeln (factura)
                        let inputElementMonto = label.querySelector('#inputfacturaMonto' + i);/// input para el monto a enviar
                        let inputElementfkdat = label.querySelector('#inputfkdat' + i);/// input para la fecha
                        let inputElementbelnr1 = label.querySelector('#inputbelnr1' + i);/// input para la fecha
                        let inputElementbuzei = label.querySelector('#inputbuzei' + i);/// input para la fecha
                        const valorSinComa = montoFactura.toString().replace(',', '.');
                        ///↓si esta presente la clase evaluando en una factura pues se ingresa el input para enviar los datos
                        if (montosElement.classList.contains('evaluando')) {
                            if (!inputElement) {///Input de n° de factura
                                inputElement = document.createElement('input');
                                inputElement.type = 'text';
                                inputElement.name = 'inputFactura' + i;
                                inputElement.className = 'd-none';
                                inputElement.value = vblen.toString();
                                inputElement.id = 'inputFactura' + i;
                                label.appendChild(inputElement);
                            }
                            
                            if (!inputElementMonto) {///input de monto
                                inputElementMonto = document.createElement('input');
                                inputElementMonto.type = 'text';
                                inputElementMonto.name = 'inputfacturaMonto' + i;
                                inputElementMonto.className = 'd-none';
                                

                                if (dif >= montoFactura) {///si la factura se compensa entonces envío el monto original de la factura
                                    inputElementMonto.value = valorSinComa;
                                } else {/// de lo contrario envio lo que se esta abonando
                                    inputElementMonto.value = dif.toFixed(2).toString();
                                }
                                inputElementMonto.id = 'inputfacturaMonto' + i;
                                label.appendChild(inputElementMonto);
                            }

                            if (!inputElementfkdat) {///input para la fecha
                                inputElementfkdat = document.createElement('input');
                                inputElementfkdat.type = 'text';
                                inputElementfkdat.name = 'inputfkdat' + i;
                                inputElementfkdat.className = 'd-none';
                                inputElementfkdat.value = fkdat.toString();
                                inputElementfkdat.id = 'inputfkdat' + i;
                                label.appendChild(inputElementfkdat);
                            }

                            if (!inputElementbelnr1) {///input para belnr1
                                inputElementbelnr1 = document.createElement('input');
                                inputElementbelnr1.type = 'text';
                                inputElementbelnr1.name = 'inputbelnr1' + i;
                                inputElementbelnr1.className = 'd-none';
                                inputElementbelnr1.value = belnr1.toString();
                                inputElementbelnr1.id = 'inputbelnr1' + i;
                                label.appendChild(inputElementbelnr1);
                            }

                            if (!inputElementbuzei) {///input para buzei
                                inputElementbuzei = document.createElement('input');
                                inputElementbuzei.type = 'text';
                                inputElementbuzei.name = 'inputbuzei' + i;
                                inputElementbuzei.className = 'd-none';
                                inputElementbuzei.value = buzei.toString();
                                inputElementbuzei.id = 'inputbuzei' + i;
                                label.appendChild(inputElementbuzei);
                            }

                        } else {///esto es para eliminar los inputs cuando ya no se estan evaluando
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
                         ///Si la factura se verifica o es positivo:
                        if (sumaFacturas + montoFactura <= montoValue) {
                            sumaFacturas += montoFactura;
                            checkbox.checked = true;

                            label.classList.add('listo');///Agregar el listo
                    
                            const textoFaltanteDiv = label.querySelector('.texto-faltante');///Se selecciona el pequeño espacio para mostrar cuanto falta para compensar 
                            textoFaltanteDiv.textContent = '';
                            const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');///Se selecciona el pequeño espacio para mostrar cuanto se abona 
                            textoAbonoDiv.textContent = '';
                            textoFaltanteDiv.classList.remove('facts');///Hago que no se pueda ver la acantidad pendiente
                            textoAbonoDiv.classList.remove('abon');///Hago que no se pueda ver la acantidad abonada
                            

                        } else {///De lo contrario:
                            const montoFaltante = (montoFactura - (montoValue - sumaFacturas)).toFixed(2);
                            const montoAbono = (montoValue - sumaFacturas).toFixed(2);
                            const textoFaltanteDiv = label.querySelector('.texto-faltante');
                            textoFaltanteDiv.textContent = `Monto pendiente: ${montoFaltante} bs`;
                            const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');
                            textoAbonoDiv.textContent = `Monto abonado: ${montoAbono} bs`;
                            textoFaltanteDiv.classList.add('facts');
                            textoAbonoDiv.classList.add('abon');
                        
                            break;
                        }
                        
                    }
                });
            } else {
                bancoReceptor.setAttribute('disabled', 'disabled');
                bancoReceptor.value = '';
                mensaje.classList.remove('d-none');
                check2.disabled = false;
                check1.disabled = false;
                monto.value= ""
                const eliminarInputs = () => {
                    ///Estas siguientes tres líneas de codigo es para identificar los inputs que se insertan mas abajo por el ciclo for(2) 
                    const inputFacturaElements = document.querySelectorAll('input[id^="inputFactura"]');
                    const inputFacturaMontoElements = document.querySelectorAll('input[id^="inputfacturaMonto"]');
                    const inputFacturafkdatElements = document.querySelectorAll('input[id^="inputfkdat"]');
                    const inputFacturabelnr1Elements = document.querySelectorAll('input[id^="inputbelnr1"]');
                    const inputFacturabuzeiElements = document.querySelectorAll('input[id^="inputbuzei"]');
                    inputFacturaElements.forEach(inputElement => {
                        inputElement.parentNode.removeChild(inputElement);
                    });
                    
                    inputFacturaMontoElements.forEach(inputElementMonto => {
                        inputElementMonto.parentNode.removeChild(inputElementMonto);
                    });

                    inputFacturafkdatElements.forEach(inputElementfkdat => {
                        inputElementfkdat.parentNode.removeChild(inputElementfkdat);
                    });

                    inputFacturabelnr1Elements.forEach(inputElementbelnr1 => {
                        inputElementbelnr1.parentNode.removeChild(inputElementbelnr1);
                    });

                    inputFacturabuzeiElements.forEach(inputElementbuzei => {
                        inputElementbuzei.parentNode.removeChild(inputElementbuzei);
                    });
                };
                
                // Llamar a la función para eliminar los elementos input
                eliminarInputs();
                    
                
                // Función para eliminar la clase '.evaluando'
                const eliminarClaseEvaluando = () => {
                    const montosElements = document.querySelectorAll('.montos');
                    montosElements.forEach(montosElement => {
                        montosElement.classList.remove('evaluando');
                    });
                };
            
                // Llamar a la función para eliminar la clase '.evaluando'
                eliminarClaseEvaluando();

                const textoFaltanteDivs = document.querySelectorAll('.texto-faltante');
                const textoAbonoDivs = document.querySelectorAll('.texto-abono');
                
                textoFaltanteDivs.forEach(div => {
                    div.textContent = '';
                    div.classList.remove('facts');
                });
            
                textoAbonoDivs.forEach(div => {
                    div.textContent = '';
                    div.classList.remove('abon');
                });

                // Eliminar la clase '.listo' de todos los elementos label
                const labels = document.querySelectorAll('label');
                labels.forEach(label => {
                    label.classList.remove('listo');
                });

                // Marcar todos los checkboxes como checked = true
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });

                }
        });
    }
});///fin del check 1, negro




// controlador de eventos a check2
document.addEventListener('DOMContentLoaded', function() {
    if (check2) {
        check2.addEventListener('change', function() {
            ///Buscando elementos por clases e id
            var bancoReceptor = document.getElementById('banco_receptor');
            var bancoReceptorDolar = document.getElementById('banco_receptor_dolar');
            var mensaje = document.querySelector('.mensaje');
            var checkboxes = document.querySelectorAll('#check5');
            var monto = document.getElementById('monto');

        ///condicional de estado de Checkeado del Booleanfield, si esta check
        /// se hará todo lo que se especifíca partir de aquí    
        if (this.checked) {
            bancoReceptor.removeAttribute('disabled');
            bancoReceptor.value = '';
            mensaje.classList.add('d-none');
            check1.disabled = true;
            check3.disabled = true;
            const bancoReceptorInput1 = document.getElementById('banco_receptor');
            const bancoReceptorInput = document.getElementById('banco_receptor_dolar');
            bancoReceptorInput.classList.remove('d-none')
            bancoReceptorInput1.classList.add('d-none')
            bancoReceptorInput1.required =false;
            /// Agregar la propiedad required
            bancoReceptorInput.required = true;
            ///Listener para el input donde se ingresa el monto
            monto.addEventListener('input', function() {
                const montoValue = parseFloat(monto.value);///Valor del input de ingreso de monto
                let sumaFacturas = 0;

                ///Funcion para eliminar los inputs de envío de datos para el backend
                const eliminarInputs = () => {
                    ///Estas siguientes tres líneas de codigo es para identificar los inputs que se insertan mas abajo por el ciclo for(2) 
                    const inputFacturaElements = document.querySelectorAll('input[id^="inputFactura"]');
                    const inputFacturaMontoElements = document.querySelectorAll('input[id^="inputfacturaMonto"]');
                    const inputFacturafkdatElements = document.querySelectorAll('input[id^="inputfkdat"]');
                    const inputFacturabelnr1Elements = document.querySelectorAll('input[id^="inputbelnr1"]');
                    const inputFacturabuzeiElements = document.querySelectorAll('input[id^="inputbuzei"]');
                    inputFacturaElements.forEach(inputElement => {
                        inputElement.parentNode.removeChild(inputElement);
                    });
                    
                    inputFacturaMontoElements.forEach(inputElementMonto => {
                        inputElementMonto.parentNode.removeChild(inputElementMonto);
                    });

                    inputFacturafkdatElements.forEach(inputElementfkdat => {
                        inputElementfkdat.parentNode.removeChild(inputElementfkdat);
                    });

                    inputFacturabelnr1Elements.forEach(inputElementbelnr1 => {
                        inputElementbelnr1.parentNode.removeChild(inputElementbelnr1);
                    });

                    inputFacturabuzeiElements.forEach(inputElementbuzei => {
                        inputElementbuzei.parentNode.removeChild(inputElementbuzei);
                    });
                };
                
                // Llamar a la función para eliminar los elementos input
                eliminarInputs();
                
                // Función para eliminar la clase '.evaluando'
                const eliminarClaseEvaluando = () => {
                    const montosElements = document.querySelectorAll('.montos');
                    montosElements.forEach(montosElement => {
                        montosElement.classList.remove('evaluando');
                    });
                };
            
                // Llamar a la función para eliminar la clase '.evaluando'
                eliminarClaseEvaluando();

                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.disabled = true;
                    checkbox.parentNode.classList.remove('listo');
                    const textoFaltanteDiv = checkbox.parentNode.querySelector('.texto-faltante');
                    textoFaltanteDiv.textContent = '';
                    textoFaltanteDiv.classList.remove('facts');
                    const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');
                    textoAbonoDiv.textContent = '';
                    textoAbonoDiv.classList.remove('abon');
                    
                });

                ///Si el monto.value no tiene nada, se borra absolutamente todo (los textos y los inputs de envío de datos)
                if (monto.value === '') {
                    const textoFaltanteDivs = document.querySelectorAll('.texto-faltante');
                    const textoAbonoDivs = document.querySelectorAll('.texto-abono');
                
                    textoFaltanteDivs.forEach(div => {
                        div.textContent = '';
                        div.classList.remove('facts');
                    });
                
                    textoAbonoDivs.forEach(div => {
                        div.textContent = '';
                        div.classList.remove('abon');
                    });
                
                    eliminarInputs(); // Llamada a la función para eliminar los elementos input
                    eliminarClaseEvaluando(); // Llamada a la función para eliminar la clase '.evaluando'

                    return;
                }
    
                const montoBsElements = [];
                ///↓Ciclo For(1): Este ciclo es para ir pasando los datos de montos
                for (let i = 0; i < checkboxes.length; i++) {
                    const label = checkboxes[i].parentNode;
                    const montobsdppElement = label.querySelector('#Montodlrdpp');
                    if (montobsdppElement) {
                        montoBsElements.push(montobsdppElement);
                    } else {
                        const montoBsElement = label.querySelector('#Montodlr');
                        if (montoBsElement) {
                        montoBsElements.push(montoBsElement);
                        }
                    }
                }

                ///↓ Ciclo for(2): A partir de aqui funcionan las evaluaciones por factura
                for (let i = 0; i < checkboxes.length; i++) {
                    
                    const checkbox = checkboxes[i];///Posiciones de los checks
                    const label = checkbox.parentNode;
                    const montosElement = label.querySelector('.montos');///Busco en el html el div cuya clase es .montos
                    montosElement.classList.add('evaluando');
                    const elementoDiv = montoBsElements[i];///Monto por posicion
                    const textoDelElemento = elementoDiv ? elementoDiv.textContent : '';
                    const valorSinSimbolo = textoDelElemento.slice(0, -2);///Eliminar las comas y puntos del formato que aparece en el html
                    const valorNumerico = parseFloat(valorSinSimbolo.replace(',', ''));
                    const montoFactura = valorNumerico;

                    checkbox.checked = false;
                    label.classList.remove('listo');///Inicializo la clase sin listo

                    ///La variable de la factura
                    const vblen = document.getElementById('vbeln' + (i + 1))?.textContent;///n° de factura vbeln
                    const fkdat = document.getElementById('fkdat' + (i + 1))?.textContent;/// fecha fkdat
                    const belnr1 = document.getElementById('belnr1' + (i + 1))?.textContent;///  belnr1
                    const buzei = document.getElementById('buzei' + (i + 1))?.textContent;///  buzei
                    const dif = montoValue - sumaFacturas
                    
                        let inputElement = label.querySelector('#inputFactura' + i);///input para vbeln (factura)
                        let inputElementMonto = label.querySelector('#inputfacturaMonto' + i);/// input para el monto a enviar
                        let inputElementfkdat = label.querySelector('#inputfkdat' + i);/// input para la fecha
                        let inputElementbelnr1 = label.querySelector('#inputbelnr1' + i);/// input para la fecha
                        let inputElementbuzei = label.querySelector('#inputbuzei' + i);/// input para la fecha
                        const valorSinComa = montoFactura.toString().replace(',', '.');
                        ///↓si esta presente la clase evaluando en una factura pues se ingresa el input para enviar los datos
                        if (montosElement.classList.contains('evaluando')) {
                            if (!inputElement) {///Input de n° de factura
                                inputElement = document.createElement('input');
                                inputElement.type = 'text';
                                inputElement.name = 'inputFactura' + i;
                                inputElement.className = 'd-none';
                                inputElement.value = vblen.toString();
                                inputElement.id = 'inputFactura' + i;
                                label.appendChild(inputElement);
                            }
                            
                            if (!inputElementMonto) {///input de monto
                                inputElementMonto = document.createElement('input');
                                inputElementMonto.type = 'text';
                                inputElementMonto.name = 'inputfacturaMonto' + i;
                                inputElementMonto.className = 'd-none';
                                

                                if (dif >= montoFactura) {///si la factura se compensa entonces envío el monto original de la factura
                                    inputElementMonto.value = valorSinComa;
                                } else {/// de lo contrario envio lo que se esta abonando
                                    inputElementMonto.value = dif.toFixed(2).toString();
                                }
                                inputElementMonto.id = 'inputfacturaMonto' + i;
                                label.appendChild(inputElementMonto);
                            }

                            if (!inputElementfkdat) {///input para la fecha
                                inputElementfkdat = document.createElement('input');
                                inputElementfkdat.type = 'text';
                                inputElementfkdat.name = 'inputfkdat' + i;
                                inputElementfkdat.className = 'd-none';
                                inputElementfkdat.value = fkdat.toString();
                                inputElementfkdat.id = 'inputfkdat' + i;
                                label.appendChild(inputElementfkdat);
                            }

                            if (!inputElementbelnr1) {///input para belnr1
                                inputElementbelnr1 = document.createElement('input');
                                inputElementbelnr1.type = 'text';
                                inputElementbelnr1.name = 'inputbelnr1' + i;
                                inputElementbelnr1.className = 'd-none';
                                inputElementbelnr1.value = belnr1.toString();
                                inputElementbelnr1.id = 'inputbelnr1' + i;
                                label.appendChild(inputElementbelnr1);
                            }

                            if (!inputElementbuzei) {///input para buzei
                                inputElementbuzei = document.createElement('input');
                                inputElementbuzei.type = 'text';
                                inputElementbuzei.name = 'inputbuzei' + i;
                                inputElementbuzei.className = 'd-none';
                                inputElementbuzei.value = buzei.toString();
                                inputElementbuzei.id = 'inputbuzei' + i;
                                label.appendChild(inputElementbuzei);
                            }

                        } else {///esto es para eliminar los inputs cuando ya no se estan evaluando
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

                    ///Si la factura se verifica o es positivo:
                    if (sumaFacturas + montoFactura <= montoValue) {
                        sumaFacturas += montoFactura;
                        checkbox.checked = true;
    
                        label.classList.add('listo');///Agregar el listo

                        const textoFaltanteDiv = label.querySelector('.texto-faltante');///Se selecciona el pequeño espacio para mostrar cuanto falta para compensar 
                        textoFaltanteDiv.textContent = ''
                        const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');///Se selecciona el pequeño espacio para mostrar cuanto se abona 
                        textoAbonoDiv.textContent = ''; 
                        textoFaltanteDiv.classList.remove('facts')///Hago que no se pueda ver la acantidad pendiente
                        textoAbonoDiv.classList.remove('abon')///Hago que no se pueda ver la acantidad abonada
    
                        
                    } else {///De lo contrario:
                        const montoFaltante = (montoFactura - (montoValue - sumaFacturas)).toFixed(2);
                        const montoAbono = (montoValue - sumaFacturas).toFixed(2);
                        const textoFaltanteDiv = label.querySelector('.texto-faltante');
                        textoFaltanteDiv.textContent = `Monto pendiente: ${montoFaltante} $`;
                        const textoAbonoDiv = label.querySelector('.texto-abono');
                        textoAbonoDiv.textContent = `Monto abonado: ${montoAbono} $`;
                        textoFaltanteDiv.classList.add('facts')///Hago que se pueda ver  la acantidad pendiente 
                        textoAbonoDiv.classList.add('abon')///Hago que se pueda ver la acantidad abonada
                        break;
                    }
                }
                });
        } else {
            bancoReceptor.classList.remove('d-none');
            bancoReceptorDolar.classList.add('d-none');
            bancoReceptor.value = '';
            mensaje.classList.remove('d-none');
            // Activa check3
            check1.disabled = false;
            check3.disabled = false;
            monto.value="";
            const eliminarInputs = () => {
                    ///Estas siguientes tres líneas de codigo es para identificar los inputs que se insertan mas abajo por el ciclo for(2) 
                    const inputFacturaElements = document.querySelectorAll('input[id^="inputFactura"]');
                    const inputFacturaMontoElements = document.querySelectorAll('input[id^="inputfacturaMonto"]');
                    const inputFacturafkdatElements = document.querySelectorAll('input[id^="inputfkdat"]');
                    const inputFacturabelnr1Elements = document.querySelectorAll('input[id^="inputbelnr1"]');
                    const inputFacturabuzeiElements = document.querySelectorAll('input[id^="inputbuzei"]');
                    inputFacturaElements.forEach(inputElement => {
                        inputElement.parentNode.removeChild(inputElement);
                    });
                    
                    inputFacturaMontoElements.forEach(inputElementMonto => {
                        inputElementMonto.parentNode.removeChild(inputElementMonto);
                    });

                    inputFacturafkdatElements.forEach(inputElementfkdat => {
                        inputElementfkdat.parentNode.removeChild(inputElementfkdat);
                    });

                    inputFacturabelnr1Elements.forEach(inputElementbelnr1 => {
                        inputElementbelnr1.parentNode.removeChild(inputElementbelnr1);
                    });

                    inputFacturabuzeiElements.forEach(inputElementbuzei => {
                        inputElementbuzei.parentNode.removeChild(inputElementbuzei);
                    });
                };
                
                // Llamar a la función para eliminar los elementos input
                eliminarInputs();
                    
                
                // Función para eliminar la clase '.evaluando'
                const eliminarClaseEvaluando = () => {
                    const montosElements = document.querySelectorAll('.montos');
                    montosElements.forEach(montosElement => {
                        montosElement.classList.remove('evaluando');
                    });
                };
            
                // Llamar a la función para eliminar la clase '.evaluando'
                eliminarClaseEvaluando();

                const textoFaltanteDivs = document.querySelectorAll('.texto-faltante');
                const textoAbonoDivs = document.querySelectorAll('.texto-abono');
                
                textoFaltanteDivs.forEach(div => {
                    div.textContent = '';
                    div.classList.remove('facts');
                });
            
                textoAbonoDivs.forEach(div => {
                    div.textContent = '';
                    div.classList.remove('abon');
                });

                // Eliminar la clase '.listo' de todos los elementos label
                const labels = document.querySelectorAll('label');
                labels.forEach(label => {
                    label.classList.remove('listo');
                });

                // Marcar todos los checkboxes como checked = true
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            

        }
    });
    }
});///fin del check 2, osea el de los $ crack





// controlador de eventos a check1
document.addEventListener('DOMContentLoaded', function() {
    if (check1) {
        check1.addEventListener('change', function() {
            ///Buscando elementos por clases e id
            var bancoReceptor = document.getElementById('banco_receptor');
            var bancoReceptorDolar = document.getElementById('banco_receptor_dolar');
            var mensaje = document.querySelector('.mensaje');
            var checkboxes = document.querySelectorAll('#check5');
            var monto = document.getElementById('monto');

        ///condicional de estado de Checkeado del Booleanfield, si esta check
        /// se hará todo lo que se especifíca partir de aquí    
        if (this.checked) {
            bancoReceptor.removeAttribute('disabled');
            bancoReceptor.value = '';
            mensaje.classList.add('d-none');
            check2.disabled = true;
            check3.disabled = true;
            const bancoReceptorInput1 = document.getElementById('banco_receptor');
            const bancoReceptorInput = document.getElementById('banco_receptor_dolar');
            bancoReceptorInput.classList.remove('d-none')
            bancoReceptorInput1.classList.add('d-none')
            bancoReceptorInput1.required =false;
            /// Agregar la propiedad required
            bancoReceptorInput.required = true;

            monto.addEventListener('input', function() {
                const montoValue = parseFloat(monto.value);///Valor del input de ingreso de monto
                let sumaFacturas = 0;

                ///Funcion para eliminar los inputs de envío de datos para el backend
                const eliminarInputs = () => {
                    ///Estas siguientes tres líneas de codigo es para identificar los inputs que se insertan mas abajo por el ciclo for(2) 
                    const inputFacturaElements = document.querySelectorAll('input[id^="inputFactura"]');
                    const inputFacturaMontoElements = document.querySelectorAll('input[id^="inputfacturaMonto"]');
                    const inputFacturafkdatElements = document.querySelectorAll('input[id^="inputfkdat"]');
                    const inputFacturabelnr1Elements = document.querySelectorAll('input[id^="inputbelnr1"]');
                    const inputFacturabuzeiElements = document.querySelectorAll('input[id^="inputbuzei"]');
                    inputFacturaElements.forEach(inputElement => {
                        inputElement.parentNode.removeChild(inputElement);
                    });
                    
                    inputFacturaMontoElements.forEach(inputElementMonto => {
                        inputElementMonto.parentNode.removeChild(inputElementMonto);
                    });

                    inputFacturafkdatElements.forEach(inputElementfkdat => {
                        inputElementfkdat.parentNode.removeChild(inputElementfkdat);
                    });

                    inputFacturabelnr1Elements.forEach(inputElementbelnr1 => {
                        inputElementbelnr1.parentNode.removeChild(inputElementbelnr1);
                    });

                    inputFacturabuzeiElements.forEach(inputElementbuzei => {
                        inputElementbuzei.parentNode.removeChild(inputElementbuzei);
                    });
                };
                
                // Llamar a la función para eliminar los elementos input
                eliminarInputs();
                
                // Función para eliminar la clase '.evaluando'
                const eliminarClaseEvaluando = () => {
                    const montosElements = document.querySelectorAll('.montos');
                    montosElements.forEach(montosElement => {
                        montosElement.classList.remove('evaluando');
                    });
                };
            
                // Llamar a la función para eliminar la clase '.evaluando'
                eliminarClaseEvaluando();

                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    checkbox.disabled = true;
                    checkbox.parentNode.classList.remove('listo');
                    const textoFaltanteDiv = checkbox.parentNode.querySelector('.texto-faltante');
                    textoFaltanteDiv.textContent = '';
                    textoFaltanteDiv.classList.remove('facts');
                    const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');
                    textoAbonoDiv.textContent = '';
                    textoAbonoDiv.classList.remove('abon');
                    
                });

                ///Si el monto.value no tiene nada, se borra absolutamente todo (los textos y los inputs de envío de datos)
                if (monto.value === '') {
                    const textoFaltanteDivs = document.querySelectorAll('.texto-faltante');
                    const textoAbonoDivs = document.querySelectorAll('.texto-abono');
                
                    textoFaltanteDivs.forEach(div => {
                        div.textContent = '';
                        div.classList.remove('facts');
                    });
                
                    textoAbonoDivs.forEach(div => {
                        div.textContent = '';
                        div.classList.remove('abon');
                    });
                
                    eliminarInputs(); // Llamada a la función para eliminar los elementos input
                    eliminarClaseEvaluando(); // Llamada a la función para eliminar la clase '.evaluando'

                    return;
                }
    
                const montoBsElements = [];
                ///↓Ciclo For(1): Este ciclo es para ir pasando los datos de montos
                for (let i = 0; i < checkboxes.length; i++) {
                    const label = checkboxes[i].parentNode;
                    const montobsdppElement = label.querySelector('#Montodlrdpp');
                    if (montobsdppElement) {
                        montoBsElements.push(montobsdppElement);
                    } else {
                        const montoBsElement = label.querySelector('#Montodlr');
                        if (montoBsElement) {
                        montoBsElements.push(montoBsElement);
                        }
                    }
                }

                ///↓ Ciclo for(2): A partir de aqui funcionan las evaluaciones por factura
                for (let i = 0; i < checkboxes.length; i++) {
                    
                    const checkbox = checkboxes[i];///Posiciones de los checks
                    const label = checkbox.parentNode;
                    const montosElement = label.querySelector('.montos');///Busco en el html el div cuya clase es .montos
                    montosElement.classList.add('evaluando');
                    const elementoDiv = montoBsElements[i];///Monto por posicion
                    const textoDelElemento = elementoDiv ? elementoDiv.textContent : '';
                    const valorSinSimbolo = textoDelElemento.slice(0, -2);///Eliminar las comas y puntos del formato que aparece en el html
                    const valorNumerico = parseFloat(valorSinSimbolo.replace(',', ''));
                    const montoFactura = valorNumerico;

                    checkbox.checked = false;
                    label.classList.remove('listo');///Inicializo la clase sin listo

                    ///La variable de la factura
                    const vblen = document.getElementById('vbeln' + (i + 1))?.textContent;///n° de factura vbeln
                    const fkdat = document.getElementById('fkdat' + (i + 1))?.textContent;/// fecha fkdat
                    const belnr1 = document.getElementById('belnr1' + (i + 1))?.textContent;///  belnr1
                    const buzei = document.getElementById('buzei' + (i + 1))?.textContent;///  buzei
                    const dif = montoValue - sumaFacturas
                    
                        let inputElement = label.querySelector('#inputFactura' + i);///input para vbeln (factura)
                        let inputElementMonto = label.querySelector('#inputfacturaMonto' + i);/// input para el monto a enviar
                        let inputElementfkdat = label.querySelector('#inputfkdat' + i);/// input para la fecha
                        let inputElementbelnr1 = label.querySelector('#inputbelnr1' + i);/// input para la fecha
                        let inputElementbuzei = label.querySelector('#inputbuzei' + i);/// input para la fecha
                        const valorSinComa = montoFactura.toString().replace(',', '.');
                        ///↓si esta presente la clase evaluando en una factura pues se ingresa el input para enviar los datos
                        if (montosElement.classList.contains('evaluando')) {
                            if (!inputElement) {///Input de n° de factura
                                inputElement = document.createElement('input');
                                inputElement.type = 'text';
                                inputElement.name = 'inputFactura' + i;
                                inputElement.className = 'd-none';
                                inputElement.value = vblen.toString();
                                inputElement.id = 'inputFactura' + i;
                                label.appendChild(inputElement);
                            }
                            
                            if (!inputElementMonto) {///input de monto
                                inputElementMonto = document.createElement('input');
                                inputElementMonto.type = 'text';
                                inputElementMonto.name = 'inputfacturaMonto' + i;
                                inputElementMonto.className = 'd-none';
                                

                                if (dif >= montoFactura) {///si la factura se compensa entonces envío el monto original de la factura
                                    inputElementMonto.value = valorSinComa;
                                } else {/// de lo contrario envio lo que se esta abonando
                                    inputElementMonto.value = dif.toFixed(2).toString();
                                }
                                inputElementMonto.id = 'inputfacturaMonto' + i;
                                label.appendChild(inputElementMonto);
                            }

                            if (!inputElementfkdat) {///input para la fecha
                                inputElementfkdat = document.createElement('input');
                                inputElementfkdat.type = 'text';
                                inputElementfkdat.name = 'inputfkdat' + i;
                                inputElementfkdat.className = 'd-none';
                                inputElementfkdat.value = fkdat.toString();
                                inputElementfkdat.id = 'inputfkdat' + i;
                                label.appendChild(inputElementfkdat);
                            }

                            if (!inputElementbelnr1) {///input para belnr1
                                inputElementbelnr1 = document.createElement('input');
                                inputElementbelnr1.type = 'text';
                                inputElementbelnr1.name = 'inputbelnr1' + i;
                                inputElementbelnr1.className = 'd-none';
                                inputElementbelnr1.value = belnr1.toString();
                                inputElementbelnr1.id = 'inputbelnr1' + i;
                                label.appendChild(inputElementbelnr1);
                            }

                            if (!inputElementbuzei) {///input para buzei
                                inputElementbuzei = document.createElement('input');
                                inputElementbuzei.type = 'text';
                                inputElementbuzei.name = 'inputbuzei' + i;
                                inputElementbuzei.className = 'd-none';
                                inputElementbuzei.value = buzei.toString();
                                inputElementbuzei.id = 'inputbuzei' + i;
                                label.appendChild(inputElementbuzei);
                            }

                        } else {///esto es para eliminar los inputs cuando ya no se estan evaluando
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

                    ///Si la factura se verifica o es positivo:
                    if (sumaFacturas + montoFactura <= montoValue) {
                        sumaFacturas += montoFactura;
                        checkbox.checked = true;
    
                        label.classList.add('listo');///Agregar el listo

                        const textoFaltanteDiv = label.querySelector('.texto-faltante');///Se selecciona el pequeño espacio para mostrar cuanto falta para compensar 
                        textoFaltanteDiv.textContent = ''
                        const textoAbonoDiv = checkbox.parentNode.querySelector('.texto-abono');///Se selecciona el pequeño espacio para mostrar cuanto se abona 
                        textoAbonoDiv.textContent = ''; 
                        textoFaltanteDiv.classList.remove('facts')///Hago que no se pueda ver la acantidad pendiente
                        textoAbonoDiv.classList.remove('abon')///Hago que no se pueda ver la acantidad abonada
    
                        
                    } else {///De lo contrario:
                        const montoFaltante = (montoFactura - (montoValue - sumaFacturas)).toFixed(2);
                        const montoAbono = (montoValue - sumaFacturas).toFixed(2);
                        const textoFaltanteDiv = label.querySelector('.texto-faltante');
                        textoFaltanteDiv.textContent = `Monto pendiente: ${montoFaltante} $`;
                        const textoAbonoDiv = label.querySelector('.texto-abono');
                        textoAbonoDiv.textContent = `Monto abonado: ${montoAbono} $`;
                        textoFaltanteDiv.classList.add('facts')///Hago que se pueda ver  la acantidad pendiente 
                        textoAbonoDiv.classList.add('abon')///Hago que se pueda ver la acantidad abonada
                        break;
                    }
                }
                });
        } else {
            bancoReceptor.classList.remove('d-none');
            bancoReceptorDolar.classList.add('d-none');
            bancoReceptor.value = '';
            mensaje.classList.remove('d-none');
            // Activa check3
            check1.disabled = false;
            check3.disabled = false;
            monto.value="";

            const eliminarInputs = () => {
                ///Estas siguientes tres líneas de codigo es para identificar los inputs que se insertan mas abajo por el ciclo for(2) 
                const inputFacturaElements = document.querySelectorAll('input[id^="inputFactura"]');
                const inputFacturaMontoElements = document.querySelectorAll('input[id^="inputfacturaMonto"]');
                const inputFacturafkdatElements = document.querySelectorAll('input[id^="inputfkdat"]');
                const inputFacturabelnr1Elements = document.querySelectorAll('input[id^="inputbelnr1"]');
                const inputFacturabuzeiElements = document.querySelectorAll('input[id^="inputbuzei"]');
                inputFacturaElements.forEach(inputElement => {
                    inputElement.parentNode.removeChild(inputElement);
                });
                
                inputFacturaMontoElements.forEach(inputElementMonto => {
                    inputElementMonto.parentNode.removeChild(inputElementMonto);
                });

                inputFacturafkdatElements.forEach(inputElementfkdat => {
                    inputElementfkdat.parentNode.removeChild(inputElementfkdat);
                });

                inputFacturabelnr1Elements.forEach(inputElementbelnr1 => {
                    inputElementbelnr1.parentNode.removeChild(inputElementbelnr1);
                });

                inputFacturabuzeiElements.forEach(inputElementbuzei => {
                    inputElementbuzei.parentNode.removeChild(inputElementbuzei);
                });
            };
            
            // Llamar a la función para eliminar los elementos input
            eliminarInputs();
                
            
            // Función para eliminar la clase '.evaluando'
            const eliminarClaseEvaluando = () => {
                const montosElements = document.querySelectorAll('.montos');
                montosElements.forEach(montosElement => {
                    montosElement.classList.remove('evaluando');
                });
            };
        
            // Llamar a la función para eliminar la clase '.evaluando'
            eliminarClaseEvaluando();

            const textoFaltanteDivs = document.querySelectorAll('.texto-faltante');
            const textoAbonoDivs = document.querySelectorAll('.texto-abono');
            
            textoFaltanteDivs.forEach(div => {
                div.textContent = '';
                div.classList.remove('facts');
            });
        
            textoAbonoDivs.forEach(div => {
                div.textContent = '';
                div.classList.remove('abon');
            });

            // Eliminar la clase '.listo' de todos los elementos label
            const labels = document.querySelectorAll('label');
            labels.forEach(label => {
                label.classList.remove('listo');
            });

            // Marcar todos los checkboxes como checked = true
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

        }
    });
    }
});///fin del check 1, osea el de los € papa


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



///↓↓↓↓CHARTS↓↓↓↓
document.addEventListener('DOMContentLoaded', function () {
    var factsChart = echarts.init(document.getElementById('factsChart'));
    var cantidadfacts = parseInt(document.getElementById('cantidadfacts').textContent);
    var cantidadAbon = parseInt(document.getElementById('cantidadAbon').textContent);
    var cantidadver = parseInt(document.getElementById('cantidadver').textContent);
    var total = cantidadfacts + cantidadAbon + cantidadver;

    option = {
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
        label: {
            show: false, 
        },
        labelLine: {
            show: false 
        },
        data: [
            {
                value: cantidadfacts,
                name: 'Facts Pendientes',
                itemStyle: {
                    color: '#D50000'
                }
            },
            {
                value: cantidadAbon,
                name: 'Abonos por consolidar',
                itemStyle: {
                    color: '#fbf451'
                }
            },
            {
                value: cantidadver,
                name: 'Facts Verificando',
                itemStyle: {
                    color: '#005c00'
                }
            }
            ]
        }
    ]
    };

    factsChart.setOption(option);
  });




  ///↓↓↓↓CHARTS↓↓↓↓
document.addEventListener('DOMContentLoaded', function () {
    var certsChart = echarts.init(document.getElementById('certsChart'));
    var factspend = parseInt(document.getElementById('factspend').textContent);
    var certpend = parseInt(document.getElementById('certpend').textContent);
    var certsaprob = parseInt(document.getElementById('certsaprob').textContent);
    var certrechz = parseInt(document.getElementById('certrechz').textContent);
    var total = cantidadfacts + cantidadAbon + cantidadver;

    option = {
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
        label: {
            show: false, 
        },
        labelLine: {
            show: false 
        },
        data: [
            {
                value: factspend,
                name: 'Facts Pendientes',
                itemStyle: {
                    color: '#D50000'
                }
            },
            {
                value: certpend,
                name: 'pendiente',
                itemStyle: {
                    color: '#fbf451'
                }
            },
            {
                value: certsaprob,
                name: 'Verificando',
                itemStyle: {
                    color: '#005c00'
                }
            },
            {
                value: certrechz,
                name: 'Verificando',
                itemStyle: {
                    color: '#005c00'
                }
            }
            ]
        }
    ]
    };

    certsChart.setOption(option);
  });