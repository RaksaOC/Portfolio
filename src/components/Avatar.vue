<template>
    <canvas ref="canvasRef" id="avatar" data-aos="zoom-in-up" data-aos-delay="500"></canvas>
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
    renderer.setClearColor(0xffffff, 0);
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
        opacity: 0.75,
        wireframe: false
    });

    // Create the mesh (cube)
    const avatar = new THREE.Mesh(cubeGeometry, cubeMaterial);
    avatar.position.set(0, 0, 0); // Set cube position

    scene.add(avatar);

    function rotateAvatar(cube) {
        if (isDragging) {
            return;
        }
        cube.rotation.x += 0.002;
        cube.rotation.y -= 0.002;
    }

    let isDragging = false;
    let currentRotation = {
        x: 0,
        y: 0,
    };
    let lastMouse = {
        x: 0,
        y: 0,
    }

    // Mouse events (desktop)
    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        lastMouse = {
            x: event.clientX,
            y: event.clientY,
        };
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - lastMouse.x;
        const deltaY = event.clientY - lastMouse.y;

        currentRotation.x += deltaY * 0.005;
        currentRotation.y += deltaX * 0.005;

        avatar.rotation.x = currentRotation.x;
        avatar.rotation.y = currentRotation.y;

        lastMouse = {
            x: event.clientX,
            y: event.clientY,
        };
    });

    // Touch events (mobile)
    canvas.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            isDragging = true;
            lastMouse = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY,
            };
        }
    });

    canvas.addEventListener('touchend', () => {
        isDragging = false;
    });

    canvas.addEventListener('touchmove', (event) => {
        if (!isDragging || event.touches.length !== 1) return;

        const touch = event.touches[0];
        const deltaX = touch.clientX - lastMouse.x;
        const deltaY = touch.clientY - lastMouse.y;

        currentRotation.x += deltaY * 0.005;
        currentRotation.y += deltaX * 0.005;

        avatar.rotation.x = currentRotation.x;
        avatar.rotation.y = currentRotation.y;

        lastMouse = {
            x: touch.clientX,
            y: touch.clientY,
        };
    });

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
