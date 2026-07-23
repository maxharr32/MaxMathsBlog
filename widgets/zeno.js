/* widgets/zeno.js
 *
 * Each step covers half of whatever distance is left. The animation
 * shows where that leaves you on the track; the graph shows the
 * running total (1/2 + 1/4 + 1/8 + ...) creeping toward 1 without a
 * slider value ever making it land exactly there.
 */
window.Widgets = window.Widgets || {};

window.Widgets['zeno'] = (function () {
  var MAX_TERMS = 20;
  var timer = null;

  function mount(container) {
    var W = 260, H = 260;

    var styles = getComputedStyle(document.documentElement);
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var inkSoft = (styles.getPropertyValue('--ink-soft') || '#4A5A4F').trim();
    var plot = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var live = (styles.getPropertyValue('--live') || '#B5542E').trim();
    var rule = (styles.getPropertyValue('--rule') || '#B9C2AF').trim();
    var paper = (styles.getPropertyValue('--paper') || '#E9EDE4').trim();
    var paperRaise = (styles.getPropertyValue('--paper-raise') || '#F3F5EF').trim();

    container.innerHTML =
      '<div class="zen-widget">' +
        '<div class="zen-row">' +
          '<canvas class="zen-track" width="' + W + '" height="' + H + '"></canvas>' +
          '<canvas class="zen-graph" width="' + W + '" height="' + H + '"></canvas>' +
        '</div>' +
        '<div class="zen-stats">' +
          '<span>jump <strong id="zen-n">1</strong></span>' +
          '<span>covered <strong id="zen-covered">—</strong></span>' +
          '<span>remaining <strong id="zen-remaining">—</strong></span>' +
        '</div>' +
        '<div class="zen-controls">' +
          '<input type="range" id="zen-slider" min="1" max="' + MAX_TERMS + '" value="1" step="1">' +
          '<button type="button" id="zen-play">Play jumps</button>' +
          '<button type="button" id="zen-reset">Reset</button>' +
        '</div>' +
      '</div>';

    injectStyles();

    var trackCanvas = container.querySelector('.zen-track');
    var graphCanvas = container.querySelector('.zen-graph');
    var tctx = trackCanvas.getContext('2d');
    var gctx = graphCanvas.getContext('2d');
    var slider = container.querySelector('#zen-slider');
    var playBtn = container.querySelector('#zen-play');
    var resetBtn = container.querySelector('#zen-reset');
    var nEl = container.querySelector('#zen-n');
    var coveredEl = container.querySelector('#zen-covered');
    var remainingEl = container.querySelector('#zen-remaining');

    function partialSum(n) { return 1 - Math.pow(0.5, n); }

    function drawTrack(n) {
      tctx.fillStyle = paper;
      tctx.fillRect(0, 0, W, H);
      tctx.strokeStyle = rule;
      tctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      var left = 24, right = W - 24, y = H / 2;

      // the track
      tctx.strokeStyle = inkSoft;
      tctx.lineWidth = 2;
      tctx.beginPath();
      tctx.moveTo(left, y);
      tctx.lineTo(right, y);
      tctx.stroke();

      // start marker
      tctx.fillStyle = inkSoft;
      tctx.fillRect(left - 1, y - 10, 2, 20);

      // the wall Achilles/the walker never quite reaches
      tctx.strokeStyle = live;
      tctx.lineWidth = 2;
      tctx.setLineDash([4, 4]);
      tctx.beginPath();
      tctx.moveTo(right, y - 26);
      tctx.lineTo(right, y + 26);
      tctx.stroke();
      tctx.setLineDash([]);
      tctx.fillStyle = live;
      tctx.font = '11px monospace';
      tctx.fillText('wall', right - 12, y - 32);

      // jump marks up to n
      var prevSum = 0;
      for (var k = 1; k <= n; k++) {
        var s = partialSum(k);
        var px = left + s * (right - left);
        tctx.beginPath();
        tctx.arc(px, y, k === n ? 5 : 2.5, 0, Math.PI * 2);
        tctx.fillStyle = k === n ? plot : rule;
        tctx.fill();
        prevSum = s;
      }

      // label current position
      var curX = left + partialSum(n) * (right - left);
      tctx.fillStyle = ink;
      tctx.font = '11px monospace';
      tctx.textAlign = 'center';
      tctx.fillText('step ' + n, curX, y + 24);
      tctx.textAlign = 'left';

      // small caption
      tctx.fillStyle = inkSoft;
      tctx.font = '11px monospace';
      tctx.fillText('start', left - 10, y + 24);
    }

    function drawGraph(n) {
      gctx.fillStyle = paper;
      gctx.fillRect(0, 0, W, H);
      gctx.strokeStyle = rule;
      gctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      var padL = 30, padB = 20, padT = 14, padR = 10;
      var plotW = W - padL - padR, plotH = H - padT - padB;

      function xAt(step) { return padL + (step / MAX_TERMS) * plotW; }
      function yAt(val) { return padT + (1 - val) * plotH; }

      // axes
      gctx.strokeStyle = ink;
      gctx.lineWidth = 1;
      gctx.beginPath();
      gctx.moveTo(padL, padT);
      gctx.lineTo(padL, padT + plotH);
      gctx.lineTo(padL + plotW, padT + plotH);
      gctx.stroke();

      // the limit line at y = 1, the value the sum approaches but never reaches
      gctx.strokeStyle = live;
      gctx.setLineDash([4, 4]);
      gctx.beginPath();
      gctx.moveTo(padL, yAt(1));
      gctx.lineTo(padL + plotW, yAt(1));
      gctx.stroke();
      gctx.setLineDash([]);
      gctx.fillStyle = live;
      gctx.font = '11px monospace';
      gctx.fillText('limit = 1', padL + plotW - 58, yAt(1) - 5);

      // partial sums
      gctx.strokeStyle = plot;
      gctx.lineWidth = 1.5;
      gctx.beginPath();
      for (var k = 1; k <= n; k++) {
        var x = xAt(k), y = yAt(partialSum(k));
        if (k === 1) gctx.moveTo(x, y); else gctx.lineTo(x, y);
      }
      gctx.stroke();

      gctx.fillStyle = plot;
      for (k = 1; k <= n; k++) {
        var px = xAt(k), py = yAt(partialSum(k));
        gctx.beginPath();
        gctx.arc(px, py, k === n ? 3.5 : 2, 0, Math.PI * 2);
        gctx.fill();
      }

      // gap marker from last point up to the limit line
      var lastX = xAt(n), lastY = yAt(partialSum(n));
      gctx.strokeStyle = inkSoft;
      gctx.setLineDash([2, 2]);
      gctx.beginPath();
      gctx.moveTo(lastX, lastY);
      gctx.lineTo(lastX, yAt(1));
      gctx.stroke();
      gctx.setLineDash([]);

      gctx.fillStyle = inkSoft;
      gctx.font = '10px monospace';
      gctx.save();
      gctx.textAlign = 'left';
      gctx.fillText('n', padL + plotW - 6, padT + plotH + 14);
      gctx.restore();
    }

    function render() {
      var n = parseInt(slider.value, 10);
      nEl.textContent = n;
      var covered = partialSum(n);
      var remaining = Math.pow(0.5, n);
      coveredEl.textContent = covered.toFixed(Math.min(6, 2 + n));
      remainingEl.textContent = remaining < 0.0001 ? remaining.toExponential(2) : remaining.toFixed(4);
      drawTrack(n);
      drawGraph(n);
    }

    slider.addEventListener('input', function () {
      stopPlay();
      render();
    });

    function stopPlay() {
      if (timer) { clearInterval(timer); timer = null; playBtn.textContent = 'Play jumps'; }
    }

    playBtn.addEventListener('click', function () {
      if (timer) { stopPlay(); return; }
      playBtn.textContent = 'Pause';
      timer = setInterval(function () {
        var n = parseInt(slider.value, 10);
        if (n >= MAX_TERMS) { stopPlay(); return; }
        slider.value = n + 1;
        render();
      }, 700);
    });

    resetBtn.addEventListener('click', function () {
      stopPlay();
      slider.value = 1;
      render();
    });

    render();
  }

  function unmount(container) {
    if (timer) { clearInterval(timer); timer = null; }
    container.innerHTML = '';
  }

  function injectStyles() {
    if (document.getElementById('zen-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'zen-widget-styles';
    style.textContent =
      '.zen-row{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;}' +
      '.zen-track,.zen-graph{flex:0 0 auto;width:260px;height:260px;max-width:48%;border:1px solid var(--rule);background:var(--paper);}' +
      '.zen-stats{display:flex;gap:18px;margin-top:12px;font-family:var(--font-mono);font-size:13px;color:var(--ink-soft);flex-wrap:wrap;}' +
      '.zen-stats strong{color:var(--ink);}' +
      '.zen-controls{margin-top:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;}' +
      '.zen-controls input[type=range]{width:140px;accent-color:var(--plot);}' +
      '.zen-controls button{font-family:var(--font-mono);font-size:12px;padding:6px 12px;border:1px solid var(--rule);background:var(--paper-raise);color:var(--ink);cursor:pointer;}' +
      '.zen-controls button:hover{border-color:var(--plot);color:var(--plot);}' +
      '@media (max-width:520px){.zen-track,.zen-graph{max-width:100%;}}';
    document.head.appendChild(style);
  }

  return { mount: mount, unmount: unmount };
})();
