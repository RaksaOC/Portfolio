<template>
  <canvas id="canvas"></canvas>
</template>

<script setup>
import * as THREE from 'three'
import { ref, onMounted, onUnmounted } from 'vue'

const theme = ref(localStorage.getItem("theme") || "dark");

// Store references for cleanup
let themeObserver = null;
let themeCheckInterval = null;
let storageEventListener = null;

// Helper function to get wireframe color based on theme
function getWireframeColor(currentTheme) {
  return currentTheme === "dark" ? 0xf9f1f1 : 0x000000; // White for dark theme, black for light theme
}

// Function to update theme colors for all wireframe objects
function updateThemeColors(currentTheme, sphereInCubes, planes) {
  const wireframeColor = getWireframeColor(currentTheme);

  // Update sphere and cube materials
  sphereInCubes.forEach(({ sphere, cube }) => {
    if (sphere.material) {
      sphere.material.color.set(wireframeColor);
    }
    if (cube.material) {
      cube.material.color.set(wireframeColor);
    }
  });

  // Update plane materials
  planes.forEach(plane => {
    if (plane.material) {
      plane.material.color.set(wireframeColor);
    }
  });
}

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
  let planes = [];

  function infiniteGroundGrid() {
    const PLANE_WIDTH = 600;
    const PLANE_LENGTH = 600;
    const SEGMENTS = 40;
    const SPEED = 0.2;

    const geometry = new THREE.PlaneGeometry(
      PLANE_WIDTH,
      PLANE_LENGTH,
      SEGMENTS,
      SEGMENTS
    );

    const wireframeColor = getWireframeColor(theme.value);
    const material = new THREE.MeshBasicMaterial({
      color: wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });

    const plane1 = new THREE.Mesh(geometry, material);
    const plane2 = new THREE.Mesh(geometry, material);

    // orientation
    plane1.rotation.x = -Math.PI / 2;
    plane2.rotation.x = -Math.PI / 2;

    // vertical placement
    plane1.position.y = -40;
    plane2.position.y = -40;

    // depth spacing
    plane1.position.z = 0;
    plane2.position.z = -PLANE_LENGTH;

    scene.add(plane1, plane2);
    planes.push(plane1, plane2);

    // Update fog based on theme
    scene.fog = new THREE.Fog(theme.value === "dark" ? 0x0e0e0e : 0xafafaf, 100, 300);


    function animate() {
      requestAnimationFrame(animate);

      plane1.position.z += SPEED;
      plane2.position.z += SPEED;

      // 🔁 leapfrog logic
      if (plane1.position.z > PLANE_LENGTH) {
        plane1.position.z = plane2.position.z - PLANE_LENGTH;
      }

      if (plane2.position.z > PLANE_LENGTH) {
        plane2.position.z = plane1.position.z - PLANE_LENGTH;
      }

      renderer.render(scene, camera);
    }

    animate();
  }



  function sphereInCube(x, y, z) {
    let sizeFactor = window.innerWidth < 978 ? 7 : 10; // Smaller sizes for small screens
    let sphereSize = sizeFactor / 2; // Keep the sphere proportional

    const wireframeColor = getWireframeColor(theme.value);
    const cubeGeo = new THREE.BoxGeometry(sizeFactor, sizeFactor, sizeFactor);
    const cubeMat = new THREE.MeshBasicMaterial({
      color: wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });

    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(x, y, z);
    scene.add(cube);

    const sphereGeo = new THREE.SphereGeometry(sphereSize);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });

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
    if (scrollPosition < 300) {
      camera.position.z = 5 + scrollPosition * 0.09;  // Example adjustment based on scroll
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
  sphereInCube(0, 0, -20);

  // Hero
  sphereInCube(40, 25, 0);
  sphereInCube(-40, 25, 0);
  infiniteGroundGrid();
  // sphereInCube(-75, -5, 20);

  // Listen for theme changes
  function handleThemeChange() {
    const newTheme = localStorage.getItem("theme") || "dark";
    if (newTheme !== theme.value) {
      theme.value = newTheme;
      updateThemeColors(theme.value, sphereInCubes, planes);

      // Update fog color
      scene.fog = new THREE.Fog(theme.value === "dark" ? 0x0e0e0e : 0xcacaca, 100, 300);
    }
  }

  // Listen for storage events (when theme changes in other tabs/windows)
  storageEventListener = handleThemeChange;
  window.addEventListener("storage", storageEventListener);

  // Also listen for custom events or check periodically (for same-tab changes)
  // Since localStorage.setItem in the same tab doesn't trigger storage event,
  // we'll use a MutationObserver on the data-theme attribute
  themeObserver = new MutationObserver(() => {
    handleThemeChange();
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // Also check on interval as a fallback (for same-tab localStorage changes)
  themeCheckInterval = setInterval(() => {
    handleThemeChange();
  }, 100);
})

onUnmounted(() => {
  // Clean up event listeners
  if (storageEventListener) {
    window.removeEventListener("storage", storageEventListener);
  }
  if (themeObserver) {
    themeObserver.disconnect();
  }
  if (themeCheckInterval) {
    clearInterval(themeCheckInterval);
  }
})

</script>

<style>
#canvas {
  background: var(--dark);
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  animation: fade-background 0.2s ease forwards;
  opacity: 0;
  overflow: hidden;
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