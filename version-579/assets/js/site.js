const MovieSite = (() => {
  const select = (selector, scope = document) => scope.querySelector(selector);
  const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function setupMenu() {
    const button = select('[data-menu-toggle]');
    const panel = select('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', () => {
      panel.classList.toggle('is-open');
      button.classList.toggle('is-active');
    });
  }

  function setupHero() {
    const root = select('[data-hero]');
    if (!root) {
      return;
    }
    const slides = selectAll('[data-hero-slide]', root);
    const dots = selectAll('[data-hero-dot]', root);
    if (slides.length < 2) {
      return;
    }
    let index = 0;
    let timer = null;
    const show = next => {
      index = next % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };
    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5200);
    };
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stop();
        show(i);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupSearchForms() {
    selectAll('[data-search-form]').forEach(form => {
      form.addEventListener('submit', event => {
        const input = select('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function setupFilters() {
    const form = select('[data-filter]');
    if (!form) {
      return;
    }
    const cards = selectAll('[data-card]');
    const apply = () => {
      const keyword = (select('input[name="keyword"]', form)?.value || '').trim().toLowerCase();
      const year = select('select[name="year"]', form)?.value || '';
      const type = select('select[name="type"]', form)?.value || '';
      cards.forEach(card => {
        const text = (card.dataset.search || '').toLowerCase();
        const matchKeyword = !keyword || text.includes(keyword);
        const matchYear = !year || card.dataset.year === year;
        const matchType = !type || card.dataset.type === type;
        card.hidden = !(matchKeyword && matchYear && matchType);
      });
    };
    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
  }

  function setupSearchPage() {
    const results = select('[data-search-results]');
    const state = select('[data-search-state]');
    const input = select('[data-search-input]');
    if (!results || !state || !window.MOVIE_DATA) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const initial = (params.get('q') || '').trim();
    if (input) {
      input.value = initial;
    }
    const render = query => {
      const q = query.trim().toLowerCase();
      results.innerHTML = '';
      if (!q) {
        state.textContent = '输入关键词即可开始搜索。';
        return;
      }
      const matched = window.MOVIE_DATA.filter(movie => {
        const text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return text.includes(q);
      }).slice(0, 120);
      state.textContent = matched.length ? `为你找到 ${matched.length} 条相关影片` : '没有找到相关影片';
      const fragment = document.createDocumentFragment();
      matched.forEach(movie => {
        const article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = `
          <a class="poster" href="${escapeAttr(movie.url)}">
            <img src="${escapeAttr(movie.cover)}" alt="${escapeAttr(movie.title)}" loading="lazy">
            <span class="poster-shade"></span>
            <span class="score">${escapeHTML(movie.score)}</span>
            <span class="card-category">${escapeHTML(movie.category)}</span>
          </a>
          <div class="card-body">
            <a href="${escapeAttr(movie.url)}"><h2>${escapeHTML(movie.title)}</h2></a>
            <p>${escapeHTML(movie.oneLine)}</p>
            <div class="meta-line">
              <span>${escapeHTML(movie.region)}</span>
              <span>${escapeHTML(movie.year)}</span>
              <span>${escapeHTML(movie.type)}</span>
            </div>
          </div>`;
        fragment.appendChild(article);
      });
      results.appendChild(fragment);
    };
    render(initial);
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"]/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHTML(value).replace(/'/g, '&#39;');
  }

  function initPlayer(source) {
    const root = select('[data-player]');
    if (!root) {
      return;
    }
    const video = select('video', root);
    const start = select('[data-player-start]', root);
    if (!video || !start) {
      return;
    }
    let ready = false;
    const load = () => {
      if (!ready) {
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      start.classList.add('is-hidden');
      video.controls = true;
      const play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(() => {});
      }
    };
    start.addEventListener('click', load);
    root.addEventListener('click', event => {
      if (event.target === root) {
        load();
      }
    });
    video.addEventListener('play', () => start.classList.add('is-hidden'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupSearchPage();
  });

  return {
    initPlayer
  };
})();
