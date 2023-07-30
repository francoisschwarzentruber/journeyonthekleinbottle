import * as THREE from 'three';

const scene = new THREE.Scene();


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


class KleinBottle {

  /**
   * 
   * @param {*} u between 0 and 1
   * @param {*} v between 0 and 1
   * @returns 
   */
  static getPoint(u, v) {
    u = u * Math.PI * 2;
    v = v * Math.PI * 4;

    const sin = Math.sin;
    const cos = Math.cos;
    const pi = Math.PI;

    const x = v < 2 * pi ? (2.5 - 1.5 * cos(v)) * cos(u) :
      (v < 3 * pi ? -2 + (2 + cos(u)) * cos(v) :
        -2 + 2 * cos(v) - cos(u));
    const y = v < 2 * pi ? (2.5 - 1.5 * cos(v)) * sin(u) :
      sin(u);
    const z = v < pi ? -2.5 * sin(v) :
      v < 2 * pi ? 3 * v - 3 * pi :
        v < 3 * pi ? (2 + cos(u)) * sin(v) + 3 * pi :
          -3 * v + 12 * pi;

    return [x, y, z];
  }


  static centerAt(v) {

    let n = 0;
    let vec = [0, 0, 0];
    for (let u = 0; u < 1; u += 0.2) {
      n++;
      const A = KleinBottle.getPoint(u, v);
      vec = [vec[0] + A[0], vec[1] + A[1], vec[2] + A[2]];
    }
    return [vec[0] / n, vec[1] / n, vec[2] / n];
  }

}


function geometryKleinBottle(uBegin, uEnd) {
  const geometry = new THREE.BufferGeometry();
  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.
  const verticesArray = [];
  const uvsArray = [];
  const step = 0.005;
  for (let v = uBegin; v < uEnd; v += step)
    for (let u = 0; u < 1; u += step) {
      verticesArray.push(...KleinBottle.getPoint(u, v));
      verticesArray.push(...KleinBottle.getPoint(u, v + step));
      verticesArray.push(...KleinBottle.getPoint(u + step, v + step));

      verticesArray.push(...KleinBottle.getPoint(u + step, v + step));
      verticesArray.push(...KleinBottle.getPoint(u, v));
      verticesArray.push(...KleinBottle.getPoint(u + step, v));

      uvsArray.push([u, v]);
      uvsArray.push([u, v + step]);
      uvsArray.push([u + step, v + step]);

      uvsArray.push([u + step, v + step]);
      uvsArray.push([u, v]);
      uvsArray.push([u + step, v]);


    }

  const vertices = new Float32Array(verticesArray);
  const uvs = new Float32Array(uvsArray);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geometry;
}




function kleinBottleMesh(uBegin, uEnd, color) {
  const sphereGeometry = geometryKleinBottle(uBegin, uEnd);
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('map.jpg');
  const material = new THREE.MeshBasicMaterial({ map: texture
  //  , color, wireframe: true
   });
  material.side = THREE.DoubleSide;
  return new THREE.Mesh(sphereGeometry, material);
}


scene.add(kleinBottleMesh(0, 1 / 2, "lightgreen"));
scene.add(kleinBottleMesh(1 / 2, 1, "brown"));


const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);



function arrToThreeVec(a) {
  return new THREE.Vector3(a[0], a[1], a[2]);
}



class BottleKleinPosition {
  constructor(u, v, inside) {
    this.u = u;
    this.v = v;
    this.inside = inside;
  }


  uPlus() {
    const SPEED = 0.005;
    this.u += SPEED;
    if (this.u >= 1) {
      this.u = this.u - 1;
    }
  }

  vPlus() {
    const SPEED = 0.005;
    this.v += SPEED;
    if (this.v >= 1) {
      this.inside != this.inside;
      this.v = this.u - 1;
    }
  }


}



let pos = new BottleKleinPosition(0, 0, false);

function setCamera() {
  const pointSurface = arrToThreeVec(KleinBottle.getPoint(pos.u, pos.v));
  const nextPointSurface = arrToThreeVec(KleinBottle.getPoint(pos.u, pos.v));
  const center = arrToThreeVec(KleinBottle.centerAt(pos.v));
  const nextCenter = arrToThreeVec(KleinBottle.centerAt(pos.v + 0.1));

  const normalToOutside = new THREE.Vector3(pointSurface.x - center.x, pointSurface.y - center.y, pointSurface.z - center.z);
  const normalToInside = normalToOutside.clone().negate();

  const pointSurfaceOutside = pointSurface.clone().add(normalToOutside);
  const pointSurfaceInside = pointSurface.clone().add(normalToOutside.clone().negate());


  //set the vector for THREE.js


  let cameraPosition;
  let lookAtVector;
  let upVector;

  if (pos.inside) {
    cameraPosition = pointSurfaceInside;
    lookAtVector = nextCenter;
    upVector = normalToOutside;
  }
  else {
    cameraPosition = pointSurfaceOutside;
    lookAtVector = nextCenter;
    upVector = normalToOutside;
  }

  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  camera.lookAt(lookAtVector);
  camera.up.set(upVector.x, upVector.y, upVector.z);

}


function deloin() {
  camera.position.set(-1, -10, -1);
  camera.lookAt(0, 0, 0);
  camera.up.set(0, 10, 0);
}
//sphereMesh.rotation.y = 1;

function animate() {
  pos.vPlus();
  requestAnimationFrame(animate);
  setCamera();
  // deloin();
  //sphereMesh.rotation.y += 0.01;
  // sphereMesh.rotation.z -= 0.01;
  renderer.render(scene, camera);
}
animate();


let position = [1, 0, 0];
let direction = [0, 1, 0];
