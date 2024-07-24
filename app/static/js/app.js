////////////////////////////////////////////////////Script del header////////////////////////////////////////
var header = document.querySelector('header');
    var alturaHeader = parseFloat(getComputedStyle(header).height);

    window.addEventListener('scroll', e => {
        var color;
        if (window.scrollY == 0) {
            color = 'rgba(255, 255, 255, 0.63)';
        } else if (window.scrollY >= alturaHeader && window.scrollY < 2 * alturaHeader) {
            color = 'white';
        }
        header.style.setProperty('background', color);
    });


////////////////////////////////////////////////////Script del header////////////////////////////////////////

///Este Script  a continuacion es para que los alerts se desbanescan luego de 5 segundos 
setTimeout(function() {
    document.querySelectorAll('.alert').forEach(function(alert) {
        alert.remove();
    });
}, 5000);



var flechaDownElement = document.querySelector('.flecha-down');

if (flechaDownElement) {
    flechaDownElement.addEventListener('click', function() {
        var holaElement = document.querySelector('#ancla');
        holaElement.scrollIntoView({behavior: "smooth"});});
}



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


document.addEventListener("keyup", e=>{

    if (e.target.matches("#buscador")){
        if (e.key ==="Escape")e.target.value = ""
    
        document.querySelectorAll(".product").forEach(nombre=>{
    
            nombre.textContent.toLowerCase().includes(e.target.value.toLowerCase())
            ?nombre.classList.remove("filter")
                :nombre.classList.add("filter")
    
        })
    }
    });


var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
    })

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
    

document.addEventListener("DOMContentLoaded", function() {
    var mostrarInformacion = document.getElementById('mostrarInformacion');

    // Verifica si el elemento existe antes de agregar el evento
    if (mostrarInformacion) {
        mostrarInformacion.addEventListener('click', function() {
            var divs = document.querySelectorAll('.info-tecnica');
            
            divs.forEach(function(div) {
                div.classList.toggle('d-none');
            });
        });
    }
});

