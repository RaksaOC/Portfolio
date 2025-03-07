<template>
    <div class="hero" id="home">
        <p>Hi, I'm Raksa, <br>  <span>computer science</span> student</p>
        <p class="hero-desc">Turning caffeine and code  into  cool, creative solutions!</p>
    </div>
</template>

<script>
</script>

<style scoped>
.hero {
    position: relative;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    padding: 10px;
}

p {
    font-size: var(--XL);
    margin-top: 20px;
    font-family: var(--poppins);
    text-align: center;
    /* Adds space between the NavBar and the text */
}

.hero-desc{
    font-family: var(--poppins);
    color: var(--gray-light);
    font-size: var(--M);
}

span{
    text-decoration: underline;
}

@media screen and (max-width: 968px) {
    p{
        font-size: var(--L);
    }
    .hero-desc{
        font-size: var(--S);
    }
}

@media screen and (max-width: 638px) {
    p{
        font-size: var(--M);
    }
}
</style>