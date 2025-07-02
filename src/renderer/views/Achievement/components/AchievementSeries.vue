<template>
    <div class="achievement-series" :class="{ selected: selected }">
        <div class="icon-wrapper">
            <img :src="SeriesIcons[item.series_icon]" />
        </div>
        <div class="name-wrapper">{{ item.series_title }}</div>
        <div class="info-wrapper">{{ `${item.count_finished}/${item.count_total} - ${((item.count_finished / item.count_total) * 100).toFixed(2)}%` }}</div>
        <div class="progress-bar-wrapper">
            <ProgressBar :progress="((item.count_finished / item.count_total) * 100).toFixed(2)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Prize1 from '@renderer/assets/image/hsr/achievement/Prize1.png';
import CultivateAchievementIcon1 from '@renderer/assets/image/hsr/achievement/CultivateAchievementIcon1.png';
import CollectAchievementIcon1 from '@renderer/assets/image/hsr/achievement/CollectAchievementIcon1.png';
import MainLineAchievementIcon1 from '@renderer/assets/image/hsr/achievement/MainLineAchievementIcon1.png';
import ExploreAchievementIcon1 from '@renderer/assets/image/hsr/achievement/ExploreAchievementIcon1.png';
import ReputationAchievementIcon1 from '@renderer/assets/image/hsr/achievement/ReputationAchievementIcon1.png';
import ChallengeAchievementIcon1 from '@renderer/assets/image/hsr/achievement/ChallengeAchievementIcon1.png';
import BattleAchievementIcon1 from '@renderer/assets/image/hsr/achievement/BattleAchievementIcon1.png';
import TrackAchievementIcon1 from '@renderer/assets/image/hsr/achievement/TrackAchievementIcon1.png';
import RougeAchievementIcon1 from '@renderer/assets/image/hsr/achievement/RougeAchievementIcon1.png';
import ProgressBar from '@renderer/components/ProgressBar.vue';

const SeriesIcons = {
    Prize: Prize1,
    CultivateAchievementIcon: CultivateAchievementIcon1,
    CollectAchievementIcon: CollectAchievementIcon1,
    MainLineAchievementIcon: MainLineAchievementIcon1,
    ExploreAchievementIcon: ExploreAchievementIcon1,
    ReputationAchievementIcon: ReputationAchievementIcon1,
    ChallengeAchievementIcon: ChallengeAchievementIcon1,
    BattleAchievementIcon: BattleAchievementIcon1,
    TrackAchievementIcon: TrackAchievementIcon1,
    RougeAchievementIcon: RougeAchievementIcon1,
};

defineProps(['item', 'selected']);
</script>

<style lang="scss" scoped>
.achievement-series {
    position: relative;
    height: 60px;
    border-radius: 5px;
    margin: 5px;
    margin-right: 2px;
    margin-left: 3px;
    white-space: nowrap;
    overflow: hidden;
    transition: all 100ms ease;

    &:hover {
        transform: scale(1.01);
        background-color: #fff7;
    }

    &:active {
        transform: scale(0.99);
        background-color: #fffa;
    }

    &.selected {
        background-color: #fffe;
        transform: scale(1);
    }
}

.icon-wrapper {
    position: absolute;
    width: 50px;
    height: 100%;
    filter: drop-shadow(2px 2px 3px #0007);

    img {
        position: absolute;
        width: 40px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
}

.name-wrapper {
    position: absolute;
    left: 50px;
    right: 5px;
    top: 12px;
    overflow: hidden;
}

.info-wrapper {
    position: absolute;
    top: 50%;
    left: 50px;
    font-size: 0.67em;
    color: gray;
}

.progress-bar-wrapper {
    position: absolute;
    left: 50px;
    right: 10px;
    height: 4px;
    bottom: 12px;
}
</style>
