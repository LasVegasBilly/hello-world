import * as THREE from 'three';

// A soft gradient sky dome plus lighting rig tuned for a calm, sunny
// cross-country drive.
export function buildSky(scene) {
  const skyGeo = new THREE.SphereGeometry(5000, 24, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color('#5fa8e8') },
      bottomColor: { value: new THREE.Color('#dff0f5') },
      offset: { value: 400 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    depthWrite: false
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.renderOrder = -1;
  scene.add(sky);

  scene.fog = new THREE.Fog(0xdff0f5, 400, 2600);

  const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x8a9b6a, 0.7);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff3d6, 1.6);
  sun.position.set(600, 800, 300);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -300;
  sun.shadow.camera.right = 300;
  sun.shadow.camera.top = 300;
  sun.shadow.camera.bottom = -300;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 2000;
  sun.shadow.bias = -0.0015;
  scene.add(sun);
  scene.add(sun.target);

  return { sky, sun, hemi };
}
