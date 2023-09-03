import { Carousel } from "bootstrap/dist/js/bootstrap.esm.js";


let originalIndicatorsHTML = "";
let labelElements, cImages, cInstance, cIndicators, cControls, cElement, variantPickerOptions;
let frame, passepartout;
let cachedVariantsArray = null;

document.addEventListener("DOMContentLoaded", function () {
  initializeElements();

  attachVariantListeners();

  isVariantSelectedBeforeDOMLoaded();
});

const attachVariantListeners = () => {
  if (variantPickerOptions) {
    variantPickerOptions.forEach(option => {
      option.addEventListener("click", () => handleVariantClick(option));
    });
  }
};

const handleVariantClick = (option) => {
  const variantId = parseInt(option.getAttribute("value"));

  fetchAllVariantsData()
    .then(variantsArray => {
      const result = variantsArray.find(variant => variant.id === variantId);
      handleFetchedVariantData(result);
    });
};

const fetchAllVariantsData = () => {
  if (cachedVariantsArray !== null) {
    return Promise.resolve(cachedVariantsArray);
  }

  return fetch('api/all_variants_data')
    .then(response => response.json())
    .then(variantsArray => {
      cachedVariantsArray = variantsArray;
      return variantsArray;
    })
    .catch(error => {
      console.error(error);
      return [];
    });
};

const handleFetchedVariantData = (result) => {
  if (result && result.price != 0) {
    document.querySelector(".text-info").innerHTML = `$ ${result.price}`;
  }

  const variantValue = result ? result.title : 'default';
  handleVariantAction(variantValue.toLowerCase());
};

const handleVariantAction = (variantValue) => {
  const variantActions = {
    'framed': selectFramedVariant,
    'unframed': handleUnframed,
    'blue': () => handleFramedVariant(passepartout, "blue"),
    'red': () => handleFramedVariant(passepartout, "red"),
    'green': () => handleFramedVariant(passepartout, "green"),
    'brown': () => handleFramedVariant(passepartout, "brown"),
    'violet': () => handleFramedVariant(passepartout, "violet"),
    'classic': () => handleFramedVariant(frame, "classic"),
    'golden': () => handleFramedVariant(frame, "golden"),
    'midnight': () => handleFramedVariant(frame, "midnight"),
    'default': () => handleFramedVariant(passepartout, "blue"),
  };

  const action = variantActions[variantValue];
  action();
};

const handleFramedVariant = (element, attribute) => {
  element.querySelector('img').src = setDataAttr(element, `data-${attribute}`);
  hideFrameAndPassepartout();
  showFrame();
  checkCurrentRadioButtons(element);
}

const handleUnframed = () => {
  hideFrameAndPassepartout();
  removeSmallerImageClassFromImages();
  setFullSizeFrameAndPassepartout();
  resetIndicatorsAndControls();
  unselectFramedVariants();
};

const hideFrameAndPassepartout = () => {
  frame.style.opacity = 0;
  passepartout.style.opacity = 0;
};

const removeSmallerImageClassFromImages = () => {
  cImages.forEach(img => img.classList.remove("smaller-image"));
};

const setFullSizeFrameAndPassepartout = () => {
  frame.style.width = "100%";
  frame.style.height = "100%";
  passepartout.style.width = "100%";
  passepartout.style.height = "100%";
};

const resetIndicatorsAndControls = () => {
  if (isValidElement(cIndicators)) {
    cIndicators.innerHTML = originalIndicatorsHTML;
  }
  if (isValidNodeList(cControls)) {
    cControls.forEach(control => control.style.display = "flex");
  }
};

const setDataAttr = (element, dataAttr) => {
  return element.getAttribute(dataAttr);
};

const selectFramedVariant = () => {
  const framed = "framed";
  const classic = "classic";
  const blue = "blue";
  checkRadioButton(framed);
  checkRadioButton(classic);
  handleFramedVariant(frame, classic);
  checkRadioButton(blue);
  handleFramedVariant(passepartout, blue)
  showFrame();
};

const checkRadioButton = (desiredLabelText, checked = true) => {
  for (const label of labelElements) {
    const labelText = label.textContent.trim();
    const associatedRadioId = label.getAttribute("for");
    const associatedRadio = document.getElementById(associatedRadioId);

    if (labelText.toLowerCase() === desiredLabelText.toLowerCase()) {
      associatedRadio.checked = checked;
    }
  }
};

const checkCurrentRadioButtons = (element) => {
  checkRadioButton("Framed");
  checkRadioButton(getLabelByElementSrc(element));
}

const getLabelByElementSrc = (element) => {
  const targetElement = (element === passepartout) ? frame : passepartout;
  const url = new URL(targetElement.querySelector('img').src);
  for (const attr in targetElement.dataset) {
    const value = targetElement.dataset[attr].trim();
    if (value == url.pathname.trim()) {
      return attr;
    }
  }
}


const unselectFramedVariants = () => {
  for (const label of labelElements) {
    const labelText = label.textContent.trim();

    labelText !== "Unframed" && checkRadioButton(labelText, false);
  }
};

const showFrame = () => {
  showFrameWithDelay();
  removeSmallerImageClass();
  navigateCarouselToFirstSlide();
  clearCarouselIndicators();
  addSmallerImageClass();
  hideCarouselControls();
};

const showFrameWithDelay = () => {
  setTimeout(() => {
    frame.style.opacity = 1;
    passepartout.style.opacity = 1;
  }, 300);
};

const removeSmallerImageClass = () => {
  cImages.forEach(img => img.classList.remove("smaller-image"));
};

const navigateCarouselToFirstSlide = () => {
  if (isValidCarouselInstance(cInstance)) {
    cInstance.to(0);
  }
};

const clearCarouselIndicators = () => {
  if (isValidElement(cIndicators)) {
    cIndicators.innerHTML = "";
  }
};

const addSmallerImageClass = () => {
  cImages.forEach(img => img.classList.add("smaller-image"));
};

const hideCarouselControls = () => {
  if (isValidNodeList(cControls)) {
    cControls.forEach(control => control.style.display = "none");
  }
};

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
}

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