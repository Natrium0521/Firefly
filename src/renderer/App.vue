<template>
    <div class="background"></div>
    <AppTitle />
    <AppContent />
</template>

<script setup lang="ts">
import $ from 'jquery';
import { onMounted } from 'vue';
import AppTitle from './views/AppTitle.vue';
import AppContent from './views/AppContent.vue';
import { useTextMap } from './store/textmap';
import { useUserAchievement } from './store/userachievement';
import { useUserGacha } from './store/usergacha';

onMounted(() => {
    $(document).on('keydown', (e) => {
        switch (e.key) {
            case 'Escape':
                window.fireflyAPI.sendMainWindowMsg('esc');
                break;
            // case 'F5':
            //     if (appSettings.Debug) window.fireflyAPI.sendMainWindow('reload');
            //     break;
            case 'Tab':
                e.preventDefault();
                break;
            case ' ':
                if (!(document.activeElement && document.activeElement instanceof HTMLInputElement)) e.preventDefault();
                break;
        }
    });
    useUserAchievement().init();
    useUserGacha().init();
    window.fireflyAPI.setting.getAppSettings().then((res) => {
        const [r, g, b] = res['ThemeColor'];
        $(':root').css('--theme-color', `rgb(${r}, ${g}, ${b})`);
    });
    window.fireflyAPI.unlockfps.isFPSUnlocked();
    useTextMap().loadTextMap('TextMapCHS');
});
</script>

<style>
@import url('./assets/css/global.css');

.background {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-position: center center;
    background-image: linear-gradient(#fff3, #fff3), url('./assets/image/background.png');
}
</style>
