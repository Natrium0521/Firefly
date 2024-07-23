<template>
    <div class="setting-item-button">
        <div class="setting-item-button-icon">
            <img :src="iconPath" />
        </div>
        <div class="setting-item-button-text">
            <div class="setting-item-button-text-title">{{ title }}</div>
            <div class="setting-item-button-text-desc">{{ desc }}</div>
        </div>
        <div class="setting-item-button-button" @click="$emit('onButtonClick')">{{ buttonText }}</div>
    </div>
</template>

<script setup lang="ts">
defineProps(['title', 'desc', 'iconPath', 'buttonText']);
</script>

<style lang="scss" scoped>
.setting-item-button {
    background-color: #fff5;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 15px;
    min-height: 60px;

    &:hover {
        background-color: #fffc;
    }
}

.setting-item-button-icon {
    margin-left: 15px;
    height: 24px;

    img {
        height: 100%;
    }
}

.setting-item-button-text {
    flex-grow: 1;
}

.setting-item-button-text-title {
    margin-top: 13px;
}

.setting-item-button-text-desc {
    margin-bottom: 10px;
    color: gray;
    font-size: 0.75em;
}

.setting-item-button-button {
    margin-right: 20px;
    filter: drop-shadow(1px 1px 2px #0003);
    background-color: #fffc;
    color: var(--theme-color);
    border-radius: 5px;
    border: solid 1px var(--theme-color);
    padding: 10px 15px;

    &:hover {
        scale: 1.01;
        filter: brightness(0.97);
    }

    &:active {
        scale: 1;
        filter: brightness(0.95);
    }
}
</style>
