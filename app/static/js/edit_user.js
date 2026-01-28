document.addEventListener('DOMContentLoaded', function() {
    // ========== Toggle Password Visibility ==========
    const botonesTogglePassword = document.querySelectorAll('.btn-toggle-password');
    
    botonesTogglePassword.forEach(boton => {
        boton.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const inputPassword = document.getElementById(targetId);
            
            if (!inputPassword) return;
            
            const iconoOjo = this.querySelector('.eye-icon');
            const iconoOjoTachado = this.querySelector('.eye-off-icon');
            
            const esPassword = inputPassword.type === 'password';
            inputPassword.type = esPassword ? 'text' : 'password';
            
            iconoOjo.style.display = esPassword ? 'none' : 'block';
            iconoOjoTachado.style.display = esPassword ? 'block' : 'none';
        });
    });


    const botonEnviar = document.getElementById('enviarEdit');
    const form = document.querySelector('#form-edit-user');

    if (botonEnviar && form) {
        botonEnviar.addEventListener('click', function(e) { 
            console.log('asd')
            e.preventDefault();
            limpiarErrores();

            const password = document.getElementById('password');
            const confirmarPassword = document.getElementById('confirmar');

            if (password && password.value.trim() !== '') {
                if (!confirmarPassword || confirmarPassword.value.trim() === '') {
                    agregarError(confirmarPassword, 'Debe confirmar la contraseña');
                    showAlertGrandes('Debe confirmar la contraseña', 'error');
                    return;
                }

                if (password.value !== confirmarPassword.value) {
                    agregarError(confirmarPassword, 'Las contraseñas no coinciden');
                    showAlertGrandes('Las contraseñas no coinciden', 'error');
                    return;
                }

                if (password.value.length < 6) {
                    agregarError(password, 'La contraseña debe tener al menos 6 caracteres');
                    showAlertGrandes('La contraseña debe tener al menos 6 caracteres', 'error');
                    return;
                }
            }


            form.submit();
        });
    }

    function limpiarErrores() {
        const errores = document.querySelectorAll('.error-message');
        errores.forEach(error => error.remove());
        
        const inputsConError = document.querySelectorAll('.input-error');
        inputsConError.forEach(input => input.classList.remove('input-error'));
    }
});