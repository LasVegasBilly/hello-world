import * as THREE from 'three';
import { buildRoute } from './world/routeCurve.js';
import { buildRoadMesh, ROAD_WIDTH } from './world/road.js';
import { buildTerrainMesh } from './world/terrain.js';
import { buildScenery } from './world/scenery.js';
import { buildSky } from './world/sky.js';
import { createTerrainSampler } from './world/terrainHeight.js';
import { Car } from './engine/car.js';
import { ChaseCamera } from './engine/camera.js';
import { Input } from './engine/input.js';
import { Economy } from './economy/economy.js';
import { PlayerState } from './economy/playerState.js';
import { HUD } from './ui/hud.js';
import { MarketUI } from './ui/market.js';

const TOWN_RADIUS = 70;
const ROAD_HALF_WIDTH = ROAD_WIDTH / 2;

// ---------- Renderer / scene ----------
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 6000);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ---------- World ----------
const routeData = buildRoute();
const { mesh: roadMesh, frames } = buildRoadMesh(routeData.curve);
const sampler = createTerrainSampler(routeData, frames, ROAD_HALF_WIDTH);
const terrainMesh = buildTerrainMesh(frames, sampler);
const sceneryGroup = buildScenery(frames, sampler, ROAD_HALF_WIDTH);
const { sky, sun } = buildSky(scene);

scene.add(terrainMesh);
scene.add(roadMesh);
scene.add(sceneryGroup);

// ---------- Car ----------
const startPos = routeData.waypoints[0].position.clone();
const p1 = routeData.waypoints[1].position;
const startHeading = Math.atan2(p1.x - startPos.x, p1.z - startPos.z);
startPos.y = sampler.heightAt(startPos.x, startPos.z);

const car = new Car(startPos, startHeading);
scene.add(car.mesh);

const chaseCam = new ChaseCamera(camera);
const input = new Input();

// ---------- Economy / player ----------
const economy = new Economy();
const player = new PlayerState();

// ---------- UI ----------
const hud = new HUD(routeData);
const market = new MarketUI({
  onToast: (msg, opts) => hud.toast(msg, opts),
  onClose: () => {}
});

let gameStarted = false;
let paused = false;

document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('intro-screen').classList.add('hidden');
  hud.show();
  gameStarted = true;
});

function findNearTown(position) {
  let best = null;
  let bestDist = Infinity;
  for (const w of routeData.waypoints) {
    const d = Math.hypot(w.position.x - position.x, w.position.z - position.z);
    if (d < bestDist) {
      bestDist = d;
      best = w;
    }
  }
  return bestDist <= TOWN_RADIUS ? best : null;
}

function setPaused(next) {
  paused = next;
  document.getElementById('pause-overlay').classList.toggle('hidden', !paused);
  if (paused) document.getElementById('pause-overlay').textContent = 'Paused — press Esc to resume';
}

// ---------- Main loop ----------
let lastTime = performance.now();

function tick(now) {
  requestAnimationFrame(tick);
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(dt, 0.05);

  if (gameStarted) {
    if (input.consumeToggle('pause')) setPaused(!paused);

    if (!paused) {
      economy.tick(dt);

      const nearTown = findNearTown(car.position);

      if (input.consumeToggle('market')) {
        if (market.isOpen) {
          market.close();
        } else if (nearTown) {
          market.open(nearTown, economy, player);
        }
      }
      if (input.consumeToggle('camera')) chaseCam.cycleMode();

      const drivingEnabled = !market.isOpen;
      if (drivingEnabled) {
        const outOfFuel = player.fuel <= 0;
        const effectiveInput = outOfFuel
          ? { state: { ...input.state, forward: false, backward: input.state.backward } }
          : input;

        const prevPos = car.position.clone();
        const info = car.update(dt, effectiveInput, sampler, ROAD_HALF_WIDTH);
        const distanceMoved = car.position.distanceTo(prevPos);
        player.consumeFuel(distanceMoved, !car.onRoad);

        if (outOfFuel && !player.strandedNotified) {
          player.strandedNotified = true;
          hud.toast("Out of fuel — visit a town market to refuel.", { duration: 4000 });
        } else if (player.fuel > 0.5) {
          player.strandedNotified = false;
        }

        const dist = info?.frame?.distance ?? sampler.infoAt(car.position.x, car.position.z).frame.distance;
        const progress = THREE.MathUtils.clamp(dist / routeData.totalLength, 0, 1);
        const regionTown = routeData.nearestTown(dist);
        const locationLabel = nearTown ? `${nearTown.name}, ${nearTown.code}` : `Crossing ${regionTown.state}`;

        hud.update({
          speedMs: car.speed,
          fuelFraction: player.fuelFraction,
          money: player.money,
          locationLabel,
          progress,
          carPos: car.position,
          nearTown,
          offRoad: !car.onRoad
        });

        if (progress >= 0.999 && !player._arrivedNotified) {
          player._arrivedNotified = true;
          hud.toast('You made it — welcome to New York City! Coast to coast complete.', { duration: 6000 });
        }
      }

      chaseCam.update(dt, car);
    }
  }

  sky.position.set(camera.position.x, 0, camera.position.z);
  sun.position.set(car.position.x + 600, car.position.y + 800, car.position.z + 300);
  sun.target.position.copy(car.position);
  sun.shadow.camera.updateProjectionMatrix();

  renderer.render(scene, camera);
}

requestAnimationFrame(tick);
