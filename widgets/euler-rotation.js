/* widgets/euler-rotation.js
 *
 * Plots e^(i*theta) as a point on the unit circle, with dashed
 * projection lines onto the real and imaginary axes showing cos(theta)
 * and sin(theta) directly. A slider controls theta by hand; a Play
 * button animates it continuously. Landing near theta = pi is called
 * out specially, since that's the angle Euler's identity is about.
 */
window.Widgets = window.Widgets || {};

window.Widgets['euler-rotation'] = (function () {
  var raf = null;

  function mount(container) {
   try {
    var W = 320, H = 320;
    var R = 110; // circle radius in px
    var cx = W / 2, cy = H / 2;

    var styles = getComputedStyle(document.documentElement);
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var inkSoft = (styles.getPropertyValue('--ink-soft') || '#4A5A4F').trim();
    var plot = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var live = (styles.getPropertyValue('--live') || '#B5542E').trim();
    var rule = (styles.getPropertyValue('--rule') || '#B9C2AF').trim();
    var paper = (styles.getPropertyValue('--paper') || '#E9EDE4').trim();

    container.innerHTML =
      '<div class="eul-widget">' +
        '<canvas class="eul-canvas" width="' + W + '" height="' + H + '"></canvas>' +
        '<div class="eul-readout">' +
          '<span>&theta; = <strong id="eul-theta">0.000</strong> rad (<strong id="eul-deg">0.0</strong>&deg;)</span>' +
          '<span>cos&theta; = <strong id="eul-cos">1.000</strong></span>' +
          '<span>sin&theta; = <strong id="eul-sin">0.000</strong></span>' +
        '</div>' +
        '<div class="eul-special" id="eul-special"></div>' +
        '<div class="eul-controls">' +
          '<input type="range" id="eul-slider" min="0" max="6.2832" step="0.005" value="0">' +
          '<button type="button" id="eul-play">Play</button>' +
          '<button type="button" id="eul-snap">Jump to &theta; = &pi;</button>' +
        '</div>' +
      '</div>';

    injectStyles();

    var canvas = container.querySelector('.eul-canvas');
    var ctx = canvas.getContext('2d');
    var slider = container.querySelector('#eul-slider');
    var playBtn = container.querySelector('#eul-play');
    var snapBtn = container.querySelector('#eul-snap');
    var thetaEl = container.querySelector('#eul-theta');
    var degEl = container.querySelector('#eul-deg');
    var cosEl = container.querySelector('#eul-cos');
    var sinEl = container.querySelector('#eul-sin');
    var specialEl = container.querySelector('#eul-special');

    var playing = false;
    var SPEED = 0.012; // radians per frame

    function toPx(re, im) {
      return [cx + re * R, cy - im * R];
    }

    function draw(theta) {
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);

      // axes
      ctx.strokeStyle = rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(W, cy);
      ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
      ctx.stroke();

      // unit circle
      ctx.strokeStyle = plot;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      var re = Math.cos(theta), im = Math.sin(theta);
      var p = toPx(re, im);
      var origin = toPx(0, 0);
      var onReal = toPx(re, 0);
      var onImag = toPx(0, im);

      // projection lines (dashed)
      ctx.strokeStyle = inkSoft;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]); ctx.lineTo(onReal[0], onReal[1]);
      ctx.moveTo(p[0], p[1]); ctx.lineTo(onImag[0], onImag[1]);
      ctx.stroke();
      ctx.setLineDash([]);

      // radius line (the "hand")
      ctx.strokeStyle = live;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(origin[0], origin[1]);
      ctx.lineTo(p[0], p[1]);
      ctx.stroke();

      // point marker
      ctx.fillStyle = live;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
      ctx.fill();

      // axis labels
      ctx.fillStyle = inkSoft;
      ctx.font = '11px monospace';
      ctx.fillText('1', toPx(1, 0)[0] + 4, cy - 4);
      ctx.fillText('-1', toPx(-1, 0)[0] - 18, cy - 4);
      ctx.fillText('i', cx + 4, toPx(0, 1)[1] + 4);
      ctx.fillText('-i', cx + 4, toPx(0, -1)[1] - 2);

      // label the moving point
      ctx.fillStyle = ink;
      ctx.font = '11px monospace';
      ctx.fillText('e^(i\u03B8)', p[0] + 8, p[1] - 8);
    }

    function render() {
      var theta = parseFloat(slider.value);
      draw(theta);

      thetaEl.textContent = theta.toFixed(3);
      degEl.textContent = (theta * 180 / Math.PI).toFixed(1);
      cosEl.textContent = Math.cos(theta).toFixed(3);
      sinEl.textContent = Math.sin(theta).toFixed(3);

      var distToPi = Math.abs(((theta - Math.PI + Math.PI) % (2 * Math.PI)) - Math.PI);
      if (Math.abs(theta - Math.PI) < 0.03) {
        specialEl.textContent = '\u03B8 \u2248 \u03C0  \u2192  e^(i\u03C0) = \u22121';
        specialEl.className = 'eul-special eul-special--hit';
      } else {
        specialEl.textContent = '';
        specialEl.className = 'eul-special';
      }
    }

    function loop() {
      if (playing) {
        var next = parseFloat(slider.value) + SPEED;
        if (next > 2 * Math.PI) next -= 2 * Math.PI;
        slider.value = next;
        render();
      }
      raf = requestAnimationFrame(loop);
    }

    slider.addEventListener('input', function () {
      playing = false;
      playBtn.textContent = 'Play';
      render();
    });

    playBtn.addEventListener('click', function () {
      playing = !playing;
      playBtn.textContent = playing ? 'Pause' : 'Play';
    });

    snapBtn.addEventListener('click', function () {
      playing = false;
      playBtn.textContent = 'Play';
      slider.value = Math.PI;
      render();
    });

    render();
    raf = requestAnimationFrame(loop);
   } catch (err) {
     console.error('euler-rotation widget error:', err);
     container.innerHTML = '<p style="font-family:monospace;font-size:12px;color:var(--live);">Widget error — check the browser console for details.</p>';
   }
  }

  function unmount(container) {
    if (raf) cancelAnimationFrame(raf);
    container.innerHTML = '';
  }

  function injectStyles() {
    if (document.getElementById('eul-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'eul-widget-styles';
    style.textContent =
      '.eul-canvas{display:block;max-width:100%;height:auto;border:1px solid var(--rule);background:var(--paper);}' +
      '.eul-readout{display:flex;gap:16px;margin-top:12px;font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);flex-wrap:wrap;}' +
      '.eul-readout strong{color:var(--ink);}' +
      '.eul-special{font-family:var(--font-mono);font-size:13px;min-height:18px;margin-top:8px;color:var(--ink-soft);}' +
      '.eul-special--hit{color:var(--live);font-weight:600;}' +
      '.eul-controls{margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}' +
      '.eul-controls input[type=range]{flex:1;min-width:140px;accent-color:var(--plot);}' +
      '.eul-controls button{font-family:var(--font-mono);font-size:12px;padding:6px 12px;border:1px solid var(--rule);background:var(--paper-raise);color:var(--ink);cursor:pointer;}' +
      '.eul-controls button:hover{border-color:var(--plot);color:var(--plot);}';
    document.head.appendChild(style);
  }

  return { mount: mount, unmount: unmount };
})();
