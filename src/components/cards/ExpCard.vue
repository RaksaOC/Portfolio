<template>
    <div class="exp-card" :data-aos="aos" :data-aos-offset="offset">
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
    duration: String,
    offset: Number,
    aos: String
})
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
}

/* phones: compact, so a card fits above or below the timeline (Experience.vue zigzag) */
@media screen and (max-width: 768px) {
    .exp-card {
        gap: 6px;
    }

    .place {
        font-size: 1.1rem;
        line-height: 1.3;
    }

    .role-duration {
        flex-wrap: wrap;
        justify-content: flex-start;
        gap: 0 10px;
    }

    .role,
    .duration {
        font-size: 0.82rem;
    }

    .desc {
        font-size: 0.8rem;
        line-height: 1.45;
    }
}
</style>
