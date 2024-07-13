<template>
    <div class="dropdown" ref="dropdownElement">
        <div class="dropdown-button" @click="toggleDropdown">
            <slot name="button" :isShowing="showDropdown"></slot>
        </div>
        <div :class="['dropdown-content', { show: showDropdown }]">
            <slot name="content" :toggleDropdown="toggleDropdown"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showDropdown = ref(false);
const dropdownElement = ref<HTMLElement | null>(null);

function toggleDropdown() {
    showDropdown.value = !showDropdown.value;
}

onMounted(() => {
    document.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.dropdown') != dropdownElement.value) {
            showDropdown.value = false;
        }
    });
});
</script>

<style scoped>
.dropdown-content {
    visibility: hidden;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 300ms ease;
}

.dropdown-content.show {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
}
</style>
