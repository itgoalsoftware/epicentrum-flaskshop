import { Carousel } from "bootstrap/dist/js/bootstrap.esm.js";

// Find the carousel element by its ID or other appropriate selector
// Find the carousel element by its ID or other appropriate selector
const carouselElement = document.querySelector("#carousel-product");

// Get the carousel instance
const carouselInstance = new Carousel(carouselElement);

// Listen for the "slid.bs.carousel" event
carouselElement.addEventListener("slid.bs.carousel", function (event) {
  // Check if the active index is back to the first slide (index 0)
  if (event.to === 0) {
    // Pause the carousel
    console.log("Carousel has stopped.");
    carouselInstance.pause();
  }
});
