<template>
    <div class="contact">
        <Avatar :imagePath="'/contact.png'" />
        <div class="form-social" id="contact">
            <div class="form" ref="formRef" id="form" data-aos="fade-right">
                <div class="email">
                    <p class="email-label">Email</p>
                    <input type="email" name="" id="">
                </div>
                <div class="message">
                    <p class="message-label">Message</p>
                    <textarea name="" id=""></textarea>
                </div>
                <div class="send">
                    <button class="send-btn">
                        <div class="svg-wrapper-1">
                            <div class="svg-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path fill="currentColor"
                                        d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <span>Send</span>
                    </button>
                </div>
            </div>
            <div class="social" ref="socialRef" data-aos="fade-left">
                <a href="https://github.com/RaksaOC" target="_blank"><img src="/github.png" alt="social-pic"></a>
                <a href="https://www.linkedin.com/in/ory-chanraksa-1702b6263/" target="_blank"><img src="/linkedin.png"
                        alt="social-pic"></a>
                <a href="https://www.facebook.com/ory.chanraksa/" target="_blank"><img src="/facebook.png"
                        alt="social-pic"></a>
                <a href="https://www.instagram.com/_chan_raksa/?__pwa=1" target="_blank"><img src="/instagram.png"
                        alt="social-pic"></a>
                <a href="https://www.youtube.com/@raksa7276" target="_blank"><img src="/youtube.png"
                        alt="social-pic"></a>
                <a href="https://t.me/chanraksaOry" target="_blank"><img src="/telegram.png" alt="social-pic"></a>

            </div>
        </div>
        <div class="download-cv" ref="cvRef">
            <button class="button">
                <p class="text">
                    Download CV
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
</template>

<script>

import Avatar from '../components/Avatar.vue';
import { ref, onMounted } from 'vue';

export default {
    name: "skills",
    components: {
        Avatar
    },
    setup() {

        const formRef = ref(null);
        const socialRef = ref(null);

        onMounted(() => {
            const form = formRef.value;
            const social = socialRef.value;

            // Check if the ref is initialized correctly
            if (!form || !social) {
                console.log("Ref is not found!");
                return;
            }

            const handleOnMouseMove = (e) => {
                const { currentTarget: target } = e;
                const rect = target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                target.style.setProperty("--mouse-x", `${x}px`);
                target.style.setProperty("--mouse-y", `${y}px`);
            };

            form.addEventListener("mousemove", handleOnMouseMove);
            social.addEventListener("mousemove", handleOnMouseMove);
        });

        // Return both skillsMap and skillContentRef so they can be used in the template
        return {
            formRef,
            socialRef
        }
    }
}
</script>

<style scoped>
.contact {
    width: 100%;
    min-height: 100vh;
    font-family: var(--poppins);
    color: var(--light);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1;
    gap: 20px;
}

.form-social {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
    scroll-margin-top: 460px;
}

.form {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    width: 80%;
    border-radius: 5px;
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
}

.form::before,
.social::before {
    background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y),
            rgba(255, 255, 255, 0.1),
            transparent 40%);
    content: "";
    height: 100%;
    width: 100%;
    border-radius: inherit;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
    opacity: 0;
    transition: opacity 500ms;
}

.form:hover::before,
.social::before {
    opacity: 1;
    cursor: crosshair;
}

.email,
.message {
    display: flex;
    flex-direction: column;
    gap: 10px !important;
    width: 100%;
}

.email input,
.message textarea {
    cursor: text;
    padding: 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    /* Light transparent background */
    backdrop-filter: blur(5px);
    /* Blurry effect */
    -webkit-backdrop-filter: blur(5px);
    /* Safari support */
    border: 1px solid rgba(255, 255, 255, 0.2);
    /* Subtle border */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    color: var(--light);
    font-family: var(--poppins);
    font-size: var(--S);
    outline: none;
    /* Removes default focus outline */
}

.message textarea {
    min-height: 200px;
    display: flex;
    align-items: flex-start;
    /* Aligns text to the top */
    text-align: left;
    /* Ensures text starts from the left */
    padding-top: 10px;
    /* Adds some space at the top */
}

.email input:focus,
.message textarea:focus {
    outline: none;
    box-shadow: none;
    border: 1px solid rgba(255, 255, 255, 0.6);
    /* Keeps border consistent */
}

.social {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
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
    width: 20%;
    padding: 20px;
    gap: 20px;
    border-radius: 10px;
}

.social img {
    width: 60px;
    cursor: pointer;
    transition: all 0.3s ease;
    filter: invert(100);
}

.social img:hover {
    transform: scale(1.1);
}

.send-btn {
    font-family: inherit;
    font-size: var(--S);
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
    color: white;
    padding: 0.7em 1em;
    padding-left: 0.9em;
    display: flex;
    align-items: center;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.2s;
    cursor: pointer;
}

.send-btn span {
    display: block;
    margin-left: 0.3em;
    transition: all 0.3s ease-in-out;
}

.send-btn svg {
    display: block;
    transform-origin: center center;
    transition: transform 0.3s ease-in-out;
}

.send-btn:hover .svg-wrapper {
    animation: fly-1 0.6s ease-in-out infinite alternate;
}

.send-btn:hover svg {
    transform: translateX(1.2em) rotate(45deg) scale(1.1);
}

.send-btn:hover span {
    transform: translateX(5em);
}

.send-btn:active {
    transform: scale(0.95);
}

.download-cv {
    cursor: pointer;
}

.button {
    padding: 0.8rem 4rem;
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
    left: 1.7rem;
    top: 1.4rem;
    transition: 0.4s ease-in-out;
    color: var(--light);
    font-size: var(--S);
}

.svg {
    transform: translateY(-20px) rotate(30deg);
    opacity: 0;
    width: 2rem;
    transition: 0.4s ease-in-out;
    cursor: pointer !important;
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

@media screen and (max-width: 638px) {
    .form-social {
        scroll-margin-top: 120px;
    }
}
</style>
