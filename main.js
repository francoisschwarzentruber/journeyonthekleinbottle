import * as THREE from 'three';

const scene = new THREE.Scene();


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function geometryKleinBottle() {
  const geometry = new THREE.BufferGeometry();

  const sin = Math.sin;
  const cos = Math.cos;
  const frac = (a, b) => a / b;
  const sqrt = Math.sqrt;
  const pi = Math.PI;
  const cos2 = (x) => cos(x) ** 2;
  const cos3 = (x) => cos(x) ** 3;
  const cos4 = (x) => cos(x) ** 4;
  const sin2 = (x) => sin(x) ** 2;

  function getPoint(u, v) {
    const x = frac(sqrt(2) * (20 * u ** 3 - 65 * pi * u ** (2) + 50 * pi ** (2) * u - 16 * pi ** 3) * cos(v) * (cos(u) * (3 * cos2(u) - 1) - 2 * cos(2 * u)),
      80 * pi ** 3 * sqrt(
        8 * cos2(2 * u) - cos(2 * u) * (24 * cos3(u) - 8 * cos(u) + 15) + 6 * cos4(u) * (1 - 3 * sin2(u)) + 17
      ))
      - frac(3 * cos(u) - 3, 4)
    const y = -frac((20 * u ** (3) - 65 * pi * u ** (2) + 50 * pi ** (2) * u - 16 * pi ** (3)) * sin(v),
      (60 * pi ** (3)));
    const z = -frac(sqrt(2) * (20 * u ** (3) - 65 * pi * u ** (2) + 50 * pi ** (2) * u - 16 * pi ** (3)) * sin(u) * cos(v),
      15 * pi ** (3) * sqrt(8 * cos2(2 * u) - cos(2 * u) * (24 * cos3(u) - 8 * cos(u) + 15) + 6 * cos4(u) * (1 - 3 * sin2(u)) + 17))
      + frac(sin(u) * cos2(u) + sin(u), 4)
      - frac(sin(u) * cos(u), 2);
    console.log([x, y, z])
    return [x, y, z];
  }
  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.

  const verticesArray = [];
  const step = 0.1;
  for (let u = 0.1; u < 2 * pi; u += step)
    for (let v = 0.1; v < 2 * pi; v += step) {
      verticesArray.push(...getPoint(u, v));
      verticesArray.push(...getPoint(u, v + step));
      verticesArray.push(...getPoint(u + step, v + step));

      verticesArray.push(...getPoint(u + step, v + step));
      verticesArray.push(...getPoint(u, v));
      verticesArray.push(...getPoint(u + step, v));
    }

  const vertices = new Float32Array(
    verticesArray
  );
  // itemSize = 3 because there are 3 values (components) per vertex
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));


  return geometry;
}



const sphereGeometry = geometryKleinBottle();



const textureLoader = new THREE.TextureLoader();
//const texture = textureLoader.load('SNES_Mario_Circuit_3_map.png');
const texture = textureLoader.load('map.jpg');

const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
material.side = THREE.DoubleSide;
const sphereMesh = new THREE.Mesh(sphereGeometry, material);

scene.add(sphereMesh);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

function inside() {
  camera.position.set(0, 2, 0);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 1, 0);
}

inside();
//sphereMesh.rotation.y = 1;

function animate() {
  requestAnimationFrame(animate);

  //sphereMesh.rotation.y += 0.01;
  sphereMesh.rotation.z -= 0.01;
  renderer.render(scene, camera);
}
animate();


let position = [1, 0, 0];
let direction = [0, 1, 0];
