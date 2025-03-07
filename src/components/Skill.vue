<template>
    <div class="skill">
        <img :src="image" alt="skill-img">
        <p>{{ name }}</p>
    </div>
</template>

<script setup>
defineProps(
    {
        image: String,
        name: String
    }
)
</script>
<style scoped>
.skill {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: var(--S);
    transition: 0.2s all ease;
    gap: 10px;
    margin: 20px;
}

img{
    width: 120px;
    height: 120px;
}

p {
    color: var(--light);
    font-size: var(--S);
    font-family: var(--poppins);
}

.skill:hover {
    transform: scale(1.1);
}

/* @media screen and (max-width: 968px){
    img{
        width: 120px;
        height: 120px;
    }
} */

@media screen and (max-width: 638px){
    img{
        width: 80px;
        height: 80px;
    }
}
</style>