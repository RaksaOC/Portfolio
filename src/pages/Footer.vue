<template>
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-left">
                <span class="logo">ChanRaksa</span>
                <span class="copyright">© 2023 ChanRaksa. All rights reserved.</span>
            </div>
            <nav class="footer-nav">
                <router-link to="/">Home</router-link>
                <router-link to="/about">About</router-link>
                <router-link to="/services">Services</router-link>
                <router-link to="/contact">Contact</router-link>
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

.footer-nav{
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    font-family: var(--poppins);
    font-size: var(--S);
}

.footer-nav router-link {
    text-decoration: none;
    color: var(--light);
}

@media screen and (max-width: 1000px) {
    .footer{
        width: 90vw;
        text-align: center;
    }
}

@media screen and (max-width: 638px) {
    .footer-content{
        flex-wrap: wrap-reverse;
        justify-content: center;        
        gap: 50px;
    }
}

</style>