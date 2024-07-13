<template>
    <div class="checkbox" :class="{ checked: props.modelValue, disabled: props.disabled }" @click="toogleChecked"></div>
</template>

<script setup lang="ts">
const props = defineProps(['modelValue', 'disabled']);
const emits = defineEmits(['update:modelValue']);
function toogleChecked() {
    if (!props.disabled) {
        emits('update:modelValue', !props.modelValue);
    }
}
</script>

<style lang="scss" scoped>
.checkbox {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: solid 1px var(--theme-color);
    position: relative;

    &::after {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
    }

    &.checked {
        background: var(--theme-color);

        &::after {
            background: url('../assets/image/svg/checked.svg');
            background-size: contain;
            filter: invert(1);
        }
    }

    &.disabled {
        background: var(--theme-color);
        filter: grayscale(0.8);

        &::after {
            background: url('../assets/image/svg/disabled.svg');
            background-size: contain;
            filter: invert(1);
        }
    }

    &.indeterminated {
        background: var(--theme-color);

        &::after {
            background: url('../assets/image/svg/square.svg');
            background-size: contain;
            filter: invert(1);
        }
    }
}
</style>
