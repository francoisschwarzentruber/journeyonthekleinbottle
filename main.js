import * as THREE from 'three';
import Input from './input.js';


const scene = new THREE.Scene();
//scene.background = new THREE.Color("lightblue");
scene.fog = new THREE.Fog(0x0, 3, 20);

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



function shiftV(v) {
  v = (v <= 0.5) ? 0.5 - v : 1 - v;
  if (v >= 1) v--;
  return v;
}



class KleinBottle {

  static getCaption(pos) {
    function between(x, a, b) {
      return a <= x && x <= b;
    }
    if (pos.outside) {
      if (between(pos.u, 0, 0.2))
        return "Turning around the bottom outside the bottle";

      if (between(pos.u, 0.2, 0.5))
        return "Outside the bottle";

      if (between(pos.u, 0.5, 0.75))
        return "Neck of the bottle";

      if (between(pos.u, 0.75, 0.90))
        return "The neck is going inside the bottle";

      if (between(pos.u, 0.90, 0.95))
        return "On the neck but inside the bottle";

      if (between(pos.u, 0.95, 1))
        return "Reaching the bottom of the bottle";

    }
    else {
      if (between(pos.u, 0, 0.20))
        return "Turning around the bottom inside the bottle";

      if (between(pos.u, 0.20, 0.35))
        return "Inside the bottle (we see the end of the neck)";


      if (between(pos.u, 0.35, 0.5))
        return "Inside the bottle";


      if (between(pos.u, 0.5, 0.6))
        return "Inside the neck";

      if (between(pos.u, 0.6, 0.72))
        return "The neck is turning";

      if (between(pos.u, 0.72, 0.86))
        return "We see a part of the bottle wall we will cross";

      if (between(pos.u, 0.86, 0.9))
        return "Inside the neck which inside the bottle";

      if (between(pos.u, 0.9, 1))
        return "At the bottom of the bottle";

    }


    return undefined;
  }
  static getParameterization(u, v) {
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
   * 
   * @param {*} u between 0 and 1
   * @param {*} v between 0 and 1
   * @returns the point on the surface at u v
   */
  static getPoint(u, v) {
    if (u > 1) {
      u = u - 1;
      v = shiftV(v);
    }
    return KleinBottle.getParameterization(u, v);
  }


  static du(u, v) {
    const p1 = KleinBottle.getPoint(u, v);
    const p2 = KleinBottle.getPoint(u + 0.01, v);
    return [0, 1, 2].map((i) => (p2[i] - p1[i]));
  }


  static dv(u, v) {
    const p1 = KleinBottle.getPoint(u, v);
    const p2 = KleinBottle.getPoint(u, v + 0.01);
    return [0, 1, 2].map((i) => (p2[i] - p1[i]));
  }



}



class KleinBottleThreeJS {
  constructor() {
    function geometryKleinBottle(uBegin, uEnd) {
      const geometry = new THREE.BufferGeometry();
      const verticesArray = [];
      const uvsArray = [];
      const indices = [];
      let i = 0;

      const stepU = 0.001;
      const stepV = 0.001;
      for (let u = uBegin; u < uEnd; u += stepU)
        for (let v = 0; v < 1; v += stepV) {
          verticesArray.push(...KleinBottle.getParameterization(u, v));
          verticesArray.push(...KleinBottle.getParameterization(u, v + stepV));
          verticesArray.push(...KleinBottle.getParameterization(u + stepU, v + stepV));
          verticesArray.push(...KleinBottle.getParameterization(u + stepU, v));

          uvsArray.push(u, v);
          uvsArray.push(u, v + stepV);
          uvsArray.push(u + stepU, v + stepV);
          uvsArray.push(u + stepU, v);

          indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
          i += 4;
        }

      const vertices = new Float32Array(verticesArray);
      const uvs = new Float32Array(uvsArray);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      geometry.normalizeNormals()
      return geometry;
    }


    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = "";
    //const filename = "SNES_Mario_Circuit_3_map.png";
    const filename = "ZeldaOverworldMap.png";
    const texture = textureLoader.load(filename);
    //const texture = textureLoader.load('degrade.png');

    function kleinBottleMesh(uBegin, uEnd, color) {
      const kleinBottleGeometry = geometryKleinBottle(uBegin, uEnd);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        //color,
        //wireframe: true,
        //  transparent: true
      });
      material.side = THREE.DoubleSide;
      return new THREE.Mesh(kleinBottleGeometry, material);
    }

    const nbMeshes = 50;
    this.meshes = [];

    for (let i = 0; i < nbMeshes; i++) {
      const u = i / nbMeshes;
      this.meshes.push(kleinBottleMesh(u, u + 1 / nbMeshes));

    }

    for (const m of this.meshes)
      scene.add(m);

  }



  tuneOpacity(uCurrent) {
    function distModulo1(u, u2) {
      return Math.min(Math.abs(u - u2 - 2), Math.abs(u - u2 - 1), Math.abs(u - u2), Math.abs(u - u2 + 1), Math.abs(u - u2 + 2))
    }

    for (let i = 0; i < this.meshes.length; i++) {
      const u = i / this.meshes.length;
      const d = distModulo1(uCurrent, u);

      const material = this.meshes[i].material;

      const isTransparent = (d > 0.3);
      material.transparent = isTransparent;

      if (isTransparent)
        material.opacity = 1.3 - d * 1.5;
      else
        material.opacity = 1;
    }
  }


}



const kb3d = new KleinBottleThreeJS();


const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);



function arrToThreeVec(a) {
  return new THREE.Vector3(a[0], a[1], a[2]);
}

const SPEEDU = 0.0005;//move foward downward
const SPEEDV = 0.0005;//turn


class BottleKleinPosition {
  constructor(u, v, inside) {
    this.u = u;
    this.v = v;
    this.outside = inside;
  }

  _shiftV() { this.v = shiftV(this.v); }


  uPlus() {
    this.u += SPEEDU;
    if (this.u >= 1) {
      this.outside = !this.outside;
      this._shiftV();
      this.u = this.u - 1;
    }
  }

  uMinus() {
    this.u -= SPEEDU;
    if (this.u < 0) {
      this.outside = !this.outside;
      this._shiftV();
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



let pos = new BottleKleinPosition(0.35, 0.25, true);

function setCamera() {
  const distanceVNext = 0.1;
  const h = 0.2;
  const pointSurface = arrToThreeVec(KleinBottle.getPoint(pos.u, pos.v));
  const nextPointSurface = arrToThreeVec(KleinBottle.getPoint(pos.u + distanceVNext, pos.v));
  const du = arrToThreeVec(KleinBottle.du(pos.u, pos.v));
  const dv = arrToThreeVec(KleinBottle.dv(pos.u, pos.v));

  const upVector = du.clone().cross(dv).normalize();
  if (pos.outside)
    upVector.negate();

  const pointSurfaceAbove = pointSurface.clone().add(upVector.clone().multiplyScalar(h));

  //set the vector for THREE.js
  const cameraPosition = pointSurfaceAbove;
  const lookAtVector = pointSurfaceAbove.clone().add(du);

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

  kb3d.tuneOpacity(pos.u);

  function arrayOfNumbersToStr(v) {
    return v.map((e) => e.toFixed(2));
  }
  document.getElementById("info").innerHTML = "u = " + pos.u.toFixed(2) + ", v = " + pos.v.toFixed(2)
    + ",<br> outside: " + pos.outside + ", <br>"
    + "pos : " + arrayOfNumbersToStr(KleinBottle.getPoint(pos.u, pos.v)) + "<br>"
    + "du : " + arrayOfNumbersToStr(KleinBottle.du(pos.u, pos.v))
    + "dv : " + arrayOfNumbersToStr(KleinBottle.dv(pos.u, pos.v));
  requestAnimationFrame(animate);
  setCamera();
  // deloin();

  document.getElementById("caption").innerHTML = KleinBottle.getCaption(pos);
  renderer.render(scene, camera);


}
animate();





