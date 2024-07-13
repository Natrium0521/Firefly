/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare interface Window {
    fireflyAPI: {
        config: {
            getAppVersion: () => Promise<string>;
        };
        setting: {
            getAppSettings: () => Promise<unknown>;
            setAppSettings: (key: string, value: unknown) => Promise<unknown>;
        };
        unlockfps: {
            isFPSUnlocked: (server?: string) => Promise<unknown>;
            toggleFPS: (server?: string) => Promise<unknown>;
        };
        achievement: {
            getAchievementUids: () => Promise<unknown>;
            getAchievementData: (uid: string, changeLastAchievementUid?: boolean) => Promise<unknown>;
            newAchievementData: (uid: string, nickname: string) => Promise<unknown>;
            delAchievementData: (uid: string) => Promise<unknown>;
            exportAchievementData: (uid: string, type: string) => Promise<unknown>;
            importAchievementData: (uid: string, type: string) => Promise<unknown>;
            setAchievementStatus: (uid: string, achievementIds: string[], achievementStatus: number) => Promise<unknown>;
        };
        gacha: {
            getGachaUids: () => Promise<unknown>;
            getGachaData: (uid: string, changeLastGachaUid?: boolean) => Promise<unknown>;
            newGachaData: (uid: string, nickname: string) => Promise<unknown>;
            delGachaData: (uid: string) => Promise<unknown>;
            exportGachaData: (uid: string, type?: string) => Promise<unknown>;
            importGachaData: (type?: string, data?: unknown) => Promise<unknown>;
            getGachaURL: (server?: string) => Promise<unknown>;
        };

        openURL: (url: string) => void;
        sendMainWindowMsg: (msg: string) => void;
        loadJson: (fName: string) => Promise<unknown>;
    };
}
