import { defineStore } from 'pinia';

export const useTextMap = defineStore('textmap', () => {
    let textMap = null;
    const loadTextMap = async (textMapFileName: string) => {
        textMap = await window.fireflyAPI.loadJson(textMapFileName);
    };
    const getText = (hash: string) => {
        return textMap[hash];
    };

    return { getText, loadTextMap };
});
