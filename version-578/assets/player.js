(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function loadRemoteHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function attachVideo(video, source) {
    if (!source) {
      return null;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return hls;
    }
    video.src = source;
    return null;
  }

  function initPlayer(box) {
    var video = box.querySelector("video");
    var overlay = box.querySelector(".player-overlay");
    if (!video || !overlay) {
      return;
    }
    var source = video.getAttribute("data-source") || "";
    var started = false;
    var hlsInstance = null;

    function start() {
      if (!started) {
        hlsInstance = attachVideo(video, source);
        started = true;
      }
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    loadRemoteHls(function () {
      Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(initPlayer);
    });
  });
})();
