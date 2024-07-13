<template>
    <div class="setting-area">
        <div class="setting-area-title">{{ title }}</div>
        <div class="setting-area-items">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps(['title']);
</script>

<style scoped>
.setting-area {
    padding: 5px;
}

.setting-area-title {
    line-height: 2em;
    margin-left: 0.5em;
}

.setting-area-items {
    background-color: #fff9;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}
</style>
