/* Copy this file to widgets/<your-widget-name>.js and reference that
 * name in the post's manifest entry (`widget: 'your-widget-name'`).
 *
 * A widget is just an object with mount/unmount, registered under a
 * unique key on window.Widgets. `container` is an empty <div> that's
 * already inside the article's widget dock — build whatever you like
 * inside it (canvas, SVG, plain DOM, a small chart).
 *
 * Keep it dependency-free or load what you need from a CDN with a
 * <script> tag inside mount(). Clean up any timers/listeners you
 * start in unmount(), so navigating away doesn't leak them.
 */
window.Widgets = window.Widgets || {};

window.Widgets['_template'] = {
  mount: function (container) {
    var el = document.createElement('p');
    el.textContent = 'Replace me with the actual widget.';
    container.appendChild(el);
  },
  unmount: function (container) {
    container.innerHTML = '';
  }
};
