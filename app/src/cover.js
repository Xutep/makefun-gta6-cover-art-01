// Vice Nights cover engine: turns photos + a caption into a multi-panel poster cover,
// drawn entirely on a 2D canvas with system fonts only. No Rockstar artwork, logo or font
// is used anywhere: every shape, gradient and letter here is original.

export const LAYOUTS = {
  hero: { panels: 3, label: 'Hero + two below' },
  strips: { panels: 3, label: 'Three vertical strips' },
  grid: { panels: 4, label: 'Four-panel grid' },
};

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080 },
  '1080x1350': { w: 1080, h: 1350 },
  '1920x1080': { w: 1920, h: 1080 },
};

export const GRADES = {
  sunset: { label: 'Vice sunset' },
  neon: { label: 'Neon nights' },
  noir: { label: 'Noir' },
};

/** A fresh default cover state: 3 panels, sunset grade, square size. */
export function defaultState() {
  return {
    layout: 'hero',
    grade: 'sunset',
    caption: 'SUNSET HEIST',
    subcaption: 'ONE LAST SCORE IN THE CITY THAT NEVER SLEEPS',
    captionColor: 'white',
    size: '1080x1080',
    panels: [
      { photo: 0, zoom: 1, x: 0, y: 0 },
      { photo: 1, zoom: 1, x: 0, y: 0 },
      { photo: 0, zoom: 1, x: 0, y: 0 },
      { photo: 1, zoom: 1, x: 0, y: 0 },
    ],
  };
}

/** Panel rectangles for a layout, in canvas pixels. Gutters stay proportional to width. */
export function panelRects(layout, w, h) {
  const g = Math.round(w * 0.012);
  if (layout === 'strips') {
    const pw = (w - g * 4) / 3;
    return [0, 1, 2].map((i) => ({ x: g + i * (pw + g), y: g, w: pw, h: h - g * 2 }));
  }
  if (layout === 'grid') {
    const pw = (w - g * 3) / 2;
    const ph = (h - g * 3) / 2;
    return [
      { x: g, y: g, w: pw, h: ph },
      { x: g * 2 + pw, y: g, w: pw, h: ph },
      { x: g, y: g * 2 + ph, w: pw, h: ph },
      { x: g * 2 + pw, y: g * 2 + ph, w: pw, h: ph },
    ];
  }
  // hero: one wide panel on top, two below it.
  const heroH = (h - g * 3) * 0.6;
  const lowH = h - g * 3 - heroH;
  const lowW = (w - g * 3) / 2;
  return [
    { x: g, y: g, w: w - g * 2, h: heroH },
    { x: g, y: g * 2 + heroH, w: lowW, h: lowH },
    { x: g * 2 + lowW, y: g * 2 + heroH, w: lowW, h: lowH },
  ];
}

/** Draws one photo into a panel, cover-fit, with the panel's zoom and pan. */
function drawPanelPhoto(ctx, photo, rect, panel, grade) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (photo) {
    const base = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
    const scale = base * panel.zoom;
    const dw = photo.naturalWidth * scale;
    const dh = photo.naturalHeight * scale;
    const ox = (w - dw) / 2 + (panel.x / 100) * w;
    const oy = (h - dh) / 2 + (panel.y / 100) * h;
    if (grade === 'noir') ctx.filter = 'grayscale(1) contrast(1.25) brightness(1.05)';
    ctx.drawImage(photo, x + ox, y + oy, dw, dh);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#241533';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.setLineDash([w * 0.03, w * 0.02]);
    ctx.strokeRect(x + w * 0.06, y + h * 0.06, w * 0.88, h * 0.88);
    ctx.setLineDash([]);
  }
  ctx.restore();
}

/** Colour grade over one panel: a warm sunset wash, a pink/cyan neon wash, or a noir vignette. */
function gradePanel(ctx, rect, grade, w) {
  const { x, y, w: pw, h: ph } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, pw, ph);
  ctx.clip();
  if (grade === 'sunset') {
    const wash = ctx.createLinearGradient(x, y + ph * 0.45, x, y + ph);
    wash.addColorStop(0, 'rgba(255, 122, 26, 0)');
    wash.addColorStop(0.6, 'rgba(255, 80, 60, 0.18)');
    wash.addColorStop(1, 'rgba(190, 20, 110, 0.42)');
    ctx.fillStyle = wash;
    ctx.fillRect(x, y, pw, ph);
    const top = ctx.createLinearGradient(x, y, x, y + ph * 0.3);
    top.addColorStop(0, 'rgba(255, 170, 60, 0.20)');
    top.addColorStop(1, 'rgba(255, 170, 60, 0)');
    ctx.fillStyle = top;
    ctx.fillRect(x, y, pw, ph);
  } else if (grade === 'neon') {
    const wash = ctx.createLinearGradient(x, y, x + pw, y + ph);
    wash.addColorStop(0, 'rgba(255, 46, 136, 0.28)');
    wash.addColorStop(0.5, 'rgba(120, 40, 200, 0.10)');
    wash.addColorStop(1, 'rgba(34, 211, 238, 0.30)');
    ctx.fillStyle = wash;
    ctx.fillRect(x, y, pw, ph);
    ctx.fillStyle = 'rgba(255, 46, 136, 0.08)';
    ctx.fillRect(x, y, pw, ph * 0.4);
  }
  // Vignette on every grade: darkens the panel edges so the caption pops.
  const vig = ctx.createRadialGradient(
    x + pw / 2, y + ph / 2, Math.min(pw, ph) * 0.35,
    x + pw / 2, y + ph / 2, Math.max(pw, ph) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vig;
  ctx.fillRect(x, y, pw, ph);
  ctx.restore();
  // Thin bright frame around the panel, poster style.
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.strokeRect(x, y, pw, ph);
}

/** A small original sun emblem (striped disc) for the sunset grade, top-right of the hero panel. */
function drawSunEmblem(ctx, rect, w) {
  const r = Math.min(rect.w, rect.h) * 0.16;
  const cx = rect.x + rect.w - r * 1.25;
  const cy = rect.y + r * 1.15;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  grad.addColorStop(0, '#ffd23d');
  grad.addColorStop(0.55, '#ff7a1a');
  grad.addColorStop(1, '#ff2e88');
  ctx.fillStyle = grad;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = 'rgba(20, 8, 28, 0.55)';
  for (let i = 0; i < 3; i++) {
    const yy = cy + r * (0.1 + i * 0.28);
    ctx.fillRect(cx - r, yy, r * 2, r * 0.09);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

/** Bold poster lettering: auto-fits the caption, thick dark outline, gradient or white fill. */
function drawCaption(ctx, state, w, h) {
  const text = (state.caption || '').trim().toUpperCase();
  if (!text) return;
  const bandH = h * 0.24;
  const bandY = h - bandH;
  // Dark scrim so the letters read over any photo.
  const scrim = ctx.createLinearGradient(0, bandY - h * 0.06, 0, h);
  scrim.addColorStop(0, 'rgba(10, 4, 18, 0)');
  scrim.addColorStop(0.45, 'rgba(10, 4, 18, 0.72)');
  scrim.addColorStop(1, 'rgba(10, 4, 18, 0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY - h * 0.06, w, bandH + h * 0.06);

  let size = h * 0.115;
  const setFont = () => {
    ctx.font = `italic 900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(size * 0.02)}px`; } catch { /* older canvas: no letter-spacing */ }
  };
  setFont();
  while (ctx.measureText(text).width > w * 0.92 && size > 16) {
    size -= 2;
    setFont();
  }
  const cx = w / 2;
  const cy = h - h * 0.085;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#14081c';
  ctx.lineWidth = size * 0.14;
  ctx.strokeText(text, cx, cy);
  let fill;
  if (state.captionColor === 'sunset') {
    fill = ctx.createLinearGradient(0, cy - size * 0.6, 0, cy + size * 0.6);
    fill.addColorStop(0, '#ffe259');
    fill.addColorStop(0.5, '#ff7a1a');
    fill.addColorStop(1, '#ff2e88');
  } else if (state.captionColor === 'neon') {
    fill = ctx.createLinearGradient(0, cy - size * 0.6, 0, cy + size * 0.6);
    fill.addColorStop(0, '#22d3ee');
    fill.addColorStop(0.5, '#e879f9');
    fill.addColorStop(1, '#ff2e88');
  } else {
    fill = '#ffffff';
  }
  ctx.fillStyle = fill;
  ctx.fillText(text, cx, cy);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = size * 0.02;
  ctx.strokeText(text, cx, cy);

  // Sub-caption in tracked-out small capitals under the main title.
  const sub = (state.subcaption || '').trim().toUpperCase();
  if (sub) {
    let subSize = h * 0.026;
    ctx.font = `700 ${subSize}px "Helvetica Neue", Arial, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(subSize * 0.22)}px`; } catch { /* no letter-spacing */ }
    while (ctx.measureText(sub).width > w * 0.88 && subSize > 9) {
      subSize -= 1;
      ctx.font = `700 ${subSize}px "Helvetica Neue", Arial, sans-serif`;
    }
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(sub, cx, h - h * 0.028);
  }
  try { ctx.letterSpacing = '0px'; } catch { /* reset */ }
}

/**
 * Renders the whole cover onto `canvas` (which must already be sized to the
 * export size). `photos` is an array of images (or nulls); `state` holds the
 * layout, grade, caption and per-panel settings.
 */
export function drawCover(canvas, photos, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.fillStyle = '#0e0716';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(state.layout, w, h);
  const count = LAYOUTS[state.layout].panels;
  for (let i = 0; i < count; i++) {
    const panel = state.panels[i];
    const photo = panel.photo >= 0 ? photos[panel.photo] ?? null : null;
    drawPanelPhoto(ctx, photo, rects[i], panel, state.grade);
    gradePanel(ctx, rects[i], state.grade, w);
  }
  if (state.grade === 'sunset') drawSunEmblem(ctx, rects[0], w);
  drawCaption(ctx, state, w, h);
  // Thin white poster frame around the whole cover.
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(2, w * 0.003);
  ctx.strokeRect(w * 0.006, h * 0.006, w * 0.988, h * 0.988);
}

/** Renders the cover at the export size and returns the fresh canvas. */
export function renderCover(photos, state) {
  const size = SIZES[state.size] ?? SIZES['1080x1080'];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, photos, state);
  return canvas;
}
