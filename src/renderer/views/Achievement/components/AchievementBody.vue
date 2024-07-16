<template>
    <div class="achievement-body">
        <div class="achievement-series-container">
            <AchievementSeries v-for="item of achievementSeriesItems" :key="item.series_id" :item="item" @click="selectSeries(item.series_id)" :selected="selectedSeries == item.series_id" />
        </div>
        <div class="achievement-item-container">
            <AchievementItemList class="scroller" :items="filteredAchievementItems" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, provide, watchEffect } from 'vue';
import emitter from '../../../utils/mitt';
import AchievementItemList from './AchievementItemList.vue';
import AchievementSeries from './AchievementSeries.vue';
import { useTextMap } from '../../../store/textmap';
import { useUserAchievement } from '../../../store/userachievement';

const achievementItems = ref([]);
const filteredAchievementItems = ref([]);
const achievementSeriesItems = ref([]);
const textMapStore = useTextMap();
const userAchievementStore = useUserAchievement();
const userAchievementData = computed(() => userAchievementStore.achiCurrData ?? []);
const selectedSeries = ref(0);
const filterSetting = ref({
    Version: [],
    IncompFirst: true,
    ShowComp: false,
    ShowIncomp: false,
    ShowHidden: false,
    ShowVisible: false,
    ShowMEOnly: false,
});
const searchString = ref('');

const refreshAchievementItemStatue = () => {
    achievementItems.value.forEach((item) => {
        if (userAchievementData.value[item['achievement_id']] === undefined || userAchievementData.value[item['achievement_id']]['status'] == 1) {
            if (meAchievementMap[item['achievement_id']]) {
                // 互斥成就判断是否有同互斥组的成就被选中了，有则交由被选中的成就处理，无则继续置为未完成
                let isEffectedByOtherAchievement = false;
                meAchievementMap[item['achievement_id']].forEach((achievementId: number | string) => {
                    if (userAchievementData.value[achievementId] !== undefined && userAchievementData.value[achievementId]['status'] == 2) {
                        isEffectedByOtherAchievement = true;
                    }
                });
                if (isEffectedByOtherAchievement) return;
            }
            item['achievement_status'] = 1;
            item['achievement_is_disabled'] = false;
            item['achievement_finish_date'] = '';
            item['achievement_finish_time'] = '';
        } else if (userAchievementData.value[item['achievement_id']] !== undefined && userAchievementData.value[item['achievement_id']]['status'] == 2) {
            // 正常成就或者互斥成就全组，先全置为禁用，再将现在的id对应的成就置为已完成
            let effectedAchievementItems = [];
            if (meAchievementMap[item['achievement_id']]) {
                achievementItems.value.forEach((effItem) => {
                    if (meAchievementMap[item['achievement_id']] && meAchievementMap[item['achievement_id']].includes(effItem['achievement_id'])) {
                        effectedAchievementItems.push(effItem);
                    }
                });
            } else {
                effectedAchievementItems = [item];
            }
            const time_str = new Date(userAchievementData.value[item['achievement_id']]['timestamp'] * 1000).toLocaleString();
            effectedAchievementItems.forEach((effItem) => {
                effItem['achievement_is_disabled'] = true;
                effItem['achievement_finish_date'] = time_str.split(' ')[0];
                effItem['achievement_finish_time'] = time_str.split(' ')[1];
            });
            item['achievement_status'] = 2;
            item['achievement_is_disabled'] = false;
        }
    });
};

let achievementData = {};
let meAchievement = [];
let meAchievementMap = {};
const refreshAchievementSeriesItemProgress = () => {
    if (achievementSeriesItems.value.length == 0) return;
    const achievementSeries = {};
    achievementSeriesItems.value.forEach((item) => {
        item['count_finished'] = 0;
        achievementSeries[item['series_id']] = item;
    });
    const finishedAchievements = new Set();
    Object.keys(userAchievementData.value).forEach((achievementId) => {
        if (!finishedAchievements.has(+achievementId)) {
            if (meAchievementMap[achievementId] !== undefined) {
                meAchievementMap[achievementId].forEach((meid: string | number) => finishedAchievements.add(+meid));
            }
            finishedAchievements.add(+achievementId);
            achievementSeries[achievementData[achievementId]['SeriesID']].count_finished++;
            achievementSeries[0].count_finished++;
        }
    });
    achievementSeriesItems.value[0] && userAchievementStore.setAchiHeadInfo(`${achievementSeriesItems.value[0].count_finished}/${achievementSeriesItems.value[0].count_total} - ${((achievementSeriesItems.value[0].count_finished / achievementSeriesItems.value[0].count_total) * 100).toFixed(2)}%`);
};

watch(userAchievementData, () => {
    refreshAchievementItemStatue();
    refreshAchievementSeriesItemProgress();
});

onMounted(async () => {
    achievementData = await window.fireflyAPI.loadJson('AchievementData');
    const achievementSeries = await window.fireflyAPI.loadJson('AchievementSeries');
    const achievementVersion = await window.fireflyAPI.loadJson('AchievementVersion');
    const textReplaceMap = await window.fireflyAPI.loadJson('AchievementTextReplaceMap');
    const rarityMap = {
        High: {
            icon: 1,
            reward: 20,
        },
        Mid: {
            icon: 2,
            reward: 10,
        },
        Low: {
            icon: 3,
            reward: 5,
        },
    };

    // 成就部分
    meAchievement = (await window.fireflyAPI.loadJson('MutualExclusiveAchievement')) as [];
    meAchievement.forEach((meGroup) => {
        meGroup.forEach((meId: number | string) => {
            meAchievementMap[meId] = meGroup;
        });
    });
    for (let [ver, achis] of Object.entries(achievementVersion)) {
        achis.forEach((aid: string) => (achievementData[aid]['AchievementVersion'] = ver));
    }
    Object.values(achievementData).forEach((item) => {
        let tmp = {};
        tmp['achievement_id'] = item['AchievementID'];
        tmp['achievement_version'] = item['AchievementVersion'];
        tmp['achievement_title'] = textMapStore.getText(item['AchievementTitle']['Hash']).replaceAll('<unbreak>', '').replaceAll('</unbreak>', '');
        tmp['achievement_show_type'] = item['ShowType'] == 'ShowAfterFinish' ? '隐藏' : '';
        tmp['achievement_reward'] = rarityMap[item['Rarity']]['reward'];
        tmp['achievement_priority'] = item['Priority'];
        tmp['achievement_icon'] = achievementSeries[item['SeriesID']]['IconPath'].split('/').at(-1).replace('_s.png', rarityMap[item['Rarity']]['icon']);
        tmp['series_id'] = item['SeriesID'];
        tmp['series_priority'] = achievementSeries[item['SeriesID']]['Priority'];
        let tmp_desc = textMapStore
            .getText(item['AchievementDesc']['Hash'])
            .replaceAll('\\n', '')
            .replaceAll('<unbreak>', '')
            .replaceAll('</unbreak>', '')
            .replaceAll('</color>', '')
            .replaceAll(/<color=.*?>/g, '')
            .replaceAll('<u>', '')
            .replaceAll('</u>', '');
        item['ParamList'].forEach((p: { [x: string]: any }, i: number) => {
            i += 1;
            tmp_desc = tmp_desc.replaceAll(`#${i}[i]%`, `${p['Value'] * 100}%`);
            tmp_desc = tmp_desc.replaceAll(`#${i}[i]`, p['Value']);
            tmp_desc = tmp_desc.replaceAll(`#${i}[m]`, p['Value']);
            tmp_desc = tmp_desc.replaceAll(`#${i}`, p['Value']);
        });
        Object.entries(textReplaceMap).forEach(([k, hash]) => {
            tmp_desc = tmp_desc.replaceAll(k, textMapStore.getText(hash['Hash']));
        });
        tmp['achievement_desc_upper'] = tmp_desc.includes('※') ? tmp_desc.split('※')[0] : tmp_desc;
        tmp['achievement_desc_lower'] = tmp_desc.includes('※') ? '※' + tmp_desc.replace(/^.*?※/, '') : '';
        tmp['achievement_status'] = 1;
        tmp['achievement_is_disabled'] = false;
        tmp['achievement_finish_date'] = '';
        tmp['achievement_finish_time'] = '';
        let meinfo = '';
        if (meAchievementMap[item['AchievementID']] !== undefined) {
            meinfo = '互斥成就：\n';
            meAchievementMap[item['AchievementID']].forEach((meid: string | number) => {
                meinfo += `  ${textMapStore.getText(achievementData[meid]['AchievementTitle']['Hash'])}\n`;
            });
        }
        tmp['achievement_mutual_exclusive_info'] = meinfo;
        achievementItems.value.push(tmp);
    });
    refreshAchievementItemStatue();

    // 成就集部分
    // 统计成就数量
    const achievementCount = {};
    achievementCount['series'] = {};
    Object.values(achievementSeries).forEach((series) => {
        achievementCount['series'][series['SeriesID']] = {
            ori: 0, // 去除互斥成就之前的数量
            me: 0, // 互斥成就数量
            fix: 0, // 修正值
        };
    });
    Object.values(achievementData).forEach((achievement) => {
        achievementCount['series'][achievement['SeriesID']]['ori'] += 1;
    });
    meAchievement.forEach((arr) => {
        achievementCount['series'][achievementData[arr[0]]['SeriesID']]['me'] += 1;
        achievementCount['series'][achievementData[arr[0]]['SeriesID']]['fix'] -= arr.length - 1;
    });
    // 所有成就
    achievementCount['ori'] = 0;
    achievementCount['me'] = 0;
    achievementCount['fix'] = 0;
    Object.keys(achievementCount['series']).forEach((sid) => {
        achievementCount['series'][sid]['fix'] += achievementCount['series'][sid]['ori'];
        achievementCount['ori'] += achievementCount['series'][sid]['ori'];
        achievementCount['me'] += achievementCount['series'][sid]['me'];
        achievementCount['fix'] += achievementCount['series'][sid]['fix'];
    });
    achievementSeriesItems.value.push({ series_id: 0, series_title: '所有成就', series_icon: 'Prize', series_priority: 999, count_total: achievementCount['fix'], count_finished: 0 });
    Object.values(achievementSeries).forEach((item) => {
        let tmp = {};
        tmp['series_id'] = item['SeriesID'];
        tmp['series_title'] = textMapStore.getText(item['SeriesTitle']['Hash']);
        tmp['series_icon'] = item['MainIconPath'].split('/').at(-1).split('.')[0];
        tmp['series_priority'] = item['Priority'];
        tmp['count_total'] = achievementCount['series'][item['SeriesID']]['fix'];
        tmp['count_finished'] = 0;
        achievementSeriesItems.value.push(tmp);
    });
    achievementSeriesItems.value.sort((a, b) => b['series_priority'] - a['series_priority']);
    refreshAchievementSeriesItemProgress();
});

function setAchievementStatus(achievement_id: number, achievement_status: number) {
    if (userAchievementData.value[achievement_id] === undefined || userAchievementData.value[achievement_id]['status'] != achievement_status) {
        userAchievementStore.setCurrAchiStatus([achievement_id], achievement_status);
    }
}

watchEffect(() => {
    // 处理要展示的成就
    filteredAchievementItems.value = [];
    // 选择的成就集或者搜索结果
    if (searchString.value == '') {
        achievementItems.value.forEach((item) => {
            if (selectedSeries.value == 0 || item.series_id == selectedSeries.value) {
                filteredAchievementItems.value.push(item);
            }
        });
    } else {
        achievementItems.value.forEach((item) => {
            if (searchString.value == item.achievement_id || `${item.achievement_title}\n${item.achievement_desc_upper}\n${item.achievement_desc_lower}`.includes(searchString.value)) {
                filteredAchievementItems.value.push(item);
            }
        });
    }
    // 筛选的版本
    if (filterSetting.value.Version.length != 0) {
        filteredAchievementItems.value = filteredAchievementItems.value.filter((item) => filterSetting.value.Version.includes(item.achievement_version));
    }
    // 筛选完成状态
    if (filterSetting.value.ShowComp || filterSetting.value.ShowIncomp) {
        if (!filterSetting.value.ShowIncomp) filteredAchievementItems.value = filteredAchievementItems.value.filter((item) => item.achievement_is_disabled || item.achievement_status == 2);
        if (!filterSetting.value.ShowComp) filteredAchievementItems.value = filteredAchievementItems.value.filter((item) => !item.achievement_is_disabled && item.achievement_status == 1);
    }
    // 筛选隐藏状态
    if (filterSetting.value.ShowHidden || filterSetting.value.ShowVisible) {
        if (!filterSetting.value.ShowVisible) filteredAchievementItems.value = filteredAchievementItems.value.filter((item) => item.achievement_show_type == '隐藏');
        if (!filterSetting.value.ShowHidden) filteredAchievementItems.value = filteredAchievementItems.value.filter((item) => item.achievement_show_type == '');
    }
    // 只显示互斥成就
    if (filterSetting.value.ShowMEOnly) filteredAchievementItems.value = filteredAchievementItems.value.filter((item) => meAchievementMap[item.achievement_id] !== undefined);
    // 是否按未完成优先排序
    filteredAchievementItems.value.forEach((item) => {
        item.priority = item.series_priority * 10000 + item.achievement_priority * 1 + (!item.achievement_is_disabled && item.achievement_status == 1 && filterSetting.value.IncompFirst ? 100000 : 0);
    });
    filteredAchievementItems.value.sort((a, b) => b.priority - a.priority);
});

emitter.on('achievement:setFilterSetting', (filter_setting) => {
    filterSetting.value = JSON.parse(JSON.stringify(filter_setting));
});

emitter.on('achievement:setAllShowingAchievementsStatus', (achievement_status: number) => {
    const achievement_ids = [];
    filteredAchievementItems.value.forEach((item) => {
        if (meAchievementMap[item.achievement_id] !== undefined) return;
        if (item.achievement_status == achievement_status) return;
        achievement_ids.push(+item.achievement_id);
    });
    userAchievementStore.setCurrAchiStatus(achievement_ids, achievement_status);
});

emitter.on('achievement:doSearch', (search_str: string) => {
    selectedSeries.value = 0;
    searchString.value = search_str;
    emitter.emit('achievement:scrollToTop');
});

function selectSeries(series_id: number) {
    selectedSeries.value = series_id;
    searchString.value = '';
    emitter.emit('achievement:clearSearch');
    emitter.emit('achievement:scrollToTop');
}

provide('achievementBody', { setAchievementStatus });
</script>

<style scoped lang="scss">
.achievement-body {
    position: absolute;
    top: 55px;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 5px;
}

.achievement-series-container {
    position: absolute;
    overflow-y: scroll;
    left: 5px;
    top: 5px;
    bottom: 5px;
    width: 200px;
    border-radius: 5px 0 0 5px;
    background-color: #fff8;
    scrollbar-gutter: stable;

    &::-webkit-scrollbar {
        width: 3px;
    }

    &::-webkit-scrollbar-track {
        margin: 5px;
    }
}

.achievement-item-container {
    position: absolute;
    right: 5px;
    top: 5px;
    bottom: 5px;
    left: 205px;
    border-radius: 0 5px 5px 0;
    background-color: #fff8;
    transition: all 300ms ease;
}

.scroller {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    padding-bottom: 5px;
    scrollbar-gutter: stable;

    &::-webkit-scrollbar-track {
        margin: 5px;
    }
}

.scroller-item {
    margin-bottom: 5px;
}
</style>
