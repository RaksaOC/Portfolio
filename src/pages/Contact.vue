<template>
  <div class="contact" data-aos-delay="500">
    <SectionIcon icon="contact" :title="$t('nav.contact')" />
    <div class="form-social" id="contact">
      <form class="form" ref="formRef" id="form" data-aos="fade-right" action="https://formspree.io/f/xqaqpjpn"
        method="POST">
        <div class="email">
          <p class="email-label">{{ $t('contact.email') }}</p>
          <input type="email" name="email" id="email" required>
        </div>
        <div class="message">
          <p class="message-label">{{ $t('contact.message') }}</p>
          <textarea name="message" id="message" required></textarea>
        </div>
        <div class="send">
          <button type="submit" class="send-btn">
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
            <span>{{ $t('contact.send') }}</span>
          </button>
        </div>
      </form>

      <div class="social" ref="socialRef" data-aos="fade-left">
        <a href="https://github.com/RaksaOC" data-tip="GitHub" aria-label="GitHub" target="_blank"><img src="/contact-img/github.png" alt="social-pic"></a>
        <a href="https://www.linkedin.com/in/ory-chanraksa-1702b6263/" data-tip="LinkedIn" aria-label="LinkedIn" target="_blank"><img
            src="/contact-img/linkedin.png" alt="social-pic"></a>
        <a href="https://www.upwork.com/freelancers/~0193c96741cd57f0f1?mp_source=share" data-tip="Upwork" aria-label="Upwork" target="_blank"><img
            src="/contact-img/upwork.png" alt="social-pic"></a>
        <a href="https://www.facebook.com/ory.chanraksa/" data-tip="Facebook" aria-label="Facebook" target="_blank"><img src="/contact-img/facebook.png"
            alt="social-pic"></a>
        <a href="https://www.youtube.com/@raksa7276" data-tip="YouTube" aria-label="YouTube" target="_blank"><img src="/contact-img/yt.png"
            alt="social-pic"></a>
        <a href="https://t.me/chanraksaOry" data-tip="Telegram" aria-label="Telegram" target="_blank"><img src="/contact-img/telegram.png" alt="social-pic"></a>
      </div>
    </div>
    <RequestCV />
  </div>
  <div v-show="showPopup" class="popup">{{ $t('contact.sent') }}</div>
</template>

<script>

import SectionIcon from '../components/SectionIcon.vue';
import RequestCV from '../components/RequestCV.vue';
import { ref, onMounted } from 'vue';

export default {
  name: "skills",
  components: {
    SectionIcon,
    RequestCV
  },
  setup() {
    const formRef = ref(null);
    const socialRef = ref(null);
    const showPopup = ref(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      const form = formRef.value;
      const formData = new FormData(form);

      try {
        const response = await fetch("https://formspree.io/f/xqaqpjpn", {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

        if (response.ok) {
          form.reset();
          showPopup.value = true;
          setTimeout(() => (showPopup.value = false), 3000);
        }
      } catch (error) {
        console.error("Form submission failed", error);
      }
    };

    onMounted(() => {
      const form = formRef.value;
      const social = socialRef.value;

      if (!form || !social) {
        console.log("Ref is not found!");
        return;
      }

      form.addEventListener("submit", handleSubmit);

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

    return {
      formRef,
      socialRef,
      showPopup
    };
  }
};

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
  scroll-margin-top: 800px;
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
  border-radius: 0px;
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
  border-radius: 0px;
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
  border-radius: 0px;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  color: var(--light);
  font-family: var(--poppins);
  font-size: var(--S);
  outline: none;
}

.message textarea {
  min-height: 200px;
  max-height: 200px;
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
  border-radius: 0px;
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  color: white;
  padding: 0.7em 1em 0.7em 0.9em;
  display: flex;
  align-items: center;
  border-radius: 60px;
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
  padding: 0.8rem 5rem;
  font-size: 1.3rem;
  border-radius: 80px;
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
  left: 1.3rem;
  top: 1rem;
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

svg,
path,
.bi-download,
.text,
.svg-wrapper {
  cursor: pointer;
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

.text {
  margin-top: 1px;
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

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #a6e3a1;
  /* Softer green */
  color: #1a3e1a;
  padding: 16px 24px;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  opacity: 0;
  animation: fadeInOut 3s ease-in-out forwards;
  z-index: 1000;
  font-weight: 500;
}

/* Animation */
@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -55%);
  }

  10%,
  90% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -45%);
  }
}
</style>
