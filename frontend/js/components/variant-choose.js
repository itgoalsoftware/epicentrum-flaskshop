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
  passepartout.style.opacity = 0;

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
    }
    
    if (label.textContent.trim() === "Midnight") {

      var associatedRadioId = label.getAttribute("for");
      var associatedRadio = document.getElementById(associatedRadioId);
      
      if(!frameTypeClicked)
      associatedRadio.checked = true;   
    }
  }
  showFrame();
}

function showFrame(){
    setTimeout(function() {
      frame.style.opacity = 1;
      passepartout.style.opacity = 1;
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

    carouselItemImages.forEach(image => {
      image.classList.add("smaller-image");
    });

    if (isValidNodeList(carouselControls)) {
      carouselControls.forEach(control => {
        control.style.display = "none";
      });
    }
}

let originalIndicatorsHTML = "";
let variantValue = ""; // Store the original indicators HTML
let labelElements;
let carouselItemImages;
let carouselInstance;
let carouselIndicators;
let carouselControls;
let variantPickerOptions;
let frame;
let passepartout;
let frameTypeClicked = false;

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
            frame = document.getElementById("frame-container");
            passepartout = document.getElementById('passepartout-container');
            carouselItemImages =
              document.querySelectorAll(".carousel-item img");
            const carouselIndicators = document.querySelector(
              ".carousel-indicators"
            );

            const passepartout_img = document.getElementById('passepartout-img');
            const frame_img = document.getElementById('frame-img');
            
            switch (variantValue.toLowerCase()) {
              case 'framed':
                showFrame();
                  break;
              case 'unframed':
                frame.style.opacity = 0; // Make the #frame div fully transparent
                passepartout.style.opacity = 0;

                carouselItemImages.forEach(image => {
                  image.classList.remove("smaller-image");
                });
  
                frame.style.width = "100%";
                frame.style.height = "100%";
                passepartout.style.width = "100%";
                passepartout.style.height = "100%";
  
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
                  passepartout_img.src = changeColor(passepartout, "data-blue");
                  break;
                case 'red':  
                  passepartout_img.src = changeColor(passepartout, "data-red");
                  break;
                case 'green':
                  passepartout_img.src = changeColor(passepartout, "data-green");
                  break;
                case 'brown':
                  passepartout_img.src = changeColor(passepartout, "data-brown");
                  break;
                case 'violet':
                  passepartout_img.src = changeColor(passepartout, "data-violet");
                  break;
                case 'classic':
                  frameTypeClicked = true;
                  frame_img.src = changeColor(frame, "data-classic-frame");
                  break;
                case 'golden':
                  frameTypeClicked = true;
                  frame_img.src = changeColor(frame, "data-golden-frame");
                  break;
                case 'midnight':
                  frameTypeClicked = true;
                  frame_img.src = changeColor(frame, "data-midnight-frame");
                  break;
              default:
                  passepartout_img.src = passepartout.getAttribute("data-blue");
                  break;
              }  
          })
          .catch(error => console.error(error));
      });
    });
  }
  isVariantSelected();
});
