import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useTextMap } from './textmap';

export const useUserGacha = defineStore('usergacha', () => {
    const avatarConfig = ref(null);
    const lightconeConfig = ref(null);
    const gachaPoolInfo = ref(null);
    const gachaBasicInfo = ref(null);
    const gachaUids = ref(null);
    const gachaCurrUid = ref(null);
    const gachaCurrData = ref(null);

    const init = async () => {
        avatarConfig.value = {
            ...await window.fireflyAPI.loadJson('AvatarConfig'),
            ...await window.fireflyAPI.loadJson('AvatarConfigLD')
        };
        lightconeConfig.value = await window.fireflyAPI.loadJson('EquipmentConfig');
        gachaPoolInfo.value = await window.fireflyAPI.loadJson('GachaPoolInfo');
        gachaBasicInfo.value = await window.fireflyAPI.loadJson('GachaBasicInfo');
        gachaUids.value = (await window.fireflyAPI.gacha.getGachaUids())['data'];
        gachaCurrUid.value = (await window.fireflyAPI.setting.getAppSettings())['LastGachaUid'];
        gachaCurrData.value = (await window.fireflyAPI.gacha.getGachaData(gachaCurrUid.value))['data'];
        if (iconMap[999] === undefined) {
            // @ts-ignore
            const icons: ImportMeta = import.meta.glob(['@renderer/assets/image/hsr/avataricon/*.png', '@renderer/assets/image/hsr/itemfigures/lightcone/*.png'], { eager: true });
            Object.keys(icons).forEach((key) => {
                iconMap[key.split('/').pop()?.split('.')[0]] = icons[key].default;
            });
        }
    };

    const setCurrGachaUid = async (uid: string) => {
        if (uid == gachaCurrUid.value) return;
        const ret = await window.fireflyAPI.gacha.getGachaData(uid, true);
        if (ret['msg'] === 'OK') {
            gachaCurrUid.value = uid;
            gachaCurrData.value = ret['data'];
        }
    };

    const newGachaUser = async (uid: string, nickname: string) => {
        const ret = await window.fireflyAPI.gacha.newGachaData(uid, nickname);
        if (ret['msg'] === 'OK') {
            gachaUids.value[uid] = nickname;
            gachaCurrUid.value = uid;
            gachaCurrData.value = (await window.fireflyAPI.gacha.getGachaData(uid, true))['data'];
        }
        return ret;
    };

    const deleteGachaUser = async (uid: string) => {
        const ret = await window.fireflyAPI.gacha.delGachaData(uid);
        if (ret['msg'] === 'OK') {
            delete gachaUids.value[uid];
            gachaCurrUid.value = Object.keys(gachaUids.value)[0];
            gachaCurrData.value = (await window.fireflyAPI.gacha.getGachaData(gachaCurrUid.value, true))['data'];
        }
        return ret;
    };

    const refreshGachaData = async (type: string, data: unknown) => {
        const ret = await window.fireflyAPI.gacha.importGachaData(type, data);
        if (ret['msg'] === 'OK') {
            gachaUids.value = (await window.fireflyAPI.gacha.getGachaUids())['data'];
            gachaCurrUid.value = ret['data']['uid'];
            gachaCurrData.value = (await window.fireflyAPI.gacha.getGachaData(gachaCurrUid.value))['data'];
        }
        return ret;
    };

    const importGachaData = async (type: string) => {
        const ret = await window.fireflyAPI.gacha.importGachaData(type);
        if (ret['msg'] === 'OK') {
            gachaUids.value = (await window.fireflyAPI.gacha.getGachaUids())['data'];
            gachaCurrUid.value = ret['data']['uid'];
            gachaCurrData.value = (await window.fireflyAPI.gacha.getGachaData(gachaCurrUid.value))['data'];
        }
        return ret;
    };

    const exportGachaData = async (type: string, uids?: string[]) => {
        const ret = await window.fireflyAPI.gacha.exportGachaData(uids || gachaCurrUid.value, type);
        return ret;
    };

    /**
     * 检查 uid 对应记录是否可以导出
     * 可以则返回 true
     */
    const checkExportable = async (uid: string) => {
        const validItemIds = new Set();
        Object.keys(avatarConfig.value).forEach((itemId) => validItemIds.add(itemId));
        Object.keys(lightconeConfig.value).forEach((itemId) => validItemIds.add(itemId));
        let isExportable = true;
        Object.values((await window.fireflyAPI.gacha.getGachaData(uid))['data']).forEach((item) => {
            if (!validItemIds.has(item['item_id'])) {
                isExportable = false;
            }
        });
        return isExportable;
    };

    const getGachaURL = async () => {
        return await window.fireflyAPI.gacha.getGachaURL();
    };

    const textMapStore = useTextMap();
    const cachedItemStar = {};
    const cachedItemNameHash = {};
    const iconMap = {};
    /**
     * 获取物品星级，不在元数据中的默认为4星
     * @param itemId 物品id
     * @returns 物品星级
     */
    const getItemStar = (itemId: number | string): number => {
        if (cachedItemStar[itemId]) return cachedItemStar[itemId];
        // 4位数字为角色，5位数字为光锥
        if (`${itemId}`.length === 4) {
            return cachedItemStar[itemId] = avatarConfig.value[itemId] ? +avatarConfig.value[itemId]['Rarity'].at(-1) : 4;
        } else {
            return cachedItemStar[itemId] = lightconeConfig.value[itemId] ? +lightconeConfig.value[itemId]['Rarity'].at(-1) : 4;
        }
    };
    /**
     * 获取物品名称，不在元数据中的返回item_id
     * @param itemId 物品id
     * @returns 物品名称
     */
    const getItemName = (itemId: number | string): string => {
        if (cachedItemNameHash[itemId]) return textMapStore.getText(cachedItemNameHash[itemId]);
        // 4位数字为角色，5位数字为光锥
        if (`${itemId}`.length === 4) {
            if (avatarConfig.value[itemId]) {
                cachedItemNameHash[itemId] = avatarConfig.value[itemId]['AvatarName']['Hash'];
                return textMapStore.getText(cachedItemNameHash[itemId]);
            } else {
                return `${itemId}`;
            }
        } else {
            if (lightconeConfig.value[itemId]) {
                cachedItemNameHash[itemId] = lightconeConfig.value[itemId]['EquipmentName']['Hash'];
                return textMapStore.getText(cachedItemNameHash[itemId]);
            }
            else {
                return `${itemId}`;
            }
        }
    };
    const getIconSrc = (itemId: number | string): string => {
        return iconMap[itemId] ?? (`${itemId}`.length === 4 ? iconMap[999] : iconMap['Icon_TestLightcone01'])
    }

    return {
        avatarConfig,
        lightconeConfig,
        gachaPoolInfo,
        gachaBasicInfo,
        init,
        gachaUids,
        gachaCurrUid,
        gachaCurrData,
        setCurrGachaUid,
        newGachaUser,
        deleteGachaUser,
        refreshGachaData,
        importGachaData,
        exportGachaData,
        checkExportable,
        getGachaURL,
        getItemStar,
        getItemName,
        getIconSrc,
    };
});
