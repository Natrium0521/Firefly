<template>
    <div class="setting-item-switch">
        <div class="setting-item-switch-icon">
            <img :src="iconPath" />
        </div>
        <div class="setting-item-switch-text">
            <div class="setting-item-switch-text-title">{{ title }}</div>
            <div class="setting-item-switch-text-desc">{{ desc }}</div>
        </div>
        <div class="setting-item-switch-switch">
            <Switch v-bind="$attrs" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Switch from '../../../components/Switch.vue';

defineProps(['title', 'desc', 'iconPath']);
</script>

<style scoped>
.setting-item-switch {
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

.setting-item-switch-icon {
    margin-left: 15px;
    height: 24px;

    img {
        height: 100%;
    }
}

.setting-item-switch-text {
    flex-grow: 1;
}

.setting-item-switch-text-title {
    margin-top: 13px;
}

.setting-item-switch-text-desc {
    margin-bottom: 10px;
    color: gray;
    font-size: 0.75em;
}

.setting-item-switch-switch {
    margin-right: 20px;
    filter: drop-shadow(1px 1px 2px #0006);
}
</style>
