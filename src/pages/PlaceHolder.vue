<template>
    <div class="placeholder">
        <p v-for="n in 100" :key="n">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
    </div>
</template>

<script>
export default {
    name: 'PlaceHolder'
}
</script>

<style scoped>
.placeholder {
    background-color: transparent;
    height: 5000px; /* Adjust height as needed */
    padding: 20px;
    color: #000;
}
</style>