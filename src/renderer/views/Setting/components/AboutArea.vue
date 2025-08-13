<template>
    <div class="about-area">
        <div class="about">
            <div class="icon_" @click="EasterEggCount++" style="position: relative;">
                <img class="icon" src="../../../../static/image/icon.png" />
                <img v-if="new Date().getMonth() === 11 && new Date().getDate() === 25" src="../../../assets/image/svg/christmas-hat.svg" style="position: absolute; left: -51px; top: -78px; scale: 0.7; transform: rotate(346deg); filter: brightness(0.9);">
            </div>
            <div class="version">工具箱版本 v{{ version }}<br />适配游戏版本 v3.5</div>
            <div class="links">
                <div>项目链接 <a href="https://github.com/Natrium0521/Firefly">GitHub</a></div>
                <div>游戏数据来自 <a href="https://github.com/DimbreathBot/TurnBasedGameData">StarRailData</a></div>
                <div>跃迁记录导出标准 <a href="https://uigf.org/">SRGF / UIGF</a></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Toast from '@renderer/components/Toast';

const version = ref('');

onMounted(() => {
    window.fireflyAPI.config.getAppVersion().then((v) => {
        version.value = v;
    });
});

const EasterEggCount = ref(0);
const IfICanStopOneHeartFromBreaking = ['Birds are born with no shackles', 'Then what fetters my fate', 'Blown away, the white petals', 'Leave me trapped in the cage', 'The endless isolation', "Can't wear down my illusion", "Someday, I'll make a dream unchained", 'Let my heart bravely spread the wings', 'Soaring past the night', 'To trace the bright moonlight', 'Let the clouds heal me of the stings', 'Gently wipe the sorrow off my life', 'I dream', 'What is meant by "Miracle"', 'A word outside my days?', 'Once again, repeat warbles', 'But how could I escape?', 'No further hesitation', 'On those unanswered questions', "So now, I'll make a dream unchained", 'Let my heart bravely spread the wings', 'Soaring past the night', 'To trace the bright moonlight', 'Let the clouds heal me of the stings', 'Gently wipe the sorrow off my life', 'I dream'];
watch(EasterEggCount, (count) => {
    if (count >= 10) {
        Toast.info(IfICanStopOneHeartFromBreaking[(count - 10) % IfICanStopOneHeartFromBreaking.length], `${count}`, 5000);
    }
});
</script>

<style lang="scss" scoped>
.about-area {
    position: relative;
    height: 200px;
}

.about {
    content: '';
    position: absolute;
    background: #fff8;
    border-radius: 5px;
    left: 5px;
    right: 5px;
    top: 5px;
    bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 50px;
}

.icon {
    height: 150px;
}
</style>
