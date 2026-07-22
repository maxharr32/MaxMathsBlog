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
    date: '21-07-2026',
    summary: 'What happens if you drop ten thousand random points on a square and count how many land in the circle.',
    tags: ['monte-carlo', 'probability', 'pi'],
    widget: 'pi-estimation'
  },
  {
    slug: 'voronoi',
    title: 'Voronoi-diagrams',
    date: '21-07-2026',
    summary: 'How Voronoi diagrams are used by city planners to decide where hospitals are placed to minimise death.',
    tags: ['geometry', 'application'],
    widget: 'voronoi'
  },
  {
    slug: 'taylor-series',
    title: 'Taylor Series Showcase',
    date: '22-07-2026',
    summary: '',
    tags: ['calculus', 'estimation', 'application'],
    widget: 'taylor-series'
  },
];
