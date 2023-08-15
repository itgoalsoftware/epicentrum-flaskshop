import { Carousel } from "bootstrap/dist/js/bootstrap.esm.js";

document.addEventListener("DOMContentLoaded", function () {
  const carouselElement = document.querySelector("#carousel-product");
  const carouselInstance = new Carousel(carouselElement);

  const carouselControls = carouselElement.querySelectorAll(
    ".carousel-control-prev, .carousel-control-next"
  );

  const disableCarousel = () => {
    carouselInstance.dispose();

    let highInterval = 99999; // Set the interval value in milliseconds
    carouselElement.setAttribute("data-bs-interval", highInterval);
  };

  const checkSlide = event => {
    if (event.to === 0) {
      disableCarousel();
    }
  };

  carouselControls.forEach(control => {
    control.addEventListener("click", function (event) {
      event.preventDefault();
      disableCarousel();
    });
  });

  carouselElement.addEventListener("slid.bs.carousel", checkSlide);
});
