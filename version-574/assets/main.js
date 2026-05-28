(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFiltering() {
    var search = document.querySelector('[data-live-search]');
    var year = document.querySelector('[data-filter-year]');
    var region = document.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    if (!cards.length) {
      return;
    }

    function valueOf(node) {
      return node ? String(node.value || '').trim().toLowerCase() : '';
    }

    function apply() {
      var query = valueOf(search);
      var yearValue = valueOf(year);
      var regionValue = valueOf(region);

      cards.forEach(function (card) {
        var haystack = String(card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
        var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }
        card.classList.toggle('is-hidden', !matched);
      });
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (region) {
      region.addEventListener('change', apply);
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-layer');
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var instance = null;

      function attach() {
        if (video.getAttribute('data-ready') === 'yes') {
          return Promise.resolve();
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.setAttribute('data-ready', 'yes');
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          instance.loadSource(stream);
          instance.attachMedia(video);
          video.setAttribute('data-ready', 'yes');
          return new Promise(function (resolve) {
            instance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1200);
          });
        }
        video.src = stream;
        video.setAttribute('data-ready', 'yes');
        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          video.controls = true;
          button.classList.add('is-hidden');
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              button.classList.remove('is-hidden');
            });
          }
        });
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (instance) {
          instance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFiltering();
    setupPlayers();
  });
})();
