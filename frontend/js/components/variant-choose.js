let originalFrameWidth = "";
let originalFrameHeight = "";

document.querySelectorAll(".variant-picker__option").forEach(option => {
  option.addEventListener("click", function () {
    const variantId = parseInt(this.getAttribute("value"));
    fetch(`api/variant_price/${variantId}`)
      .then(response => response.json())
      .then(result => {
        document.querySelector(".text-info").innerHTML = `$ ${result.price}`;
        document.querySelector(".stock").innerHTML = `Stock: ${result.stock}`;

        const frame = document.getElementById("frame");
        const carouselItemImages =
          document.querySelectorAll(".carousel-item img");

        if (variantId % 2 === 0) {
          frame.style.opacity = 1; // Make the #frame div fully opaque

          // Apply smaller image class to active carousel-item's image
          carouselItemImages.forEach(image => {
            image.classList.remove("smaller-image");
          });

          // Apply the original dimensions to the #frame element
          if (!originalFrameWidth && !originalFrameHeight) {
            originalFrameWidth = frame.offsetWidth + "px";
            originalFrameHeight = frame.offsetHeight + "px";
          }

          frame.style.width = originalFrameWidth;
          frame.style.height = originalFrameHeight;

          const activeCarouselItem = document.querySelector(
            ".carousel-item.active img"
          );
          if (activeCarouselItem) {
            activeCarouselItem.classList.add("smaller-image");
          }
        } else {
          frame.style.opacity = 0; // Make the #frame div fully transparent

          // Remove smaller image class from all carousel-item images
          carouselItemImages.forEach(image => {
            image.classList.remove("smaller-image");
          });

          frame.style.width = "100%"; // Reset the width
          frame.style.height = "100%"; // Reset the height
        }
      })
      .catch(error => console.error(error));
  });
});
