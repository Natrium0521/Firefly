<template>
    <div class="gacha-body">
        <Transition :name="currentView === GachaBodyPoolView ? 'slide-left' : 'slide-right'">
            <KeepAlive>
                <component :is="currentView" />
            </KeepAlive>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import emitter from '../../../utils/mitt';
import GachaBodyTypeView from './GachaBodyTypeView.vue';
import GachaBodyPoolView from './GachaBodyPoolView.vue';

const currentView = shallowRef(GachaBodyTypeView);

function toggleGachaView(toggleTo: string) {
    if (toggleTo === '卡池') currentView.value = GachaBodyPoolView;
    else currentView.value = GachaBodyTypeView;
}

emitter.on('gacha:toggleGachaView', toggleGachaView);
</script>

<style scoped lang="scss">
.gacha-body {
    position: absolute;
    top: 55px;
    bottom: 0;
    left: 0;
    right: 0;
}

.gacha-body {
    .slide-left-enter-active,
    .slide-left-leave-active,
    .slide-right-enter-active,
    .slide-right-leave-active {
        transition: all 300ms ease;
    }
    .slide-right-enter-from {
        opacity: 0;
        transform: translateX(-10px);
    }
    .slide-right-enter-to {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-right-leave-from {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-right-leave-to {
        opacity: 0;
        transform: translateX(10px);
    }
    .slide-left-enter-from {
        opacity: 0;
        transform: translateX(10px);
    }
    .slide-left-enter-to {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-left-leave-from {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-left-leave-to {
        opacity: 0;
        transform: translateX(-10px);
    }
}
</style>
