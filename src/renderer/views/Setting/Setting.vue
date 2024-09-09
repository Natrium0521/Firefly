<template>
    <div class="setting-container">
        <AboutArea />
        <SettingArea title="流萤工具箱">
            <SettingItemSwitch title="关闭时直接退出" desc="不保留托盘图标" :icon-path="CloseIconPath" v-model="isCloseDirectly" />
            <SettingItemSwitch title="Debug模式（重启生效）" desc="不建议非开发人员开启" :icon-path="DebugIconPath" v-model="isDebugOn" />
            <SettingItemButtonSwitch title="启动时自动检查更新" desc="需要能访问 GitHub" button-text="检查更新" :icon-path="UpdateIconPath" @onButtonClick="showUpdateAlert = true" v-model="isCheckUpdateOnLaunch" />
            <Alert id="update-alert" v-if="showUpdateAlert" @close="!['downloading', 'updating'].includes(updateState) ? (showUpdateAlert = false) : false" title="更新" @vue:mounted="onUpdateAlertMounted">
                <div class="update-info" v-html="updateInfo"></div>
                <div class="release-href" v-show="['need_update', 'downloading', 'download_failed', 'update_failed'].includes(updateState)">使用浏览器下载：<a href="https://github.com/Natrium0521/Firefly/releases/latest">GitHub</a></div>
                <div class="download-info" v-show="updateState == 'downloading'">
                    <div class="size">{{ downloadInfoSize }}</div>
                    <div class="speed">{{ downloadInfoSpeed }}</div>
                    <div class="progress">{{ downloadInfoProgress }}%</div>
                    <div class="progress-bar-wrapper">
                        <ProgressBar :progress="downloadInfoProgress" />
                    </div>
                </div>
                <div class="button-area" v-show="!['initial', 'updating', 'update_failed'].includes(updateState)">
                    <div id="button-cancel" class="button" @click="onUpdateAlertCancelButtonClick">取消</div>
                    <div id="button-confirm" class="button theme" @click="onUpdateAlertConfirmButtonClick" v-show="updateState != 'downloading'">{{ { need_update: '下载', is_latest: '重试', check_failed: '重试', download_failed: '重试', downloaded: '更新' }[updateState] }}</div>
                </div>
            </Alert>
        </SettingArea>
        <SettingArea title="游戏">
            <SettingItemSwitch title="是否解锁120帧" :desc="unlockFPSDesc" :icon-path="UnlockIconPath" v-model="isFPSUnlocked" :disabled="!unlockFPSEnabled" />
        </SettingArea>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Alert from '@renderer/components/Alert.vue';
import ProgressBar from '@renderer/components/ProgressBar.vue';
import AboutArea from './components/AboutArea.vue';
import SettingArea from './components/SettingArea.vue';
import SettingItemSwitch from './components/SettingItemSwitch.vue';
import SettingItemButtonSwitch from './components/SettingItemButtonSwitch.vue';
import CloseIconPath from '@renderer/assets/image/svg/close-circle.svg';
import DebugIconPath from '@renderer/assets/image/svg/bug.svg';
import UpdateIconPath from '@renderer/assets/image/svg/update.svg';
import UnlockIconPath from '@renderer/assets/image/svg/unlock.svg';

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

let isCheckUpdateOnLaunch = ref(false);
watch(isCheckUpdateOnLaunch, () => {
    window.fireflyAPI.setting.setAppSettings('CheckUpdateOnLaunch', isCheckUpdateOnLaunch.value).then((res) => {
        if (res['CheckUpdateOnLaunch'] !== isCheckUpdateOnLaunch.value) {
            isCheckUpdateOnLaunch.value = res['CheckUpdateOnLaunch'];
        }
    });
});

onMounted(() => {
    window.fireflyAPI.setting.getAppSettings().then((res) => {
        isDebugOn.value = res['Debug'];
        isCloseDirectly.value = res['CloseDirectly'];
        isCheckUpdateOnLaunch.value = res['CheckUpdateOnLaunch'];
    });
    window.fireflyAPI.config.getAppVersion().then((res) => {
        versionNow = res;
    });
});

const showUpdateAlert = ref(false);
const updateInfo = ref('');
const downloadInfoSize = ref('');
const downloadInfoSpeed = ref('');
const downloadInfoProgress = ref('');
type UpdateState = 'initial' | 'need_update' | 'is_latest' | 'check_failed' | 'downloading' | 'download_failed' | 'downloaded' | 'updating' | 'update_failed';
const updateState = ref<UpdateState>('initial');
let versionNow = '999.999.999.999';
let asarHash = '';
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
let downloadLink = '';
let totalSize = 0;
const doCheck = (useCache: boolean = false) => {
    updateInfo.value = '正在检查更新';
    fetch('https://api.github.com/repos/Natrium0521/Firefly/releases/latest', useCache ? undefined : { headers: { 'cache-control': 'no-cache' } })
        .then((res) => res.json())
        .then((res) => {
            if (res['message'] && res['message'].includes('API rate limit exceeded')) {
                updateInfo.value = 'API请求次数超限<br>请尝试更换代理或直接访问GitHub';
                updateState.value = 'check_failed';
                return;
            }
            if (isNewVersion(res['tag_name'])) {
                res['assets'].forEach((asset: unknown) => {
                    if (asset['name'].endsWith('.asar')) {
                        downloadLink = asset['browser_download_url'];
                        totalSize = asset['size'];
                        asarHash = asset['name'].replace('.asar', '');
                    }
                });
                if (downloadLink == '') {
                    throw new Error('asar not found');
                } else {
                    updateInfo.value = '发现新版 ' + res['tag_name'];
                    updateState.value = 'need_update';
                }
            } else {
                updateInfo.value = '已经是最新版本';
                updateState.value = 'is_latest';
            }
        })
        .catch(() => {
            updateInfo.value = '无法获取最新版本<br>请检查网络连接';
            updateState.value = 'check_failed';
        });
};
let downloadTimer = undefined;
const doDownload = () => {
    downloadInfoSize.value = '';
    downloadInfoSpeed.value = '';
    downloadInfoProgress.value = '0';
    window.fireflyAPI.update.doDownload(downloadLink);
    updateInfo.value = '准备下载';
    updateState.value = 'downloading';
    downloadTimer = setInterval(() => {
        window.fireflyAPI.update.getDownloadInfo().then((info) => {
            if (info.progress && info.speed && info.state) {
                switch (info.state) {
                    case 'downloading':
                        updateInfo.value = '下载中';
                        updateState.value = 'downloading';
                        break;
                    case 'downloaded':
                        updateInfo.value = '下载完成';
                        updateState.value = 'downloaded';
                        break;
                    case 'cancelled':
                        updateInfo.value = '下载失败：已取消';
                        updateState.value = 'download_failed';
                        break;
                    case 'interrupted':
                    case 'failed':
                        updateInfo.value = '下载失败';
                        updateState.value = 'download_failed';
                }
                if (info.state != 'downloading') clearInterval(downloadTimer);
                downloadInfoProgress.value = (info.progress * 100).toFixed(2);
                let unit = 'B/s';
                let speed = ~~info.speed;
                if (speed > 1024) {
                    unit = 'KB/s';
                    speed = speed / 1024;
                }
                if (speed > 1024) {
                    unit = 'MB/s';
                    speed = speed / 1024;
                }
                if (speed > 1024) {
                    unit = 'GB/s';
                    speed = speed / 1024;
                }
                downloadInfoSpeed.value = speed.toFixed(2) + unit;
                unit = 'B';
                let size = ~~(totalSize * info.progress);
                if (size > 1024) {
                    unit = 'KB';
                    size = size / 1024;
                }
                if (size > 1024) {
                    unit = 'MB';
                    size = size / 1024;
                }
                if (size > 1024) {
                    unit = 'GB';
                    size = size / 1024;
                }
                downloadInfoSize.value = size.toFixed(2) + unit;
            }
        });
    }, 1000);
};
const doUpdate = () => {
    window.fireflyAPI.update.doUpdate(asarHash).then((res) => {
        switch (res) {
            case 'no update file':
                updateInfo.value = '更新失败：缺少更新文件';
                updateState.value = 'update_failed';
                break;
            case 'CRC32 verification failed':
                updateInfo.value = '更新失败：CRC32校验失败';
                updateState.value = 'update_failed';
                break;
            case 'updating':
                updateInfo.value = '更新中，请耐心等待';
                updateState.value = 'updating';
        }
    });
};
const onUpdateAlertCancelButtonClick = () => {
    switch (updateState.value) {
        case 'downloading':
            window.fireflyAPI.update.cancelDownload();
            break;
        default:
            showUpdateAlert.value = false;
            break;
    }
};
const onUpdateAlertConfirmButtonClick = () => {
    switch (updateState.value) {
        case 'need_update':
            doDownload();
            break;
        case 'is_latest':
            doCheck();
            break;
        case 'check_failed':
            doCheck();
            break;
        case 'download_failed':
            doDownload();
            break;
        case 'downloaded':
            doUpdate();
            break;
    }
};
const onUpdateAlertMounted = async () => {
    if (updateState.value == 'initial') doCheck(true);
};
</script>

<style lang="scss" scoped>
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

#update-alert {
    .update-info {
        text-align: center;
    }

    .release-href {
        margin-top: 8px;
        font-size: 0.95em;
    }

    .download-info {
        position: relative;
        font-size: 0.8em;
        height: 2em;
        width: 250px;
        margin-top: 10px;
        display: flex;
        justify-content: space-between;

        .progress-bar-wrapper {
            position: absolute;
            left: 0;
            right: 0;
            height: 4px;
            bottom: 0;
        }
    }
}

.button-area {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 15px;

    .button {
        padding: 5px 15px;
        width: 50px;
        border: solid 1px var(--theme-color);
        border-radius: 4px;
        text-align: center;
        background-color: #fff;

        &:hover {
            scale: 1.02;
            filter: brightness(0.95);
        }

        &:active {
            scale: 1.01;
            filter: brightness(0.9);
        }

        &.theme {
            color: #fff;
            background-color: var(--theme-color);
        }
    }
}
</style>
