<template>
    <div class="grid-item" :class="[item.upType ?? 'normal']" :title="`${item.name}\n${item.time}`">
        <div class="icon" :class="[item.iconType]" :style="{ bottom: item.count === undefined ? 0 : '15px' }">
            <img :src="getIconSrc(item.itemId)" />
        </div>
        <div v-if="item.count !== undefined" class="text">{{ item.count }}</div>
        <img v-if="isChristmas && `${item.itemId}`.length === 4" src="@renderer/assets/image/svg/christmas-hat.svg" style="position: absolute; right: -92px; top: -98px; scale: 0.3; transform: rotate(30deg); filter: brightness(0.9)" />
    </div>
</template>

<script setup lang="ts">
import { useUserGacha } from '@renderer/store/usergacha';

const { getIconSrc } = useUserGacha();

defineProps(['item']);

const isChristmas = new Date().getMonth() === 11 && new Date().getDate() === 25;
</script>

<style scoped lang="scss">
.grid-item {
    position: relative;
    border-radius: 5px;
    box-shadow: 1px 1px 2px #0003;
    height: 60px;
}

.icon {
    position: absolute;
    top: 0;
    width: 100%;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    img {
        position: absolute;
        width: 100%;
    }
}

.text {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    font-size: 0.8em;
}

.icon.star5 {
    background: radial-gradient(farthest-corner at 75% 75%, #ec9a1d, #a36c19);
}

.icon.star4 {
    background: radial-gradient(farthest-corner at 75% 75%, #9012eb, #6512a0);
}

.icon.star3 {
    background: radial-gradient(farthest-corner at 75% 75%, #0b96db, #1072a3);
}

.grid-item.up {
    background-color: #fff;
}

.grid-item.noup {
    background-color: #faa;
}

.grid-item.newbie {
    background-color: #afa;
}

.grid-item.normal {
    background-color: #fff;
}
</style>
