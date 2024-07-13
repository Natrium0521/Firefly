<template>
    <div class="setting-container">
        <AboutArea />
        <SettingArea title="流萤工具箱">
            <SettingItemSwitch title="关闭时直接退出" desc="不保留托盘图标" :icon-path="CloseIconPath" v-model="isCloseDirectly" />
            <SettingItemSwitch title="Debug模式（重启生效）" desc="不建议非开发人员开启" :icon-path="DebugIconPath" v-model="isDebugOn" />
        </SettingArea>
        <SettingArea title="游戏">
            <SettingItemSwitch title="是否解锁120帧" :desc="unlockFPSDesc" :icon-path="UnlockIconPath" v-model="isFPSUnlocked" :disabled="!unlockFPSEnabled" />
        </SettingArea>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import AboutArea from './components/AboutArea.vue';
import SettingArea from './components/SettingArea.vue';
import SettingItemSwitch from './components/SettingItemSwitch.vue';
import CloseIconPath from '../../assets/image/svg/close-circle.svg';
import DebugIconPath from '../../assets/image/svg/bug.svg';
import UnlockIconPath from '../../assets/image/svg/unlock.svg';

let isFPSUnlocked = ref(false);
let unlockFPSDesc = ref('检测中');
let unlockFPSEnabled = false;
window.fireflyAPI.unlockfps.isFPSUnlocked().then((res) => {
    unlockFPSDesc.value = '解锁前请先在游戏中修改任意图像设置（使图像质量显示为自定义）并退出游戏';
    isFPSUnlocked.value = res['msg'] === 'unlocked';
    unlockFPSEnabled = true;
});
watch(isFPSUnlocked, () => {
    window.fireflyAPI.unlockfps.isFPSUnlocked().then((res) => {
        if ((res['msg'] === 'unlocked') !== isFPSUnlocked.value) {
            unlockFPSEnabled = false;
            window.fireflyAPI.unlockfps.toggleFPS().then((res) => {
                isFPSUnlocked.value = res['fps'] == 120;
                unlockFPSEnabled = true;
            });
        }
    });
});

let isCloseDirectly = ref(false);
watch(isCloseDirectly, () => {
    window.fireflyAPI.setting.setAppSettings('CloseDirectly', isCloseDirectly.value).then((res) => {
        if (res['CloseDirectly'] !== isCloseDirectly.value) {
            isCloseDirectly.value = res['CloseDirectly'];
        }
    });
});

let isDebugOn = ref(false);
watch(isDebugOn, () => {
    window.fireflyAPI.setting.setAppSettings('Debug', isDebugOn.value).then((res) => {
        if (res['Debug'] !== isDebugOn.value) {
            isDebugOn.value = res['Debug'];
        }
    });
});

onMounted(() => {
    window.fireflyAPI.setting.getAppSettings().then((res) => {
        isDebugOn.value = res['Debug'];
        isCloseDirectly.value = res['CloseDirectly'];
    });
});
</script>

<style scoped>
.setting-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    padding-bottom: 5px;
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    gap: 5px;

    & > div {
        box-shadow: 2px 2px 3px #0004;
        background-color: #fff8;
        border-radius: 5px;
    }
}
</style>
