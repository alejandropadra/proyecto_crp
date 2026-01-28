let datosUsuarios = [];
let tablaUsuarios;

function mostrarLoaderUser() {
    let loaderOverlay = document.getElementById('loaderOverlay');
    
    if (!loaderOverlay) {
        loaderOverlay = document.createElement('div');
        loaderOverlay.id = 'loaderOverlay';
        loaderOverlay.className = 'loader-overlay';
        loaderOverlay.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
                <p class="loader-text">Procesando...</p>
                <p class="loader-subtext">Por favor espere, no cierre esta ventana</p>
            </div>
        `;
        document.body.appendChild(loaderOverlay);
    }
    

    setTimeout(() => {
        loaderOverlay.classList.add('active');
    }, 10);
}

$(document).ready(function() {
    // Cargar datos UNA SOLA VEZ
    $.ajax({
        url: window.location.pathname + '?get_data=true',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            datosUsuarios = data;
            

            $('#loader-container').remove(); 
            inicializarTabla();
            $('#tabla-container').fadeIn(300); 
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar datos:', error);
            $('#loader-container').hide();
            mostrarError();
        }
    });
});

function inicializarTabla() {
    tablaUsuarios = $('#tablaUsuarios').DataTable({
        data: datosUsuarios.users, 
        columns: [
            { data: 'rif' },  
            { data: 'username' },      
            { data: 'email' },              
            { data: 'zona' },           
            { 
                data: 'nivel',
                render: function(data, type, row) {
                    if (type === 'display') {
                        return formatearNivel(data);
                    }
                    return data;
                }
            },          
            { 
                data: 'seller',
            },
            { 
                data: 'rif',
                render: function(data, type, row) {  
                    return crearBoton(data);
                }
            },

        ],
        language: {
            processing: "Procesando...",
            search: "Buscar:",
            searchPlaceholder: "Buscar usuarios...",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 a 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron registros coincidentes",
            emptyTable: "No hay usuarios disponibles",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            },
            aria: {
                sortAscending: ": activar para ordenar ascendente",
                sortDescending: ": activar para ordenar descendente"
            }
        },
        pageLength: 15,
        lengthMenu: [[15, 50, 100, -1], [15, 50, 100, "Todos"]],
        order: [[0, 'desc']],
        deferRender: true,
        responsive: true,
        autoWidth: false,
    });
}


function formatearFecha(fecha) {
    if (!fecha) return '-';
    
    try {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-VE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return fecha;
    }
}

function formatearNivel(nivel) {
    if (!nivel) return '<span class="badge badge-danger">Sin nivel</span>';
    
    const nivelStr = nivel.toString().toLowerCase();
    let badgeClass = 'badge-info';
    
    switch(nivelStr) {
        case 'administrador':
        case 'admin':
            badgeClass = 'badge-info';
            break;
        case 'corimon':
            badgeClass = 'badge-danger';
            break;
        case 'usuario':
        case 'user':
            badgeClass = 'badge-success';
            break;
        default:
            badgeClass = 'badge-warning';
    }
    
    return `<span class="badge ${badgeClass}">${nivel}</span>`;
}


function crearBoton(rif) {
    const boton = `
        <button class="btn-detalle" title="Ver Detalles" onclick="window.location.href='/usuario/${rif}'">
            <svg style="font-size: 1.5rem; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg> 
            Detalles
        </button>
    `;
    return boton; 
}


function mostrarError() {
    const mensajeError = `
        <div style="text-align: center; padding: 60px 20px; color: #6B7280;">
            <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
            <h3 style="color: #374151; margin-bottom: 8px;">Error al cargar datos</h3>
            <p>No se pudieron cargar los usuarios. Por favor, recarga la página.</p>
            <button onclick="location.reload()" style="margin-top: 16px; padding: 10px 20px; background: #333; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Recargar página
            </button>
        </div>
    `;
    $('.table-wrapper').html(mensajeError);
}



/* Para que se abra pa */
function modalAgregarUsuarios() {
    const modal = document.getElementById('invoiceModalAddUsers');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}


const activarModal= document.getElementById('activarModal');

activarModal.addEventListener('click', ()=>{
    modalAgregarUsuarios()
})

function cerrarModalAddUsuarios() {
    const modal = document.getElementById('invoiceModalAddUsers');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.getElementById('invoiceModalAddUsers').addEventListener('click', function(e) {
    if (e.target === this) {
        cerrarModalAddUsuarios();
    }
});


const ModalesUsuarios = document.querySelectorAll('.close-modal-add-users');
ModalesUsuarios.forEach(boton => {
    boton.addEventListener('click', ()=>{
    cerrarModalAddUsuarios();
    })
});


// Cerrar modal con la tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('invoiceModalAddUsers');
        if (modal.classList.contains('active')) {
            cerrarModalAddUsuarios();
        }
    }
});



document.addEventListener('DOMContentLoaded', function() {
    const csrf = document.getElementById('csrf').value;

    const botonEnviar = document.getElementById('botonEnviarUsuarios');
    const form = document.querySelector('.modern-form');
    

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function validarFormulario() {
        let esValido = true;
        
        limpiarErroresCampos();
        
        // 1. Validar RIF - Tipo
        const rifTipo = document.getElementById('letraRif');
        if (!rifTipo || rifTipo.value.trim() === '') {
            agregarError(rifTipo, 'Debe seleccionar el tipo de RIF');
            esValido = false;
        }
        
        // 2. Validar RIF - Número
        const rifNumero = document.getElementById('numeroRif');
        if (!rifNumero || rifNumero.value.trim() === '') {
            agregarError(rifNumero, 'El número de RIF es obligatorio');
            esValido = false;
        }
        
        // 3. Validar Nombre de Usuario
        const username = document.getElementById('username');
        if (!username || username.value.trim() === '') {
            agregarError(username, 'El nombre de usuario es obligatorio');
            esValido = false;
        } else if (username.value.trim().length < 3) {
            agregarError(username, 'El nombre debe tener al menos 3 caracteres');
            esValido = false;
        }
        
        // 4. Validar Contraseña
        const password = document.getElementById('password');
        if (!password || password.value.trim() === '') {
            agregarError(password, 'La contraseña es obligatoria');
            esValido = false;
        } else if (password.value.length < 6) {
            agregarError(password, 'La contraseña debe tener al menos 6 caracteres');
            esValido = false;
        }
        
        // 5. Validar Confirmar Contraseña
        const confirmarPassword = document.getElementById('confirmar');
        if (!confirmarPassword || confirmarPassword.value.trim() === '') {
            agregarError(confirmarPassword, 'Debe confirmar la contraseña');
            esValido = false;
        } else if (password && password.value !== confirmarPassword.value) {
            agregarError(confirmarPassword, 'Las contraseñas no coinciden');
            esValido = false;
        }
        
        // 6. Validar Email
        const email = document.getElementById('email');
        if (!email || email.value.trim() === '') {
            agregarError(email, 'El email es obligatorio');
            esValido = false;
        } else if (!validarEmail(email.value.trim())) {
            agregarError(email, 'Ingrese un email válido');
            esValido = false;
        }
        
        // 7. Validar Código
        const codigo = document.getElementById('codigo');
        if (!codigo || codigo.value.trim() === '') {
            agregarError(codigo, 'El código del usuario es obligatorio');
            esValido = false;
        }
        
        // 8. Validar Nivel
        const nivel = document.getElementById('nivel');
        if (!nivel || nivel.value.trim() === '') {
            agregarError(nivel, 'Debe seleccionar un nivel de usuario');
            esValido = false;
        }
        
        // 9. Validar Zona
        const zona = document.getElementById('zona');
        if (!zona || zona.value.trim() === '') {
            agregarError(zona, 'Debe seleccionar una zona');
            esValido = false;
        }
        
        // 10. Validar Vendedor
        const vendedor = document.getElementById('vendedor');
        if (!vendedor || vendedor.value.trim() === '') {
            agregarError(vendedor, 'El nombre del vendedor es obligatorio');
            esValido = false;
        }
        
        return esValido;
    }
    
    let formEnviando = false;
    
    if (botonEnviar) {
    botonEnviar.addEventListener('click', async function(e) { 
        e.preventDefault();
            
        if (formEnviando) {
            return;
        }

        if (!validarFormulario()) {
            const primerError = document.querySelector('.campo-error');
            if (primerError) {
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                primerError.focus();
            }
            return; 
        }

        formEnviando = true;
    
        mostrarLoaderUser();
        
        botonEnviar.disabled = true;
        botonEnviar.classList.add('enviando');
        const botonesCancelar = document.querySelectorAll('.close-modal-add-users');
        botonesCancelar.forEach(btn => btn.disabled = true);
        const modal = document.getElementById('invoiceModalVerificacion');
        
        if (modal) {
            modal.style.pointerEvents = 'none';
        }

        const rif = document.getElementById('letraRif').value;  
        const n_rif = document.getElementById('numeroRif').value;  
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const codigo = document.getElementById('codigo').value;
        const nivel = document.getElementById('nivel').value;
        const zona = document.getElementById('zona').value;
        const vendedor = document.getElementById('vendedor').value;

        const formData = new FormData();
        formData.append('data', JSON.stringify({
            rif: rif,
            n_rif: n_rif,
            username: username,
            password: password,
            email: email,
            codigo: codigo,
            nivel: nivel,
            zona: zona,
            vendedor: vendedor
        }));

        try {
            const response = await fetch('/usuarioPost', {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrf 
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error del servidor: ${response.status}`);
            }


            if (data.success) {
                console.log("Usuario creado exitosamente:", data);
                showAlertGrandes(data.message || 'Usuario creado exitosamente', 'success');
                
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                ocultarLoader();
                
                if (modal) {
                    cerrarModalAddUsuarios();
                }
                
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    window.location.reload();
                }
            } else {
                throw new Error(data.message || 'Error al procesar el usuario');
            }

            } catch (error) {

                console.error('Error capturado:', error);
                ocultarLoader();
                
                showAlertGrandes(
                    error.message || 'Error de conexión: No se pudo procesar el usuario. Por favor, intenta nuevamente.', 
                    'error'
                );
            }
        });
    }
    


    function ocultarLoader() {
        const loaderOverlay = document.getElementById('loaderOverlay');
        
        if (loaderOverlay) {
            loaderOverlay.classList.remove('active');
            

            setTimeout(() => {
                if (loaderOverlay && loaderOverlay.parentNode) {
                    loaderOverlay.remove();
                }
            }, 300);
        }
        
        // Resetear estado del formulario
        formEnviando = false;
        
        const botonEnviar = document.getElementById('botonEnviarUsuarios');  // ← Cambiado de 'enviarBoton'
        if (botonEnviar) {
            botonEnviar.disabled = false;
            botonEnviar.classList.remove('enviando');
        }
        

        const botonesCancelar = document.querySelectorAll('.close-modal-add-users');  // ← Cambiado
        botonesCancelar.forEach(btn => btn.disabled = false);
        
        const modal = document.getElementById('invoiceModalVerificacion');
        if (modal) {
            modal.style.pointerEvents = 'auto';
        }
    }


    const todosLosInputs = document.querySelectorAll('.form-input');
    
    todosLosInputs.forEach(input => {
        // Verificar al cargar si ya tiene valor
        if (input.value.trim() !== '') {
            input.classList.add('input-filled');
        }
        
        input.addEventListener('input', function() {
            if (this.classList.contains('campo-error')) {
                removerError(this);
            }
            
            if (this.value.trim() !== '') {
                this.classList.add('input-filled');
            } else {
                this.classList.remove('input-filled');
            }
        });
        
        input.addEventListener('change', function() {
            if (this.classList.contains('campo-error')) {
                removerError(this);
            }
            
            if (this.value.trim() !== '') {
                this.classList.add('input-filled');
            } else {
                this.classList.remove('input-filled');
            }
        });
    });
    
    // =========================================
    // Toggle de contraseñas
    // =========================================
    const botonesTogglePassword = document.querySelectorAll('.btn-toggle-password');
    
    botonesTogglePassword.forEach(boton => {
        boton.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const inputPassword = document.getElementById(targetId);
            
            const iconoOjo = this.querySelector('.eye-icon');
            const iconoOjoTachado = this.querySelector('.eye-off-icon');
            
            if (inputPassword) {
                if (inputPassword.type === 'password') {
                    inputPassword.type = 'text';
                    iconoOjo.style.display = 'none';
                    iconoOjoTachado.style.display = 'block';
                } else {
                    inputPassword.type = 'password';
                    iconoOjo.style.display = 'block';
                    iconoOjoTachado.style.display = 'none';
                }
            }
        });
    });
    
});