import * as THREE from 'three';

const CORRIDOR_HALF_WIDTH = 900; // meters either side of the road — plenty of open room to roam
const ROW_SPACING = 45;
const COLS = 19;
const END_PAD_ROWS = 6; // extra rows extrapolated past each end so the camera never sees past the terrain's edge

function extrapolate(edge, spacing, sign) {
  return {
    position: edge.position.clone().addScaledVector(edge.tangent, spacing * sign),
    right: edge.right,
    tangent: edge.tangent,
    up: edge.up,
    distance: edge.distance + spacing * sign
  };
}

export function buildTerrainMesh(roadFrames, sampler) {
  const rows = [];
  for (let i = 0; i < roadFrames.length; i += Math.max(1, Math.round(ROW_SPACING / 6))) {
    rows.push(roadFrames[i]);
  }
  if (rows[rows.length - 1] !== roadFrames[roadFrames.length - 1]) {
    rows.push(roadFrames[roadFrames.length - 1]);
  }

  const leadIn = [];
  for (let k = END_PAD_ROWS; k >= 1; k--) leadIn.push(extrapolate(rows[0], ROW_SPACING * k, -1));
  const leadOut = [];
  for (let k = 1; k <= END_PAD_ROWS; k++) leadOut.push(extrapolate(rows[rows.length - 1], ROW_SPACING * k, 1));
  rows.unshift(...leadIn);
  rows.push(...leadOut);

  const positions = [];
  const colors = [];
  const indices = [];
  const tmpColor = new THREE.Color();

  rows.forEach((f, rowIdx) => {
    const { color } = sampler.biomeBlendAt(f.distance);
    for (let c = 0; c < COLS; c++) {
      const lateral = THREE.MathUtils.lerp(-CORRIDOR_HALF_WIDTH, CORRIDOR_HALF_WIDTH, c / (COLS - 1));
      const x = f.position.x + f.right.x * lateral;
      const z = f.position.z + f.right.z * lateral;
      const y = sampler.heightAt(x, z);
      positions.push(x, y, z);
      tmpColor.copy(color);
      const shade = 0.92 + Math.random() * 0.16;
      tmpColor.multiplyScalar(shade);
      colors.push(tmpColor.r, tmpColor.g, tmpColor.b);
    }
  });

  for (let r = 0; r < rows.length - 1; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      const a = r * COLS + c;
      const b = a + 1;
      const cc = a + COLS;
      const d = cc + 1;
      indices.push(a, b, cc, b, d, cc);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    metalness: 0
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';
  return mesh;
}
