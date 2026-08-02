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

window.Widgets['timelinepresoc'] = (function () {
  var EVENTS = [
    {
      year: -624,
      label: '624 BCE',
      title: 'Thales',
      summary: 'The original Greek philosopher, the first to question the universe',
      detail: 'Thales was the first known philosopher to pose questions about the world around him. His questions stood out as more philosophical than mythological or religious. He is thought to have predicted a solar eclipse. Thales also, after being called smart but poor, used his knowledge of weather to predict a good olive harvest and rent all the olive presses in Miletus, after the harvest he rented the presses back at a premium.\n\n Thale\'s biggest contribution is a a questioning to the foundation of nature, desiring a more compelling account than that of the Greek gods. His conclusion was that of different arches or first principles that of which all things are composed. Thales believed the universe\'s arche to be water, because of its abundance and prevelance in the natural world. The way water was choes was the best part, relying on observation and reason rather than mythology.',
      image: 'images/Thales.png'
    },
    {
      year: -610,
      label: '610 BCE',
      title: 'Anaximander',
      summary: 'Had his own idea for the universe\'s arche',
      detail: 'Anaximinder had a different idea of the universe\'s arche, calling it the "Apeiron" or the unbounded. He is beleived as to have the first recorded words of philosophy with lines from his book being quoted by later philosphers. He is also credited with creating the first map of the world and the first sundial (although it did not track the time, only the seasons).\n\n Anaximander looks to have been a very inteligent astronomer, having ideas of the sun being a ball of fire and being bigger than the earth. He thought the moon was reflecting the sun\'s light and that the earth was a cylinder floating in space, with the flat top being the land and the bottom being water. ',
      image: 'images/Anaximander.png'
    },
    {
      year: -570,
      label: '570 BCE',
      title: 'Pythagoras',
      summary: 'The famous leader of the Pythagorean cult.',
      detail: 'Pythagoras was a mainly private man, only known through the writings of his followers. Some of his more philosophical beliefs were that the soul is immortal and that reincarnation is real. Therefore, Pythagoras and his following were strict vegetarians, believing that eating meat would be eating the soul of another.\n\n Pythagoras is obviously most well known for his contributions to mathematics, said by some followers to be the first person to take arithmetic beyond normal commerce practices. Pythagoras made oaths to the triangular numbers, in particular having fondness for the number 10, in which he made a triangle of dots, with 4 of the bottom then 3, 2 and 1 to have 10 dots. The Pythagorean theorem however, was never truly credited to Pythagoras, being seen practiced by the Babylonians many years before. it is possible however that one of the Pythagorean followers discovered a proof.\n\n The Pythagorean cult is credited with much discovery over many different fields. They are thought to have understood how the length of string dictates the pitch it made when plucked, and they thought that planets followed this balance with different planets having different pitches. Pythagoras also hated the discovery of irrational numbers so much that upon discovery that the diagonal of a 1x1 square was irrational, he drowned the person who discovered it. Finally, the Pythagorean cult is thought to have considered earth to be spherical and the solar system to be heliocentric.',
      image: 'images/PythagoreanCult.png'
    },
    {
      year: -540,
      label: '540 BCE',
      title: "Heraclitus",
      summary: 'Known as "the obscure"',
      detail: "Heraclitus is very obscured, not helped by the little remanants of his writings we still have. His grammer was poor and we are not even sure of the order of the fragments we have, only knowing his beleifs through the work of other later philosophers.\n\n His main work is described by Plato as follows. Heraclitus believed that all things pass and flow, and nothing is permanent. He said that everything is in flux, and that everything flows like a river. One of his disciples (Cratylus) was famous for being asked a question and only answering by wiggling his finger, saying that at the point he was ready to answer the world had changed and moved on. Heraclitus also was emphatuated by opposites, saying there is balance in opposites. Some of his examples were that of a need of youth to have age, sleep to have waking and life to have death. Heraclitus also had an idea for the universe\'s arche, beleiving it to be fire, saying some of the world is kindling and some burning out.",
      image: 'images/Heraclitus.png'
    },
    {
      year: -515,
      label: '515 BCE',
      title: "Parmenides",
      summary: '"What is" was not, won\'t be, for it is now',
      detail: "Parmenides was born in Elea to a wealthy family and was cosy with high class society. Parmenides was a pupil of a philosopher called Xenophanes but disagreed with much of his teachings and also was at one point a member of the Pythagorean cult. It is also said that Socrates met him when Socrates was a young boy.\n\n Parmenides wrote his work in a poem of Homeric style, similar to that of the Odyssey. His main work is split into 2 parts in which a young man is taken to a goddess who tells him the 'truth'. This truth was 'What is', being a whole, unmoving and continuous, the goddess added that 'it was not once, it will not be, for it is now'.\n\n This raises a further question of whether what is is physical or figurative (like a god or a concept of infinity). Aristotle said that Parmenides\' 'What is' is the universe as a whole. It also questions whether Parmenides believed in time, perhaps why he included the line of 'nor was it once'. There is another questions of whether change and movement exist to Parmenides as what is is unmoving. This could be encompassed by 'what is not', however, Parmenides said that nothing is not, as to say it is 'not', is for it to be something.\n\n While not being as cryptic a writer as Heraclitus, the concepts he wrote about were certainly of no clear nature. However his direct students and followers were clearly entranced, with the next philosopher on the timeline, Zeno, spending his time defending Parmenides and his 'What is'.",
      image: 'images/Parmenidesbanner.png'
    },
    {
      year: -490,
      label: '490 BCE',
      title: "Zeno of Elea",
      summary: 'Half and then half again, and again, and again ... ',
      detail: "All of Zeno\'s writing and concepts were told by other philosophers, namely Diogenes and Plato, being the only source of information about his life. Zeno met Socrates with Parmenides when Socrates was only young, as Zeno was a follower/student/adopted son/lover of Parmenides.\n\n Zeno is thought to have invented dialect, a form of deconstructing arguments in debate, rather than eristic where you merely argue with the opposition. Perhaps what Zeno was most known for was his paradox, his most famous of which was in defence of the ideas Parmenides. Already discussed in a previous article, Zeno's paradox explains a frog that tries to cross a pond. To cross it must first cross half, then half of the remaining distance, then half again and so on. Zeno said he will never fully complete his journey and therefore will never actually move and so movement is impossible. This defends Parmenides and his 'What is' being unmoving and unchanged. The counters to this argument have already been discussed in sufficient detail in the article dedicated to it. ",
      image: 'images/Zeno.png'
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
          '<div class="tl-track" style="min-width:' + Math.max(560, events.length * 110) + 'px">' +
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
      '.tl-track-wrap{overflow-x:auto;padding:26px 44px 10px;}' +
      '.tl-track{position:relative;height:86px;margin:0;}' +
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
