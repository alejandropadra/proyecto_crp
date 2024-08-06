/*document.addEventListener('DOMContentLoaded', (event) => {
  let tl = gsap.timeline();

  // Animación de entrada
  tl.to("#overlay", {duration:  1.3, x: "100%", ease: "power2.inOut", onComplete: removeOverlay});

  // Función para remover el overlay después de la animación
  function removeOverlay() {
      document.getElementById('overlay').style.display = 'none';
  }


});*/

///Registrando el pluggin
gsap.registerPlugin(ScrollTrigger);

// Primera animación
var subtitulo = document.querySelectorAll('.ancla');

// Convierte el NodeList en un array
var subtituloArray = gsap.utils.toArray(subtitulo);

// Verifica si hay elementos para animar
if (subtituloArray.length > 0) {
  gsap.fromTo(subtituloArray, {
    y: "0",
    autoAlpha: 0,
}, {
    scrollTrigger: {
    trigger: subtituloArray,
    start: 'top center',
    end: 'center center',
    scrub: true
  },
  y: "37",
  duration: 2,
  autoAlpha: 1,
});
}


// Selecciona todos los elementos con la clase '.tarjeta-producto'
var tarjetas = document.querySelectorAll('.tarjeta-producto');

// Verifica si hay elementos con la clase '.tarjeta-producto'
if (tarjetas.length > 0) {
  var tl = gsap.timeline();
 // Aplica la función stagger a la línea de tiempo
  tl.staggerFromTo(tarjetas, 2, {
    y: "=100",
    autoAlpha: 0,
  }, {
    y: -60,
    autoAlpha: 1,
    duration: 2,
  }, 0.3);
}


gsap.utils.toArray('.product').forEach((element, index) => {
  gsap.fromTo(
      element,
      {
        y: 200,
        autoAlpha: 0,
      },
      {
          scrollTrigger: {
              trigger: element,
              animation: 'anim'
          },
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out', 
          delay: 0.3 * index
      }
  );
});



var boxElements = document.querySelectorAll('.EfectoDiv');

boxElements.forEach((boxElement) => {
  gsap.fromTo(boxElement, {
    y: 150,
    autoAlpha: 0, 
  }, {
    scrollTrigger: {
      trigger: boxElement,
      animation: 'anim',
    },
    autoAlpha: 1,
    y: 0,
    duration: 1,
  });
  });


///Este Script a continuacion es para que loa animacion de los subtitulos (linea que se mueve de adentro hacia afuera)
window.addEventListener('scroll', function() {
  var scrollTop = document.documentElement.scrollTop;
  var elements = document.querySelectorAll('.subtitulo'); 

  elements.forEach(function(element) {
      var elementOffsetTop = element.offsetTop;
      var windowHeight = window.innerHeight;
      var width = 0;
      var opacity = 0;
      if (scrollTop + windowHeight >= elementOffsetTop + element.offsetHeight && scrollTop < elementOffsetTop) {
          width = 100;
          opacity = 1;
      } else {
          width = 0;
          opacity = 0;
      }
      element.style.width = width + '%';
      element.style.opacity = opacity;
  });
});
gsap.utils.toArray('.animaSVG').forEach((element, index) => {
  gsap.fromTo(
      element,
      {
          scale: 0.5,
          autoAlpha: 0,
      },
      {
          scrollTrigger: {
              trigger: element,
              animation: 'anim'
          },
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          ease: 'power2.out', 
          delay: 0.2 * index,
          onComplete: () => {
            // Agrega la clase de animación de GSAP después de que la animación ha comenzado
            element.classList.add('movimiento-const');
        } 
      }
  );
});

gsap.utils.toArray('.moveIzq').forEach((element, index) => {
  gsap.fromTo(
      element,
      {
        x: -200,
        autoAlpha: 0,
      },
      {
          scrollTrigger: {
              trigger: element,
              animation: 'anim'
          },
          autoAlpha: 1,
          x: 0,
          duration: 1,
          ease: 'power2.out', 
          stagger: 0.2
      }
  );
});



gsap.utils.toArray('.moveDer').forEach((element, index) => {
  gsap.fromTo(
      element,
      {
        x: 200,
        autoAlpha: 0,
      },
      {
          scrollTrigger: {
              trigger: element,
              animation: 'anim'
          },
          autoAlpha: 1,
          x: 0,
          duration: 1,
          ease: 'power2.out', 
          stagger: 0.2
      }
  );
});


gsap.utils.toArray('.aparicion').forEach((element, index) => {
  gsap.fromTo(
      element,
      {
        y: -200,
        autoAlpha: 0,
      },
      {
          scrollTrigger: {
              trigger: element,
              animation: 'anim'
          },
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out', 
          delay: 0.3 * index
      }
  );
});

gsap.utils.toArray('.deAbajo').forEach((element, index) => {
  gsap.fromTo(
      element,
      {
        y: 200,
        autoAlpha: 0,
      },
      {
          scrollTrigger: {
              trigger: element,
              animation: 'anim'
          },
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out', 
          delay: 0.3 * index
      }
  );
});


