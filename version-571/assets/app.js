(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  }

  function autoPlay() {
    if (timer) {
      clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(active + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    showSlide(0);
    autoPlay();

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        autoPlay();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(active - 1);
        autoPlay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(active + 1);
        autoPlay();
      });
    }
  }

  var searchInput = document.querySelector("[data-search-input]");
  var yearSelect = document.querySelector("[data-year-filter]");
  var regionSelect = document.querySelector("[data-region-filter]");
  var typeSelect = document.querySelector("[data-type-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card] .movie-card, .search-results .movie-card"));
  var noResults = document.querySelector("[data-no-results]");

  function getParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (error) {
      return new URLSearchParams("");
    }
  }

  if (searchInput) {
    var q = getParams().get("q");

    if (q) {
      searchInput.value = q;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";
    var region = regionSelect ? regionSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-type"),
        card.getAttribute("data-keywords")
      ].join(" ").toLowerCase();
      var ok = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        ok = false;
      }

      if (year && card.getAttribute("data-year") !== year) {
        ok = false;
      }

      if (region && card.getAttribute("data-region") !== region) {
        ok = false;
      }

      if (type && card.getAttribute("data-type") !== type) {
        ok = false;
      }

      card.hidden = !ok;

      if (ok) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle("is-visible", visible === 0);
    }
  }

  [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (item) {
    if (item) {
      item.addEventListener("input", filterCards);
      item.addEventListener("change", filterCards);
    }
  });

  filterCards();
})();
