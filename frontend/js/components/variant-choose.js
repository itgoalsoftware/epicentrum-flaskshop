import { Carousel } from "bootstrap/dist/js/bootstrap.esm.js";


const isValidElement = (element) => element instanceof HTMLElement;
const isValidCarouselInstance = (instance) => instance instanceof Carousel;
const isValidNodeList = (nodeList) => nodeList && nodeList.length > 0;

const isVariantSelectedBeforeDOMLoaded = () => {
  for (const option of variantPickerOptions) {
    if (option.checked) {
      option.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
      return option;
    }
  }
  return null;
};

const setColor = (element, dataAttr) => {
  frame.style.opacity = 0;
  passepartout.style.opacity = 0;
  selectFramedVariant();
  return element.getAttribute(dataAttr);
};

const selectFramedVariant = () => {
  const frameType = "Classic";
  for (const label of labelElements) {
    const labelText = label.textContent.trim();
    const associatedRadioId = label.getAttribute("for");
    const associatedRadio = document.getElementById(associatedRadioId);

    if (labelText === "Framed") {
      associatedRadio.checked = true;
    }

    if (labelText === frameType && !frameTypeClicked) {
      associatedRadio.checked = true;
    }

    if (labelText === "Blue" && !passepartoutClicked) {
      associatedRadio.checked = true;
    }
  }
  showFrame();
}

const unselectFramedVariants = () => {
  for (const label of labelElements) {
    const labelText = label.textContent.trim();
    
    if (labelText !== "Unframed") {
      const associatedRadioId = label.getAttribute("for");
      const associatedRadio = document.getElementById(associatedRadioId);
      associatedRadio.checked = false;
    }

    passepartoutClicked = false;
    frameTypeClicked = false;
  }
}

const showFrame = () => {
  setTimeout(() => {
    frame.style.opacity = 1;
    passepartout.style.opacity = 1;
  }, 300);

  cImages.forEach(img => img.classList.remove("smaller-image"));

  isValidCarouselInstance(cInstance) && cInstance.to(0);

  if (isValidElement(cIndicators)) {
  cIndicators.innerHTML = "";
}

  cImages.forEach(img => img.classList.add("smaller-image"));

  isValidNodeList(cControls) && cControls.forEach(control => control.style.display = "none");
}

const initializeElements = () => {
  cElement = document.querySelector("#carousel-product");
  cControls = cElement.querySelectorAll(".carousel-control-prev, .carousel-control-next");
  cInstance = Carousel.getOrCreateInstance(cElement);
  cIndicators = document.querySelector(".carousel-indicators");
  cImages = document.querySelectorAll(".carousel-item img");
  cIndicators = document.querySelector(".carousel-indicators");
  
  if (cIndicators) originalIndicatorsHTML = cIndicators.innerHTML;
  
  variantPickerOptions = document.querySelectorAll(".variant-picker__option");
  labelElements = document.querySelectorAll('.btn-group label');
  frame = document.getElementById("frame-container");
  passepartout = document.getElementById('passepartout-container');
  passepartout_img = document.getElementById('passepartout-img');
  frame_img = document.getElementById('frame-img');
}

let originalIndicatorsHTML = "";
let variantValue = "";
let labelElements, cImages, cInstance, cIndicators, cControls, cElement, variantPickerOptions;
let frame, passepartout, passepartout_img, frame_img;
let frameTypeClicked = false, passepartoutClicked = false;

document.addEventListener("DOMContentLoaded", function () {
  initializeElements();

  if (variantPickerOptions) {
    variantPickerOptions.forEach(option => {
      option.addEventListener("click", function () {
        const variantId = parseInt(this.getAttribute("value"));

        fetch(`api/variant_price/${variantId}`)
          .then(response => response.json())
          .then(result => {
            if (result.price != 0) document.querySelector(".text-info").innerHTML = `$ ${result.price}`;            

            const variantActions = {
              'framed': selectFramedVariant,
              'unframed': () => handleUnframed(),
              'blue': () => setPassepartoutColor("blue"),
              'red': () => setPassepartoutColor("red"),
              'green': () => setPassepartoutColor("green"),
              'brown': () => setPassepartoutColor("brown"),
              'violet': () => setPassepartoutColor("violet"),
              'classic': () => setFrameColor("classic-frame"),
              'golden': () => setFrameColor("golden-frame"),
              'midnight': () => setFrameColor("midnight-frame"),
              'default': () => setPassepartoutColor("blue"),
            };

            const action = variantActions[variantValue.toLowerCase()] || variantActions['default'];
            action();
          })
          .catch(error => console.error(error));
      });
    });
  }

  isVariantSelectedBeforeDOMLoaded();
});

const setPassepartoutColor = (color) => {
  passepartoutClicked = true;
  passepartout_img.src = setColor(passepartout, `data-${color}`);
};

const setFrameColor = (type) => {
  frameTypeClicked = true;
  frame_img.src = setColor(frame, `data-${type}`);
};

const handleUnframed = () => {
  frame.style.opacity = 0;
  passepartout.style.opacity = 0;
  cImages.forEach(img => img.classList.remove("smaller-image"));
  frame.style.width = "100%";
  frame.style.height = "100%";
  passepartout.style.width = "100%";
  passepartout.style.height = "100%";

  if (isValidElement(cIndicators)) cIndicators.innerHTML = originalIndicatorsHTML;
  if (isValidNodeList(cControls)) cControls.forEach(control => control.style.display = "flex");
  unselectFramedVariants();
};
