<template>
    <div class="gacha-type-view">
        <div class="container" ref="container">
            <div class="scroll">
                <div class="content">
                    <GachaBodyTypeViewBox :box-size="boxSize" gacha-title="限定角色" :gacha-count="avatarCount" :gacha-analyze="avatarAnalyze" :gacha-detail="avatarDetail" />
                    <GachaBodyTypeViewBox :box-size="boxSize" gacha-title="限定光锥" :gacha-count="lightconeCount" :gacha-analyze="lightconeAnalyze" :gacha-detail="lightconeDetail" />
                    <GachaBodyTypeViewBox :box-size="boxSize" gacha-title="常驻" :gacha-count="normalCount" :gacha-analyze="normalAnalyze" :gacha-detail="normalDetail" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue';
import GachaBodyTypeViewBox from './GachaBodyTypeViewBox.vue';
import { useTextMap } from '../../../store/textmap';
import { useUserGacha } from '../../../store/usergacha';

const userGachaStore = useUserGacha();
const textMapStore = useTextMap();
const userGachaData = computed(() => userGachaStore.gachaCurrData ?? {});

const avatarConfig = computed(() => userGachaStore.avatarConfig);
const lightconeConfig = computed(() => userGachaStore.lightconeConfig);
const gachaPoolInfo = computed(() => userGachaStore.gachaPoolInfo);
const gachaPoolAvatar = computed(() =>
    Object.values(userGachaData.value)
        .filter((item) => item['gacha_type'] == '11')
        .sort((a, b) => a['id'] - b['id'])
);
const gachaPoolLightcone = computed(() =>
    Object.values(userGachaData.value)
        .filter((item) => item['gacha_type'] == '12')
        .sort((a, b) => a['id'] - b['id'])
);
const gachaPoolNormal = computed(() =>
    Object.values(userGachaData.value)
        .filter((item) => item['gacha_type'] == '1')
        .sort((a, b) => a['id'] - b['id'])
);
const gachaPoolNewbie = computed(() =>
    Object.values(userGachaData.value)
        .filter((item) => item['gacha_type'] == '2')
        .sort((a, b) => a['id'] - b['id'])
);

/**
 * 获取物品星级，不在元数据中的默认为4星
 * @param itemId 物品id
 * @returns 物品星级
 */
const getItemStar = (itemId: number | string): number => {
    // 4位数字为角色，5位数字为光锥
    if (`${itemId}`.length === 4) {
        return avatarConfig.value[itemId] ? +avatarConfig.value[itemId]['Rarity'].at(-1) : 4;
    } else {
        return lightconeConfig.value[itemId] ? +lightconeConfig.value[itemId]['Rarity'].at(-1) : 4;
    }
};

/**
 * 获取物品名称，不在元数据中的返回item_id
 * @param itemId 物品id
 * @returns 物品名称
 */
const getItemName = (itemId: number | string): string => {
    // 4位数字为角色，5位数字为光锥
    if (`${itemId}`.length === 4) {
        if (avatarConfig.value[itemId]) return textMapStore.getText(avatarConfig.value[itemId]['AvatarName']['Hash']);
        else return `${itemId}`;
    } else {
        if (lightconeConfig.value[itemId]) return textMapStore.getText(lightconeConfig.value[itemId]['EquipmentName']['Hash']);
        else return `${itemId}`;
    }
};

/**
 * 获取距离上个四/五星抽数
 * @param items 物品列表
 * @param targetStar 目标星级
 * @returns 抽数
 */
const countLastStarn = (items: any[], targetStar: number) => {
    let count = 0;
    for (let i = items.length - 1; i >= 0; i--) {
        if (getItemStar(items[i]['item_id']) === targetStar) break;
        count++;
    }
    return count;
};

const avatarCount = computed(() => {
    const count = {};
    count['total'] = gachaPoolAvatar.value.length;
    count['star5'] = countLastStarn(gachaPoolAvatar.value, 5);
    count['star4'] = countLastStarn(gachaPoolAvatar.value, 4);
    count['star5percent'] = (count['star5'] / 90) * 100;
    count['star4percent'] = (count['star4'] / 10) * 100;
    return count;
});
const avatarAnalyze = computed(() => {
    const analyze = {};
    analyze['startDate'] = gachaPoolAvatar.value.length ? gachaPoolAvatar.value[0]['time'].split(' ')[0].replaceAll('-', '.') : '';
    analyze['endDate'] = gachaPoolAvatar.value.length ? gachaPoolAvatar.value.at(-1)['time'].split(' ')[0].replaceAll('-', '.') : '';
    let star5Count = 0;
    gachaPoolAvatar.value.forEach((item) => {
        if (getItemStar(item['item_id']) === 5) star5Count++;
    });
    let star5UpCount = 0;
    gachaPoolAvatar.value.forEach((item) => {
        if (getItemStar(item['item_id']) === 5 && gachaPoolInfo.value[item['gacha_id']] && gachaPoolInfo.value[item['gacha_id']]['UpItems5'].indexOf(+item['item_id']) !== -1) star5UpCount++;
    });
    // 修复最近一次五星是歪的情况的不歪概率
    let fixUpRate = avatarDetail.value.length && avatarDetail.value[0]['upType'] === 'noup' ? 1 : 0;
    analyze['dataGroup'] = [
        {
            label: '五星数',
            unit: '金',
            value: star5Count,
        },
        {
            label: '不歪概率',
            unit: '%',
            value: star5UpCount ? (((2 * (star5UpCount + fixUpRate) - (star5Count + fixUpRate)) / (star5UpCount + fixUpRate)) * 100).toFixed(0) : 0,
        },
        {
            label: '五星平均',
            unit: '抽',
            value: star5Count ? ((avatarCount.value['total'] - avatarCount.value['star5']) / star5Count).toFixed(0) : 0,
        },
        {
            label: 'UP平均',
            unit: '抽',
            value: star5UpCount ? ((avatarCount.value['total'] - avatarCount.value['star5']) / star5UpCount).toFixed(0) : 0,
        },
    ];
    return analyze;
});
const avatarDetail = computed(() => {
    const detail = [];
    let count = 0;
    gachaPoolAvatar.value.forEach((item) => {
        count++;
        if (getItemStar(item['item_id']) === 5) {
            detail.unshift({
                id: item['id'],
                itemId: item['item_id'],
                name: getItemName(item['item_id']),
                count: count,
                iconType: 'star5',
                progress: (count / 90) * 100,
                upType: gachaPoolInfo.value[item['gacha_id']] && gachaPoolInfo.value[item['gacha_id']]['UpItems5'].indexOf(+item['item_id']) !== -1 ? 'up' : 'noup',
                time: item['time'],
            });
            count = 0;
        }
    });
    return detail;
});

const lightconeCount = computed(() => {
    const count = {};
    count['total'] = gachaPoolLightcone.value.length;
    count['star5'] = countLastStarn(gachaPoolLightcone.value, 5);
    count['star4'] = countLastStarn(gachaPoolLightcone.value, 4);
    count['star5percent'] = (count['star5'] / 80) * 100;
    count['star4percent'] = (count['star4'] / 10) * 100;
    return count;
});
const lightconeAnalyze = computed(() => {
    const analyze = {};
    analyze['startDate'] = gachaPoolLightcone.value.length ? gachaPoolLightcone.value[0]['time'].split(' ')[0].replaceAll('-', '.') : '';
    analyze['endDate'] = gachaPoolLightcone.value.length ? gachaPoolLightcone.value.at(-1)['time'].split(' ')[0].replaceAll('-', '.') : '';
    let star5Count = 0;
    gachaPoolLightcone.value.forEach((item) => {
        if (getItemStar(item['item_id']) === 5) star5Count++;
    });
    let star5UpCount = 0;
    gachaPoolLightcone.value.forEach((item) => {
        if (getItemStar(item['item_id']) === 5 && gachaPoolInfo.value[item['gacha_id']] && gachaPoolInfo.value[item['gacha_id']]['UpItems5'].indexOf(+item['item_id']) !== -1) star5UpCount++;
    });
    // 修复最近一次五星是歪的情况的不歪概率
    let fixUpRate = lightconeDetail.value.length && lightconeDetail.value[0]['upType'] === 'noup' ? 1 : 0;
    analyze['dataGroup'] = [
        {
            label: '五星数',
            unit: '金',
            value: star5Count,
        },
        {
            label: '不歪概率',
            unit: '%',
            value: star5UpCount ? (((2 * (star5UpCount + fixUpRate) - (star5Count + fixUpRate)) / (star5UpCount + fixUpRate)) * 100).toFixed(0) : 0,
        },
        {
            label: '五星平均',
            unit: '抽',
            value: star5Count ? ((lightconeCount.value['total'] - lightconeCount.value['star5']) / star5Count).toFixed(0) : 0,
        },
        {
            label: 'UP平均',
            unit: '抽',
            value: star5UpCount ? ((lightconeCount.value['total'] - lightconeCount.value['star5']) / star5UpCount).toFixed(0) : 0,
        },
    ];
    return analyze;
});
const lightconeDetail = computed(() => {
    const detail = [];
    let count = 0;
    gachaPoolLightcone.value.forEach((item) => {
        count++;
        if (getItemStar(item['item_id']) === 5) {
            detail.unshift({
                id: item['id'],
                itemId: item['item_id'],
                name: getItemName(item['item_id']),
                count: count,
                iconType: 'star5',
                progress: (count / 80) * 100,
                upType: gachaPoolInfo.value[item['gacha_id']] && gachaPoolInfo.value[item['gacha_id']]['UpItems5'].indexOf(+item['item_id']) !== -1 ? 'up' : 'noup',
                time: item['time'],
            });
            count = 0;
        }
    });
    return detail;
});

const normalCount = computed(() => {
    const count = {};
    count['total'] = gachaPoolNormal.value.length;
    count['star5'] = countLastStarn(gachaPoolNormal.value, 5);
    count['star4'] = countLastStarn(gachaPoolNormal.value, 4);
    count['star5percent'] = (count['star5'] / 90) * 100;
    count['star4percent'] = (count['star4'] / 10) * 100;
    return count;
});
const newbieCount = computed(() => {
    const count = {};
    count['total'] = gachaPoolNewbie.value.length;
    count['star5'] = countLastStarn(gachaPoolNewbie.value, 5);
    count['star4'] = countLastStarn(gachaPoolNewbie.value, 4);
    return count;
});
const normalAnalyze = computed(() => {
    const analyze = {};
    analyze['startDate'] = gachaPoolNormal.value.length ? gachaPoolNormal.value[0]['time'].split(' ')[0].replaceAll('-', '.') : '';
    analyze['endDate'] = gachaPoolNormal.value.length ? gachaPoolNormal.value.at(-1)['time'].split(' ')[0].replaceAll('-', '.') : '';
    let normalStar5Count = 0;
    gachaPoolNormal.value.forEach((item) => {
        if (getItemStar(item['item_id']) === 5) normalStar5Count++;
    });
    let newbieStar5Count = 0;
    gachaPoolNewbie.value.forEach((item) => {
        if (getItemStar(item['item_id']) === 5) newbieStar5Count++;
    });
    analyze['dataGroup'] = [
        {
            label: '常驻池',
            unit: '金',
            value: normalStar5Count,
        },
        {
            label: '常驻平均',
            unit: '抽',
            value: normalStar5Count ? ((normalCount.value['total'] - normalCount.value['star5']) / normalStar5Count).toFixed(0) : 0,
        },
        {
            label: '新手池',
            unit: '金',
            value: newbieStar5Count,
        },
        {
            label: '新手平均',
            unit: '抽',
            value: newbieStar5Count ? ((newbieCount.value['total'] - newbieCount.value['star5']) / newbieStar5Count).toFixed(0) : 0,
        },
    ];
    return analyze;
});
const normalDetail = computed(() => {
    const detail = [];
    let count = 0;
    gachaPoolNewbie.value.forEach((item) => {
        count++;
        if (getItemStar(item['item_id']) === 5) {
            detail.unshift({
                id: item['id'],
                itemId: item['item_id'],
                name: getItemName(item['item_id']),
                count: count,
                iconType: 'star5',
                progress: (count / 90) * 100,
                upType: 'newbie',
                time: item['time'],
            });
            count = 0;
        }
    });
    count = 0;
    gachaPoolNormal.value.forEach((item) => {
        count++;
        if (getItemStar(item['item_id']) === 5) {
            detail.unshift({
                id: item['id'],
                itemId: item['item_id'],
                name: getItemName(item['item_id']),
                count: count,
                iconType: 'star5',
                progress: (count / 90) * 100,
                upType: 'normal',
                time: item['time'],
            });
            count = 0;
        }
    });
    return detail;
});

const container = ref(null);
const containerSize = ref({ height: 0, width: 0 });
const boxSize = ref({ height: 0, width: 0 });
const boxCount = 3;
const minWidth = 280;
const calcBoxSize = () => {
    const target = container.value;
    if (target === undefined) return;
    containerSize.value.height = target.clientHeight;
    containerSize.value.width = target.clientWidth;
    boxSize.value.height = target.clientHeight - 5;
    if ((minWidth + 5) * boxCount > target.clientWidth) boxSize.value.width = minWidth;
    else boxSize.value.width = target.clientWidth / boxCount - 5;
};
const resizeObserver = new ResizeObserver(calcBoxSize);
onMounted(() => {
    calcBoxSize();
    resizeObserver.observe(container.value);
});
onActivated(() => {
    calcBoxSize();
});
</script>

<style scoped lang="scss">
.gacha-type-view {
    position: absolute;
    left: 0;
    right: -5px;
    bottom: -5px;
    top: 0;
}

.container {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    overflow: hidden;
}

.scroll {
    position: relative;
    width: calc(v-bind('containerSize.height') * 1px);
    height: calc(v-bind('containerSize.width') * 1px);
    overflow: auto;
    transform-origin: 0 0;
    transform: translateY(calc(v-bind('containerSize.height') * 1px)) rotate(-90deg);

    &::-webkit-scrollbar {
        display: none;
    }
}

.content {
    position: absolute;
    left: 100%;
    transform-origin: 0 0;
    transform: rotate(90deg);
    display: flex;

    & > div {
        flex-shrink: 0;
    }
}
</style>
