(function () {
    "use strict";

    window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !sourceUrl) {
            return;
        }
        var hlsInstance = null;
        var ready = false;
        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        function start() {
            attach();
            button.classList.add("is-hidden");
            video.play().catch(function () {
                button.classList.remove("is-hidden");
            });
        }
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
