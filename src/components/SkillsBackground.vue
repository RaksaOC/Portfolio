<template>
    <canvas id="skills-bg" ref="canvasRef"></canvas>
</template>

<script setup>
import * as THREE from 'three';
import { ref, onMounted } from 'vue';

const canvasRef = ref(null);

onMounted(() => {
    const canvas = canvasRef.value;

    if (!canvas) return; // Safety check



    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.position.z = 5;


    const skillItems = [];
    function skillItem(x, y, z, path) {
        console.log("Loading texture:", path);

        const texture = new THREE.TextureLoader().load(path, () => {
            console.log("Texture loaded:", path);
        });

        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(1, 1);

        // Create the geometry
        const skillItemGeo = new THREE.BoxGeometry(1, 1);


        // Use a single material like BoxGeometry does
        const skillItemMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });

        const skillItem = new THREE.Mesh(skillItemGeo, skillItemMat);
        skillItem.position.set(x, y, z);

        skillItem.scale.x = 1.5;
        skillItem.scale.y = 1.5;
        skillItem.scale.z = 1.5;
        
        skillItems.push(skillItem);
        scene.add(skillItem);
    }


    function animate() {
        requestAnimationFrame(animate);
        skillItems.forEach((item) => {
            item.rotation.x += 0.002;
            item.rotation.y -= 0.002;
        })

        renderer.render(scene, camera);
    }
    skillItem(0, 0, 0, '/image.png');
    
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });



});
</script>

<style scoped>
#skills-bg {
    width: 100%;
    z-index: -1;
    top: 0;
}
</style>