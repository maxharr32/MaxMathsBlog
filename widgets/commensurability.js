/* widgets/commensurability.js
 *
 * The Greeks treated a "number" as a ratio between two lengths, found
 * by repeated measuring: lay the shorter length into the longer as
 * many times as it fits, take the leftover, and repeat with that
 * leftover against the previous shorter length (this process is
 * called anthyphairesis, and it's exactly Euclid's algorithm run on
 * lengths instead of integers). If the process ever hits a leftover
 * of zero, the two lengths share a common unit — they're
 * commensurable. If it never terminates, no common unit exists: the
 * ratio is what we'd now call irrational.
 */
window.Widgets = window.Widgets || {};

window.Widgets['commensurability'] = (function () {
  var autoTimer = null;

  function mount(container) {
   try {
    var W = 420, H = 150;
    var MAX_LEN = 260, MIN_LEN = 24;
    var MAX_STEPS = 14;
    var TOL = 0.4; // px — below this a remainder counts as "zero"

    var styles = getComputedStyle(document.documentElement);
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var inkSoft = (styles.getPropertyValue('--ink-soft') || '#4A5A4F').trim();
    var plot = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var live = (styles.getPropertyValue('--live') || '#B5542E').trim();
    var rule = (styles.getPropertyValue('--rule') || '#B9C2AF').trim();
    var paper = (styles.getPropertyValue('--paper') || '#E9EDE4').trim();

    container.innerHTML =
      '<div class="com-widget">' +
        '<canvas class="com-canvas" width="' + W + '" height="' + H + '"></canvas>' +
        '<div class="com-controls">' +
          '<label class="com-field">length B' +
            '<input type="range" id="com-slider" min="' + MIN_LEN + '" max="' + MAX_LEN + '" step="0.5" value="173">' +
          '</label>' +
          '<span class="com-ratio" id="com-ratio">A : B = 1.500</span>' +
        '</div>' +
        '<div class="com-presets">' +
          '<button type="button" data-preset="3:2">set B so A:B = 3:2</button>' +
          '<button type="button" data-preset="sqrt2">set B = A / \u221A2 (diagonal:side)</button>' +
          '<button type="button" data-preset="phi">set B = A / \u03C6 (golden ratio)</button>' +
        '</div>' +
        '<div class="com-test">' +
          '<div class="com-test-controls">' +
            '<button type="button" id="com-start">Start measuring</button>' +
            '<button type="button" id="com-step" disabled>Step</button>' +
            '<button type="button" id="com-auto" disabled>Auto</button>' +
          '</div>' +
          '<div class="com-verdict" id="com-verdict"></div>' +
          '<div class="com-log" id="com-log"></div>' +
        '</div>' +
      '</div>';

    injectStyles();

    var canvas = container.querySelector('.com-canvas');
    var ctx = canvas.getContext('2d');
    var slider = container.querySelector('#com-slider');
    var ratioEl = container.querySelector('#com-ratio');
    var startBtn = container.querySelector('#com-start');
    var stepBtn = container.querySelector('#com-step');
    var autoBtn = container.querySelector('#com-auto');
    var verdictEl = container.querySelector('#com-verdict');
    var logEl = container.querySelector('#com-log');

    var lenA = MAX_LEN;
    var lenB = parseFloat(slider.value);

    // anthyphairesis test state
    var testActive = false;
    var p = 0, q = 0, step = 0;

    function drawLines() {
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = rule;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      var left = 20;

      function bar(y, len, color, label) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(left + len, y);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(left, y, 4, 0, Math.PI * 2);
        ctx.arc(left + len, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = ink;
        ctx.font = '12px monospace';
        ctx.fillText(label, left, y - 12);
      }

      bar(40, lenA, plot, 'A');
      bar(90, lenB, live, 'B (drag the end, or use the slider)');
    }

    function fractionApprox(x) {
      for (var q2 = 1; q2 <= 12; q2++) {
        for (var p2 = 1; p2 <= 12; p2++) {
          if (Math.abs(x - p2 / q2) < 0.004) return p2 + ':' + q2;
        }
      }
      return null;
    }

    function updateRatio() {
      var r = lenA / lenB;
      var approx = fractionApprox(r);
      ratioEl.textContent = 'A : B = ' + r.toFixed(4) + (approx ? '  (\u2248 ' + approx + ')' : '');
    }

    function render() {
      drawLines();
      updateRatio();
    }

    // --- dragging B's right handle directly on the canvas ---
    var dragging = false;
    function canvasX(evt) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = W / rect.width;
      var clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      return (clientX - rect.left) * scaleX;
    }

    canvas.addEventListener('pointerdown', function (evt) {
      var x = canvasX(evt);
      if (Math.abs(x - (20 + lenB)) < 14) dragging = true;
    });
    window.addEventListener('pointermove', function (evt) {
      if (!dragging) return;
      var x = canvasX(evt);
      lenB = Math.max(MIN_LEN, Math.min(MAX_LEN, x - 20));
      slider.value = lenB;
      render();
    });
    window.addEventListener('pointerup', function () { dragging = false; });

    slider.addEventListener('input', function () {
      lenB = parseFloat(slider.value);
      render();
    });

    container.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.getAttribute('data-preset');
        if (kind === '3:2') lenB = lenA * (2 / 3);
        if (kind === 'sqrt2') lenB = lenA / Math.SQRT2;
        if (kind === 'phi') lenB = lenA / ((1 + Math.sqrt(5)) / 2);
        lenB = Math.max(MIN_LEN, Math.min(MAX_LEN, lenB));
        slider.value = lenB;
        render();
        resetTest();
      });
    });

    // --- anthyphairesis (repeated measuring) test ---
    function resetTest() {
      stopAuto();
      testActive = false;
      step = 0;
      logEl.innerHTML = '';
      verdictEl.textContent = '';
      verdictEl.className = 'com-verdict';
      stepBtn.disabled = true;
      autoBtn.disabled = true;
      autoBtn.textContent = 'Auto';
      startBtn.textContent = 'Start measuring';
    }

    function logLine(text) {
      var line = document.createElement('div');
      line.textContent = text;
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
    }

    function startTest() {
      testActive = true;
      p = Math.max(lenA, lenB);
      q = Math.min(lenA, lenB);
      step = 0;
      logEl.innerHTML = '';
      verdictEl.textContent = '';
      verdictEl.className = 'com-verdict';
      logLine('start: longer = ' + p.toFixed(1) + ', shorter = ' + q.toFixed(1));
      stepBtn.disabled = false;
      autoBtn.disabled = false;
      startBtn.textContent = 'Restart with current A, B';
    }

    function doStep() {
      if (!testActive || q <= TOL || step >= MAX_STEPS) return;
      var k = Math.floor(p / q);
      var r = p - k * q;
      step++;
      logLine('step ' + step + ': ' + p.toFixed(1) + ' fits ' + k + '\u00D7 into ' + q.toFixed(1) + ' logic swap \u2014 remainder ' + r.toFixed(2));
      p = q; q = r;

      if (q <= TOL) {
        verdictEl.textContent = 'Common measure found after ' + step + ' step' + (step === 1 ? '' : 's') + ' \u2014 A and B are commensurable.';
        verdictEl.className = 'com-verdict com-verdict--yes';
        stopAuto();
        stepBtn.disabled = true;
        autoBtn.disabled = true;
      } else if (step >= MAX_STEPS) {
        verdictEl.textContent = 'No common measure found in ' + MAX_STEPS + ' steps \u2014 the process shows no sign of stopping. A and B look incommensurable.';
        verdictEl.className = 'com-verdict com-verdict--no';
        stopAuto();
        stepBtn.disabled = true;
        autoBtn.disabled = true;
      }
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      autoBtn.textContent = 'Auto';
    }

    startBtn.addEventListener('click', function () {
      resetTest();
      startTest();
    });

    stepBtn.addEventListener('click', doStep);

    autoBtn.addEventListener('click', function () {
      if (autoTimer) { stopAuto(); return; }
      autoBtn.textContent = 'Pause';
      autoTimer = setInterval(function () {
        doStep();
        if (stepBtn.disabled) stopAuto();
      }, 550);
    });

    render();
   } catch (err) {
     console.error('commensurability widget error:', err);
     container.innerHTML = '<p style="font-family:monospace;font-size:12px;color:var(--live);">Widget error — check the browser console for details.</p>';
   }
  }

  function unmount(container) {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    container.innerHTML = '';
  }

  function injectStyles() {
    if (document.getElementById('com-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'com-widget-styles';
    style.textContent =
      '.com-canvas{display:block;max-width:100%;height:auto;border:1px solid var(--rule);cursor:default;touch-action:none;}' +
      '.com-controls{display:flex;align-items:center;gap:16px;margin-top:12px;flex-wrap:wrap;}' +
      '.com-field{font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);display:flex;flex-direction:column;gap:4px;}' +
      '.com-field input{width:180px;accent-color:var(--live);}' +
      '.com-ratio{font-family:var(--font-mono);font-size:13px;color:var(--ink);}' +
      '.com-presets{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}' +
      '.com-presets button,.com-test-controls button{font-family:var(--font-mono);font-size:11px;padding:6px 10px;border:1px solid var(--rule);background:var(--paper-raise);color:var(--ink);cursor:pointer;}' +
      '.com-presets button:hover,.com-test-controls button:hover{border-color:var(--plot);color:var(--plot);}' +
      '.com-test{margin-top:16px;border-top:1px dashed var(--rule);padding-top:14px;}' +
      '.com-test-controls{display:flex;gap:8px;}' +
      '.com-test-controls button:disabled{opacity:0.4;cursor:default;}' +
      '.com-verdict{font-family:var(--font-mono);font-size:12px;margin-top:10px;min-height:16px;}' +
      '.com-verdict--yes{color:var(--plot);font-weight:600;}' +
      '.com-verdict--no{color:var(--live);font-weight:600;}' +
      '.com-log{font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);margin-top:8px;max-height:110px;overflow-y:auto;border:1px solid var(--rule);background:var(--paper-raise);padding:8px 10px;}' +
      '.com-log div{margin-bottom:3px;}';
    document.head.appendChild(style);
  }

  return { mount: mount, unmount: unmount };
})();
