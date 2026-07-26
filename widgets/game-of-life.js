/* widgets/game-of-life.js
 *
 * A 10x10 Game of Life grid you can edit by hand before (or during)
 * a run. Click any cell to toggle it, use the speed slider to control
 * how fast generations advance, and step through one generation at a
 * time if you want to watch a single transition closely.
 */
window.Widgets = window.Widgets || {};

window.Widgets['game-of-life'] = (function () {
  var timer = null;

  function mount(container) {
    var COLS = 10, ROWS = 10, CELL = 30;
    var W = COLS * CELL, H = ROWS * CELL;

    var styles = getComputedStyle(document.documentElement);
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var plot = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var rule = (styles.getPropertyValue('--rule') || '#B9C2AF').trim();
    var paper = (styles.getPropertyValue('--paper') || '#E9EDE4').trim();
    var paperRaise = (styles.getPropertyValue('--paper-raise') || '#F3F5EF').trim();

    container.innerHTML =
      '<div class="gol-widget">' +
        '<canvas class="gol-canvas" width="' + W + '" height="' + H + '"></canvas>' +
        '<div class="gol-controls">' +
          '<button type="button" id="gol-play">Play</button>' +
          '<button type="button" id="gol-step">Step</button>' +
          '<button type="button" id="gol-clear">Clear</button>' +
          '<button type="button" id="gol-random">Randomise</button>' +
        '</div>' +
        '<div class="gol-controls">' +
          '<label class="gol-speed-label">speed' +
            '<input type="range" id="gol-speed" min="80" max="1500" value="400" step="20">' +
          '</label>' +
          '<span class="gol-stats">generation <strong id="gol-gen">0</strong></span>' +
        '</div>' +
        '<p class="gol-hint">click any cell to toggle it — works while paused or running</p>' +
      '</div>';

    injectStyles();

    var canvas = container.querySelector('.gol-canvas');
    var ctx = canvas.getContext('2d');
    var playBtn = container.querySelector('#gol-play');
    var stepBtn = container.querySelector('#gol-step');
    var clearBtn = container.querySelector('#gol-clear');
    var randomBtn = container.querySelector('#gol-random');
    var speedSlider = container.querySelector('#gol-speed');
    var genEl = container.querySelector('#gol-gen');

    var grid = new Uint8Array(COLS * ROWS);
    var generation = 0;
    var running = false;

    function idx(x, y) { return y * COLS + x; }

    function seedGlider() {
      grid = new Uint8Array(COLS * ROWS);
      var pts = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]];
      pts.forEach(function (p) { grid[idx(p[0], p[1])] = 1; });
    }

    function draw() {
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);

      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          var alive = grid[idx(x, y)];
          ctx.fillStyle = alive ? plot : paperRaise;
          ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
        }
      }

      ctx.strokeStyle = rule;
      ctx.lineWidth = 1;
      for (var gx = 0; gx <= COLS; gx++) {
        ctx.beginPath();
        ctx.moveTo(gx * CELL, 0);
        ctx.lineTo(gx * CELL, H);
        ctx.stroke();
      }
      for (var gy = 0; gy <= ROWS; gy++) {
        ctx.beginPath();
        ctx.moveTo(0, gy * CELL);
        ctx.lineTo(W, gy * CELL);
        ctx.stroke();
      }
      ctx.strokeStyle = ink;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
    }

    function neighbours(x, y) {
      var n = 0;
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          var nx = (x + dx + COLS) % COLS; // wraps at the edges
          var ny = (y + dy + ROWS) % ROWS;
          n += grid[idx(nx, ny)];
        }
      }
      return n;
    }

    function step() {
      var next = new Uint8Array(COLS * ROWS);
      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          var n = neighbours(x, y);
          var alive = grid[idx(x, y)];
          next[idx(x, y)] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        }
      }
      grid = next;
      generation++;
      genEl.textContent = generation;
      draw();
    }

    function startPlaying() {
      running = true;
      playBtn.textContent = 'Pause';
      timer = setInterval(step, parseInt(speedSlider.value, 10));
    }

    function stopPlaying() {
      running = false;
      playBtn.textContent = 'Play';
      if (timer) { clearInterval(timer); timer = null; }
    }

    playBtn.addEventListener('click', function () {
      if (running) stopPlaying(); else startPlaying();
    });

    stepBtn.addEventListener('click', function () {
      stopPlaying();
      step();
    });

    clearBtn.addEventListener('click', function () {
      stopPlaying();
      grid = new Uint8Array(COLS * ROWS);
      generation = 0;
      genEl.textContent = '0';
      draw();
    });

    randomBtn.addEventListener('click', function () {
      stopPlaying();
      for (var i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.3 ? 1 : 0;
      generation = 0;
      genEl.textContent = '0';
      draw();
    });

    speedSlider.addEventListener('input', function () {
      if (running) {
        clearInterval(timer);
        timer = setInterval(step, parseInt(speedSlider.value, 10));
      }
    });

    canvas.addEventListener('click', function (evt) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = W / rect.width, scaleY = H / rect.height;
      var x = Math.floor((evt.clientX - rect.left) * scaleX / CELL);
      var y = Math.floor((evt.clientY - rect.top) * scaleY / CELL);
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
      grid[idx(x, y)] = grid[idx(x, y)] ? 0 : 1;
      draw();
    });

    seedGlider();
    draw();
  }

  function unmount(container) {
    if (timer) { clearInterval(timer); timer = null; }
    container.innerHTML = '';
  }

  function injectStyles() {
    if (document.getElementById('gol-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'gol-widget-styles';
    style.textContent =
      '.gol-canvas{display:block;max-width:100%;height:auto;border:1px solid var(--rule);cursor:pointer;}' +
      '.gol-controls{display:flex;gap:10px;align-items:center;margin-top:12px;flex-wrap:wrap;}' +
      '.gol-controls button{font-family:var(--font-mono);font-size:12px;padding:6px 12px;border:1px solid var(--rule);background:var(--paper-raise);color:var(--ink);cursor:pointer;}' +
      '.gol-controls button:hover{border-color:var(--plot);color:var(--plot);}' +
      '.gol-speed-label{font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);display:flex;align-items:center;gap:8px;}' +
      '.gol-speed-label input{width:140px;accent-color:var(--plot);}' +
      '.gol-stats{font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);}' +
      '.gol-stats strong{color:var(--ink);}' +
      '.gol-hint{font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);margin-top:10px;}';
    document.head.appendChild(style);
  }

  return { mount: mount, unmount: unmount };
})();
