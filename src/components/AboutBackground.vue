<template>
    <!-- Ensure the canvas element is properly referenced -->
    <canvas ref="canvas" id="about-bg"></canvas>
</template>

<script setup>
import { onMounted } from 'vue';
import * as THREE from 'three';



onMounted(() => {
    const canvas = document.getElementById("about-bg");
    const about = document.querySelector(".about")
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight); // Set the renderer size to window size

    // Create a rotating 3D object (Icosahedron)
    const IcoGeo = new THREE.IcosahedronGeometry(1, 0);
    const IcoMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const Ico = new THREE.Mesh(IcoGeo, IcoMat);
    scene.add(Ico);

    function animate() {
        requestAnimationFrame(animate);
        Ico.rotation.x += 0.01;
        Ico.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resizing
    // window.addEventListener('resize', () => {
    //     camera.aspect = window.innerWidth / window.innerHeight;
    //     camera.updateProjectionMatrix();
    //     renderer.setSize(window.innerWidth, window.innerHeight);
    // });
});
</script>

<style>
canvas {
    background: #0e0e0e;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    z-index: 0;
    opacity: 1;
}
</style>