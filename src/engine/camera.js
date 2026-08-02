import * as THREE from 'three';

const MODES = [
  { name: 'chase', distance: 9, height: 3.4, lookHeight: 1.2, lerp: 4.5 },
  { name: 'close', distance: 5.5, height: 2.1, lookHeight: 1.0, lerp: 6 },
  { name: 'far', distance: 16, height: 6.5, lookHeight: 1.5, lerp: 3.2 },
  { name: 'top', distance: 0.001, height: 55, lookHeight: 0, lerp: 3.5, top: true }
];

export class ChaseCamera {
  constructor(camera) {
    this.camera = camera;
    this.modeIndex = 0;
    this._pos = new THREE.Vector3();
    this._look = new THREE.Vector3();
    this._initialized = false;
  }

  cycleMode() {
    this.modeIndex = (this.modeIndex + 1) % MODES.length;
  }

  update(dt, car) {
    const mode = MODES[this.modeIndex];
    const dir = car.forwardVector;
    let desired;
    let lookAt;

    if (mode.top) {
      desired = car.position.clone().add(new THREE.Vector3(0, mode.height, 0.01));
      lookAt = car.position.clone();
    } else {
      desired = car.position.clone()
        .addScaledVector(dir, -mode.distance)
        .add(new THREE.Vector3(0, mode.height, 0));
      lookAt = car.position.clone().addScaledVector(dir, 4).add(new THREE.Vector3(0, mode.lookHeight, 0));
    }

    if (!this._initialized) {
      this._pos.copy(desired);
      this._look.copy(lookAt);
      this._initialized = true;
    } else {
      const t = 1 - Math.exp(-mode.lerp * dt);
      this._pos.lerp(desired, t);
      this._look.lerp(lookAt, t);
    }

    this.camera.position.copy(this._pos);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this._look);
  }
}
