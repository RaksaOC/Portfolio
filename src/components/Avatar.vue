<template>
    <canvas ref="canvasRef" id="avatar"></canvas>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import * as THREE from 'three';

const canvasRef = ref(null);

const props = defineProps(
    {
        imagePath: String,
    }
)

onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) return; // Safety check

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const myPicTexture = new THREE.TextureLoader().load(props.imagePath, () => {
        console.log("texture loaded");
    })

    // Create a cube -------------------------------------------------------------------------------

    const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

    // Apply texture
    const cubeMaterial = new THREE.MeshBasicMaterial({
        map: myPicTexture,
        transparent: true,
        opacity: 1
    });

    // Create the mesh (cube)
    const avatar = new THREE.Mesh(cubeGeometry, cubeMaterial);
    avatar.position.set(0, 0, 0); // Set cube position

    scene.add(avatar);

    function rotateAvatar(cube) {
        cube.rotation.x += 0.002;
        cube.rotation.y -= 0.002;
    }

    function animate() {
        requestAnimationFrame(animate);
        rotateAvatar(avatar);
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
#avatar {
    background: transparent;
    width: 100vw;
    z-index: -50;
}
</style>
