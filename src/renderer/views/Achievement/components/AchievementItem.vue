<template>
    <div class="achievement-item" :title="`编号：${item.achievement_id}\n${item.achievement_mutual_exclusive_info}`">
        <div class="checkbox-area">
            <Checkbox class="checkbox" :model-value="item.achievement_status > 1" @update:model-value="handleUpdateCheckbox" :disabled="item.achievement_is_disabled" />
        </div>
        <div class="icon-area">
            <img class="icon-bg" :src="AchievementIconBg" />
            <img class="icon" :src="AchievementIcons[item.achievement_icon]" />
        </div>
        <div class="info-area">
            <div class="title-wrapper">
                <span class="title">{{ item.achievement_title }}</span>
                <span class="version-tag">{{ item.achievement_version }}</span>
                <span class="visible-tag">{{ item.achievement_show_type }}</span>
            </div>
            <div class="desc-wrapper">
                <div class="desc-upper" :title="item.achievement_desc_upper">{{ item.achievement_desc_upper }}</div>
                <div class="desc-lower" :title="item.achievement_desc_lower">{{ item.achievement_desc_lower }}</div>
            </div>
        </div>
        <div class="time-area">
            <span class="date">{{ item.achievement_finish_date }}</span>
            <span class="time">{{ item.achievement_finish_time }}</span>
        </div>
        <div class="reward-area">
            <img class="reward-icon" :src="Itemfigure900001" />
            <span class="reward-count">{{ item.achievement_reward }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import AchievementIconBg from '@renderer/assets/image/hsr/achievement/IconBg.png';
import Itemfigure900001 from '@renderer/assets/image/hsr/itemfigures/900001.png';
import CultivateAchievementIcon1 from '@renderer/assets/image/hsr/achievement/CultivateAchievementIcon1.png';
import CultivateAchievementIcon2 from '@renderer/assets/image/hsr/achievement/CultivateAchievementIcon2.png';
import CultivateAchievementIcon3 from '@renderer/assets/image/hsr/achievement/CultivateAchievementIcon3.png';
import CollectAchievementIcon1 from '@renderer/assets/image/hsr/achievement/CollectAchievementIcon1.png';
import CollectAchievementIcon2 from '@renderer/assets/image/hsr/achievement/CollectAchievementIcon2.png';
import CollectAchievementIcon3 from '@renderer/assets/image/hsr/achievement/CollectAchievementIcon3.png';
import MainLineAchievementIcon1 from '@renderer/assets/image/hsr/achievement/MainLineAchievementIcon1.png';
import MainLineAchievementIcon2 from '@renderer/assets/image/hsr/achievement/MainLineAchievementIcon2.png';
import MainLineAchievementIcon3 from '@renderer/assets/image/hsr/achievement/MainLineAchievementIcon3.png';
import ExploreAchievementIcon1 from '@renderer/assets/image/hsr/achievement/ExploreAchievementIcon1.png';
import ExploreAchievementIcon2 from '@renderer/assets/image/hsr/achievement/ExploreAchievementIcon2.png';
import ExploreAchievementIcon3 from '@renderer/assets/image/hsr/achievement/ExploreAchievementIcon3.png';
import ReputationAchievementIcon1 from '@renderer/assets/image/hsr/achievement/ReputationAchievementIcon1.png';
import ReputationAchievementIcon2 from '@renderer/assets/image/hsr/achievement/ReputationAchievementIcon2.png';
import ReputationAchievementIcon3 from '@renderer/assets/image/hsr/achievement/ReputationAchievementIcon3.png';
import ChallengeAchievementIcon1 from '@renderer/assets/image/hsr/achievement/ChallengeAchievementIcon1.png';
import ChallengeAchievementIcon2 from '@renderer/assets/image/hsr/achievement/ChallengeAchievementIcon2.png';
import ChallengeAchievementIcon3 from '@renderer/assets/image/hsr/achievement/ChallengeAchievementIcon3.png';
import BattleAchievementIcon1 from '@renderer/assets/image/hsr/achievement/BattleAchievementIcon1.png';
import BattleAchievementIcon2 from '@renderer/assets/image/hsr/achievement/BattleAchievementIcon2.png';
import BattleAchievementIcon3 from '@renderer/assets/image/hsr/achievement/BattleAchievementIcon3.png';
import TrackAchievementIcon1 from '@renderer/assets/image/hsr/achievement/TrackAchievementIcon1.png';
import TrackAchievementIcon2 from '@renderer/assets/image/hsr/achievement/TrackAchievementIcon2.png';
import TrackAchievementIcon3 from '@renderer/assets/image/hsr/achievement/TrackAchievementIcon3.png';
import RougeAchievementIcon1 from '@renderer/assets/image/hsr/achievement/RougeAchievementIcon1.png';
import RougeAchievementIcon2 from '@renderer/assets/image/hsr/achievement/RougeAchievementIcon2.png';
import RougeAchievementIcon3 from '@renderer/assets/image/hsr/achievement/RougeAchievementIcon3.png';
import Checkbox from '@renderer/components/Checkbox.vue';

const AchievementIcons = {
    CultivateAchievementIcon1,
    CultivateAchievementIcon2,
    CultivateAchievementIcon3,
    CollectAchievementIcon1,
    CollectAchievementIcon2,
    CollectAchievementIcon3,
    MainLineAchievementIcon1,
    MainLineAchievementIcon2,
    MainLineAchievementIcon3,
    ExploreAchievementIcon1,
    ExploreAchievementIcon2,
    ExploreAchievementIcon3,
    ReputationAchievementIcon1,
    ReputationAchievementIcon2,
    ReputationAchievementIcon3,
    ChallengeAchievementIcon1,
    ChallengeAchievementIcon2,
    ChallengeAchievementIcon3,
    BattleAchievementIcon1,
    BattleAchievementIcon2,
    BattleAchievementIcon3,
    TrackAchievementIcon1,
    TrackAchievementIcon2,
    TrackAchievementIcon3,
    RougeAchievementIcon1,
    RougeAchievementIcon2,
    RougeAchievementIcon3,
};

const achievementBody = inject('achievementBody', { setAchievementStatus: (achievement_id: number, achievement_status: number) => {} });

function handleUpdateCheckbox(newVal: boolean) {
    achievementBody.setAchievementStatus(item.achievement_id, newVal ? 2 : 1);
}

const { item } = defineProps(['item']);
</script>

<style lang="scss" scoped>
.achievement-item {
    position: relative;
    height: 60px;
    background-color: #fffe;
    border-radius: 5px;
    margin: 5px;
    margin-right: 3px;
    margin-left: 4px;

    & > div {
        position: absolute;
        height: 100%;
    }
}

.checkbox-area {
    width: 30px;
    left: 0;

    .checkbox {
        position: absolute;
        left: 10px;
        top: 0;
        bottom: 0;
        margin: auto;
    }
}

.icon-area {
    left: 35px;
    width: 60px;

    .icon-bg {
        position: absolute;
        width: 50px;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        margin: auto;
    }

    .icon {
        position: absolute;
        width: 36px;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        margin: auto;
    }
}

.info-area {
    right: 150px;
    left: 100px;
    overflow: hidden;
    white-space: nowrap;

    .title-wrapper {
        position: absolute;
        display: flex;
        gap: 5px;
        top: 5px;

        .title {
            font-size: 1.05em;
            margin-right: 5px;
        }

        .version-tag {
            font-size: 0.8em;
            color: var(--theme-color);
            filter: brightness(0.8);
        }

        .visible-tag {
            font-size: 0.8em;
            font-style: italic;
            color: var(--theme-color);
            filter: brightness(0.8);
        }
    }

    .desc-wrapper {
        position: absolute;
        top: 25px;
        font-size: 0.75em;

        .desc-upper {
            color: gray;
        }

        .desc-lower {
            color: #8790ab;
        }
    }
}

.time-area {
    right: 50px;
    width: 100px;
    font-size: 0.85em;
    color: #000c;

    .date {
        position: absolute;
        width: 100%;
        text-align: center;
        bottom: 50%;
    }

    .time {
        position: absolute;
        width: 100%;
        text-align: center;
        top: 50%;
    }
}

.reward-area {
    right: 10px;
    width: 40px;

    .reward-icon {
        position: absolute;
        width: 24px;
        left: 0;
        right: 0;
        top: 8px;
        margin: auto;
    }

    .reward-count {
        position: absolute;
        width: 100%;
        text-align: center;
        bottom: 5px;
        font-size: 0.85em;
        color: #000c;
    }
}
</style>
