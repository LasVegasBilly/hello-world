import * as THREE from 'three';
import { makeRoadTexture } from './roadTexture.js';

const ROAD_WIDTH = 14; // meters — real-scale divided highway incl. shoulders
const WORLD_UP = new THREE.Vector3(0, 1, 0);

// Samples the route curve at a fixed spacing and returns per-sample
// position/tangent/right/up frames, avoiding Frenet-frame flipping on
// near-straight stretches by deriving "right" from world-up instead.
export function sampleFrames(curve, spacing = 6) {
  const length = curve.getLength();
  const count = Math.max(2, Math.ceil(length / spacing));
  const frames = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const position = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    let right = new THREE.Vector3().crossVectors(tangent, WORLD_UP);
    if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
    right.normalize();
    const up = new THREE.Vector3().crossVectors(right, tangent).normalize();
    frames.push({ t, distance: t * length, position, tangent, right, up });
  }
  return frames;
}

export function buildRoadMesh(curve) {
  const frames = sampleFrames(curve, 6);
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const halfWidth = ROAD_WIDTH / 2;

  const RAISE = 0.1; // lift the road just above the terrain to avoid z-fighting where they're coplanar
  frames.forEach((f, i) => {
    const center = f.position.clone().addScaledVector(f.up, RAISE);
    const left = center.clone().addScaledVector(f.right, -halfWidth);
    const rightPt = center.clone().addScaledVector(f.right, halfWidth);
    positions.push(left.x, left.y, left.z, rightPt.x, rightPt.y, rightPt.z);
    normals.push(f.up.x, f.up.y, f.up.z, f.up.x, f.up.y, f.up.z);
    const v = f.distance / ROAD_WIDTH;
    uvs.push(0, v, 1, v);
  });

  for (let i = 0; i < frames.length - 1; i++) {
    const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
    indices.push(a, b, c, b, d, c);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  const texture = makeRoadTexture();
  texture.repeat.set(1, 1);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.95,
    metalness: 0.0
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.name = 'road';
  return { mesh, frames, roadWidth: ROAD_WIDTH };
}

export { ROAD_WIDTH };
