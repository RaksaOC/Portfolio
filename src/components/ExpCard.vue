<template>
    <div class="exp-card">
        <div class="place">{{ place }}</div>
        <div class="role-duration">
            <div class="role">{{ role }}</div>
            <div class="duration">{{ duration }}</div>
        </div>
        <div class="desc">{{ desc }}</div>
    </div>
</template>

<script setup>
defineProps({
    place: String,
    role: String,
    desc: String,
    duration: String
});
</script>

<style scoped>
.exp-card {
    font-family: var(--poppins);
    color: var(--light);
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
}

.place {
    font-size: var(--M);
    color: var(--light);
    font-weight: 600;
}

.role-duration {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}

.role {
    font-size: var(--S);
    color: var(--gray-light);
    font-weight: 500;
}

.duration {
    font-size: var(--S);
    color: var(--gray-light);
    white-space: nowrap;
}

.desc {
    font-size: var(--XS);
    color: var(--light);
    line-height: 1.6;
}

@media screen and (max-width: 768px) {
    .role-duration {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}
</style>
