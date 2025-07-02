<template>
    <div ref="scrollContainer" :class="mergedClass" :style="mergedStyle" v-bind="filteredAttrs">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, onActivated, onDeactivated, useAttrs } from 'vue';

interface Props {
    // 自定义 class
    customClass?: string | Array<unknown> | object;
    // 自定义 style
    customStyle?: string | Array<unknown> | object;
    // 是否启用滚动保存
    enabled?: boolean;
    // 滚动容器选择器，用于查找特定的滚动元素
    scrollSelector?: string;
}

const props = withDefaults(defineProps<Props>(), {
    customClass: '',
    customStyle: '',
    enabled: true,
    scrollSelector: '',
});

const attrs = useAttrs();
const scrollContainer = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const scrollLeft = ref(0);

const mergedClass = computed(() => [props.customClass, attrs.class]);
const mergedStyle = computed(() => [props.customStyle, attrs.style]);
const filteredAttrs = computed(() => {
    const { class: _, style: __, ...rest } = attrs;
    return rest;
});

const getScrollElement = (): HTMLElement | null => {
    if (props.scrollSelector) {
        return scrollContainer.value?.querySelector(props.scrollSelector) || scrollContainer.value;
    }
    return scrollContainer.value;
};

onActivated(() => {
    if (!props.enabled) return;

    nextTick(() => {
        const scrollElement = getScrollElement();
        if (scrollElement) {
            scrollElement.scrollTop = scrollTop.value;
            scrollElement.scrollLeft = scrollLeft.value;
        }
    });
});

onDeactivated(() => {
    if (!props.enabled) return;

    const scrollElement = getScrollElement();
    if (scrollElement) {
        scrollTop.value = scrollElement.scrollTop;
        scrollLeft.value = scrollElement.scrollLeft;
    }
});
</script>
