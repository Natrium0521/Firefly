<template>
    <div class="list-view">
        <CardListItem v-for="item in gachaDetail" :key="item.id" :item="item" />
    </div>
</template>

<script setup lang="ts">
import CardListItem from './CardListItem.vue';

defineProps(['gachaDetail']);
</script>

<style scoped lang="scss">
.list-view {
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
    display: flex;
    flex-direction: column;
    gap: 5px;

    &::-webkit-scrollbar-track {
        margin: 5px;
    }
}
</style>
