<template>
    <footer class="footer" data-aos="fade-down">
        <div class="footer-content">
            <div class="footer-left">
                <span class="logo">ChanRaksa</span>
                <span class="copyright">Hire me! You won't regret it i swear.</span>
            </div>
            <nav class="footer-nav">
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#skills">Skills</a>
                <a href="#projects">Projects</a>
                <a href="#contact">Contact</a>
            </nav>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'Footer',
};
</script>

<style scoped>
.footer {
    width: 100%;
    border-top: 1px solid rgb(245, 245, 245, 0.2);
    padding: 20px;
    margin-top: 300px;
    margin-bottom: 100px;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1000px;
    margin: 0 auto;

    gap: 20px;
}

.footer-left {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.logo {
    font-size: var(--L);
    font-family: var(--poppins);
    color: var(--light);
}

.copyright {
    font-size: var(--S);
    font-family: var(--poppins);
    color: var(--light);
}

.footer-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    font-family: var(--poppins);
    font-size: var(--S);
}

.footer-nav a {
  position: relative;
    text-decoration: none;
    color: var(--light);
}

.footer-nav a:before {
  content: "";
  position: absolute;
  bottom: -5px;
  height: 2px;
  width: 100%;
  background: var(--gray-light);
  border-radius: 50px;
  transform: scaleX(0);
  transition: transform 0.2s linear;
}

.footer-nav a:hover::before {
  transform: scaleX(1);
}

@media screen and (max-width: 1000px) {
    .footer {
        width: 90vw;
        text-align: center;
    }

  .footer-nav{
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
}

@media screen and (max-width: 638px) {
    .footer-content {
        flex-wrap: wrap-reverse;
        justify-content: center;
        gap: 50px;
    }
}
</style>