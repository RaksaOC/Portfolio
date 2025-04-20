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
  margin: 30px;
  width: 100px;
  height: 100px;
}

img {
  width: 90%;
  min-height: 90%;
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

@media screen and (max-width: 638px) {
  .skill {
    margin: 5px;
  }

  img{
    width: 65%;
    height: 65%;
  }

  p {
    font-size: var(--XS);
  }
}
</style>