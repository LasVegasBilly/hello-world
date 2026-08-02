import * as THREE from 'three';

function buildCarMesh() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: '#c23b3b', roughness: 0.45, metalness: 0.25 });
  const glassMat = new THREE.MeshStandardMaterial({ color: '#274157', roughness: 0.15, metalness: 0.4 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: '#1b1b1b', roughness: 0.9 });
  const trimMat = new THREE.MeshStandardMaterial({ color: '#e7e2d6', roughness: 0.4, metalness: 0.3 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 4.4), bodyMat);
  body.position.y = 0.62;
  body.castShadow = true;

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 2.2), glassMat);
  cabin.position.set(0, 1.02, -0.15);
  cabin.castShadow = true;

  const bumperF = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.3, 0.3), trimMat);
  bumperF.position.set(0, 0.42, 2.2);
  const bumperR = bumperF.clone();
  bumperR.position.z = -2.2;

  group.add(body, cabin, bumperF, bumperR);

  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 14);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelPositions = [
    [-0.95, 0.42, 1.5], [0.95, 0.42, 1.5],
    [-0.95, 0.42, -1.5], [0.95, 0.42, -1.5]
  ];
  const wheels = wheelPositions.map(([x, y, z]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(x, y, z);
    w.castShadow = true;
    group.add(w);
    return w;
  });

  const headlight = new THREE.MeshStandardMaterial({ color: '#fff6d0', emissive: '#fff6d0', emissiveIntensity: 0.6 });
  [-0.7, 0.7].forEach(x => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.08), headlight);
    l.position.set(x, 0.62, 2.22);
    group.add(l);
  });

  group.userData.wheels = wheels;
  group.userData.frontWheels = [wheels[0], wheels[1]];
  return group;
}

const MAX_SPEED = 34;        // m/s (~122 km/h) cruising top speed
const MAX_REVERSE = 9;
const ACCEL = 12;
const REVERSE_ACCEL = 6;
const BRAKE_DECEL = 24;
const COAST_FRICTION = 3.2;
const OFFROAD_FRICTION_MULT = 2.6;
const OFFROAD_SPEED_MULT = 0.5;
const MAX_STEER = 0.65; // radians
const WHEELBASE = 2.9;

export class Car {
  constructor(startPosition, startHeading) {
    this.mesh = buildCarMesh();
    this.position = startPosition.clone();
    this.heading = startHeading;
    this.speed = 0;
    this.steerAngle = 0;
    this.mesh.position.copy(this.position);
    this.pitch = 0;
    this.roll = 0;
    this.wheelSpin = 0;
    this.onRoad = true;
  }

  get forwardVector() {
    return new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
  }

  update(dt, input, sampler, roadHalfWidth) {
    const throttleIn = (input.state.forward ? 1 : 0) - (input.state.backward ? 1 : 0);
    const steerIn = (input.state.right ? 1 : 0) - (input.state.left ? 1 : 0);

    const info = sampler.infoAt(this.position.x, this.position.z);
    this.onRoad = Math.abs(info.lateral) <= roadHalfWidth + 1;
    const speedCap = this.onRoad ? MAX_SPEED : MAX_SPEED * OFFROAD_SPEED_MULT;
    const frictionMult = this.onRoad ? 1 : OFFROAD_FRICTION_MULT;

    let accel = 0;
    if (throttleIn > 0) {
      accel = ACCEL * throttleIn;
    } else if (throttleIn < 0) {
      if (this.speed > 0.5) {
        accel = -BRAKE_DECEL; // braking while moving forward
      } else {
        accel = REVERSE_ACCEL * throttleIn; // reverse
      }
    }

    if (input.state.handbrake) {
      accel = -Math.sign(this.speed || 1) * BRAKE_DECEL * 1.4;
    }

    // natural coast friction
    if (Math.abs(throttleIn) < 0.01 && !input.state.handbrake) {
      accel = -Math.sign(this.speed) * COAST_FRICTION * frictionMult;
    }

    this.speed += accel * dt;
    if (Math.abs(this.speed) < 0.05 && Math.abs(throttleIn) < 0.01) this.speed = 0;
    this.speed = THREE.MathUtils.clamp(this.speed, -MAX_REVERSE, speedCap);

    // steering: less authority at very low speed to avoid spinning in place,
    // but enough to maneuver into/out of parking spots.
    const speedFactor = THREE.MathUtils.clamp(Math.abs(this.speed) / 6, 0.15, 1);
    const targetSteer = -steerIn * MAX_STEER;
    this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetSteer, Math.min(1, dt * 6));

    const angularVelocity = (this.speed / WHEELBASE) * Math.tan(this.steerAngle) * speedFactor;
    this.heading += angularVelocity * dt;

    const dir = this.forwardVector;
    this.position.addScaledVector(dir, this.speed * dt);

    const groundY = sampler.heightAt(this.position.x, this.position.z);
    // approximate slope for a gentle pitch/roll tilt
    const ahead = sampler.heightAt(this.position.x + dir.x * 2, this.position.z + dir.z * 2);
    const behind = sampler.heightAt(this.position.x - dir.x * 2, this.position.z - dir.z * 2);
    const right = new THREE.Vector3(dir.z, 0, -dir.x);
    const rightY = sampler.heightAt(this.position.x + right.x * 1.2, this.position.z + right.z * 1.2);
    const leftY = sampler.heightAt(this.position.x - right.x * 1.2, this.position.z - right.z * 1.2);

    this.pitch = THREE.MathUtils.lerp(this.pitch, Math.atan2(behind - ahead, 4), 0.2);
    this.roll = THREE.MathUtils.lerp(this.roll, Math.atan2(leftY - rightY, 2.4), 0.2);
    this.position.y = groundY;

    this.mesh.position.copy(this.position);
    this.mesh.position.y += 0.02;
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotation.order = 'YXZ';
    this.mesh.rotation.y = this.heading;
    this.mesh.rotation.x = this.pitch;
    this.mesh.rotation.z = this.roll;

    this.wheelSpin += this.speed * dt * 1.5;
    this.mesh.userData.wheels.forEach(w => { w.rotation.x = this.wheelSpin; });
    this.mesh.userData.frontWheels.forEach(w => { w.rotation.y = this.steerAngle; });

    return info;
  }
}
