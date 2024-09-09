<template>
    <teleport to=".app-content">
        <div class="alert-layer" :id="$props.id" ref="alertLayer" @mousedown="onAlertLayerMouseDown" @mouseup="onAlertLayerMouseUp">
            <div class="alert-box" ref="alertBox">
                <div class="alert-title">{{ props.title }}</div>
                <div class="alert-content">
                    <slot></slot>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const emits = defineEmits(['close']);
const props = defineProps(['title', 'id']);

// 用于确认鼠标点击和松开的对象都是layer，防止从box按下后拖动到layer触发关闭事件
let isLayerClicked = false;

const alertLayer = ref<HTMLDivElement>(null);
const alertBox = ref<HTMLDivElement>(null);
const onAlertLayerMouseDown = (e: MouseEvent) => {
    isLayerClicked = e.target === alertLayer.value;
};
const onAlertLayerMouseUp = (e: MouseEvent) => {
    if (isLayerClicked && e.target === alertLayer.value) {
        emits('close');
    }
    isLayerClicked = false;
};
onMounted(() => {
    alertLayer.value.animate([{ opacity: 0 }, { opacity: 1 }], 200);
    alertBox.value.animate([{ transform: 'translateY(10px)' }, { transform: 'translateY(0)' }], 200);
});
</script>

<style lang="scss" scoped>
.alert-layer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 10;
    background-color: #0003;
}

.alert-box {
    position: absolute;
    background-color: #fffe;
    border-radius: 10px;
    box-shadow: 2px 2px 3px #0007;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    width: fit-content;
    min-width: 200px;
    height: fit-content;
}

.alert-title {
    --theme-color: red;
    border-bottom: solid 1px #7773;
    text-align: center;
    margin: 5px 0;
    line-height: 1.8em;
    font-size: 1.11em;
}

.alert-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px 30px 10px 30px;
}
</style>
