(() => {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(() => {
    const header = document.querySelector(".site-header");
    const menuButton = document.querySelector(".menu-toggle");

    if (header && menuButton) {
      menuButton.addEventListener("click", () => {
        const open = header.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(open));
      });
    }

    document.querySelectorAll("[data-global-search]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        const input = form.querySelector("input[name='q']");
        const value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    const hero = document.querySelector("[data-hero]");

    if (hero) {
      const slides = Array.from(hero.querySelectorAll(".hero-slide"));
      const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
      const prev = hero.querySelector("[data-hero-prev]");
      const next = hero.querySelector("[data-hero-next]");
      let active = 0;
      let timer = null;

      const show = (index) => {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      };

      const move = (step) => {
        show(active + step);
      };

      const start = () => {
        stop();
        timer = window.setInterval(() => move(1), 5200);
      };

      const stop = () => {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          show(Number(dot.dataset.heroDot || 0));
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", () => {
          move(-1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", () => {
          move(1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    const pageSearch = document.querySelector("[data-page-search]");
    const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
    const items = Array.from(document.querySelectorAll(".movie-card, .rank-row"));
    const empty = document.querySelector("[data-empty-state]");
    let activeFilter = "all";

    const normalize = (value) => (value || "").toString().trim().toLowerCase();

    const applyFilters = () => {
      const query = normalize(pageSearch ? pageSearch.value : "");
      let visibleCount = 0;

      items.forEach((item) => {
        const text = normalize(item.dataset.text);
        const category = item.dataset.category || "";
        const matchesText = !query || text.includes(query);
        const matchesFilter = activeFilter === "all" || category === activeFilter;
        const visible = matchesText && matchesFilter;
        item.classList.toggle("is-hidden", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }
    };

    if (pageSearch && items.length) {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get("q");
      if (initialQuery) {
        pageSearch.value = initialQuery;
      }
      pageSearch.addEventListener("input", applyFilters);
      applyFilters();
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
        applyFilters();
      });
    });

    document.querySelectorAll("[data-player]").forEach((shell) => {
      const video = shell.querySelector("video");
      const cover = shell.querySelector(".player-cover");
      const message = shell.querySelector(".player-message");
      const url = video ? video.getAttribute("data-stream-url") : "";
      let loaded = false;
      let hls = null;

      const playVideo = () => {
        if (!video || !url) {
          return;
        }

        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, () => {
              if (message) {
                message.textContent = "播放暂时不可用，请稍后再试";
              }
            });
          } else {
            video.src = url;
          }
          loaded = true;
        }

        shell.classList.add("is-playing");
        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {
            if (hls && window.Hls) {
              hls.once(window.Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {
                  if (message) {
                    message.textContent = "播放暂时不可用，请稍后再试";
                  }
                });
              });
            } else if (message) {
              message.textContent = "播放暂时不可用，请稍后再试";
            }
          });
        }
      };

      if (cover) {
        cover.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", () => {
          if (!loaded || video.paused) {
            playVideo();
          }
        });
      }
    });
  });
})();
