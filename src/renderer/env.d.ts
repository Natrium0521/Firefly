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
            getAppSettings: () => Promise<AppSettings>;
            setAppSettings: (key: string, value: unknown) => Promise<AppSettings>;
        };
        unlockfps: {
            isFPSUnlocked: (server?: string) => Promise<{ msg: string }>;
            toggleFPS: (server?: string) => Promise<{ msg: 'OK'; fps: number } | { msg: string }>;
        };
        achievement: {
            getAchievementUids: () => Promise<unknown>;
            getAchievementData: (uid: string, changeLastAchievementUid?: boolean) => Promise<unknown>;
            newAchievementData: (uid: string, nickname: string) => Promise<unknown>;
            delAchievementData: (uid: string) => Promise<unknown>;
            exportAchievementData: (uid: string, type: string) => Promise<unknown>;
            importAchievementData: (uid: string, type: string) => Promise<unknown>;
            setAchievementStatus: (uid: string, achievementIds: string[], achievementStatus: number) => Promise<unknown>;
            refreshAchievementFromMYS: (keepCookie: boolean) => Promise<unknown>;
            cancelRefreshAchievementFromMYS: () => Promise<unknown>;
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
        update: {
            doDownload: (url: string) => Promise<void>;
            getDownloadInfo: () => Promise<{ progress: number; speed: number; state: undefined | 'downloading' | 'downloaded' | 'cancelled' | 'interrupted' | 'failed' }>;
            cancelDownload: () => Promise<void>;
            doUpdate: (hash: string) => Promise<'patch failed' | 'no update file' | 'CRC32 verification failed' | 'updating'>;
        };

        openURL: (url: string) => void;
        sendMainWindowMsg: (msg: string) => void;
        loadJson: (fName: string) => Promise<unknown>;
    };
}
