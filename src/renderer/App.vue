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
import Toast from './components/Toast';

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
        if (res['CheckUpdateOnLaunch']) checkUpdate();
    });
    window.fireflyAPI.unlockfps.isFPSUnlocked();
    useTextMap().loadTextMap('TextMapCHS');
    const checkUpdate = () =>
        window.fireflyAPI.config.getAppVersion().then((res) => {
            let versionNow = res;
            const isNewVersion = (version: string) => {
                if (version.startsWith('v')) {
                    version = version.substring(1);
                }
                const versionNowArray = versionNow.split('.').map(Number);
                const versionArray = version.split('.').map(Number);
                const maxLength = Math.max(versionNowArray.length, versionArray.length);
                while (versionNowArray.length < maxLength) versionNowArray.push(0);
                while (versionArray.length < maxLength) versionArray.push(0);
                for (let i = 0; i < maxLength; i++) {
                    if (versionNowArray[i] > versionArray[i]) {
                        return false;
                    } else if (versionNowArray[i] < versionArray[i]) {
                        return true;
                    }
                }
                return false;
            };
            fetch('https://api.github.com/repos/Natrium0521/Firefly/releases/latest')
                .then((res) => res.json())
                .then((res) => {
                    if (res['message'] && res['message'].includes('API rate limit exceeded')) {
                        return;
                    }
                    if (isNewVersion(res['tag_name'])) {
                        let changeLog = '';
                        res['body'].split('\r\n\r\n').forEach((item) => {
                            if (item.startsWith('## ')) {
                                changeLog += item.substring(3) + '<br>&emsp;';
                            } else if (item.startsWith('#### ')) {
                                changeLog += item.substring(5) + '：<br>';
                            } else if (item.startsWith('+ ')) {
                                changeLog += '&emsp;' + item.substring(2) + '<br>';
                            } else {
                                changeLog += item + '<br>';
                            }
                        });
                        Toast.info('发现新版本', '可前往设置页面更新或直接跳转 <a href="https://github.com/Natrium0521/Firefly/releases/latest">GitHub</a> 下载<br><br>' + changeLog, 60000);
                    }
                })
                .catch(() => {});
        });
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
