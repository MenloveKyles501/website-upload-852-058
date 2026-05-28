(function () {
    "use strict";

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupHeader() {
        var header = document.querySelector("[data-site-header]");
        if (!header) {
            return;
        }
        function update() {
            if (window.scrollY > 18) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }
        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
        selectAll("a", menu).forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("is-open");
            });
        });
    }

    function setupHero() {
        var slides = selectAll("[data-hero-slide]");
        var dots = selectAll("[data-hero-dot]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });
        show(0);
        play();
    }

    function setupSearchForms() {
        selectAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                if (value) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                } else {
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function setupFilters() {
        var keyword = document.querySelector("[data-filter-keyword]");
        var type = document.querySelector("[data-filter-type]");
        var year = document.querySelector("[data-filter-year]");
        var category = document.querySelector("[data-filter-category]");
        var cards = selectAll("[data-movie-card]");
        if (!cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (keyword && initial) {
            keyword.value = initial;
        }
        function textOf(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-category")
            ].join(" ").toLowerCase();
        }
        function apply() {
            var q = keyword ? keyword.value.trim().toLowerCase() : "";
            var selectedType = type ? type.value : "";
            var selectedYear = year ? year.value : "";
            var selectedCategory = category ? category.value : "";
            cards.forEach(function (card) {
                var ok = true;
                var text = textOf(card);
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (selectedType && (card.getAttribute("data-type") || "").indexOf(selectedType) === -1) {
                    ok = false;
                }
                if (selectedYear && (card.getAttribute("data-year") || "").indexOf(selectedYear) === -1) {
                    ok = false;
                }
                if (selectedCategory && (card.getAttribute("data-category") || "") !== selectedCategory) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
            });
        }
        [keyword, type, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupHeader();
        setupMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
    });
})();
