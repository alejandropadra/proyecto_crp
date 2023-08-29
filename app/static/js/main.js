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


    document.addEventListener("DOMContentLoaded", function() {
  const checkbox = document.getElementById("burger");
  const responsiveNav = document.querySelector(".responsive_nav");

  checkbox.addEventListener("change", function() {
    if (checkbox.checked) {
      responsiveNav.classList.add("active");
    } else {
      responsiveNav.classList.remove("active");
    }
  });
});

setTimeout(function() {
    document.querySelectorAll('.alert').forEach(function(alert) {
      alert.remove();
    });
  }, 5000);


