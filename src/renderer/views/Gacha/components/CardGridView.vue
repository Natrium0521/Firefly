<template>
    <div class="grid-view">
        <CardGridItem v-for="item in gachaDetail" :key="item.id" :item="item" />
    </div>
</template>

<script setup lang="ts">
import CardGridItem from './CardGridItem.vue';

defineProps(['gachaDetail']);
</script>

<style scoped lang="scss">
.grid-view {
    position: absolute;
    left: 5px;
    top: 5px;
    bottom: 5px;
    right: 5px;
    border-radius: 5px;
    background-color: #fff7;
    overflow-y: overlay;
    box-shadow: 1px 1px 2px #0003 inset;
    padding: 5px;
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
    grid-template-rows: repeat(auto-fill, 60px);

    &::-webkit-scrollbar-track {
        margin: 5px;
    }
}
</style>
