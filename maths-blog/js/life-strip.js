/* life-strip.js
 * A small, perpetually-running Conway's Game of Life, used as the
 * site's header ornament instead of a static logo. Purely decorative,
 * self-contained, no dependencies.
 */
(function () {
  function mountLifeStrip(canvas, opts) {
    var cols = (opts && opts.cols) || 34;
    var rows = (opts && opts.rows) || 12;
    var cell = (opts && opts.cell) || 6;
    var stepMs = (opts && opts.stepMs) || 700;

    canvas.width = cols * cell;
    canvas.height = rows * cell;
    var ctx = canvas.getContext('2d');

    var styles = getComputedStyle(document.documentElement);
    var liveColor = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var bgColor = (styles.getPropertyValue('--paper-raise') || '#F3F5EF').trim();

    var grid = new Uint8Array(cols * rows);
    // seed ~28% alive, biased so something is usually happening
    for (var i = 0; i < grid.length; i++) {
      grid[i] = Math.random() < 0.28 ? 1 : 0;
    }

    function idx(x, y) { return y * cols + x; }

    function neighbors(x, y) {
      var n = 0;
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          var nx = (x + dx + cols) % cols;
          var ny = (y + dy + rows) % rows;
          n += grid[idx(nx, ny)];
        }
      }
      return n;
    }

    function step() {
      var next = new Uint8Array(cols * rows);
      var alive = 0;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var n = neighbors(x, y);
          var cur = grid[idx(x, y)];
          var willLive = cur ? (n === 2 || n === 3) : (n === 3);
          next[idx(x, y)] = willLive ? 1 : 0;
          alive += willLive ? 1 : 0;
        }
      }
      // if the board dies out or stagnates, re-seed gently so the
      // header never goes permanently blank
      if (alive < cols * rows * 0.03) {
        for (var i = 0; i < next.length; i++) {
          if (Math.random() < 0.15) next[i] = 1;
        }
      }
      grid = next;
    }

    function draw() {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = liveColor;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          if (grid[idx(x, y)]) {
            ctx.fillRect(x * cell + 1, y * cell + 1, cell - 1, cell - 1);
          }
        }
      }
    }

    draw();
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      setInterval(function () {
        step();
        draw();
      }, stepMs);
    }
  }

  window.mountLifeStrip = mountLifeStrip;
})();
