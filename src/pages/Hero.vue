<template>
    <div class="hero" id="home" data-aos="fade-up" data-aos-delay="30" data-aos-anchor-placement="center-bottom">
        <p class="based-in">Based in Phnom Penh, Cambodia</p>
        <p>Hi, I'm Raksa, sophmore <br> <span>computer science</span> student</p>
        <p class="hero-desc">Turning caffeine and code into cool, creative solutions!</p>
        <div class="links">
            <a href=""><img src="/github.png" alt=""></a>
            <a href=""><img src="/linkedin.png" alt=""></a>
            <div class="download-cv" ref="cvRef">
                <button class="button">
                    <p class="text">
                        Download Resume
                    </p>
                    <div class="svg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" class="bi bi-download" viewBox="0 0 16 16">
                            <path
                                d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z">
                            </path>
                            <path
                                d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z">
                            </path>
                        </svg>
                    </div>
                </button>
            </div>

        </div>
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
    border-radius: 30px;
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
    border-radius: 10px;
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
    bottom: 1.2rem;
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
    p {
        font-size: var(--L);
    }

    .hero-desc {
        font-size: var(--S);
    }
}

@media screen and (max-width: 638px) {
    p {
        font-size: var(--M);
    }
}
</style>