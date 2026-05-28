(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    show(0);
    restart();
  }

  function initCardFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var scope = input.closest("[data-filter-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var term = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.style.display = !term || text.indexOf(term) !== -1 ? "" : "none";
        });
      });
    });
  }

  function cardHtml(item) {
    return [
      '<a class="movie-card" href="' + item.url + '" data-search="' + escapeHtml(item.search) + '">',
      '<span class="poster-wrap">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="card-badge">' + escapeHtml(item.year) + '</span>',
      '<span class="play-mark">▶</span>',
      '</span>',
      '<span class="card-body">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<em>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</em>',
      '<small>' + escapeHtml(item.oneLine) + '</small>',
      '</span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch];
    });
  }

  function initSearchPage() {
    var box = document.getElementById("siteSearchInput");
    var results = document.getElementById("searchResults");
    if (!box || !results || !window.MOVIES) {
      return;
    }
    var region = document.getElementById("regionFilter");
    var type = document.getElementById("typeFilter");
    var year = document.getElementById("yearFilter");

    function render() {
      var term = box.value.trim().toLowerCase();
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      var matched = window.MOVIES.filter(function (item) {
        var okTerm = !term || item.search.toLowerCase().indexOf(term) !== -1;
        var okRegion = !r || item.region === r;
        var okType = !t || item.type.indexOf(t) !== -1;
        var okYear = !y || item.year === y;
        return okTerm && okRegion && okType && okYear;
      }).slice(0, 120);
      results.innerHTML = matched.length ? matched.map(cardHtml).join('') : '<div class="search-empty">没有找到匹配的影片</div>';
    }

    [box, region, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      }
    });
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initCardFilters();
    initSearchPage();
  });
})();
