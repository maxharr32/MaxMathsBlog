/* widgets/voronoi.js
 *
 * A Voronoi diagram over 5 draggable points. For every pixel, colour
 * it by whichever of the 5 points is nearest (Euclidean distance) —
 * that's the whole definition of a Voronoi cell, and with only 5
 * points, checking every pixel against every site directly is cheap
 * enough to redo on every drag frame. No geometry library needed.
 */
window.Widgets = window.Widgets || {};

window.Widgets['voronoi'] = (function () {
  function mount(container) {
    var SIZE = 400;
    var POINT_COUNT = 5;

    var styles = getComputedStyle(document.documentElement);
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var paper = (styles.getPropertyValue('--paper') || '#E9EDE4').trim();

    // Five muted, mutually distinguishable fills — harmonised with the
    // rest of the site's palette rather than stock bright colours.
    var palette = [
      hexToRgb('#2F6F4E'), // plot green
      hexToRgb('#B5542E'), // live sienna
      hexToRgb('#3B5BDB'), // data blue
      hexToRgb('#8B5FA3'), // muted plum
      hexToRgb('#C99A2E')  // ochre
    ];

    container.innerHTML =
      '<div class="vor-widget">' +
        '<canvas class="vor-canvas" width="' + SIZE + '" height="' + SIZE + '"></canvas>' +
        '<div class="vor-controls">' +
          '<span class="vor-hint">drag a point to reshape its region</span>' +
          '<button type="button" id="vor-shuffle">Randomise points</button>' +
        '</div>' +
      '</div>';

    injectStyles();

    var canvas = container.querySelector('.vor-canvas');
    var ctx = canvas.getContext('2d');
    var shuffleBtn = container.querySelector('#vor-shuffle');

    var points = randomPoints();
    var dragIndex = -1;
    var pendingFrame = false;

    function randomPoints() {
      var pts = [];
      for (var i = 0; i < POINT_COUNT; i++) {
        pts.push({
          x: SIZE * (0.15 + 0.7 * Math.random()),
          y: SIZE * (0.15 + 0.7 * Math.random())
        });
      }
      return pts;
    }

    function hexToRgb(hex) {
      var v = parseInt(hex.slice(1), 16);
      return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
    }

    function render() {
      var img = ctx.createImageData(SIZE, SIZE);
      var data = img.data;

      // background fill by nearest site
      for (var y = 0; y < SIZE; y++) {
        for (var x = 0; x < SIZE; x++) {
          var best = 0, bestDist = Infinity;
          for (var p = 0; p < points.length; p++) {
            var dx = x - points[p].x, dy = y - points[p].y;
            var d = dx * dx + dy * dy;
            if (d < bestDist) { bestDist = d; best = p; }
          }
          var idx = (y * SIZE + x) * 4;
          var c = palette[best % palette.length];
          data[idx] = c.r;
          data[idx + 1] = c.g;
          data[idx + 2] = c.b;
          data[idx + 3] = 235; // slight transparency so it reads as "ink on paper", not a solid poster
        }
      }
      ctx.putImageData(img, 0, 0);

      // cell-border overlay: darken any pixel whose right/bottom
      // neighbour belongs to a different site
      ctx.fillStyle = ink;
      // (re-derive ownership cheaply from the image we just built is
      // awkward, so just recompute a lightweight border pass at lower
      // cost by sampling every pixel's owner once more into a typed array)
      var owner = new Int8Array(SIZE * SIZE);
      for (var yy = 0; yy < SIZE; yy++) {
        for (var xx = 0; xx < SIZE; xx++) {
          var b = 0, bd = Infinity;
          for (var pp = 0; pp < points.length; pp++) {
            var ddx = xx - points[pp].x, ddy = yy - points[pp].y;
            var dd = ddx * ddx + ddy * ddy;
            if (dd < bd) { bd = dd; b = pp; }
          }
          owner[yy * SIZE + xx] = b;
        }
      }
      ctx.globalAlpha = 0.55;
      for (var y2 = 0; y2 < SIZE; y2++) {
        for (var x2 = 0; x2 < SIZE; x2++) {
          var here = owner[y2 * SIZE + x2];
          var rightDiff = x2 + 1 < SIZE && owner[y2 * SIZE + x2 + 1] !== here;
          var downDiff = y2 + 1 < SIZE && owner[(y2 + 1) * SIZE + x2] !== here;
          if (rightDiff || downDiff) {
            ctx.fillRect(x2, y2, 1, 1);
          }
        }
      }
      ctx.globalAlpha = 1;

      // site markers
      points.forEach(function (pt, i) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = paper;
        ctx.fill();
        ctx.lineWidth = 2;
        var c = palette[i % palette.length];
        ctx.strokeStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
        ctx.stroke();
      });
    }

    function scheduleRender() {
      if (pendingFrame) return;
      pendingFrame = true;
      requestAnimationFrame(function () {
        pendingFrame = false;
        render();
      });
    }

    function canvasPos(evt) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = SIZE / rect.width;
      var scaleY = SIZE / rect.height;
      var clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      var clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    }

    function nearestPointIndex(pos) {
      var best = -1, bestDist = Infinity;
      points.forEach(function (pt, i) {
        var dx = pt.x - pos.x, dy = pt.y - pos.y;
        var d = dx * dx + dy * dy;
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return bestDist <= 30 * 30 ? best : -1; // must click within 30px of a site
    }

    function onDown(evt) {
      var pos = canvasPos(evt);
      var i = nearestPointIndex(pos);
      if (i >= 0) {
        dragIndex = i;
        canvas.setPointerCapture && evt.pointerId != null && canvas.setPointerCapture(evt.pointerId);
        evt.preventDefault();
      }
    }

    function onMove(evt) {
      if (dragIndex < 0) return;
      var pos = canvasPos(evt);
      points[dragIndex].x = Math.max(0, Math.min(SIZE, pos.x));
      points[dragIndex].y = Math.max(0, Math.min(SIZE, pos.y));
      scheduleRender();
      evt.preventDefault();
    }

    function onUp() {
      dragIndex = -1;
    }

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    shuffleBtn.addEventListener('click', function () {
      points = randomPoints();
      scheduleRender();
    });

    canvas._voronoiCleanup = function () {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    render();
  }

  function unmount(container) {
    var canvas = container.querySelector('.vor-canvas');
    if (canvas && canvas._voronoiCleanup) canvas._voronoiCleanup();
    container.innerHTML = '';
  }

  function injectStyles() {
    if (document.getElementById('vor-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'vor-widget-styles';
    style.textContent =
      '.vor-canvas{display:block;max-width:100%;height:auto;border:1px solid var(--rule);cursor:grab;touch-action:none;}' +
      '.vor-canvas:active{cursor:grabbing;}' +
      '.vor-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;flex-wrap:wrap;}' +
      '.vor-hint{font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);}' +
      '.vor-controls button{font-family:var(--font-mono);font-size:12px;padding:6px 12px;border:1px solid var(--rule);background:var(--paper-raise);color:var(--ink);cursor:pointer;}' +
      '.vor-controls button:hover{border-color:var(--plot);color:var(--plot);}';
    document.head.appendChild(style);
  }

  return { mount: mount, unmount: unmount };
})();
