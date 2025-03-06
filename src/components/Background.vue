<template>
  <canvas id="canvas"></canvas>
</template>

<script setup>
import * as THREE from 'three'
import { sinc } from 'three/tsl';
import { onMounted } from 'vue'


onMounted(() => {
  // Setup ------------------------------------------------------------------------------------------------
  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0)
  // Setup ------------------------------------------------------------------------------------------------

  window.addEventListener("resize", () => {
    // Update camera aspect ratio and projection matrix
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Resize the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);

    // You can also trigger a re-render immediately after resizing, if needed
    renderer.render(scene, camera);
  });

  // Rotation ------------------------------------------------------------------------------------------------

  function rotateSphere(sphere) {
    sphere.rotation.y -= 0.005;
    sphere.rotation.z -= 0.005;
    return sphere;
  }

  function rotateCube(cube) {
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
    return cube;
  }
  // Rotation ------------------------------------------------------------------------------------------------

  // Objects ------------------------------------------------------------------------------------------------

  let sphereInCubes = [];

  function sphereInCube(x, y, z) {
    let sizeFactor = window.innerWidth < 978 ? 7 : 10; // Smaller sizes for small screens
    let sphereSize = sizeFactor / 2; // Keep the sphere proportional

    const cubeGeo = new THREE.BoxGeometry(sizeFactor, sizeFactor, sizeFactor);
    const cubeMat = new THREE.MeshBasicMaterial({ color: 0xf9f1f1, wireframe: true, transparent: true, opacity: 0.1 });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(x, y, z);
    scene.add(cube);

    const sphereGeo = new THREE.SphereGeometry(sphereSize);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xf9f1f1, wireframe: true, transparent: true, opacity: 0.1 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(x, y, z);
    scene.add(sphere);

    animate();
    sphereInCubes.push({ sphere: sphere, cube: cube });
  }

  // Objects ------------------------------------------------------------------------------------------------

  // Animation  ------------------------------------------------------------------------------------------------

  function animate() {
    requestAnimationFrame(animate);
    sphereInCubes.forEach(({ sphere, cube }) => {
      rotateSphere(sphere);
      rotateCube(cube);
    });
    renderer.render(scene, camera);
  }

  // Animations------------------------------------------------------------------------------------------------

  // Camera move back on scroll -------------------------------------------------------------------------------
  window.addEventListener("scroll", () => {
    let scrollPosition = window.scrollY;
    if(scrollPosition < 300){
      camera.position.z =  5  + scrollPosition * 0.09;  // Example adjustment based on scroll
    }
    // else{
    //   // camera.position.y =  -1 * (scrollPosition * 0.05);  // Example adjustment based on scroll
    //   camera.position.y =  -1 * (scrollPosition * 0.05);  // Example adjustment based on scroll
    //   const leftObj = sphereInCubes[1];
    //   const rightObj = sphereInCubes[2];
    //   leftObj.cube.position.y += camera.position.y;
    //   leftObj.sphere.position.y += camera.position.y;
    //   rightObj.cube.position.y += camera.position.y;
    //   rightObj.sphere.position.y += camera.position.y;

    // }
    // sphereInCubes = sphereInCubes.filter(({ sphere }) => camera.position.z - sphere.position.z <= 20);
  })

  // Object Placement ------------------------------------------------------------------------------------------

  // Welcome Screen
  sphereInCube(0, 0, -10);

  // Hero
  sphereInCube(40, 25, 0);
  sphereInCube(-40, 25, 0);
  // sphereInCube(-75, -5, 20);

  // About

  // ....
})

</script>

<style>
canvas {
  background: #0e0e0e;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  animation: fade-background 0.2s ease forwards;
  opacity: 0;
}

@keyframes fade-background {
  from {
    background-color: #000000;
  }

  to {
    opacity: 1;
  }
}
</style>