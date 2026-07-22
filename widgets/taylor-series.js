/* widgets/taylor-series.js
 *
 * Plots a target function alongside its Maclaurin (Taylor-at-0) series
 * truncated to N terms, with a slider for N. The gap between the two
 * curves is shaded so the shrinking error is something you can see,
 * not just read as a number.
 */
window.Widgets = window.Widgets || {};

window.Widgets['taylor-series'] = (function () {
  var FUNCS = {
    sin: {
      label: 'sin(x)',
      domain: [-2 * Math.PI, 2 * Math.PI],
      yRange: [-1.8, 1.8],
      trueFn: Math.sin,
      maxTerms: 12,
      // term k (k = 0..N-1) contributes the (2k+1)-th power, sign alternates
      termPower: function (k) { return 2 * k + 1; },
      termCoeff: function (k) { return (k % 2 === 0 ? 1 : -1) / factorial(2 * k + 1); }
    },
    cos: {
      label: 'cos(x)',
      domain: [-2 * Math.PI, 2 * Math.PI],
      yRange: [-1.8, 1.8],
      trueFn: Math.cos,
      maxTerms: 12,
      termPower: function (k) { return 2 * k; },
      termCoeff: function (k) { return (k % 2 === 0 ? 1 : -1) / factorial(2 * k); }
    },
    exp: {
      label: 'eˣ',
      domain: [-3, 3],
      yRange: [-2, 22],
      trueFn: Math.exp,
      maxTerms: 15,
      termPower: function (k) { return k; },
      termCoeff: function (k) { return 1 / factorial(k); }
    }
  };

  function factorial(n) {
    var r = 1;
    for (var i = 2; i <= n; i++) r *= i;
    return r;
  }

  var SUP = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹' };
  function sup(n) {
    return String(n).split('').map(function (d) { return SUP[d]; }).join('');
  }

  function mount(container) {
    var W = 520, H = 320;
    var PAD = { l: 34, r: 14, t: 14, b: 26 };

    var styles = getComputedStyle(document.documentElement);
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var inkSoft = (styles.getPropertyValue('--ink-soft') || '#4A5A4F').trim();
    var plot = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var live = (styles.getPropertyValue('--live') || '#B5542E').trim();
    var rule = (styles.getPropertyValue('--rule') || '#B9C2AF').trim();
    var paper = (styles.getPropertyValue('--paper') || '#E9EDE4').trim();

    container.innerHTML =
      '<div class="tay-widget">' +
        '<div class="tay-toprow">' +
          '<label class="tay-field">function' +
            '<select id="tay-fn">' +
              '<option value="sin">sin(x)</option>' +
              '<option value="cos">cos(x)</option>' +
              '<option value="exp">eˣ</option>' +
            '</select>' +
          '</label>' +
          '<label class="tay-field">terms: <span id="tay-n-label">1</span>' +
            '<input type="range" id="tay-n" min="1" max="12" value="1" step="1">' +
          '</label>' +
        '</div>' +
        '<canvas class="tay-canvas" width="' + W + '" height="' + H + '"></canvas>' +
        '<div class="tay-formula" id="tay-formula"></div>' +
        '<div class="tay-stats">' +
          '<span>max error on screen: <strong id="tay-err">—</strong></span>' +
        '</div>' +
      '</div>';

    injectStyles();

    var canvas = container.querySelector('.tay-canvas');
    var ctx = canvas.getContext('2d');
    var fnSelect = container.querySelector('#tay-fn');
    var slider = container.querySelector('#tay-n');
    var nLabel = container.querySelector('#tay-n-label');
    var formulaEl = container.querySelector('#tay-formula');
    var errEl = container.querySelector('#tay-err');

    function toPx(x, y, domain, yRange) {
      var px = PAD.l + ((x - domain[0]) / (domain[1] - domain[0])) * (W - PAD.l - PAD.r);
      var py = PAD.t + (1 - (y - yRange[0]) / (yRange[1] - yRange[0])) * (H - PAD.t - PAD.b);
      return [px, py];
    }

    function approx(cfg, terms, x) {
      var sum = 0;
      for (var k = 0; k < terms; k++) {
        sum += cfg.termCoeff(k) * Math.pow(x, cfg.termPower(k));
      }
      return sum;
    }

    function buildFormula(cfg, terms) {
      var parts = [];
      for (var k = 0; k < terms; k++) {
        var power = cfg.termPower(k);
        var coeff = cfg.termCoeff(k);
        var sign = coeff < 0 ? '−' : (k === 0 ? '' : '+');
        var mag = Math.abs(coeff);
        var termStr;
        if (power === 0) {
          termStr = (mag === 1 ? '1' : mag.toFixed(3));
        } else {
          var xPart = power === 1 ? 'x' : 'x' + sup(power);
          termStr = xPart + '/' + power + '!';
        }
        parts.push((k === 0 ? sign : ' ' + sign + ' ') + termStr);
      }
      return 'P(x) = ' + parts.join('');
    }

    function draw() {
      var cfg = FUNCS[fnSelect.value];
      var terms = parseInt(slider.value, 10);
      var domain = cfg.domain, yRange = cfg.yRange;

      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);

      // grid + axes
      ctx.strokeStyle = rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var zero = toPx(0, yRange[0], domain, yRange);
      var zeroTop = toPx(0, yRange[1], domain, yRange);
      ctx.moveTo(zero[0], zeroTop[1]); ctx.lineTo(zero[0], zero[1]);
      var xAxisY = toPx(domain[0], 0, domain, yRange)[1];
      ctx.moveTo(PAD.l, xAxisY); ctx.lineTo(W - PAD.r, xAxisY);
      ctx.strokeStyle = inkSoft;
      ctx.stroke();

      ctx.strokeStyle = rule;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      // true function curve
      ctx.beginPath();
      ctx.strokeStyle = live;
      ctx.lineWidth = 2;
      var steps = 300;
      var maxErr = 0;
      var trueMax = -Infinity, trueMin = Infinity;
      for (var i = 0; i <= steps; i++) {
        var x = domain[0] + (i / steps) * (domain[1] - domain[0]);
        var y = cfg.trueFn(x);
        var pt = toPx(x, clamp(y, yRange), domain, yRange);
        if (i === 0) ctx.moveTo(pt[0], pt[1]); else ctx.lineTo(pt[0], pt[1]);
      }
      ctx.stroke();

      // approximation curve + shaded error region
      var truePts = [], approxPts = [];
      for (i = 0; i <= steps; i++) {
        x = domain[0] + (i / steps) * (domain[1] - domain[0]);
        var ty = cfg.trueFn(x);
        var ay = approx(cfg, terms, x);
        maxErr = Math.max(maxErr, Math.abs(ty - ay));
        truePts.push(toPx(x, clamp(ty, yRange), domain, yRange));
        approxPts.push(toPx(x, clamp(ay, yRange), domain, yRange));
      }

      ctx.beginPath();
      ctx.fillStyle = live;
      ctx.globalAlpha = 0.12;
      truePts.forEach(function (p, i2) {
        if (i2 === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      });
      for (i2 = approxPts.length - 1; i2 >= 0; i2--) ctx.lineTo(approxPts[i2][0], approxPts[i2][1]);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.strokeStyle = plot;
      ctx.lineWidth = 2;
      approxPts.forEach(function (p, i2) {
        if (i2 === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      });
      ctx.stroke();

      // legend
      ctx.font = '11px monospace';
      ctx.fillStyle = live; ctx.fillRect(PAD.l, 6, 10, 3);
      ctx.fillStyle = ink; ctx.fillText('true function', PAD.l + 16, 12);
      ctx.fillStyle = plot; ctx.fillRect(PAD.l + 120, 6, 10, 3);
      ctx.fillStyle = ink; ctx.fillText('Taylor approx.', PAD.l + 136, 12);

      formulaEl.textContent = buildFormula(cfg, terms);
      errEl.textContent = maxErr.toExponential(2);
    }

    function clamp(y, yRange) {
      return Math.max(yRange[0] - 1, Math.min(yRange[1] + 1, y));
    }

    function syncSliderBounds() {
      var cfg = FUNCS[fnSelect.value];
      slider.max = cfg.maxTerms;
      if (parseInt(slider.value, 10) > cfg.maxTerms) slider.value = cfg.maxTerms;
      nLabel.textContent = slider.value;
    }

    fnSelect.addEventListener('change', function () {
      syncSliderBounds();
      draw();
    });

    slider.addEventListener('input', function () {
      nLabel.textContent = slider.value;
      draw();
    });

    syncSliderBounds();
    draw();
  }

  function unmount(container) {
    container.innerHTML = '';
  }

  function injectStyles() {
    if (document.getElementById('tay-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'tay-widget-styles';
    style.textContent =
      '.tay-toprow{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:12px;}' +
      '.tay-field{font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);display:flex;flex-direction:column;gap:4px;}' +
      '.tay-field select{font-family:var(--font-mono);font-size:13px;padding:5px 8px;border:1px solid var(--rule);background:var(--paper-raise);color:var(--ink);}' +
      '.tay-field input[type=range]{width:180px;accent-color:var(--plot);}' +
      '.tay-canvas{display:block;max-width:100%;height:auto;border:1px solid var(--rule);background:var(--paper);}' +
      '.tay-formula{font-family:var(--font-mono);font-size:13px;color:var(--ink);margin-top:10px;overflow-x:auto;white-space:nowrap;}' +
      '.tay-stats{font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);margin-top:8px;}' +
      '.tay-stats strong{color:var(--ink);}';
    document.head.appendChild(style);
  }

  return { mount: mount, unmount: unmount };
})();
