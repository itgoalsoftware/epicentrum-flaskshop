import { Carousel } from "bootstrap/dist/js/bootstrap.esm.js";


function isValidElement(element) {
  return element instanceof HTMLElement;
}

function isValidCarouselInstance(instance) {
  return instance instanceof Carousel;
}

function isValidNodeList(nodeList) {
  return nodeList && nodeList.length > 0;
}

function isVariantSelected() {
  for (const option of variantPickerOptions) {
    if (option.checked) {
      const event = new Event('click', {
        bubbles: true,
        cancelable: true,
      });
  
      option.dispatchEvent(event);
      return option;
    }
  }
  return null;
}

function changeColor(element, dataAttr) {
  frame.style.opacity = 0; 
  selectFramedVariant();

  return element.getAttribute(dataAttr)
}

function selectFramedVariant(){
  labelElements = document.querySelectorAll('.btn-group label');

  for (var i = 0; i < labelElements.length; i++) {
    var label = labelElements[i];
    if (label.textContent.trim() === "Framed") {

      var associatedRadioId = label.getAttribute("for");
      var associatedRadio = document.getElementById(associatedRadioId);

      associatedRadio.checked = true;
      
      showFrame();

      break;
    }
  }
}

function showFrame(){
    setTimeout(function() {
      frame.style.opacity = 1;
    }, 300);

    carouselItemImages.forEach(image => {
      image.classList.remove("smaller-image");
    });

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
}

let originalFrameWidth = "";
let originalFrameHeight = "";
let originalIndicatorsHTML = "";
let variantValue = ""; // Store the original indicators HTML
let labelElements;
let carouselItemImages;
let carouselInstance;
let carouselIndicators;
let carouselControls;
let variantPickerOptions;

document.addEventListener("DOMContentLoaded", function () {
  const carouselElement = document.querySelector("#carousel-product");
  carouselControls = carouselElement.querySelectorAll(
    ".carousel-control-prev, .carousel-control-next"
  );
  carouselInstance = Carousel.getOrCreateInstance(carouselElement); 

  carouselIndicators = document.querySelector(".carousel-indicators");
  if (carouselIndicators) {
    originalIndicatorsHTML = carouselIndicators.innerHTML;
  }

  variantPickerOptions = document.querySelectorAll(
    ".variant-picker__option"
  );

  labelElements = document.querySelectorAll('.btn-group label');

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
            variantValue = result.title;
            const frame = document.getElementById("frame");
            carouselItemImages =
              document.querySelectorAll(".carousel-item img");
            const carouselIndicators = document.querySelector(
              ".carousel-indicators"
            );
            const frameImage = document.getElementById('empty-image');

            switch (variantValue.toLowerCase()) {
              case 'framed':
                showFrame();
                  break;
              case 'unframed':
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
                  break;
                case 'blue': 
                  frameImage.src = changeColor(frame, "data-blue");
                  break;
                case 'red':  
                  frameImage.src = changeColor(frame, "data-red");
                  break;
                case 'green':
                  frameImage.src = changeColor(frame, "data-green");
                  break;
                case 'brown':
                  frameImage.src = changeColor(frame, "data-brown");
                  break;
                case 'violet':
                  frameImage.src = changeColor(frame, "data-violet");
                  break;
              default:
                  frameImage.src = frame.getAttribute("data-blue");
                  break;
              }  
          })
          .catch(error => console.error(error));
      });
    });
  }
  isVariantSelected();
});
