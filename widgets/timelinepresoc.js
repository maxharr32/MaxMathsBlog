/* widgets/timeline.js
 *
 * An editable horizontal timeline. Click any event to open a detail
 * panel below with a longer write-up and (optionally) an image.
 *
 * ============================================================
 * EDIT THE EVENTS BELOW to build your own timeline. Each event:
 *   year    — number for positioning along the line. Negative for
 *             BCE (e.g. -300 for 300 BCE). Required.
 *   label   — short text shown under the dot, e.g. "1637" or
 *             "c. 300 BCE". Defaults to `year` if omitted.
 *   title   — event/person name, shown on the dot's tooltip and as
 *             the detail panel heading.
 *   summary — one sentence, shown as a hint under the title in the
 *             detail panel.
 *   detail  — the longer write-up, shown when the event is open.
 *             Plain text only (no markdown) — use \n\n for a new
 *             paragraph.
 *   image   — optional. Path to an image, e.g. 'images/euclid.jpg'.
 *             Paths are resolved from the site root, same as in
 *             article markdown — put files in an images/ folder.
 * ============================================================
 */
window.Widgets = window.Widgets || {};

window.Widgets['timeline'] = (function () {
  var EVENTS = [
    {
      year: -300,
      label: 'c. 300 BCE',
      title: 'Euclid — Elements',
      summary: 'Thirteen books that defined geometry for the next two thousand years.',
      detail: 'Euclid compiled and systematised the geometric knowledge of his time into the Elements, building everything up from a small set of axioms and postulates. The style — start from a few self-evident truths, derive everything else by strict logical proof — became the template for mathematics itself, not just geometry.\n\nReplace this with your own research and sources.'
      // image: 'images/euclid.jpg'
    },
    {
      year: 1637,
      label: '1637',
      title: 'Descartes — coordinate geometry',
      summary: 'Fusing algebra and geometry with a single grid of numbers.',
      detail: 'In an appendix to his Discourse on Method, Descartes showed that geometric curves could be described by algebraic equations, using a pair of perpendicular axes to locate every point with two numbers. That grid is the (x, y) plane every graph on this site is drawn on.\n\nReplace this with your own research and sources.'
    },
    {
      year: 1687,
      label: '1687',
      title: 'Newton — Principia Mathematica',
      summary: 'Calculus and the laws of motion, in one volume.',
      detail: 'Newton laid out the mathematics of motion and gravitation, developing calculus (independently of Leibniz, in a long and bitter priority dispute) as the tool needed to describe continuously changing quantities — exactly what the Taylor series widget on this site is built from.\n\nReplace this with your own research and sources.'
    },
    {
      year: 1874,
      label: '1874',
      title: "Cantor — different sizes of infinity",
      summary: 'Proving some infinities are strictly bigger than others.',
      detail: "Georg Cantor showed that the real numbers cannot be counted off 1, 2, 3, ... the way the whole numbers can — there are, in a precise mathematical sense, more real numbers than whole numbers. Deeply controversial at the time; foundational to mathematics now.\n\nReplace this with your own research and sources."
    },
    {
      year: 1931,
      label: '1931',
      title: "Gödel — incompleteness theorems",
      summary: 'Some true statements can never be proven, no matter the rulebook.',
      detail: "Gödel proved that any sufficiently powerful, consistent mathematical system contains true statements that system can never prove. It ended a decades-long hope (Hilbert's program) of putting all of mathematics on one complete, self-verifying foundation.\n\nReplace this with your own research and sources."
    }
  ];

  function mount(container) {
   try {
    var styles = getComputedStyle(document.documentElement);
    var ink = (styles.getPropertyValue('--ink') || '#1B2A22').trim();
    var inkSoft = (styles.getPropertyValue('--ink-soft') || '#4A5A4F').trim();
    var plot = (styles.getPropertyValue('--plot') || '#2F6F4E').trim();
    var live = (styles.getPropertyValue('--live') || '#B5542E').trim();
    var rule = (styles.getPropertyValue('--rule') || '#B9C2AF').trim();

    var events = EVENTS.slice().sort(function (a, b) { return a.year - b.year; });
    var minYear = events[0].year;
    var maxYear = events[events.length - 1].year;
    var span = Math.max(1, maxYear - minYear);

    container.innerHTML =
      '<div class="tl-widget">' +
        '<div class="tl-track-wrap">' +
          '<div class="tl-track">' +
            '<div class="tl-line"></div>' +
            events.map(function (ev, i) {
              var pct = ((ev.year - minYear) / span) * 100;
              return (
                '<button type="button" class="tl-dot" data-index="' + i + '" style="left:' + pct + '%" aria-label="' + escapeHtml(ev.title) + '">' +
                  '<span class="tl-dot-mark"></span>' +
                  '<span class="tl-dot-label">' + escapeHtml(ev.label || String(ev.year)) + '</span>' +
                  '<span class="tl-dot-title">' + escapeHtml(ev.title) + '</span>' +
                '</button>'
              );
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="tl-detail" id="tl-detail">' +
          '<p class="tl-placeholder">Click an event on the timeline to read more.</p>' +
        '</div>' +
      '</div>';

    injectStyles();

    var detail = container.querySelector('#tl-detail');
    var dots = container.querySelectorAll('.tl-dot');

    function escapeHtml(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    function openEvent(ev) {
      var paras = (ev.detail || '').split('\n\n').map(function (p) {
        return '<p>' + escapeHtml(p) + '</p>';
      }).join('');

      detail.innerHTML =
        '<div class="tl-detail-head">' +
          '<span class="tl-detail-date">' + escapeHtml(ev.label || String(ev.year)) + '</span>' +
          '<h3 class="tl-detail-title">' + escapeHtml(ev.title) + '</h3>' +
          (ev.summary ? '<p class="tl-detail-summary">' + escapeHtml(ev.summary) + '</p>' : '') +
        '</div>' +
        (ev.image ? '<img class="tl-detail-image" src="' + ev.image + '" alt="' + escapeHtml(ev.title) + '">' : '') +
        '<div class="tl-detail-body">' + paras + '</div>';
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        dots.forEach(function (d) { d.classList.remove('tl-dot--active'); });
        dot.classList.add('tl-dot--active');
        var ev = events[parseInt(dot.getAttribute('data-index'), 10)];
        openEvent(ev);
      });
    });
   } catch (err) {
     console.error('timeline widget error:', err);
     container.innerHTML = '<p style="font-family:monospace;font-size:12px;color:var(--live);">Widget error — check the browser console for details.</p>';
   }
  }

  function unmount(container) {
    container.innerHTML = '';
  }

  function injectStyles() {
    if (document.getElementById('tl-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'tl-widget-styles';
    style.textContent =
      '.tl-track-wrap{overflow-x:auto;padding-bottom:6px;}' +
      '.tl-track{position:relative;min-width:560px;height:86px;margin:20px 10px 0;}' +
      '.tl-line{position:absolute;left:0;right:0;top:38px;height:2px;background:var(--rule);}' +
      '.tl-dot{position:absolute;top:26px;transform:translateX(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;flex-direction:column;align-items:center;font-family:var(--font-mono);}' +
      '.tl-dot-mark{width:14px;height:14px;border-radius:50%;background:var(--paper-raise);border:2px solid var(--plot);display:block;transition:background 0.15s,border-color 0.15s;}' +
      '.tl-dot:hover .tl-dot-mark{background:var(--plot);}' +
      '.tl-dot--active .tl-dot-mark{background:var(--live);border-color:var(--live);}' +
      '.tl-dot-label{font-size:10px;color:var(--ink-soft);margin-top:6px;white-space:nowrap;}' +
      '.tl-dot-title{position:absolute;top:-22px;font-size:10px;color:var(--ink);white-space:nowrap;opacity:0;transition:opacity 0.15s;pointer-events:none;}' +
      '.tl-dot:hover .tl-dot-title,.tl-dot--active .tl-dot-title{opacity:1;}' +
      '.tl-detail{margin-top:18px;border:1px solid var(--rule);background:var(--paper-raise);padding:18px;min-height:80px;}' +
      '.tl-placeholder{font-family:var(--font-mono);font-size:12px;color:var(--ink-soft);margin:0;}' +
      '.tl-detail-date{font-family:var(--font-mono);font-size:11px;color:var(--plot);}' +
      '.tl-detail-title{font-family:var(--font-display);font-size:19px;margin:4px 0 6px;}' +
      '.tl-detail-summary{color:var(--ink-soft);font-style:italic;margin:0 0 12px;}' +
      '.tl-detail-image{display:block;max-width:100%;height:auto;border:1px solid var(--rule);margin:0 0 14px;}' +
      '.tl-detail-body p{margin:0 0 12px;line-height:1.6;}' +
      '.tl-detail-body p:last-child{margin-bottom:0;}';
    document.head.appendChild(style);
  }

  return { mount: mount, unmount: unmount };
})();
