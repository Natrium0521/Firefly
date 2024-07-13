import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserAchievement = defineStore('userachievement', () => {
    const achiUids = ref(null);
    const achiCurrUid = ref(null);
    const achiCurrData = ref(null);
    const achiHeadInfo = ref('Loading');

    const init = async () => {
        achiUids.value = (await window.fireflyAPI.achievement.getAchievementUids())['data'];
        achiCurrUid.value = (await window.fireflyAPI.setting.getAppSettings())['LastAchievementUid'];
        achiCurrData.value = (await window.fireflyAPI.achievement.getAchievementData(achiCurrUid.value))['data'];
    };

    const setCurrAchiUid = async (uid: string) => {
        if (uid == achiCurrUid.value) return;
        const ret = await window.fireflyAPI.achievement.getAchievementData(uid, true);
        if (ret['msg'] == 'OK') {
            achiCurrUid.value = uid;
            achiCurrData.value = ret['data'];
        }
    };

    const setCurrAchiStatus = async (achi_ids: string[] | number[], achi_status: number) => {
        const strids = [];
        achi_ids.forEach((i: string | number) => strids.push(`${i}`));
        const ret = await window.fireflyAPI.achievement.setAchievementStatus(achiCurrUid.value, strids, achi_status);
        if (ret['msg'] == 'OK') {
            achiCurrData.value = (await window.fireflyAPI.achievement.getAchievementData(achiCurrUid.value))['data'];
        }
    };

    const newAchiUser = async (uid: string, nickname: string) => {
        const ret = await window.fireflyAPI.achievement.newAchievementData(uid, nickname);
        if (ret['msg'] == 'OK') {
            achiUids.value[uid] = nickname;
            achiCurrUid.value = uid;
            achiCurrData.value = (await window.fireflyAPI.achievement.getAchievementData(uid, true))['data'];
        }
        return ret;
    };

    const deleteAchiUser = async (uid: string) => {
        const ret = await window.fireflyAPI.achievement.delAchievementData(uid);
        if (ret['msg'] == 'OK') {
            delete achiUids.value[uid];
            achiCurrUid.value = Object.keys(achiUids.value)[0];
            achiCurrData.value = (await window.fireflyAPI.achievement.getAchievementData(achiCurrUid.value, true))['data'];
        }
        return ret;
    };

    const importAchiData = async (type: string) => {
        const ret = await window.fireflyAPI.achievement.importAchievementData(achiCurrUid.value, type);
        if (ret['msg'] == 'OK') {
            achiCurrData.value = (await window.fireflyAPI.achievement.getAchievementData(achiCurrUid.value))['data'];
        }
        return ret;
    };

    const exportAchiData = async (type: string) => {
        const ret = await window.fireflyAPI.achievement.exportAchievementData(achiCurrUid.value, type);
        return ret;
    };

    const setAchiHeadInfo = (info: string) => {
        achiHeadInfo.value = info;
    };

    return {
        init,
        achiUids,
        achiCurrUid,
        achiCurrData,
        achiHeadInfo,
        setCurrAchiUid,
        setCurrAchiStatus,
        setAchiHeadInfo,
        newAchiUser,
        deleteAchiUser,
        importAchiData,
        exportAchiData,
    };
});
