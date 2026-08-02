import * as THREE from 'three';
import { BIOMES } from './biomes.js';

const CORRIDOR_HALF_WIDTH = 900;
const ROW_STEP = 5; // sample every 5th road frame (~30m) for scenery placement
const MAX_PER_TYPE = 6000;

function makeTree() {
  const group = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.26, 2.2, 5);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#5b4630', roughness: 1 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.1;
  const foliageGeo = new THREE.ConeGeometry(1.6, 3.4, 7);
  const foliageMat = new THREE.MeshStandardMaterial({ color: '#3c6b3c', roughness: 1 });
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.y = 3.6;
  group.add(trunk, foliage);
  return group;
}

function makeRock() {
  const geo = new THREE.IcosahedronGeometry(0.9, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#8a8378', roughness: 1, flatShading: true });
  return new THREE.Mesh(geo, mat);
}

function makeCactus() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: '#4f7a4a', roughness: 1 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 2.6, 7), mat);
  body.position.y = 1.3;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.2, 6), mat);
  arm.position.set(0.5, 1.7, 0);
  arm.rotation.z = Math.PI / 2.4;
  group.add(body, arm);
  return group;
}

function makeBuilding() {
  const h = 4 + Math.random() * 14;
  const geo = new THREE.BoxGeometry(4 + Math.random() * 3, h, 4 + Math.random() * 3);
  const shade = 0.55 + Math.random() * 0.25;
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(shade, shade * 0.98, shade * 1.02), roughness: 0.85 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.height = h;
  return mesh;
}

function flattenToInstanced(prototype, transforms, castShadow = true) {
  const meshes = [];
  prototype.traverse(child => {
    if (child.isMesh) meshes.push(child);
  });
  const group = new THREE.Group();
  meshes.forEach(m => {
    const inst = new THREE.InstancedMesh(m.geometry, m.material, transforms.length);
    inst.castShadow = castShadow;
    inst.receiveShadow = true;
    const matrix = new THREE.Matrix4();
    transforms.forEach((t, i) => {
      matrix.compose(
        new THREE.Vector3(t.x, t.y + m.position.y, t.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, t.rot, 0)),
        new THREE.Vector3(t.scale, t.scale, t.scale)
      );
      inst.setMatrixAt(i, matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    group.add(inst);
  });
  return group;
}

export function buildScenery(roadFrames, sampler, roadHalfWidth) {
  const treeT = [];
  const rockT = [];
  const cactusT = [];
  const buildingT = [];

  for (let i = 0; i < roadFrames.length; i += ROW_STEP) {
    const f = roadFrames[i];
    const { fromBiome, toBiome, t } = sampler.biomeBlendAt(f.distance);
    const biome = t < 0.5 ? fromBiome : toBiome;
    const def = BIOMES[biome] ?? BIOMES.plains;

    const attempts = 3;
    for (let a = 0; a < attempts; a++) {
      if (Math.random() > def.treeDensity + def.rockDensity) continue;
      const side = Math.random() < 0.5 ? -1 : 1;
      const lateral = side * (roadHalfWidth + 6 + Math.random() * (CORRIDOR_HALF_WIDTH - roadHalfWidth - 6));
      const x = f.position.x + f.right.x * lateral;
      const z = f.position.z + f.right.z * lateral;
      const y = sampler.heightAt(x, z);
      const rot = Math.random() * Math.PI * 2;
      const isRock = Math.random() < def.rockDensity / (def.treeDensity + def.rockDensity + 1e-6);

      if (biome === 'urban' && Math.abs(lateral) > roadHalfWidth + 20 && Math.random() < 0.06) {
        if (buildingT.length < MAX_PER_TYPE) buildingT.push({ x, y, z, rot, scale: 1 });
      } else if (biome === 'desert' && !isRock && Math.random() < 0.5) {
        if (cactusT.length < MAX_PER_TYPE) cactusT.push({ x, y, z, rot, scale: 0.8 + Math.random() * 0.6 });
      } else if (isRock) {
        if (rockT.length < MAX_PER_TYPE) rockT.push({ x, y, z, rot, scale: 0.5 + Math.random() * 1.4 });
      } else {
        if (treeT.length < MAX_PER_TYPE) treeT.push({ x, y, z, rot, scale: 0.7 + Math.random() * 0.8 });
      }
    }
  }

  const group = new THREE.Group();
  group.name = 'scenery';
  if (treeT.length) group.add(flattenToInstanced(makeTree(), treeT));
  if (rockT.length) group.add(flattenToInstanced(makeRock(), rockT));
  if (cactusT.length) group.add(flattenToInstanced(makeCactus(), cactusT));
  if (buildingT.length) group.add(flattenToInstanced(makeBuilding(), buildingT));
  return group;
}
