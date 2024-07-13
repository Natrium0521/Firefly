<template>
    <div class="button" :class="[btnClass]" >
        <img class="icon" :src="iconPath" />
        <div class="label">{{ btnTitle }}</div>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
defineProps(['iconPath', 'btnTitle', 'btnClass']);
</script>

<style scoped lang="scss">
.button {
    border-radius: 5px;
    padding: 0 10px;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    filter: drop-shadow(2px 2px 3px #0003);
    transition: all 100ms ease;

    img {
        height: 20px;
    }
}

.white {
    background-color: #fffa;

    &:hover {
        background-color: #fffc;
    }

    &:active {
        background-color: #fffe;
    }
}

.red {
    background-color: #c00c;
    color: #fff;

    &:hover {
        filter: brightness(1.02) drop-shadow(2px 2px 3px #0003);
    }

    &:active {
        filter: brightness(1.1) drop-shadow(2px 2px 3px #0003);
    }

    img {
        filter: invert(1);
    }
}

.theme {
    background-color: var(--theme-color);
    color: #fff;

    &:hover {
        filter: brightness(0.98) drop-shadow(2px 2px 3px #0003);
    }

    &:active {
        filter: brightness(0.94) drop-shadow(2px 2px 3px #0003);
    }

    img {
        filter: invert(1);
    }
}

.hover-drop {
    background-color: #fffa;

    &:hover {
        background-color: #fffe;
    }
}
</style>
