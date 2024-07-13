<template>
    <div class="achievement-container">
        <AchievementHead />
        <AchievementBody />
    </div>
</template>

<script setup lang="ts">
import AchievementHead from './components/AchievementHead.vue';
import AchievementBody from './components/AchievementBody.vue';

</script>

<style scoped lang="scss">
.achievement-container {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 5px;

    & > div {
        box-shadow: 2px 2px 3px #0004;
        background-color: #fff8;
        border-radius: 5px;
    }
}
</style>
