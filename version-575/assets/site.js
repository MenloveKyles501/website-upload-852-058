(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const menuPanel = document.querySelector('[data-menu-panel]');

    if (menuButton && menuPanel) {
        menuButton.addEventListener('click', function () {
            menuPanel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const setSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                setSlide(dotIndex);
                start();
            });
        });

        start();
    }

    const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-value]'));
    let activeFilter = '';

    const normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    const applyFilters = function () {
        const term = normalize(searchInputs.map(function (input) {
            return input.value;
        }).find(Boolean) || '');

        const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

        cards.forEach(function (card) {
            const keywords = normalize(card.getAttribute('data-keywords'));
            const matchesTerm = !term || keywords.indexOf(term) !== -1;
            const matchesFilter = !activeFilter || keywords.indexOf(normalize(activeFilter)) !== -1;
            card.classList.toggle('is-hidden', !(matchesTerm && matchesFilter));
        });
    };

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter-value') || '';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyFilters();
        });
    });

    const playerShell = document.querySelector('.player-shell[data-video]');

    if (playerShell) {
        const video = playerShell.querySelector('video');
        const overlay = playerShell.querySelector('.play-overlay');
        const source = playerShell.getAttribute('data-video');
        let hls = null;
        let initialized = false;
        let playRequested = false;

        const markWaiting = function () {
            playerShell.classList.add('is-playing');
        };

        const showOverlay = function () {
            if (!video || video.paused) {
                playerShell.classList.remove('is-playing');
            }
        };

        const startVideo = function () {
            if (!video) {
                return;
            }

            markWaiting();
            const attempt = video.play();

            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    showOverlay();
                });
            }
        };

        const initialize = function () {
            if (!video || !source || initialized) {
                return;
            }

            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    if (playRequested) {
                        startVideo();
                    }
                }, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (playRequested) {
                        startVideo();
                    }
                });
            } else {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    if (playRequested) {
                        startVideo();
                    }
                }, { once: true });
            }
        };

        const play = function () {
            playRequested = true;
            markWaiting();
            initialize();

            if (video.readyState > 0) {
                startVideo();
            }
        };

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (!initialized) {
                play();
            }
        });

        video.addEventListener('play', markWaiting);
        video.addEventListener('ended', showOverlay);

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
