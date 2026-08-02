import * as THREE from 'three';
import { fbm2D } from './noise.js';
import { BIOMES, biomeColor } from './biomes.js';

// Shared ground-height/biome sampler used by both the terrain mesh builder
// and the car controller, so what you see is exactly what you drive on.
export function createTerrainSampler(routeData, roadFrames, roadHalfWidth) {
  let lastIndex = 0;
  const n = roadFrames.length;

  function nearestFrame(x, z) {
    const searchRadius = 40;
    let start = Math.max(0, lastIndex - searchRadius);
    let end = Math.min(n - 1, lastIndex + searchRadius);
    let bestIdx = lastIndex;
    let bestDist = Infinity;
    for (let i = start; i <= end; i++) {
      const f = roadFrames[i];
      const dx = f.position.x - x;
      const dz = f.position.z - z;
      const d = dx * dx + dz * dz;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx === start || bestIdx === end) {
      for (let i = 0; i < n; i += 5) {
        const f = roadFrames[i];
        const dx = f.position.x - x;
        const dz = f.position.z - z;
        const d = dx * dx + dz * dz;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
    }
    lastIndex = bestIdx;
    return roadFrames[bestIdx];
  }

  function biomeBlendAt(distance) {
    const { from, to, t } = routeData.infoAtDistance(distance);
    const ba = BIOMES[from.biome] ?? BIOMES.plains;
    const bb = BIOMES[to.biome] ?? BIOMES.plains;
    const amplitude = THREE.MathUtils.lerp(ba.roughness, bb.roughness, t) * 5;
    const color = biomeColor(from.biome).lerp(biomeColor(to.biome), t);
    return { amplitude, color, fromBiome: from.biome, toBiome: to.biome, t, state: t < 0.5 ? from.code : to.code, town: t < 0.5 ? from : to };
  }

  function lateralOf(x, z, frame) {
    return (x - frame.position.x) * frame.right.x + (z - frame.position.z) * frame.right.z;
  }

  function heightAt(x, z) {
    const f = nearestFrame(x, z);
    const lateral = lateralOf(x, z, f);
    const { amplitude } = biomeBlendAt(f.distance);
    const big = fbm2D(f.distance * 0.004, lateral * 0.01, 4) * amplitude;
    const detail = fbm2D(f.distance * 0.02, lateral * 0.05, 3) * amplitude * 0.3;
    let h = big + detail;
    const edge = Math.abs(lateral) - (roadHalfWidth + 2);
    const flatten = THREE.MathUtils.clamp(edge / 10, 0, 1);
    h *= flatten;
    return f.position.y + h;
  }

  function infoAt(x, z) {
    const f = nearestFrame(x, z);
    const lateral = lateralOf(x, z, f);
    return { frame: f, lateral, ...biomeBlendAt(f.distance) };
  }

  return { heightAt, infoAt, nearestFrame, biomeBlendAt, lateralOf };
}
