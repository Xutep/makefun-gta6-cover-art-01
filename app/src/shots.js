// Fixed scenes for screenshots: ?shot=editor shows the editor with a sample photo loaded;
// ?shot=cover shows the exported cover alone, at the export size the query names.
// Query params: photo / photo2 (sample names), caption, subcaption, layout, grade,
// captionColor, size (1080x1080 | 1080x1350 | 1920x1080). window.__shotReady is set
// once the scene has painted, so a headless browser can wait for it.
export async function runShot(shot, query, app) {
  const layout = query.get('layout') ?? 'hero';
  const grade = query.get('grade') ?? 'sunset';
  const captionColor = query.get('captionColor') ?? 'white';
  const size = query.get('size') ?? '1080x1080';
  const caption = query.get('caption') ?? 'SUNSET HEIST';
  const subcaption = query.get('subcaption') ?? 'ONE LAST SCORE IN THE CITY THAT NEVER SLEEPS';
  const photoName = query.get('photo') ?? 'pier';
  const photo2Name = query.get('photo2') ?? 'boulevard';

  if (shot === 'cover') document.body.classList.add('shot-cover');

  const first = await app.loadImage(`samples/${photoName}.jpg`);
  const firstIndex = app.addPhoto(`${photoName} sample`, first);
  const second = await app.loadImage(`samples/${photo2Name}.jpg`);
  const secondIndex = app.addPhoto(`${photo2Name} sample`, second);

  app.applyState({
    layout,
    grade,
    captionColor,
    size,
    caption,
    subcaption,
    panels: [
      { photo: firstIndex, zoom: 1, x: 0, y: 0 },
      { photo: secondIndex, zoom: 1, x: 0, y: 0 },
      { photo: firstIndex, zoom: 1.15, x: 0, y: -8 },
      { photo: secondIndex, zoom: 1.1, x: 6, y: 0 },
    ],
  });
  app.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
