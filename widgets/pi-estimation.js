/* widgets/pi-estimation.js
 *
 * Monte Carlo estimate of pi: scatter random points in a square,
 * count the fraction landing inside the inscribed circle, multiply
 * by 4. Two views: the dartboard itself, and a convergence chart
 * of the running estimate against the true value of pi.
 */
window.Widgets = window.Widgets || {};

window.Widgets['pi-estimation'] = (function () {
  var raf = null;

  function mount(container) {
    var styles = getComputedStyle(document.documentElement);
    var plot = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var live = (styles.getPropertyValue('--live') || '#B5542E').trim();
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var inkSoft = (styles.getPropertyValue('--ink-soft') || '#4A5A4F').trim();
    var rule = (styles.getPropertyValue('--rule') || '#B9C2AF').trim();
    var paper = (styles.getPropertyValue('--paper') || '#E9EDE4').trim();

    container.innerHTML =
      '<div class="pi-widget">' +
        '<div class="pi-widget-row">' +
          '<canvas class="pi-board" width="320" height="320"></canvas>' +
          '<canvas class="pi-chart" width="320" height="320"></canvas>' +
        '</div>' +
        '<div class="pi-stats">' +
          '<span><strong id="pi-n">0</strong> points</span>' +
          '<span>estimate <strong id="pi-est">—</strong></span>' +
          '<span>error <strong id="pi-err">—</strong></span>' +
        '</div>' +
        '<div class="pi-controls">' +
          '<button type="button" id="pi-toggle">Pause</button>' +
          '<button type="button" id="pi-reset">Reset</button>' +
        '</div>' +
      '</div>';

    injectStyles();

    var board = container.querySelector('.pi-board');
    var chart = container.querySelector('.pi-chart');
    var bctx = board.getContext('2d');
    var cctx = chart.getContext('2d');

    var n = 0, inside = 0;
    var history = []; // {n, estimate} sampled periodically for the chart
    var maxPoints = 8000;
    var running = true;

    var toggleBtn = container.querySelector('#pi-toggle');
    var resetBtn = container.querySelector('#pi-reset');
    var nEl = container.querySelector('#pi-n');
    var estEl = container.querySelector('#pi-est');
    var errEl = container.querySelector('#pi-err');

    function drawBoardBase() {
      bctx.fillStyle = paper;
      bctx.fillRect(0, 0, board.width, board.height);
      bctx.strokeStyle = rule;
      bctx.lineWidth = 1;
      bctx.strokeRect(0.5, 0.5, board.width - 1, board.height - 1);
      bctx.beginPath();
      bctx.arc(board.width / 2, board.height / 2, board.width / 2 - 2, 0, Math.PI * 2);
      bctx.strokeStyle = inkSoft;
      bctx.stroke();
    }

    function drawChartBase() {
      cctx.fillStyle = paper;
      cctx.fillRect(0, 0, chart.width, chart.height);
      cctx.strokeStyle = rule;
      cctx.strokeRect(0.5, 0.5, chart.width - 1, chart.height - 1);

      var padL = 40, padB = 22, padT = 14, padR = 10;
      var plotW = chart.width - padL - padR;
      var plotH = chart.height - padT - padB;

      // true pi reference line
      var piY = padT + plotH * (1 - (Math.PI - 2.6) / (4.0 - 2.6));
      cctx.strokeStyle = inkSoft;
      cctx.setLineDash([3, 3]);
      cctx.beginPath();
      cctx.moveTo(padL, piY);
      cctx.lineTo(padL + plotW, piY);
      cctx.stroke();
      cctx.setLineDash([]);
      cctx.fillStyle = inkSoft;
      cctx.font = '11px monospace';
      cctx.fillText('π', padL + plotW + 2, piY + 4);

      cctx.strokeStyle = ink;
      cctx.beginPath();
      cctx.moveTo(padL, padT);
      cctx.lineTo(padL, padT + plotH);
      cctx.lineTo(padL + plotW, padT + plotH);
      cctx.stroke();

      return { padL: padL, padT: padT, plotW: plotW, plotH: plotH, yMin: 2.6, yMax: 4.0 };
    }

    var chartGeom = drawChartBase();

    function plotHistoryLine() {
      if (history.length < 2) return;
      cctx.strokeStyle = plot;
      cctx.lineWidth = 1.5;
      cctx.beginPath();
      history.forEach(function (pt, i) {
        var x = chartGeom.padL + (pt.n / maxPoints) * chartGeom.plotW;
        var yFrac = (pt.estimate - chartGeom.yMin) / (chartGeom.yMax - chartGeom.yMin);
        var y = chartGeom.padT + chartGeom.plotH * (1 - Math.max(0, Math.min(1, yFrac)));
        if (i === 0) cctx.moveTo(x, y); else cctx.lineTo(x, y);
      });
      cctx.stroke();
    }

    function reset() {
      n = 0; inside = 0; history = [];
      drawBoardBase();
      chartGeom = drawChartBase();
      nEl.textContent = '0';
      estEl.textContent = '—';
      errEl.textContent = '—';
    }

    function step() {
      var batch = 25;
      for (var i = 0; i < batch && n < maxPoints; i++) {
        var x = Math.random(), y = Math.random();
        var dx = x - 0.5, dy = y - 0.5;
        var isInside = dx * dx + dy * dy <= 0.25;
        n++;
        if (isInside) inside++;

        var px = x * board.width, py = y * board.height;
        bctx.fillStyle = isInside ? plot : live;
        bctx.globalAlpha = 0.7;
        bctx.fillRect(px, py, 1.6, 1.6);
        bctx.globalAlpha = 1;
      }

      var estimate = n > 0 ? 4 * inside / n : 0;
      history.push({ n: n, estimate: estimate });
      if (history.length > 400) history.shift();

      chartGeom = drawChartBase();
      plotHistoryLine();

      nEl.textContent = n.toString();
      estEl.textContent = estimate.toFixed(4);
      errEl.textContent = n > 0 ? Math.abs(estimate - Math.PI).toFixed(4) : '—';

      if (n >= maxPoints) {
        running = false;
        toggleBtn.textContent = 'Start';
      }
    }

    function loop() {
      if (running) {
        step();
      }
      raf = requestAnimationFrame(loop);
    }

    toggleBtn.addEventListener('click', function () {
      running = !running;
      toggleBtn.textContent = running ? 'Pause' : 'Start';
    });

    resetBtn.addEventListener('click', function () {
      reset();
      running = true;
      toggleBtn.textContent = 'Pause';
    });

    drawBoardBase();
    raf = requestAnimationFrame(loop);
  }

  function unmount(container) {
    if (raf) cancelAnimationFrame(raf);
    container.innerHTML = '';
  }

  function injectStyles() {
    if (document.getElementById('pi-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'pi-widget-styles';
    style.textContent =
      '.pi-widget-row{display:flex;gap:16px;flex-wrap:wrap;}' +
      '.pi-board,.pi-chart{max-width:100%;height:auto;border:1px solid var(--rule);background:var(--paper);}' +
      '.pi-stats{display:flex;gap:18px;margin-top:12px;font-family:var(--font-mono);font-size:13px;color:var(--ink-soft);flex-wrap:wrap;}' +
      '.pi-stats strong{color:var(--ink);}' +
      '.pi-controls{margin-top:12px;display:flex;gap:8px;}' +
      '.pi-controls button{font-family:var(--font-mono);font-size:12px;padding:6px 12px;border:1px solid var(--rule);background:var(--paper-raise);color:var(--ink);cursor:pointer;}' +
      '.pi-controls button:hover{border-color:var(--plot);color:var(--plot);}';
    document.head.appendChild(style);
  }

  return { mount: mount, unmount: unmount };
})();
