(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var form = document.querySelector("[data-filter-form]");
    if (!form) {
      return;
    }
    var input = form.querySelector("[data-search-input]");
    var category = form.querySelector("[data-category-filter]");
    var year = form.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function apply() {
      var keyword = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchCategory = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
        var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
        card.classList.toggle("hidden-card", !(matchKeyword && matchCategory && matchYear));
      });
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupPlayer() {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector("[data-play-cover]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-video");
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (attached || !source) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          maxBufferLength: 30
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      shell.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          shell.classList.add("is-playing");
          video.setAttribute("controls", "controls");
        });
      }
    }

    attachSource();
    if (cover) {
      cover.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
