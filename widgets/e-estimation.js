/* widgets/e-estimation.js
 *
 * Estimates e using the series e = sum_{k=0}^{n} 1/k!. A slider picks
 * how many terms to keep; the graph plots each partial sum against a
 * dashed line at the true value of e, so the shrinking gap is visible
 * rather than just read as a number.
 */
window.Widgets = window.Widgets || {};

window.Widgets['e-estimation'] = (function () {
  var MAX_TERMS = 15;

  function mount(container) {
   try {
    var W = 420, H = 280;
    var PAD = { l: 46, r: 16, t: 16, b: 30 };

    var styles = getComputedStyle(document.documentElement);
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var inkSoft = (styles.getPropertyValue('--ink-soft') || '#4A5A4F').trim();
    var plot = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var live = (styles.getPropertyValue('--live') || '#B5542E').trim();
    var rule = (styles.getPropertyValue('--rule') || '#B9C2AF').trim();
    var paper = (styles.getPropertyValue('--paper') || '#E9EDE4').trim();

    container.innerHTML =
      '<div class="ee-widget">' +
        '<canvas class="ee-canvas" width="' + W + '" height="' + H + '"></canvas>' +
        '<div class="ee-formula" id="ee-formula"></div>' +
        '<div class="ee-stats">' +
          '<span>terms <strong id="ee-n">1</strong></span>' +
          '<span>estimate <strong id="ee-est">—</strong></span>' +
          '<span>error <strong id="ee-err">—</strong></span>' +
        '</div>' +
        '<input type="range" id="ee-slider" min="1" max="' + MAX_TERMS + '" value="1" step="1">' +
      '</div>';

    injectStyles();

    var canvas = container.querySelector('.ee-canvas');
    var ctx = canvas.getContext('2d');
    var slider = container.querySelector('#ee-slider');
    var formulaEl = container.querySelector('#ee-formula');
    var nEl = container.querySelector('#ee-n');
    var estEl = container.querySelector('#ee-est');
    var errEl = container.querySelector('#ee-err');

    var TRUE_E = Math.E;

    function factorial(k) {
      var r = 1;
      for (var i = 2; i <= k; i++) r *= i;
      return r;
    }

    function partialSum(n) {
      var s = 0;
      for (var k = 0; k <= n; k++) s += 1 / factorial(k);
      return s;
    }

    // y-range chosen so the climb from 1 -> ~2.5 -> e is visible without
    // the line hugging the top of the chart
    var yMin = 0.8, yMax = 3.0;

    function xAt(step) { return PAD.l + (step / MAX_TERMS) * (W - PAD.l - PAD.r); }
    function yAt(val) { return PAD.t + (1 - (val - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b); }

    function draw(n) {
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = rule;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      // axes
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.l, PAD.t);
      ctx.lineTo(PAD.l, H - PAD.b);
      ctx.lineTo(W - PAD.r, H - PAD.b);
      ctx.stroke();

      // y-axis ticks
      ctx.fillStyle = inkSoft;
      ctx.font = '10px monospace';
      [1, 1.5, 2, 2.5, 3].forEach(function (v) {
        var y = yAt(v);
        ctx.strokeStyle = rule;
        ctx.beginPath();
        ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y);
        ctx.stroke();
        ctx.fillText(v.toFixed(1), 8, y + 3);
      });

      // true e reference line
      ctx.strokeStyle = live;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD.l, yAt(TRUE_E));
      ctx.lineTo(W - PAD.r, yAt(TRUE_E));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = live;
      ctx.fillText('e = 2.71828…', W - PAD.r - 92, yAt(TRUE_E) - 6);

      // partial sums
      ctx.strokeStyle = plot;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var k = 0; k <= n; k++) {
        var x = xAt(k), y = yAt(partialSum(k));
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = plot;
      for (k = 0; k <= n; k++) {
        var px = xAt(k), py = yAt(partialSum(k));
        ctx.beginPath();
        ctx.arc(px, py, k === n ? 4 : 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = inkSoft;
      ctx.fillText('terms used', W - PAD.r - 58, H - 8);
    }

    function render() {
      var n = parseInt(slider.value, 10);
      var est = partialSum(n);
      nEl.textContent = n + 1; // k = 0..n is n+1 terms
      estEl.textContent = est.toFixed(6);
      errEl.textContent = Math.abs(TRUE_E - est).toExponential(2);

      var parts = [];
      for (var k = 0; k <= n; k++) parts.push('1/' + k + '!');
      formulaEl.textContent = 'e \u2248 ' + parts.join(' + ');

      draw(n);
    }

    slider.addEventListener('input', render);
    render();
   } catch (err) {
     console.error('e-estimation widget error:', err);
     container.innerHTML = '<p style="font-family:monospace;font-size:12px;color:var(--live);">Widget error — check the browser console for details.</p>';
   }
  }

  function unmount(container) {
    container.innerHTML = '';
  }

  function injectStyles() {
    if (document.getElementById('ee-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'ee-widget-styles';
    style.textContent =
      '.ee-canvas{display:block;max-width:100%;height:auto;border:1px solid var(--rule);background:var(--paper);}' +
      '.ee-formula{font-family:var(--font-mono);font-size:12px;color:var(--ink);margin-top:10px;overflow-x:auto;white-space:nowrap;}' +
      '.ee-stats{display:flex;gap:18px;margin-top:8px;font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);flex-wrap:wrap;}' +
      '.ee-stats strong{color:var(--ink);}' +
      '.ee-widget input[type=range]{width:100%;margin-top:12px;accent-color:var(--plot);}';
    document.head.appendChild(style);
  }

  return { mount: mount, unmount: unmount };
})();
