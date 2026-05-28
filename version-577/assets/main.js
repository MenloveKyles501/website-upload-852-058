(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  var areas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
  areas.forEach(function (area) {
    var input = area.querySelector('[data-local-search]');
    var select = area.querySelector('[data-local-category]');
    var list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var category = select ? select.value : 'all';
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var matchedText = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedCategory = category === 'all' || cardCategory === category;
        card.classList.toggle('card-hidden', !(matchedText && matchedCategory));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
    }

    if (select) {
      select.addEventListener('change', apply);
      select.addEventListener('change', function () {
        var chosen = select.value;
        if (chosen !== 'all') {
          var target = document.querySelector('a[href="./category-' + chosen + '.html"]');
          if (!target) {
            target = document.querySelector('a[href="category-' + chosen + '.html"]');
          }
        }
      });
    }

    apply();
  });
})();
