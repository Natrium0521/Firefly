<template>
    <div class="gacha-container">
        <GachaHead />
        <GachaBody />
    </div>
</template>

<script setup lang="ts">
import GachaHead from './components/GachaHead.vue';
import GachaBody from './components/GachaBody.vue';
</script>

<style scoped lang="scss">
.gacha-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 5px;
}
</style>
