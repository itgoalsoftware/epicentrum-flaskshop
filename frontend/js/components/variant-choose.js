import { Carousel } from "bootstrap/dist/js/bootstrap.esm.js";


// Utility functions
function isValidElement(element) {
  return element instanceof HTMLElement;
}

function isValidCarouselInstance(instance) {
  return instance instanceof Carousel;
}

function isValidNodeList(nodeList) {
  return nodeList && nodeList.length > 0;
}

let originalFrameWidth = "";
let originalFrameHeight = "";
let originalIndicatorsHTML = "";
let ifFramed = ""; // Store the original indicators HTML

document.addEventListener("DOMContentLoaded", function () {
  const carouselElement = document.querySelector("#carousel-product");
  const carouselControls = carouselElement.querySelectorAll(
    ".carousel-control-prev, .carousel-control-next"
  );
  const carouselInstance = Carousel.getOrCreateInstance(carouselElement); 

  const carouselIndicators = document.querySelector(".carousel-indicators");
  if (carouselIndicators) {
    originalIndicatorsHTML = carouselIndicators.innerHTML;
  }

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
            ifFramed = result.title;
            const frame = document.getElementById("frame");
            const carouselItemImages =
              document.querySelectorAll(".carousel-item img");
            const carouselIndicators = document.querySelector(
              ".carousel-indicators"
            );

            if (ifFramed.toLowerCase() === "framed") {
              frame.style.opacity = 1; // Make the #frame div fully opaque

              // Apply smaller image class to active carousel-item's image
              carouselItemImages.forEach(image => {
                image.classList.remove("smaller-image");
              });

              console.log(carouselInstance);
              if (isValidCarouselInstance(carouselInstance)) {
                carouselInstance.to(0);
              }

              if (isValidElement(carouselIndicators)) {
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

              if (isValidNodeList(carouselControls)) {
                carouselControls.forEach(control => {
                  control.style.display = "none";
                });
              }
            } else {
              frame.style.opacity = 0; // Make the #frame div fully transparent

              carouselItemImages.forEach(image => {
                image.classList.remove("smaller-image");
              });

              frame.style.width = "100%";
              frame.style.height = "100%";

              if (isValidElement(carouselIndicators)) {
                carouselIndicators.innerHTML = originalIndicatorsHTML;
              }

              if (isValidNodeList(carouselControls)) {
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
