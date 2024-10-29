<template>
    <div class="view-scope" @scroll="onScroll($event)" ref="viewScope">
        <div class="scroll-view" :style="{ height: scrollHeight + 'px' }">
            <AchievementItem class="scroll-item" :style="{ transform: `translateY(${scrollTop - (scrollTop % 65)}px)` }" v-for="item of renderItems" :key="item.achievement_id" :item="item" :ref="(el) => setItemRef(el, item.achievement_id)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, ref, toRefs, watch } from 'vue';
import emitter from '../../../utils/mitt';
import AchievementItem from './AchievementItem.vue';

const props = defineProps(['items']);
const { items } = toRefs(props);
const itemRefs = {};
function setItemRef(el: any, id: number | string) {
    if (!el) return;
    itemRefs[id] = el._.vnode.el;
}
let oldItemsOrder = [];

watch(items, () => {
    // 处理从上层传下来的items改变时的动画效果
    let itemDiffs = {};
    let maxDiff = Math.floor(scopeHeight.value / 65) + 1;
    items.value.forEach((item: any, index: number) => {
        // 计算每个item下标变化情况，用于计算动画的距离
        let diff = 0;
        if (oldItemsOrder.indexOf(item.achievement_id) === -1) {
            diff = index + 1;
        } else {
            diff = index - oldItemsOrder.indexOf(item.achievement_id);
        }
        if (diff > maxDiff) diff = maxDiff;
        if (diff < -maxDiff) diff = -maxDiff;
        itemDiffs[item.achievement_id] = diff;
    });
    // 由于这里先于v-for，v-for中新的DOM对象还没有挂载，itemRefs中为undefined，所以延迟一下
    requestAnimationFrame(() => {
        items.value.slice(startIndex, endIndex).forEach((item: any) => {
            // 给渲染的DOM添加动画
            if (itemDiffs[item.achievement_id] !== 0) {
                let style = window.getComputedStyle(itemRefs[item.achievement_id]);
                let matrix = style.transform === 'none' ? [1, 0, 0, 1, 0, 0] : style.transform.split('(')[1].split(')')[0].split(',').map(Number);
                let translateY = matrix[5];
                // 这里要加上元素本身的translateY。元素的translateY是为了保持在视口，不加会跟着scroll-view一起滚动到上面
                itemRefs[item.achievement_id].animate([{ transform: `translateY(${translateY + itemDiffs[item.achievement_id] * -65}px)` }, { transform: `translateY(${translateY}px)` }], { duration: 300, easing: 'ease' });
            }
        });
    });
    oldItemsOrder = [];
    items.value.forEach((item: any) => {
        oldItemsOrder.push(item.achievement_id);
    });
});

const viewScope = ref<HTMLElement | null>(null);
const scrollHeight = computed(() => items.value.length * 65 + 5);
const scrollTop = ref(0);
const scopeHeight = ref(0);
function onScroll(e: any) {
    scrollTop.value = e.target.scrollTop;
    if (scopeHeight.value !== e.target.clientHeight) scopeHeight.value = e.target.clientHeight;
}
let startIndex = 0;
let endIndex = 0;
const renderItems = computed(() => {
    // 计算渲染范围，items是所有的数据，renderItems是要加到DOM的数据
    let upper = scrollTop.value;
    startIndex = Math.floor(upper / 65);
    startIndex = startIndex < 0 ? 0 : startIndex;
    endIndex = startIndex + Math.floor(scopeHeight.value / 65) + 2;
    endIndex = endIndex > items.value.length ? items.value.length : endIndex;
    return items.value.slice(startIndex, endIndex);
});

onMounted(() => {
    // 防止一开始容器高度为0，导致视口高度计算错误
    scopeHeight.value = viewScope.value.clientHeight;
    window.addEventListener('resize', () => {
        // 窗口大小改变时，重新获取视口高度
        scopeHeight.value = viewScope.value.clientHeight;
    });
});

onActivated(() => {
    // 若改变大小时不在成就页面，viewScope高度会为0，所以激活时重新获取一下
    scopeHeight.value = viewScope.value.clientHeight;
    // 以及让滚动条回到记录的位置
    viewScope.value.style.scrollBehavior = 'auto';
    viewScope.value.scrollTo(0, scrollTop.value);
    viewScope.value.style.scrollBehavior = 'smooth';
});

emitter.on('achievement:scrollToTop', (smoothScroll = false) => {
    if (!smoothScroll) viewScope.value.style.scrollBehavior = 'auto';
    viewScope.value.scrollTo(0, 0);
    if (!smoothScroll) viewScope.value.style.scrollBehavior = 'smooth';
});
</script>

<style scoped lang="scss">
.view-scope {
    overflow-y: scroll;
    overflow-x: hidden;
    scroll-behavior: smooth;
}

.scroll-view {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
}
</style>
