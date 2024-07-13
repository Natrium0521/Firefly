<template>
    <div class="pool-list-item" :class="{ select: isSelected }" @click="clicked">
        <div class="head">
            <div class="title">{{ poolVersion }} {{ poolName }}</div>
            <div class="count">{{ item.length }} 抽</div>
        </div>
        <div class="show-up-area">
            <CardGridItem v-for="item in upItems" :key="item.itemId" :item="item" />
        </div>
        <div class="foot">{{ poolStart }} ~ {{ poolEnd }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CardGridItem from './CardGridItem.vue';
import { useTextMap } from '../../../store/textmap';
import { useUserGacha } from '../../../store/usergacha';

const textMapStore = useTextMap();
const userGachaStore = useUserGacha();
const gachaPoolInfo = computed(() => userGachaStore.gachaPoolInfo);
const gachaBasicInfo = computed(() => userGachaStore.gachaBasicInfo);
const avatarConfig = computed(() => userGachaStore.avatarConfig);
const lightconeConfig = computed(() => userGachaStore.lightconeConfig);

const props = defineProps(['item', 'isSelected', 'clicked']);

/**
 * 获取物品名称，不在元数据中的返回item_id
 * @param itemId 物品id
 * @returns 物品名称
 */
const getItemName = (itemId: number | string): string => {
    // 4位数字为角色，5位数字为光锥
    if (`${itemId}`.length == 4) {
        if (avatarConfig.value[itemId]) return textMapStore.getText(avatarConfig.value[itemId]['AvatarName']['Hash']);
        else return `${itemId}`;
    } else {
        if (lightconeConfig.value[itemId]) return textMapStore.getText(lightconeConfig.value[itemId]['EquipmentName']['Hash']);
        else return `${itemId}`;
    }
};

const poolVersion = computed(() => {
    if (gachaPoolInfo.value[props.item[0].gacha_id]) {
        return gachaPoolInfo.value[props.item[0].gacha_id].Version;
    } else {
        return '';
    }
});
const poolName = computed(() => {
    if (gachaPoolInfo.value[props.item[0].gacha_id]) {
        return textMapStore.getText(gachaBasicInfo.value[props.item[0].gacha_id].PoolName.Hash);
    } else {
        return props.item[0].gacha_id;
    }
});
const poolStart = computed(() => {
    if (gachaPoolInfo.value[props.item[0].gacha_id]) {
        return gachaPoolInfo.value[props.item[0].gacha_id].StartTime.split(' ')[0].replaceAll('-', '.');
    } else {
        return '未知卡池';
    }
});
const poolEnd = computed(() => {
    if (gachaPoolInfo.value[props.item[0].gacha_id]) {
        return gachaPoolInfo.value[props.item[0].gacha_id].EndTime.split(' ')[0].replaceAll('-', '.');
    } else {
        return '请尝试更新';
    }
});
const upItems = computed(() => {
    const itemInfo = {};
    if (gachaPoolInfo.value[props.item[0].gacha_id]) {
        gachaPoolInfo.value[props.item[0].gacha_id].UpItems5.forEach((id: number) => {
            itemInfo[id] = {
                itemId: id,
                name: getItemName(id),
                count: 0,
                star: 5,
                iconType: 'star5',
                time: '',
            };
        });
        gachaPoolInfo.value[props.item[0].gacha_id].UpItems4.forEach((id: number) => {
            itemInfo[id] = {
                itemId: id,
                name: getItemName(id),
                count: 0,
                star: 4,
                iconType: 'star4',
                time: '',
            };
        });
        props.item.forEach((item: any) => {
            if (itemInfo[item.item_id]) {
                itemInfo[item.item_id].count++;
            }
        });
    } else {
        props.item.forEach((item: any) => {
            if (getItemName(item.item_id) == item.item_id) {
                if (itemInfo[item.item_id]) {
                    itemInfo[item.item_id].count++;
                } else {
                    itemInfo[item.item_id] = {
                        itemId: item.item_id,
                        name: item.item_id,
                        count: 1,
                        star: 4,
                        iconType: 'star4',
                        time: '',
                    };
                }
            }
        });
    }
    const sortedItemIds = Object.keys(itemInfo).sort((a, b) => {
        if (itemInfo[a].star != itemInfo[b].star) return itemInfo[b].star - itemInfo[a].star;
        if (itemInfo[a].count != itemInfo[b].count) return itemInfo[b].count - itemInfo[a].count;
        return +itemInfo[a].itemId - +itemInfo[b].itemId;
    });
    const items = [];
    sortedItemIds.forEach((itemId) => {
        items.push(itemInfo[itemId]);
    });
    return items;
});
</script>

<style lang="scss" scoped>
.pool-list-item {
    position: relative;
    border-radius: 5px;
    margin: 5px;
    background-color: #fff3;
    height: 120px;

    &:hover {
        background-color: #fff7;
    }

    &:active {
        background-color: #fffa;
    }

    &.select {
        background-color: #fffe;
    }
}

.head {
    position: absolute;
    top: 0;
    left: 5px;
    right: 5px;
    height: 30px;
    line-height: 30px;

    .title {
        float: left;
    }

    .count {
        float: right;
    }
}

.foot {
    position: absolute;
    bottom: 3px;
    left: 5px;
    color: gray;
    font-size: 0.8em;
}

.show-up-area {
    position: absolute;
    left: 5px;
    right: 5px;
    top: 30px;
    bottom: 20px;
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fill, 45px);
}
</style>
