import * as THREE from 'three';

// Procedural tileable asphalt texture with a dashed yellow center line and
// white edge lines — avoids needing any external image assets.
export function makeRoadTexture() {
  const w = 256;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#3a3b3f';
  ctx.fillRect(0, 0, w, h);

  // subtle noise for asphalt grain
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const shade = Math.random() * 30 - 15;
    ctx.fillStyle = `rgba(${shade > 0 ? 255 : 0},${shade > 0 ? 255 : 0},${shade > 0 ? 255 : 0},${Math.abs(shade) / 120})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // white edge lines
  ctx.fillStyle = '#e8e4d8';
  ctx.fillRect(w * 0.06, 0, w * 0.02, h);
  ctx.fillRect(w * 0.92, 0, w * 0.02, h);

  // yellow dashed center line
  ctx.fillStyle = '#e8c93a';
  const dashLen = h * 0.12;
  const gapLen = h * 0.1;
  let y = 0;
  while (y < h) {
    ctx.fillRect(w / 2 - w * 0.01, y, w * 0.02, dashLen);
    y += dashLen + gapLen;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}
