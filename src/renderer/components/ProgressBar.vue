<template>
    <div class="progress-bar">
        <div class="bar" :style="{ width: `${progress}%` }"></div>
    </div>
</template>

<script setup lang="ts">
defineProps(['progress']);
</script>

<style scoped lang="scss">
.progress-bar {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: 2px;
    background: #fff9;
    box-shadow: 1px 1px #0003 inset;
    overflow: hidden;

    .bar {
        border-radius: 2px;
        background: var(--theme-color);
        width: 0%;
        height: 100%;
        transition: all 300ms ease;
    }
}
</style>
