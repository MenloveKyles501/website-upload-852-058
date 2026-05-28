(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (holder) {
    var video = holder.querySelector("video");
    var overlay = holder.querySelector("[data-play-overlay]");
    var button = holder.querySelector("[data-play-button]");
    var message = holder.querySelector("[data-player-message]");
    var loading = holder.querySelector("[data-player-loading]");
    var active = false;
    var hls = null;

    if (!video || !overlay || !button) {
      return;
    }

    function setMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text || "";
      message.classList.toggle("is-visible", Boolean(text));
    }

    function setLoading(state) {
      if (loading) {
        loading.classList.toggle("is-visible", Boolean(state));
      }
    }

    function requestPlay() {
      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          setMessage("点击视频可继续播放。");
        });
      }
    }

    function start() {
      var url = video.getAttribute("data-stream");

      if (!url) {
        setMessage("播放暂未成功，请稍后再试。");
        return;
      }

      overlay.classList.add("is-hidden");
      setMessage("");
      setLoading(true);

      if (active) {
        requestPlay();
        return;
      }

      active = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setLoading(false);
          requestPlay();
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          setLoading(false);

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage("播放暂未成功，请稍后再试。");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage("正在恢复播放。");
            hls.recoverMediaError();
          } else {
            setMessage("播放暂未成功，请稍后再试。");
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", function () {
          setLoading(false);
          requestPlay();
        }, { once: true });
        requestPlay();
      } else {
        setLoading(false);
        setMessage("播放暂未成功，请稍后再试。");
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });

    overlay.addEventListener("click", function () {
      start();
    });

    video.addEventListener("playing", function () {
      setLoading(false);
      setMessage("");
    });

    video.addEventListener("waiting", function () {
      setLoading(true);
    });

    video.addEventListener("pause", function () {
      setLoading(false);
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
