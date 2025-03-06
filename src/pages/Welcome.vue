<template>
  <div class="welcome">
    <div class="name-wrapper">
      <p class="name lName">{{ lName }}</p>
      <p class="name fName">{{ fName }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  lName: String,
  fName: String
})
</script>

<style scoped>
.welcome {
  width: 100%;
  height: 100vh;
  background-color: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: left;
  position: relative;
  overflow: hidden;
  z-index: 10;
  transition: all 0.2s ease-in-out;
}

.name-wrapper {
  background-color: rgba(0, 0, 0, 0);
  position: relative;
  font-size: var(--XXXL);
  font-family: var(--poppins);
  color: white;
  user-select: none;
  opacity: 1; /* Ensure it's visible */
  padding: 20px;
}

.name {
  background: transparent !important;
  transform: translate3d(0, 0, 0); /* Improve animation performance */
}

.lName {
  animation: slide-in-from-left 1.5s ease-out forwards;
}

.fName {
  animation: slide-in-from-right 1.5s ease-out forwards;
}

@keyframes slide-in-from-left {
  from {
    opacity: 0;
    transform: translateX(-100vw);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-from-right {
  from {
    opacity: 0;
    transform: translateX(100vw);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}



@media screen and (max-width: 968px) {
  .name-wrapper {
    font-size: var(--XXL);
  }
}

@media screen and (max-width: 638px) {
  .name-wrapper {
    font-size: var(--XL);
  }
}
</style>
