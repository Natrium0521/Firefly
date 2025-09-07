<template>
    <div class="list-item" :class="[item.upType]" :title="item.time">
        <div class="bg-bar" :style="{ animationDelay: `-${item.progress / 100}s` }"></div>
        <div class="icon">
            <img :src="getIconSrc(item.itemId)" />
        </div>
        <div class="name">{{ item.name }}</div>
        <div class="tag">{{ tagMap[item.upType] }}</div>
        <div class="count">{{ item.count }}</div>
    </div>
</template>

<script setup lang="ts">
import { useUserGacha } from '@renderer/store/usergacha';

const { getIconSrc } = useUserGacha();
const tagMap = { up: 'UP', noup: '歪', newbie: '新', normal: '' };

defineProps(['item']);
</script>

<style scoped lang="scss">
.list-item {
    width: 100%;
    height: 40px;
    border-radius: 5px;
    background-color: #fff;
    position: relative;
    box-shadow: 1px 1px 2px #0003;
    flex-shrink: 0;
    overflow: hidden;

    & > div {
        position: absolute;
    }
}

.bg-bar {
    height: 100%;
    border-radius: 5px;
    animation: bg-bar-anim 1s linear forwards paused;
    animation-delay: -0s;

    &::after {
        content: '';
        position: absolute;
        inset: -50px;
        background: repeating-linear-gradient(45deg, transparent 0px 18px, #fff3 18px 32px);
        animation: bg-bar-mask-anim 5s linear infinite;
    }
}

.icon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 40px;
    overflow: hidden;
    left: 0;

    img {
        width: 100%;
    }
}

.name {
    line-height: 40px;
    left: 45px;
    right: 80px;
    overflow: hidden;
}

.tag {
    line-height: 40px;
    right: 40px;
    width: 30px;
    text-align: center;
    color: var(--theme-color);
}

.count {
    line-height: 40px;
    right: 10px;
}

@keyframes bg-bar-anim {
    0% {
        width: 0%;
        background: #0f09;
    }

    50% {
        background: #0f09;
    }

    70% {
        background: #fa09;
    }

    80% {
        background: #f009;
    }

    100% {
        width: 100%;
        background: #f009;
    }
}

@keyframes bg-bar-mask-anim {
    from {
        background-position: 0;
    }

    to {
        background-position: 45px;
    }
}
</style>
