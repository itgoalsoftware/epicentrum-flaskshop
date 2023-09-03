import { Carousel } from "bootstrap/dist/js/bootstrap.esm.js";


let originalIndicatorsHTML = "";
let labelElements, cImages, cInstance, cIndicators, cControls, cElement;
let frame, passepartout;
let cachedVariantsArray = null;
let productPrice;

document.addEventListener("DOMContentLoaded", function () {
  const elements = initializeElements();
  const variantPickerOptions = elements.variantPickerOptions;

  attachVariantListeners(variantPickerOptions);

  const selectedOption = isVariantSelectedBeforeDOMLoaded(variantPickerOptions);
  if (selectedOption) {
    handleVariantClick(selectedOption);
  }
});

const attachVariantListeners = (variantPickerOptions) => {
  if (variantPickerOptions) {
    variantPickerOptions.forEach(option => {
      option.addEventListener("click", () => handleVariantClick(option));
    });
  }
};

const handleVariantClick = async (option) => {
  const variantId = parseInt(option.getAttribute("value"));

  fetchAllVariantsData()
    .then(variantsArray => {
      const result = variantsArray.find(variant => variant.id === variantId);
      handleFetchedVariantData(result);
    });
};

const fetchAllVariantsData = async () => {
  if (cachedVariantsArray !== null) {
    return cachedVariantsArray;
  }

  try {
    const response = await fetch('api/all_variants_data');
    const variantsArray = await response.json();
    cachedVariantsArray = variantsArray;
    return variantsArray;
  } catch (error) {
    console.error(error);
    return [];
  }
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
  restorePrice();
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
  fetchPriceOverride(classic);

  handleFramedVariant(frame, classic);
  checkRadioButton(blue);
  handleFramedVariant(passepartout, blue)
  showFrame();
};

const fetchPriceOverride = async (label) => {
    fetchAllVariantsData()
    .then(variantsArray => {
      const result = variantsArray.find(variant => variant.title.toLowerCase().trim() === label.toLowerCase().trim());
      if (result && result.price !== 0) {
        const priceElement = document.querySelector(".text-info");
        if (priceElement) {
          priceElement.innerHTML = `$ ${result.price}`;
        }
      }
    })
    .catch(error => {
      console.error("Error fetching price:", error);
    });
};

const restorePrice = () => {
  const priceElement = document.querySelector(".text-info");
        if (priceElement) {
          priceElement.innerHTML = `${productPrice}`;
        }
}

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
  let label = getLabelByElementSrc(element);
  checkRadioButton(label);
  fetchPriceOverride(label);
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
  
  const variantPickerOptions = document.querySelectorAll(".variant-picker__option");
  labelElements = document.querySelectorAll('.btn-group label');
  frame = document.getElementById("frame-container");
  passepartout = document.getElementById('passepartout-container');
  productPrice = document.querySelector(".text-info").innerHTML;

  return {
    cElement,
    cControls,
    cInstance,
    cImages,
    cIndicators,
    variantPickerOptions,
    labelElements,
    frame,
    passepartout,
    productPrice
  };
}

const isValidElement = (element) => element instanceof HTMLElement;
const isValidCarouselInstance = (instance) => instance instanceof Carousel;
const isValidNodeList = (nodeList) => nodeList && nodeList.length > 0;

const isVariantSelectedBeforeDOMLoaded = (variantPickerOptions) => {
  for (const option of variantPickerOptions) {
    if (option.checked) {
      return option;
    }
  }
  return null;
};