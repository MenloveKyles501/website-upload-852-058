(function () {
  function attach(video, url) {
    if (!video || !url) {
      return;
    }

    if (video.dataset.ready === '1') {
      video.play().catch(function () {});
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.dataset.ready = '1';
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.dataset.ready = '1';
        video.play().catch(function () {});
      });
      return;
    }

    video.src = url;
    video.dataset.ready = '1';
    video.play().catch(function () {});
  }

  function setup(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var url = box.getAttribute('data-stream');

    function play() {
      if (button) {
        button.classList.add('hidden');
      }
      attach(video, url);
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!video.dataset.ready) {
          play();
        }
      });
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), setup);
})();
