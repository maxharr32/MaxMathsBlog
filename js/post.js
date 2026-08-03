(function () {
  mountLifeStrip(document.getElementById('life-strip'));

  var params = new URLSearchParams(window.location.search);
  var slug = params.get('post');
  var post = (window.POSTS || []).find(function (p) { return p.slug === slug; });

  if (!post) {
    document.getElementById('not-found').hidden = false;
    return;
  }

  document.title = post.title + ' — Notebook';
  document.getElementById('page-title').textContent = post.title + ' — Notebook';
  document.getElementById('article-title').textContent = post.title;
  document.getElementById('article-meta').textContent =
    post.date + (post.tags && post.tags.length ? '  ·  ' + post.tags.join(', ') : '');

  fetch('posts/' + post.slug + '.md')
    .then(function (res) {
      if (!res.ok) throw new Error('missing markdown file for ' + post.slug);
      return res.text();
    })
    .then(function (markdown) {
      renderBody(markdown, post);
    })
    .catch(function (err) {
      var body = document.getElementById('article-body');
      body.innerHTML = '<p><em>Could not load this entry (' + err.message + ').</em></p>';
      document.getElementById('article').hidden = false;
    });

 function renderBody(markdown, post) {
    // Supports two placeholder forms:
    //   {{widget}}         — legacy, single widget, uses post.widget from the manifest
    //   {{widget:name}}    — named, any number per post, e.g. {{widget:pi-estimation}}
    // Mix and match freely; each placeholder becomes its own docked panel.
    var slots = [];
    var processed = markdown.replace(/{{\s*widget(?::([a-zA-Z0-9_-]+))?\s*}}/g, function (full, name) {
      var widgetName = name || post.widget;
      var token = '\u00A7WIDGET_DOCK_' + slots.length + '\u00A7';
      slots.push({ widgetName: widgetName, mountId: 'widget-mount-' + slots.length });
      return token;
    });
 
    var html = marked.parse(processed);
    var body = document.getElementById('article-body');
 
    slots.forEach(function (slot, i) {
      if (!slot.widgetName) return;
      var token = '\u00A7WIDGET_DOCK_' + i + '\u00A7';
      var dockHtml =
        '<div class="widget-dock">' +
          '<div class="widget-dock-label">live &mdash; ' + slot.widgetName + '</div>' +
          '<div class="widget-dock-body" id="' + slot.mountId + '"></div>' +
        '</div>';
      html = html.replace(new RegExp('<p>\\s*' + token + '\\s*</p>'), dockHtml);
      html = html.replace(token, dockHtml);
    });
 
    body.innerHTML = html;
    document.getElementById('article').hidden = false;
 
    var loadCallbacks = {};
 
    slots.forEach(function (slot) {
      if (!slot.widgetName) return;
 
      function doMount() {
        var mountEl = document.getElementById(slot.mountId);
        if (mountEl && window.Widgets && window.Widgets[slot.widgetName]) {
          window.Widgets[slot.widgetName].mount(mountEl);
        }
      }
 
      if (window.Widgets && window.Widgets[slot.widgetName]) {
        doMount();
      } else if (loadCallbacks[slot.widgetName]) {
        loadCallbacks[slot.widgetName].push(doMount);
      } else {
        loadCallbacks[slot.widgetName] = [doMount];
        var script = document.createElement('script');
        script.src = 'widgets/' + slot.widgetName + '.js';
        script.onload = function () {
          loadCallbacks[slot.widgetName].forEach(function (fn) { fn(); });
        };
        script.onerror = function () {
          var mountEl = document.getElementById(slot.mountId);
          if (mountEl) mountEl.innerHTML = '<p><em>Widget script not found: widgets/' + slot.widgetName + '.js</em></p>';
        };
        document.body.appendChild(script);
      }
    });
  }
})();
