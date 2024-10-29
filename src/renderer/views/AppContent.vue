<template>
    <div class="app-content">
        <div class="app-content-sidebar-wrapper" :class="{ collapsed: isSidebarCollapsed }">
            <div class="app-content-sidebar">
                <div class="app-content-sidebar-item" :class="{ selected: currentComponent === Achievement }" @click="onSidebarItemClick($event, Achievement)">
                    <img src="../assets/image/hsr/AchievementIcon.png" />
                    <span>成就管理</span>
                </div>
                <div class="app-content-sidebar-item" :class="{ selected: currentComponent === Gacha }" @click="onSidebarItemClick($event, Gacha)">
                    <img src="../assets/image/hsr/DrawcardIcon.png" />
                    <span>跃迁记录</span>
                </div>
                <div class="app-content-sidebar-item" :class="{ selected: currentComponent === Setting }" @click="onSidebarItemClick($event, Setting)">
                    <img src="../assets/image/hsr/SettingsIcon.png" />
                    <span>设置</span>
                </div>
                <div class="app-content-sidebar-item" style="margin-top: auto; width: 45px" @click="isSidebarCollapsed = !isSidebarCollapsed">
                    <img src="../assets/image/svg/hamburger-button.svg" style="transform: translate(8px, -50%)" />
                </div>
            </div>
        </div>
        <div class="app-content-main" :class="{ collapsed: isSidebarCollapsed }">
            <Transition :name="transitionName">
                <KeepAlive>
                    <component :is="currentComponent" />
                </KeepAlive>
            </Transition>
        </div>
        <Toast />
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import Achievement from './Achievement/Achievement.vue';
import Gacha from './Gacha/Gacha.vue';
import Setting from './Setting/Setting.vue';
import Toast from '@renderer/components/Toast/Toast.vue';

const componentIndex = new WeakMap([
    [Achievement, 1],
    [Gacha, 2],
    [Setting, 3],
]);
const isSidebarCollapsed = ref(false);
window.fireflyAPI.setting.getAppSettings().then((settings) => {
    isSidebarCollapsed.value = settings['SidebarCollapsed'];
});
const currentComponent = shallowRef(Achievement);
const transitionName = ref('');

function onSidebarItemClick(event: MouseEvent, component: any) {
    if (currentComponent.value === component) return;
    if (componentIndex.get(currentComponent.value) > componentIndex.get(component)) {
        transitionName.value = 'slide-down';
    } else {
        transitionName.value = 'slide-up';
    }
    currentComponent.value = component;
}

watch(isSidebarCollapsed, () => {
    window.fireflyAPI.setting.setAppSettings('SidebarCollapsed', isSidebarCollapsed.value);
});
</script>

<style scoped lang="scss">
.app-content {
    position: absolute;
    width: 100%;
    top: 45px;
    bottom: 0;
    overflow: hidden;
}

.app-content-sidebar-wrapper {
    position: absolute;
    width: 200px;
    height: 100%;
    left: 0;
    top: 0;
    transition: all 300ms ease;

    &.collapsed {
        width: 60px;

        & img {
            transform: translate(8px, -50%);
        }

        & span {
            transform: translate(40px, -50%);
            opacity: 0;
        }
    }
}

.app-content-sidebar {
    position: absolute;
    height: calc(100% - 15px);
    width: calc(100% - 5px);
    left: 5px;
    top: 5px;
    background-color: #fff8;
    display: flex;
    flex-direction: column;
    overflow-y: overlay;
    overflow-x: hidden;
    scrollbar-gutter: stable;
    border-radius: 5px;
    box-shadow: 2px 2px 3px #0004;
    padding-top: 5px;
}

.app-content-sidebar::-webkit-scrollbar-track {
    margin: 5px;
}

.app-content-sidebar-item {
    position: relative;
    border-radius: 5px;
    height: 45px;
    flex-shrink: 0;
    margin-bottom: 5px;
    margin-left: 5px;
    transition: all 50ms ease;
}

.app-content-sidebar-item:hover {
    background-color: #fff7;
}

.app-content-sidebar-item:active {
    scale: 0.99;
    background-color: #fffa;
}

.app-content-sidebar-item.selected {
    background-color: #fffc;
}

.app-content-sidebar-item img {
    position: absolute;
    top: 50%;
    transform: translate(10px, -50%);
    height: 28px;
    filter: drop-shadow(1px 1px 2px #000c);
    transition: all 300ms ease;
}

.app-content-sidebar-item span {
    position: absolute;
    top: 50%;
    transform: translate(50px, -50%);
    text-wrap: nowrap;
    transition: all 300ms ease;
}

.app-content-main {
    position: absolute;
    left: 205px;
    top: 5px;
    right: 0;
    bottom: 0;
    padding-bottom: 5px;
    padding-right: 5px;
    overflow-y: overlay;
    overflow-x: hidden;
    scrollbar-gutter: stable;
    transition: all 300ms ease;

    &.collapsed {
        left: 65px;
    }
}

.app-content-main {
    .slide-up-enter-active,
    .slide-up-leave-active,
    .slide-down-enter-active,
    .slide-down-leave-active {
        transition: all 300ms ease;
    }
    .slide-down-enter-from {
        opacity: 0;
        transform: translateY(-10px);
    }
    .slide-down-enter-to {
        opacity: 1;
        transform: translateY(0);
    }
    .slide-down-leave-from {
        opacity: 1;
        transform: translateY(0);
    }
    .slide-down-leave-to {
        opacity: 0;
        transform: translateY(10px);
    }
    .slide-up-enter-from {
        opacity: 0;
        transform: translateY(10px);
    }
    .slide-up-enter-to {
        opacity: 1;
        transform: translateY(0);
    }
    .slide-up-leave-from {
        opacity: 1;
        transform: translateY(0);
    }
    .slide-up-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }
}
</style>
