window.Widgets = window.Widgets || {};
 
window.Widgets['mandelbrot'] = (function () {
  var timer = null;
  var buildTimer = null;
 
  function mount(container) {
    var W = 420, H = 300;
    var RE_MIN = -2.5, RE_MAX = 1, IM_MIN = -1.25, IM_MAX = 1.25;
    var MAX_ITER = 80;
    var ORBIT_STEPS = 60;
    var ESCAPE_R = 2;
    var ROWS_PER_CHUNK = 15;
 
    var styles = getComputedStyle(document.documentElement);
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var inkSoft = (styles.getPropertyValue('--ink-soft') || '#4A5A4F').trim();
    var plot = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var live = (styles.getPropertyValue('--live') || '#B5542E').trim();
    var rule = (styles.getPropertyValue('--rule') || '#B9C2AF').trim();
    var paper = (styles.getPropertyValue('--paper') || '#E9EDE4').trim();
 
    container.innerHTML =
      '<div class="mbo-widget">' +
        '<canvas class="mbo-canvas" width="' + W + '" height="' + H + '"></canvas>' +
        '<div class="mbo-readout">' +
          '<span>c = <strong id="mbo-c">click the plane</strong></span>' +
          '<span>step <strong id="mbo-n">—</strong></span>' +
          '<span>|z| <strong id="mbo-mag">—</strong></span>' +
          '<span id="mbo-status" class="mbo-status">—</span>' +
        '</div>' +
        '<div class="mbo-controls">' +
          '<span class="mbo-hint">click anywhere on the plane to trace an orbit</span>' +
          '<button type="button" id="mbo-clear">Clear orbit</button>' +
        '</div>' +
      '</div>';
 
    injectStyles();
 
    var canvas = container.querySelector('.mbo-canvas');
    var ctx = canvas.getContext('2d');
    var cEl = container.querySelector('#mbo-c');
    var nEl = container.querySelector('#mbo-n');
    var magEl = container.querySelector('#mbo-mag');
    var statusEl = container.querySelector('#mbo-status');
    var clearBtn = container.querySelector('#mbo-clear');
 
    function hexToRgb(hex) {
      var v = parseInt(hex.replace('#', ''), 16);
      return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
    }
 
    function cssColorToHex(color) {
      if (color[0] === '#') return color;
      var probe = document.createElement('div');
      probe.style.color = color;
      document.body.appendChild(probe);
      var rgb = getComputedStyle(probe).color.match(/[\d.]+/g);
      document.body.removeChild(probe);
      return '#' + rgb.slice(0, 3).map(function (x) {
        return ('0' + Math.round(parseFloat(x)).toString(16)).slice(-2);
      }).join('');
    }
    
        // multi-stop gradient: paper (slow escape, near the boundary) through
    // the site's plot/data/live accents to near-black (very fast escape)
    var gradientStops = [
      paperRgb,
      hexToRgb(cssColorToHex(plot)),
      hexToRgb(cssColorToHex(live)),
      { r: 20, g: 20, b: 20 }
    ];

    function gradientColor(t) {
      var n = gradientStops.length - 1;
      var scaled = t * n;
      var i = Math.min(n - 1, Math.floor(scaled));
      var frac = scaled - i;
      var a = gradientStops[i], b = gradientStops[i + 1];
      return {
        r: a.r + (b.r - a.r) * frac,
        g: a.g + (b.g - a.g) * frac,
        b: a.b + (b.b - a.b) * frac
      };
    }

    function showError(err) {
      console.error('mandelbrot-orbit widget error:', err);
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = rule;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
      ctx.fillStyle = live;
      ctx.font = '12px monospace';
      ctx.fillText('Widget error — check the browser console', 10, H / 2);
    }
 
    try {
      var plotRgb = hexToRgb(cssColorToHex(plot));
      var liveRgb = hexToRgb(cssColorToHex(live));
      var paperRgb = hexToRgb(cssColorToHex(paper));
 
      function toComplex(px, py) {
        return {
          re: RE_MIN + (px / W) * (RE_MAX - RE_MIN),
          im: IM_MAX - (py / H) * (IM_MAX - IM_MIN)
        };
      }
 
      function toCanvas(re, im) {
        return [
          ((re - RE_MIN) / (RE_MAX - RE_MIN)) * W,
          ((IM_MAX - im) / (IM_MAX - IM_MIN)) * H
        ];
      }
 
      var bgImageData = null;
 
      function drawProgress(frac) {
        ctx.fillStyle = paper;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = rule;
        ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
        ctx.fillStyle = inkSoft;
        ctx.font = '12px monospace';
        ctx.fillText('rendering… ' + Math.round(frac * 100) + '%', W / 2 - 46, H / 2);
      }
 
      function buildBackgroundChunked(onDone) {
        var img = ctx.createImageData(W, H);
        var data = img.data;
        var row = 0;
 
        function processChunk() {
          try {
            var end = Math.min(H, row + ROWS_PER_CHUNK);
            for (; row < end; row++) {
              var im0 = IM_MAX - (row / H) * (IM_MAX - IM_MIN);
              for (var px = 0; px < W; px++) {
                var re0 = RE_MIN + (px / W) * (RE_MAX - RE_MIN);
                var zr = 0, zi = 0, iter = 0;
                while (zr * zr + zi * zi <= 4 && iter < MAX_ITER) {
                  var nzr = zr * zr - zi * zi + re0;
                  var nzi = 2 * zr * zi + im0;
                  zr = nzr; zi = nzi;
                  iter++;
                }
                var idx = (row * W + px) * 4;
                if (iter === MAX_ITER) {
                  data[idx] = plotRgb.r; data[idx + 1] = plotRgb.g; data[idx + 2] = plotRgb.b;
                  data[idx + 3] = 220;
                } else {

                  var logZn = Math.log(zr * zr + zi * zi) / 2;
                  var nu = Math.log(logZn / Math.log(2)) / Math.log(2);
                  var smoothIter = iter + 1 - nu;
                  var t = Math.max(0, Math.min(1, smoothIter / MAX_ITER));

                  var col = gradientColor(t);
                  data[idx] = col.r; data[idx + 1] = col.g; data[idx + 2] = col.b;
                  data[idx + 3] = 255;
                }
              }
            }
 
            if (row < H) {
              drawProgress(row / H);
              buildTimer = setTimeout(processChunk, 0);
            } else {
              bgImageData = img;
              onDone();
            }
          } catch (err) {
            showError(err);
          }
        }

        
 
        processChunk();
      }
 
      function drawBackground() {
        if (!bgImageData) return;
        ctx.putImageData(bgImageData, 0, 0);
        ctx.strokeStyle = rule;
        ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
        ctx.strokeStyle = inkSoft;
        ctx.globalAlpha = 0.5;
        var origin = toCanvas(0, 0);
        ctx.beginPath();
        ctx.moveTo(0, origin[1]); ctx.lineTo(W, origin[1]);
        ctx.moveTo(origin[0], 0); ctx.lineTo(origin[0], H);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
 
      function formatComplex(c) {
        var im = c.im >= 0 ? '+ ' + c.im.toFixed(3) + 'i' : '- ' + Math.abs(c.im).toFixed(3) + 'i';
        return c.re.toFixed(3) + ' ' + im;
      }
 
      function stopAnimation() {
        if (timer) { clearInterval(timer); timer = null; }
      }
 
      function liveRgbCss() {
        return 'rgb(' + liveRgb.r + ',' + liveRgb.g + ',' + liveRgb.b + ')';
      }
 
      function traceOrbit(c) {
        stopAnimation();
        drawBackground();
        cEl.textContent = formatComplex(c);
        nEl.textContent = '0';
        magEl.textContent = '0.000';
        statusEl.textContent = 'tracing…';
        statusEl.className = 'mbo-status';
 
        var zr = 0, zi = 0;
        var path = [toCanvas(0, 0)];
        var step = 0;
 
        timer = setInterval(function () {
          if (step >= ORBIT_STEPS) {
            stopAnimation();
            statusEl.textContent = 'bounded through ' + ORBIT_STEPS + ' steps';
            statusEl.className = 'mbo-status mbo-status--bounded';
            return;
          }
 
          var nzr = zr * zr - zi * zi + c.re;
          var nzi = 2 * zr * zi + c.im;
          zr = nzr; zi = nzi;
          step++;
 
          var mag = Math.sqrt(zr * zr + zi * zi);
          path.push(toCanvas(zr, zi));
 
          drawBackground();
          ctx.strokeStyle = liveRgbCss();
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          path.forEach(function (p, i) {
            if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
          });
          ctx.stroke();
 
          ctx.fillStyle = liveRgbCss();
          var last = path[path.length - 1];
          ctx.beginPath();
          ctx.arc(last[0], last[1], 3, 0, Math.PI * 2);
          ctx.fill();
 
          nEl.textContent = step;
          magEl.textContent = mag.toFixed(3);
 
          if (mag > ESCAPE_R) {
            stopAnimation();
            statusEl.textContent = 'escaped at step ' + step;
            statusEl.className = 'mbo-status mbo-status--escaped';
          }
        }, 140);
      }
 
      canvas.addEventListener('click', function (evt) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = W / rect.width, scaleY = H / rect.height;
        var px = (evt.clientX - rect.left) * scaleX;
        var py = (evt.clientY - rect.top) * scaleY;
        traceOrbit(toComplex(px, py));
      });
 
      clearBtn.addEventListener('click', function () {
        stopAnimation();
        drawBackground();
        cEl.textContent = 'click the plane';
        nEl.textContent = '—';
        magEl.textContent = '—';
        statusEl.textContent = '—';
        statusEl.className = 'mbo-status';
      });
 
      drawProgress(0);
      buildBackgroundChunked(function () {
        drawBackground();
      });
    } catch (err) {
      showError(err);
    }
  }
 
  function unmount(container) {
    if (timer) { clearInterval(timer); timer = null; }
    if (buildTimer) { clearTimeout(buildTimer); buildTimer = null; }
    container.innerHTML = '';
  }
 
  function injectStyles() {
    if (document.getElementById('mbo-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'mbo-widget-styles';
    style.textContent =
      '.mbo-canvas{display:block;max-width:100%;height:auto;border:1px solid var(--rule);cursor:crosshair;}' +
      '.mbo-readout{display:flex;gap:16px;margin-top:12px;font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);flex-wrap:wrap;}' +
      '.mbo-readout strong{color:var(--ink);}' +
      '.mbo-status--bounded{color:var(--plot);font-weight:600;}' +
      '.mbo-status--escaped{color:var(--live);font-weight:600;}' +
      '.mbo-controls{margin-top:10px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;}' +
      '.mbo-hint{font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);}' +
      '.mbo-controls button{font-family:var(--font-mono);font-size:12px;padding:6px 12px;border:1px solid var(--rule);background:var(--paper-raise);color:var(--ink);cursor:pointer;}' +
      '.mbo-controls button:hover{border-color:var(--plot);color:var(--plot);}';
    document.head.appendChild(style);
  }
 
  return { mount: mount, unmount: unmount };
})();