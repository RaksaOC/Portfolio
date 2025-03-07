<template>
    <canvas ref="canvasRef" id="about-bg"></canvas>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import * as THREE from 'three';

const canvasRef = ref(null);

onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) return; // Safety check

    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth/ window.innerHeight, 0.1, 1000);   
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const myPicTexture = new THREE.TextureLoader().load('/my-pic.png', () => {
        console.log("texture loaded");
    })

    // Create a cube (BoxGeometry)
    const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

    // Apply texture
    const cubeMaterial = new THREE.MeshBasicMaterial({
        // wireframe: true,
        // color: 0xffffff,
        map: myPicTexture,
        transparent: true,
        opacity: 1
    });

    // Create the mesh (cube)
    const cube1 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube1.position.set(0, 0, 0); // Set cube position
    cube1.scale.x = 1.5;
    cube1.scale.y = 1.5;
    cube1.scale.z = 1.5;

    scene.add(cube1);

    const cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube2.position.set(-2.5, 3, 0); // Set cube position
    // scene.add(cube2);

    // const Ico2 = new THREE.Mesh(IcoGeo, IcoMat);
    // Ico2.position.x = -6;
    // Ico2.position.y = 1;
    // scene.add(Ico2);

    function rotateIco(cube) {
        cube.rotation.x += 0.002;
        cube.rotation.y -= 0.002;
        // cube.rotation.z += 0.002;
    }

    function animate() {
        requestAnimationFrame(animate);
        rotateIco(cube1);
        // rotateIco(cube2);

        // rotateIco(Ico2);
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
</script>

<style scoped>
#about-bg {
    background: transparent;
    width: 100vw;
    z-index: -50;
}
</style>
