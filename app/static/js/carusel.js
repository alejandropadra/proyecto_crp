const swiper = new Swiper('.swiper', {
  // Optional parameters
  direction: 'horizontal',
  loop: true,
  speed: 700,
  spaceBetween: 0,
  effect: "fade",

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  autoplay: {
    delay: 3000, 
    disableOnInteraction: false, 

  }
}
);

var miSwiper = new Swiper('.mi-swiper-container', {
  slidesPerView: 1,
  spaceBetween: 0,
  loop: true,
  navigation: {
      nextEl: '.mi-swiper-container .swiper-button-next',
      prevEl: '.mi-swiper-container .swiper-button-prev',
  },
});



