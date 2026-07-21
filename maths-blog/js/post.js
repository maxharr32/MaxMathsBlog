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
    var hasWidget = /{{\s*widget\s*}}/.test(markdown);
    var placeholder = '§WIDGET_DOCK§';
    var html = marked.parse(markdown.replace(/{{\s*widget\s*}}/, placeholder));

    var body = document.getElementById('article-body');

    if (hasWidget && post.widget) {
      var dockHtml =
        '<div class="widget-dock">' +
          '<div class="widget-dock-label">live &mdash; ' + post.widget + '</div>' +
          '<div class="widget-dock-body" id="widget-mount"></div>' +
        '</div>';
      // marked wraps the placeholder text in a <p>; swap that whole
      // paragraph out for the dock rather than leaving it nested inside one.
      html = html.replace(new RegExp('<p>\\s*' + placeholder + '\\s*</p>'), dockHtml);
      html = html.replace(placeholder, dockHtml); // fallback if not its own paragraph
    }

    body.innerHTML = html;
    document.getElementById('article').hidden = false;

    if (hasWidget && post.widget) {
      var script = document.createElement('script');
      script.src = 'widgets/' + post.widget + '.js';
      script.onload = function () {
        var mount = document.getElementById('widget-mount');
        if (mount && window.Widgets && window.Widgets[post.widget]) {
          window.Widgets[post.widget].mount(mount);
        }
      };
      script.onerror = function () {
        var mount = document.getElementById('widget-mount');
        if (mount) mount.innerHTML = '<p><em>Widget script not found: widgets/' + post.widget + '.js</em></p>';
      };
      document.body.appendChild(script);
    }
  }
})();
