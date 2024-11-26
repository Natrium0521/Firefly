<template>
    <div class="pool-detail-view">
        <div class="summary">
            <div class="title">统计（数量）：</div>
            <div class="box" ref="summaryBox">
                <CardGridItem v-for="item in summary" :key="item.itemId" :item="item" />
            </div>
        </div>
        <div class="record">
            <div class="title">记录（正序）：</div>
            <div class="box" ref="recordBox">
                <CardGridItem v-for="item in detail" :key="item.id" :item="item" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import CardGridItem from './CardGridItem.vue';

const props = defineProps(['detail']);

const summary = computed(() => {
    const itemInfo = {};
    props.detail.forEach((item: any) => {
        if (itemInfo[item.itemId]) {
            itemInfo[item.itemId].count++;
        } else {
            itemInfo[item.itemId] = {
                id: item.id,
                itemId: item.itemId,
                name: item.name,
                count: 1,
                star: +item.iconType.at(-1),
                iconType: item.iconType,
                time: '',
            };
        }
    });
    const sortedItemIds = Object.keys(itemInfo).sort((a, b) => {
        if (itemInfo[a].star !== itemInfo[b].star) return itemInfo[b].star - itemInfo[a].star;
        if (itemInfo[a].count !== itemInfo[b].count) return itemInfo[b].count - itemInfo[a].count;
        return +itemInfo[a].itemId - +itemInfo[b].itemId;
    });
    const items = [];
    sortedItemIds.forEach((itemId) => {
        items.push(itemInfo[itemId]);
    });
    return items;
});

const summaryBox = ref<HTMLDivElement>(null);
const recordBox = ref<HTMLDivElement>(null);
watch(
    () => props.detail,
    () => {
        if (summaryBox.value) {
            summaryBox.value.scrollTop = 0;
        }
        if (recordBox.value) {
            recordBox.value.scrollTop = 0;
        }
    }
);
</script>

<style lang="scss" scoped>
.pool-detail-view {
    position: absolute;
    left: 5px;
    right: 5px;
    bottom: 5px;
    top: 5px;
}

.summary {
    position: absolute;
    top: 0;
    width: 100%;
    height: 230px;
}

.record {
    position: absolute;
    bottom: 0;
    width: 100%;
    top: 240px;
}

.title {
    position: absolute;
    left: 5px;
    line-height: 30px;
}

.box {
    position: absolute;
    top: 30px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: overlay;
    scroll-behavior: smooth;
    background-color: #fff7;
    border-radius: 5px;
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
