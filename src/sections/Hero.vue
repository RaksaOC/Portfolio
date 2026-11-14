<template>
  <div class="hero" id="home" data-aos="fade-up" data-aos-delay="30" data-aos-anchor-placement="center-bottom">
    <p class="based-in">{{ $t('hero.basedIn') }}</p>
    <div class="hero-text">
      <p class="hero-text-1">{{ $t('hero.hello') }} <span></span> </p>
      <p class="hero-text-2"> <span>{{ $t('hero.role') }}</span> </p>
    </div>
    <p class="hero-desc">{{ $t('hero.desc') }}</p>
    <div class="links">
      <a v-for="s in heroSocials" :key="s.name" :href="s.href" :data-tip="s.name" :aria-label="s.name" target="_blank"><img
          :src="s.icon" alt=""></a>
      <RequestCV />

    </div>
  </div>
</template>

<script setup>
import RequestCV from '../components/common/RequestCV.vue';
import { heroSocials } from '../data/socials';
</script>

<style scoped>
.hero {
  position: relative;
  color: var(--light);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  padding: 20px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero-text-1 {
  font-size: var(--XL);
  margin-top: 20px;
  font-family: var(--poppins);
  text-align: center;
}

.hero-text-2 {
  font-size: var(--XL);
  margin-top: 0px;
  font-family: var(--poppins);
  text-align: center;
}

p {
  font-size: var(--XL);
  margin-top: 20px;
  font-family: var(--poppins);
  text-align: center;
  /* Adds space between the NavBar and the text */
}

.hero-desc {
  font-family: var(--poppins);
  color: var(--gray-light);
  font-size: var(--M);
}

span {
  text-decoration: underline;
}

.links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 20px;
}

.links img {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  filter: invert(100);
  cursor: pointer;
}

.links a {
  transition: all 0.3s ease;
}

.links a:hover {
  transform: scale(1.05);
}

.resume {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.resume p {
  margin: 0;
  font-size: var(--XS);
  color: var(--light);
  text-decoration: none;
  cursor: pointer;
}

.resume:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.button {
  padding: 0.8rem 5rem 0 5rem;
  font-size: 1.3rem;
  border-radius: 60px;
  /* Glassmorphism Effect */
  background: rgba(255, 255, 255, 0.1);
  /* Light transparent background */
  backdrop-filter: blur(5px);
  /* Blurry effect */
  -webkit-backdrop-filter: blur(5px);
  /* Safari support */
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* Subtle border */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  /* Soft shadow */
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: 0.4s ease-in-out;
  font-family: var(--poppins);
}

.button .text {
  position: absolute;
  left: 1.5rem;
  bottom: 1rem;
  transition: 0.4s ease-in-out;
  color: var(--light);
  font-size: var(--S);
}

.svg {
  transform: translateY(-40px) rotate(30deg);
  opacity: 0;
  width: 2rem;
  transition: 0.4s ease-in-out;
  cursor: pointer !important;
  margin-bottom: 10px;
}

.button:hover {
  background-color: rgb(50, 50, 50);
}

.button:hover .svg {
  display: inline-block;
  transform: translateY(0px) rotate(0deg);
  opacity: 1;
}

.button:hover .text {
  opacity: 0;
}

.button:active {
  scale: 0.97;
}

.based-in {
  font-size: var(--S);
  color: var(--gray-light);
}

.svg {
  margin-bottom: 50%;
}

.text {
  margin-bottom: 3px;
}

svg,
path,
.bi-download,
.text,
.svg-wrapper {
  cursor: pointer;
}

@keyframes fly-1 {
  from {
    transform: translateY(0.1em);
  }

  to {
    transform: translateY(-0.1em);
  }
}


@media screen and (max-width: 1000px) {
  .contact {
    width: 90vw;
  }

  .form-social {
    flex-wrap: wrap;
    justify-content: center;
  }

  .form {
    width: 100%;
  }

  .social {
    flex-direction: row;
    width: 100%;
  }
}

@media screen and (max-width: 968px) {

  .hero-text-1,
  .hero-text-2 {
    font-size: var(--L);
  }

  .hero-desc {
    font-size: var(--S);
  }
}

@media screen and (max-width: 638px) {

  .hero-text-1,
  .hero-text-2 {
    font-size: var(--L);
  }

  .hero {
    scroll-margin-top: 40px;
  }

  .links {
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

  /* Request CV gets its own centred row so its email panel stays on screen */
  .links :deep(.request-cv) {
    flex-basis: 100%;
  }
}

@media screen and (max-width: 398px) {

  .hero-text-1,
  .hero-text-2 {
    font-size: 32px;
  }

  .button p {
    font-size: var(--XS);
  }
}
</style>