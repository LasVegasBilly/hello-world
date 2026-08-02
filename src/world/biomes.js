import * as THREE from 'three';

export const BIOMES = {
  urban:    { color: '#6f7860', roughness: 0.4, treeDensity: 0.02, rockDensity: 0.0, propScale: 1 },
  valley:   { color: '#7a9b5c', roughness: 0.8, treeDensity: 0.08, rockDensity: 0.02, propScale: 1 },
  mountain: { color: '#7d8570', roughness: 3.2, treeDensity: 0.22, rockDensity: 0.18, propScale: 1.2 },
  desert:   { color: '#c9a66b', roughness: 1.1, treeDensity: 0.01, rockDensity: 0.12, propScale: 0.8 },
  saltflat: { color: '#e9e7df', roughness: 0.15, treeDensity: 0.0, rockDensity: 0.01, propScale: 0.6 },
  plains:   { color: '#c2b25a', roughness: 0.6, treeDensity: 0.02, rockDensity: 0.01, propScale: 1 },
  farmland: { color: '#8a9b4a', roughness: 0.35, treeDensity: 0.03, rockDensity: 0.0, propScale: 1 },
  forest:   { color: '#4f7a4f', roughness: 1.4, treeDensity: 0.35, rockDensity: 0.05, propScale: 1.1 }
};

export function biomeColor(name) {
  return new THREE.Color(BIOMES[name]?.color ?? BIOMES.plains.color);
}
