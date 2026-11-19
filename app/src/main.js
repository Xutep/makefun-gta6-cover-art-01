// Wires the Vice Nights editor: photo uploads, per-panel crop controls, layout / grade /
// size pickers, live preview and PNG export. A `?shot=` query sets up a fixed scene for
// screenshots instead (./shots.js).
import { drawCover, defaultState, LAYOUTS, SIZES, renderCover } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subcaptionInput = document.getElementById('subcaption');
const layoutSelect = document.getElementById('layout');
const gradeSelect = document.getElementById('grade');
const captionColorSelect = document.getElementById('caption-color');
const sizeSelect = document.getElementById('size');
const status = document.getElementById('status');
const photoList = document.getElementById('photo-list');
const panelTabs = document.getElementById('panel-tabs');
const panelPhotoSelect = document.getElementById('panel-photo');
const zoomInput = document.getElementById('zoom');
const zoomValue = document.getElementById('zoom-value');
const panXInput = document.getElementById('pan-x');
const panYInput = document.getElementById('pan-y');

const state = defaultState();
const photos = []; // { name, img } in upload order; samples append here too.
let selectedPanel = 0;

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Adds an image to the photo tray and points empty panels at it. */
function addPhoto(name, img) {
  photos.push({ name, img });
  const index = photos.length - 1;
  for (const panel of state.panels) {
    if (panel.photo < 0) panel.photo = index;
  }
  refreshPhotoList();
  refreshPanelPhotoOptions();
  redraw();
  return index;
}

/** Redraws the preview canvas at the chosen export size. */
function redraw() {
  const size = SIZES[state.size];
  canvas.width = size.w;
  canvas.height = size.h;
  canvas.dataset.size = state.size;
  drawCover(canvas, photos.map((p) => p.img), state);
}

function refreshPhotoList() {
  photoList.innerHTML = '';
  photos.forEach((photo, index) => {
    const li = document.createElement('li');
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = photo.name;
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = `${index + 1}. ${photo.name}`;
    const use = document.createElement('button');
    use.type = 'button';
    use.textContent = 'Use in panel';
    use.addEventListener('click', () => {
      state.panels[selectedPanel].photo = index;
      refreshPanelPhotoOptions();
      redraw();
    });
    li.append(thumb, name, use);
    photoList.appendChild(li);
  });
}

function panelCount() {
  return LAYOUTS[state.layout].panels;
}

function refreshPanelTabs() {
  panelTabs.innerHTML = '';
  for (let i = 0; i < panelCount(); i++) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(i === selectedPanel));
    tab.textContent = `Panel ${i + 1}`;
    tab.addEventListener('click', () => {
      selectedPanel = i;
      refreshPanelTabs();
      refreshPanelControls();
    });
    panelTabs.appendChild(tab);
  }
}

function refreshPanelPhotoOptions() {
  panelPhotoSelect.innerHTML = '';
  const none = document.createElement('option');
  none.value = '-1';
  none.textContent = 'Empty panel';
  panelPhotoSelect.appendChild(none);
  photos.forEach((photo, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${index + 1}. ${photo.name}`;
    panelPhotoSelect.appendChild(option);
  });
  panelPhotoSelect.value = String(state.panels[selectedPanel].photo);
}

function refreshPanelControls() {
  const panel = state.panels[selectedPanel];
  zoomInput.value = String(Math.round(panel.zoom * 100));
  zoomValue.textContent = `${Math.round(panel.zoom * 100)}%`;
  panXInput.value = String(panel.x);
  panYInput.value = String(panel.y);
  refreshPanelPhotoOptions();
}

function refreshAllControls() {
  refreshPanelTabs();
  refreshPanelControls();
}

document.getElementById('photos').addEventListener('change', async (event) => {
  const files = [...event.target.files];
  for (const file of files) {
    if (photos.length >= 4) break;
    try {
      const img = await loadImage(URL.createObjectURL(file));
      addPhoto(file.name, img);
      status.textContent = `Loaded ${file.name}.`;
    } catch {
      status.textContent = `Could not read ${file.name}.`;
    }
  }
  event.target.value = '';
});

async function loadSample(file, label) {
  if (photos.length >= 4) {
    status.textContent = 'Photo tray is full (4 photos).';
    return;
  }
  try {
    const img = await loadImage(`samples/${file}`);
    addPhoto(label, img);
    status.textContent = `Loaded sample photo: ${label}.`;
  } catch {
    status.textContent = `Could not load sample ${label}.`;
  }
}

document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard.jpg', 'Boulevard sample'));
document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier.jpg', 'Pier sample'));

panelPhotoSelect.addEventListener('change', () => {
  state.panels[selectedPanel].photo = Number(panelPhotoSelect.value);
  redraw();
});
zoomInput.addEventListener('input', () => {
  state.panels[selectedPanel].zoom = Number(zoomInput.value) / 100;
  zoomValue.textContent = `${zoomInput.value}%`;
  redraw();
});
panXInput.addEventListener('input', () => {
  state.panels[selectedPanel].x = Number(panXInput.value);
  redraw();
});
panYInput.addEventListener('input', () => {
  state.panels[selectedPanel].y = Number(panYInput.value);
  redraw();
});
document.getElementById('fill-all').addEventListener('click', () => {
  const photo = state.panels[selectedPanel].photo;
  for (const panel of state.panels) panel.photo = photo;
  redraw();
  status.textContent = 'All panels now use the same photo.';
});

layoutSelect.addEventListener('change', () => {
  state.layout = layoutSelect.value;
  if (selectedPanel >= panelCount()) selectedPanel = 0;
  refreshAllControls();
  redraw();
});
gradeSelect.addEventListener('change', () => {
  state.grade = gradeSelect.value;
  redraw();
});
captionColorSelect.addEventListener('change', () => {
  state.captionColor = captionColorSelect.value;
  redraw();
});
captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  redraw();
});
subcaptionInput.addEventListener('input', () => {
  state.subcaption = subcaptionInput.value;
  redraw();
});
sizeSelect.addEventListener('change', () => {
  state.size = sizeSelect.value;
  redraw();
});

document.getElementById('export').addEventListener('click', () => {
  const out = renderCover(photos.map((p) => p.img), state);
  out.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export failed — please try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-nights-cover-${state.size}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved vice-nights-cover-${state.size}.png`;
  }, 'image/png');
});

// Screenshot scenes (?shot=cover / ?shot=editor) or the plain editor.
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    loadImage,
    applyState: (patch) => {
      Object.assign(state, patch);
      layoutSelect.value = state.layout;
      gradeSelect.value = state.grade;
      captionColorSelect.value = state.captionColor;
      sizeSelect.value = state.size;
      captionInput.value = state.caption;
      subcaptionInput.value = state.subcaption;
      refreshAllControls();
    },
    addPhoto,
    redraw,
  });
} else {
  refreshAllControls();
  redraw();
}
