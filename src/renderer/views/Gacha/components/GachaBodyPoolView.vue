<template>
    <div class="gacha-pool-view">
        <KeepScroll class="pool-list">
            <PoolListItem v-for="item of poolListItems" :key="item[0]['gacha_id']" :item="item" :clicked="() => (showingPoolId = item[0]['gacha_id'])" :isSelected="showingPoolId == item[0]['gacha_id']" />
        </KeepScroll>
        <div class="pool-detail">
            <PoolDetailView :detail="showingDetail" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PoolListItem from './PoolListItem.vue';
import PoolDetailView from './PoolDetailView.vue';
import KeepScroll from '@renderer/components/KeepScroll.vue';
import { useTextMap } from '@renderer/store/textmap';
import { useUserGacha } from '@renderer/store/usergacha';

const userGachaStore = useUserGacha();
const textMapStore = useTextMap();
const userGachaData = computed(() => userGachaStore.gachaCurrData ?? {});

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

const avatarConfig = computed(() => userGachaStore.avatarConfig);
const lightconeConfig = computed(() => userGachaStore.lightconeConfig);
const gachaPoolAvatarAndLightcone = computed(() =>
    Object.values(userGachaData.value)
        // .filter((item) => item['gacha_type'] == '11' || item['gacha_type'] == '12')
        .sort((a, b) => a['id'] - b['id'])
);
const poolDetail = computed(() => {
    const detail = {};
    gachaPoolAvatarAndLightcone.value.forEach((item) => {
        item['itemId'] = item['item_id'];
        item['name'] = getItemName(item['item_id']);
        item['iconType'] = `star${getItemStar(item['item_id'])}`;
        if (detail[item['gacha_id']]) {
            detail[item['gacha_id']].push(item);
        } else {
            detail[item['gacha_id']] = [item];
        }
    });
    return detail;
});
const poolListItems = computed(() => {
    let orderedIds = Object.keys(poolDetail.value).sort((a, b) => {
        if (+a % 1000 === +b % 1000) {
            return +b - +a;
        } else {
            return (+a % 1000) - (+b % 1000);
        }
    });
    const topIds = [/4001/, /1001/, /[56]\d{3}/];
    topIds.reverse().forEach((idPattern) => {
        const front = orderedIds.filter((id) => !id.match(idPattern));
        const back = orderedIds.filter((id) => id.match(idPattern));
        orderedIds = front.concat(back);
    });
    const items = [];
    orderedIds.forEach((id) => {
        items.unshift(poolDetail.value[id]);
    });
    return items;
});

const showingPoolId = ref(null);
const showingDetail = computed(() => {
    if (poolDetail.value[showingPoolId.value]) return poolDetail.value[showingPoolId.value];
    if (poolListItems.value.length) {
        showingPoolId.value = poolListItems.value[0][0]['gacha_id'];
        return poolDetail.value[showingPoolId.value];
    }
    return [];
});
</script>

<style scoped lang="scss">
.gacha-pool-view {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background-color: #fff8;
    border-radius: 5px;
}

.pool-list {
    position: absolute;
    background-color: #fff8;
    left: 5px;
    top: 5px;
    bottom: 5px;
    width: 300px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    overflow-y: scroll;
    // display: grid;

    &::-webkit-scrollbar {
        width: 3px;
    }

    &::-webkit-scrollbar-track {
        margin: 5px;
    }
}

.pool-detail {
    position: absolute;
    background-color: #fff8;
    left: 305px;
    top: 5px;
    bottom: 5px;
    right: 5px;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
}
</style>
