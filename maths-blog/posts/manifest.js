/* manifest.js
 *
 * This is the entire "database" for the site: one array, one entry per
 * post. Add a new post by:
 *   1. Writing posts/<slug>.md
 *   2. (Optional) writing widgets/<widget-name>.js
 *   3. Adding one object below
 *
 * Fields:
 *   slug     — must match the .md filename (without extension)
 *   title    — shown on the homepage and the article page
 *   date     — "YYYY-MM-DD", used for sorting (newest first) and display
 *   summary  — one or two sentences, shown on the homepage
 *   tags     — array of short strings, purely descriptive
 *   widget   — optional. Must match the key registered in a widgets/*.js
 *              file via window.Widgets['<name>'] = { mount, unmount }.
 *              Leave undefined for a text-only post.
 *
 * See posts/_template.md and widgets/_template.js for starting points.
 */
window.POSTS = [
  {
    slug: 'pi-estimation',
    title: 'Estimating pi by throwing darts',
    date: '2026-08-01',
    summary: 'What happens if you drop ten thousand random points on a square and count how many land in the circle.',
    tags: ['monte-carlo', 'probability'],
    widget: 'pi-estimation'
  },
];
