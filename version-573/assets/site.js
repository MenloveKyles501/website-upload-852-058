(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var open = mobilePanel.hasAttribute("hidden");
      if (open) {
        mobilePanel.removeAttribute("hidden");
      } else {
        mobilePanel.setAttribute("hidden", "");
      }
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var slideIndex = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === slideIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === slideIndex);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }
    slideTimer = window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5600);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      window.clearInterval(slideTimer);
      showSlide(Number(dot.getAttribute("data-slide")) || 0);
      startSlides();
    });
  });

  startSlides();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search-input"));
  var filters = Array.prototype.slice.call(document.querySelectorAll(".site-filter"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var emptyState = document.querySelector(".empty-state");

  function textValue(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = textValue(searchInputs[0] ? searchInputs[0].value : "");
    var active = {};

    filters.forEach(function (filter) {
      var key = filter.getAttribute("data-filter");
      active[key] = filter.value;
    });

    var visible = 0;

    cards.forEach(function (card) {
      var haystack = textValue([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags")
      ].join(" "));

      var matched = !query || haystack.indexOf(query) !== -1;

      Object.keys(active).forEach(function (key) {
        if (active[key] && card.getAttribute("data-" + key) !== active[key]) {
          matched = false;
        }
      });

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInputs.length || filters.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    searchInputs.forEach(function (input) {
      input.value = query;
      input.addEventListener("input", applyFilters);
    });

    filters.forEach(function (filter) {
      filter.addEventListener("change", applyFilters);
    });

    applyFilters();
  }
})();
