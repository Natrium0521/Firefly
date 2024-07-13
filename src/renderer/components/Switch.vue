<template>
    <input type="checkbox" v-model="checked" :disabled="props.disabled ?? false" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps(['modelValue', 'disabled']);
const emits = defineEmits(['update:modelValue']);
const checked = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    },
});
</script>

<style scoped>
input {
    width: 48px;
    height: 24px;
    appearance: none;
    background: #dddd;
    border-radius: 25px;
    position: relative;
    transition: all 70ms ease;
}

input::after {
    content: '';
    width: 20px;
    height: 20px;
    position: absolute;
    top: 2px;
    left: 2px;
    background: #fff;
    border-radius: 50%;
    transition: all 150ms ease;
}

input:checked {
    background: var(--theme-color);
}

input:checked::after {
    left: calc(100% - 22px);
}

:hover {
    filter: brightness(0.97);
}

:active {
    filter: brightness(0.94);
}
</style>
