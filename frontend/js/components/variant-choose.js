import { Carousel } from "bootstrap/dist/js/bootstrap.esm.js";

let originalFrameWidth = "";
let originalFrameHeight = "";
let originalIndicatorsHTML = ""; // Store the original indicators HTML
let carouselInstance;
let carouselControls;

window.addEventListener("load", function () {
  const carouselIndicators = document.querySelector(".carousel-indicators");
  if (carouselIndicators) {
    originalIndicatorsHTML = carouselIndicators.innerHTML;
  }
  const carouselElement = document.querySelector("#carousel-product");
  carouselInstance = new Carousel(carouselElement);
  carouselControls = carouselElement.querySelectorAll(
    ".carousel-control-prev, .carousel-control-next"
  );
});

document.addEventListener("DOMContentLoaded", function () {
  const variantPickerOptions = document.querySelectorAll(
    ".variant-picker__option"
  );

  if (variantPickerOptions) {
    variantPickerOptions.forEach(option => {
      option.addEventListener("click", function () {
        const variantId = parseInt(this.getAttribute("value"));
        fetch(`api/variant_price/${variantId}`)
          .then(response => response.json())
          .then(result => {
            document.querySelector(
              ".text-info"
            ).innerHTML = `$ ${result.price}`;
            document.querySelector(
              ".stock"
            ).innerHTML = `Stock: ${result.stock}`;

            const frame = document.getElementById("frame");
            const carouselItemImages =
              document.querySelectorAll(".carousel-item img");
            const carouselIndicators = document.querySelector(
              ".carousel-indicators"
            );

            if (variantId % 2 === 0) {
              frame.style.opacity = 1; // Make the #frame div fully opaque

              // Apply smaller image class to active carousel-item's image
              carouselItemImages.forEach(image => {
                image.classList.remove("smaller-image");
              });

              if (carouselInstance) {
                carouselInstance.to(0);
              }

              if (carouselIndicators) {
                while (carouselIndicators.firstChild) {
                  carouselIndicators.removeChild(carouselIndicators.firstChild);
                }
              }

              if (!originalFrameWidth && !originalFrameHeight) {
                originalFrameWidth = frame.offsetWidth + "px";
                originalFrameHeight = frame.offsetHeight + "px";
              }

              frame.style.width = originalFrameWidth;
              frame.style.height = originalFrameHeight;

              carouselItemImages.forEach(image => {
                image.classList.add("smaller-image");
              });

              if (carouselControls) {
                carouselControls.forEach(control => {
                  control.style.display = "flex";
                });
              }
            } else {
              frame.style.opacity = 0; // Make the #frame div fully transparent

              carouselItemImages.forEach(image => {
                image.classList.remove("smaller-image");
              });

              frame.style.width = "100%";
              frame.style.height = "100%";

              if (carouselIndicators) {
                carouselIndicators.innerHTML = originalIndicatorsHTML;
              }

              if (carouselControls) {
                carouselControls.forEach(control => {
                  control.style.display = "flex";
                });
              }
            }
          })
          .catch(error => console.error(error));
      });
    });
  }
});
