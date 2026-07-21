# Notebook

A static, no-build blog for maths-and-code write-ups, where each entry
can carry its own live interactive demo. Grid-paper look, a small
Game of Life running quietly in the header.

## Structure

```
index.html          homepage — lists entries from posts/manifest.js
post.html            article template (shared by every post)
css/style.css        all styling
js/life-strip.js     the header's ambient Game of Life
js/post.js           loads and renders a single post
posts/manifest.js    the list of published entries — edit this to publish
posts/<slug>.md      one Markdown file per entry
posts/_template.md   copy this to start a new entry
widgets/<name>.js    one file per interactive widget
widgets/_template.js copy this to start a new widget
```

No build step, no framework, no dependencies beyond Google Fonts and
`marked.js` (loaded from a CDN for Markdown parsing).

## Running it locally

Opening `index.html` directly (`file://`) won't work, because the
pages `fetch()` the Markdown files, and browsers block that for local
files. Serve the folder instead:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Adding a new post

1. Copy `posts/_template.md` to `posts/your-slug.md` and write it —
   plain Markdown. Drop `{{widget}}` on its own line anywhere you want
   an interactive demo to appear.
2. If it has a widget, copy `widgets/_template.js` to
   `widgets/your-widget-name.js` and build it — it just needs a
   `mount(container)` function that fills the given `<div>`.
3. Add one entry to the array in `posts/manifest.js`:

   ```js
   {
     slug: 'your-slug',
     title: 'Your title',
     date: '2026-08-01',
     summary: 'One sentence for the homepage.',
     tags: ['monte-carlo'],
     widget: 'your-widget-name'   // omit for a text-only post
   }
   ```

That's it — the homepage and the post page both read from the
manifest automatically, newest first.

## Deploying

It's plain static files, so any static host works. Easiest option:
push this folder to a GitHub repo and turn on GitHub Pages for the
`main` branch — no build configuration needed.
