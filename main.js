import * as THREE from 'three';
import Input from './input.js';


const scene = new THREE.Scene();
//scene.background = new THREE.Color("lightblue");
scene.fog = new THREE.Fog(0x888888, 3, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



function moy2(A, B, w) {
  return [0, 1, 2].map((i) => A[i] * (1 - w) + B[i] * w);
}

function moy3(A, B, C, w) {
  if (w < 1 / 2)
    return moy2(A, B, w * 2);
  else
    return moy2(B, C, (w - 1 / 2) * 2);
}


class KleinBottle {

  /**
   * 
   * @param {*} u between 0 and 1
   * @param {*} v between 0 and 1
   * @returns the point on the surface at u v
   */
  static getPoint(u, v) {
    [u, v] = [u * Math.PI * 4, v * Math.PI * 2];

    const sin = Math.sin;
    const cos = Math.cos;
    const pi = Math.PI;

    [u, v] = [v, u];
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



  /**
   *   static getPoint(u, v) {
    [u, v] = [u * Math.PI * 2, v * Math.PI * 2];

    const sin = Math.sin;
    const cos = Math.cos;
    const pi = Math.PI;

     const c = 4 - 2 * cos(u);
     const x = -6 * cos(u) * (1 + sin(u)) + c * cos(v);
     const y = 16 * sin(u);
     const z = c * sin(v);

    return [x, y, z];
  }
   */

  /**
   * 
   * @param {*} u 
   * @returns the point at the center of the slice v
   */
  static centerAt(u) {

    let n = 0;
    let vec = [0, 0, 0];
    for (let v = 0; v < 1; v += 0.1) {
      n++;
      const A = KleinBottle.getPoint(u, v);
      vec = [vec[0] + A[0], vec[1] + A[1], vec[2] + A[2]];
    }
    return [vec[0] / n, vec[1] / n, vec[2] / n];
  }



  static upVector(pos) {
    const p = KleinBottle.getPoint(pos.u, pos.v);
    const c = KleinBottle.centerAt(pos.u);
    const vec = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
    const vecOpposed = [-vec[0], -vec[1], -vec[2]];

    const vFinal = pos.outside ? vec : vecOpposed;
    return vFinal;
    /* if (pos.v > 0.1)
       return vFinal;
     else
       return moy3([-vFinal[0], -vFinal[1], -vFinal[2]], [0, 0, -20], vFinal, pos.v / 0.1);//a bit a hack
 */
    //
    //  return moy3([-vFinal[0], -vFinal[1], -vFinal[2]], [0, 0, -20], vFinal, pos.v / 0.1);//a bit a hack

  }





}



function geometryKleinBottle(uBegin, uEnd) {
  const geometry = new THREE.BufferGeometry();
  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.
  const verticesArray = [];
  const uvsArray = [];
  const indices = [];
  let i = 0;
  const step = 0.005;
  for (let v = uBegin; v < uEnd; v += step)
    for (let u = 0; u < 1; u += step) {
      verticesArray.push(...KleinBottle.getPoint(u, v));
      verticesArray.push(...KleinBottle.getPoint(u, v + step));
      verticesArray.push(...KleinBottle.getPoint(u + step, v + step));
      verticesArray.push(...KleinBottle.getPoint(u + step, v));

      uvsArray.push(u, v);
      uvsArray.push(u, v + step);
      uvsArray.push(u + step, v + step);
      uvsArray.push(u + step, v);

      indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
      i += 4;
    }

  const vertices = new Float32Array(verticesArray);
  const uvs = new Float32Array(uvsArray);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  /*  geometry.computeVertexNormals();
    geometry.normalizeNormals ()
   */
  return geometry;
}


const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = "";
const texture = textureLoader.load('ZeldaOverworldMap.png');

function kleinBottleMesh(uBegin, uEnd, color) {
  const kleinBottleGeometry = geometryKleinBottle(uBegin, uEnd);


  const material = new THREE.MeshBasicMaterial({
    map: texture,
    //color,
    //wireframe: true,
    opacity: 0.9,
    transparent: true
  });
  material.side = THREE.DoubleSide;
  return new THREE.Mesh(kleinBottleGeometry, material);
}


scene.add(kleinBottleMesh(0, 1, "green"));

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);



function arrToThreeVec(a) {
  return new THREE.Vector3(a[0], a[1], a[2]);
}

const SPEEDU = 0.0009;
const SPEEDV = 0.009;


class BottleKleinPosition {
  constructor(u, v, inside) {
    this.u = u;
    this.v = v;
    this.outside = inside;
  }


  uPlus() {
    this.u += SPEEDU;
    if (this.u >= 1) {
      this.outside = !this.outside;
      this.u = this.u - 1;
    }
  }

  uMinus() {
    this.u -= SPEEDU;
    if (this.u < 0) {
      this.outside = !this.outside;

      this.u++;
    }
  }

  vPlus() {
    this.v += SPEEDV;
    if (this.v >= 1) {
      this.v--;
    }
  }

  vMinus() {
    this.v -= SPEEDV;
    if (this.v < 0) {
      this.v++;
    }
  }


}



let pos = new BottleKleinPosition(0, 0.99, true);

function setCamera() {
  const distanceVNext = 0.1;
  const h = 0.1;
  const pointSurface = arrToThreeVec(KleinBottle.getPoint(pos.u, pos.v));
  const nextPointSurface = arrToThreeVec(KleinBottle.getPoint(pos.u + distanceVNext, pos.v));
  const center = arrToThreeVec(KleinBottle.centerAt(pos.u + distanceVNext));
  const nextCenter = arrToThreeVec(KleinBottle.centerAt(pos.u + distanceVNext));

  const upVector = arrToThreeVec(KleinBottle.upVector(pos));

  const pointSurfaceAbove = pointSurface.clone().add(upVector.clone().multiplyScalar(h));
  const nextPointSurfaceAbove = nextPointSurface;//.clone().add(upVector.clone().multiplyScalar(h));


  //set the vector for THREE.js
  const cameraPosition = pointSurfaceAbove;
  const lookAtVector = nextPointSurfaceAbove;

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
  if (Input["ArrowUp"]) pos.uPlus();
  if (Input["ArrowDown"]) pos.uMinus();
  if (Input["ArrowLeft"]) pos.vPlus();
  if (Input["ArrowRight"]) pos.vMinus();

  document.getElementById("info").innerHTML = "u = " + pos.u + ", v = " + pos.v
    + ",<br> outside: " + pos.outside + ", <br>"
    + "pos : " + KleinBottle.getPoint(pos.u, pos.v) + "<br>"
    + "up : " + KleinBottle.upVector(pos);
  requestAnimationFrame(animate);
  setCamera();
  // deloin();
  // deloin();
  //sphereMesh.rotation.y += 0.01;
  // sphereMesh.rotation.z -= 0.01;
  renderer.render(scene, camera);
}
animate();

