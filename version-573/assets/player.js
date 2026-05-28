(function () {
  function initPlayer(videoId, coverId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var ready = false;
    var hls = null;

    if (!video || !cover || !sourceUrl) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      video.controls = true;
      ready = true;
    }

    function play() {
      attach();
      cover.setAttribute("hidden", "");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          cover.removeAttribute("hidden");
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("ended", function () {
      cover.removeAttribute("hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.initPlayer = initPlayer;
})();
