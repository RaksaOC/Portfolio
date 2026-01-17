<template>
  <div class="skill" data-aos="flip-up" data-aos-delay="100" data-aos-offset="100">
    <img :src="image" alt="skill-img" data-aos="zoom-in-up" data-aos-delay="100" data-aos-offset="100">
    <p data-aos="zoom-in-up" data-aos-delay="100" data-aos-offset="100" data-aos-duration="1000">{{ name }}</p>
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
  width: 100px;
  height: 100px;
}

img {
  width: 75%;
  aspect-ratio: 1/1;
}

p {
  color: var(--light);
  font-size: var(--S);
  font-family: var(--poppins);
  text-align: center;
}

.skill:hover {
  transform: scale(1.2);
}

/* @media screen and (max-width: 968px){
    img{
        width: 120px;
        height: 120px;
    }
} */

@media screen and (max-width: 638px) {
  .skill {
    margin: 0px;
  }

  img {
    width: 50%;
  }

  p {
    font-size: var(--XS);
  }
}
</style>