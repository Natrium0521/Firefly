import { app, BrowserWindow, dialog } from 'electron';
import configService from './ConfigService';
import settingService from './SettingService';
import path from 'path';
import fs from 'fs';

class AchievementService {
    private appDataPath: string;
    private achievementDataPath: string;
    private achievementUidsPath: string;
    private achievementUids: Record<string, string>;
    private mysBrowserWindow: BrowserWindow;

    constructor() {
        this.appDataPath = configService.getAppDataPath();
        this.achievementDataPath = path.join(this.appDataPath + './achievement/');
        if (!fs.existsSync(this.achievementDataPath)) {
            fs.mkdirSync(this.achievementDataPath);
        }
        this.achievementUidsPath = path.join(this.achievementDataPath, './uids.json');
        if (!fs.existsSync(this.achievementUidsPath)) {
            fs.writeFileSync(this.achievementUidsPath, JSON.stringify({ '000000000': 'Trailblazer' }, null, 4), 'utf-8');
            fs.writeFileSync(path.join(this.achievementDataPath, './000000000.json'), JSON.stringify({}, null, 4), 'utf-8');
        }
        this.achievementUids = JSON.parse(fs.readFileSync(this.achievementUidsPath, 'utf-8'));
    }

    private saveAchievementUids() {
        this.achievementUids = Object.keys(this.achievementUids)
            .sort()
            .reduce((sortedObj, key) => {
                sortedObj[key] = this.achievementUids[key];
                return sortedObj;
            }, {});
        fs.writeFileSync(this.achievementUidsPath, JSON.stringify(this.achievementUids, null, 4), 'utf-8');
    }

    public async getAchievementUids() {
        return { msg: 'OK', data: this.achievementUids };
    }

    public async getAchievementData(uid: string, changeLastAchievementUid = false) {
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (this.achievementUids[uid] === undefined) return { msg: 'UID not found' };
        if (changeLastAchievementUid) {
            settingService.setAppSettings('LastAchievementUid', uid);
        }
        return { msg: 'OK', data: JSON.parse(fs.readFileSync(path.join(this.achievementDataPath, `./${uid}.json`), 'utf-8')) };
    }

    public async newAchievementData(uid: string, nickname: string) {
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (this.achievementUids[uid] === undefined) {
            fs.writeFileSync(path.join(this.achievementDataPath, `./${uid}.json`), JSON.stringify({}, null, 4), 'utf-8');
        }
        this.achievementUids[uid] = nickname;
        this.saveAchievementUids();
        return { msg: 'OK' };
    }

    public async delAchievementData(uid: string) {
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (this.achievementUids[uid] === undefined) return { msg: 'UID not found' };
        if (Object.keys(this.achievementUids).length === 1) return { msg: 'The last UID cant be deleted' };
        delete this.achievementUids[uid];
        this.saveAchievementUids();
        return { msg: 'OK' };
    }

    public async exportAchievementData(uid: string, type: string) {
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (this.achievementUids[uid] === undefined) return { msg: 'UID not found' };
        if (type === 'firefly') {
            const exportData = {
                info: {
                    export_app: 'Firefly',
                    export_app_version: app.getVersion(),
                    export_timestamp: Math.floor(new Date().getTime() / 1000),
                },
                list: Object.values(JSON.parse(fs.readFileSync(path.join(this.achievementDataPath, `./${uid}.json`), 'utf-8'))),
            };
            let msg = 'OK';
            try {
                await dialog
                    .showSaveDialog(BrowserWindow.getAllWindows()[0], {
                        title: '导出成就存档',
                        buttonLabel: '导出',
                        defaultPath: path.join(app.getPath('desktop'), `Firefly_AchievementExport_v${app.getVersion()}_${this.achievementUids[uid]}_${uid}.json`),
                        filters: [{ name: 'json', extensions: ['json'] }],
                    })
                    .then((result) => {
                        if (result.canceled) {
                            msg = 'Canceled';
                        } else {
                            fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 4), 'utf-8');
                        }
                    })
                    .catch((err) => {
                        msg = err.message;
                    });
            } catch (error) {
                return { msg: error.message };
            }
            return { msg: msg };
        } else {
            return { msg: 'Unknown type' };
        }
    }

    public async importAchievementData(uid: string, type: string) {
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (type === 'firefly') {
            let msg = 'OK';
            try {
                let importData = {};
                await dialog
                    .showOpenDialog(BrowserWindow.getAllWindows()[0], {
                        title: '导入存档',
                        buttonLabel: '导入',
                        defaultPath: app.getPath('desktop'),
                        filters: [{ name: 'json', extensions: ['json'] }],
                    })
                    .then((result) => {
                        if (result.canceled) {
                            msg = 'Canceled';
                        } else {
                            importData = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
                        }
                    })
                    .catch((err) => {
                        msg = err.message;
                    });
                if (msg !== 'OK') return { msg: msg };
                if (importData['info']['export_app'] !== 'Firefly') return { msg: 'Unknown app' };
                if (importData['list'] === undefined) return { msg: 'No data' };
                const list = {};
                const timenow = Math.floor(new Date().getTime() / 1000);
                importData['list'].forEach((e: unknown) => {
                    if (isNaN(e['id']) || isNaN(e['status'])) throw new Error('Invalid data');
                    list[e['id']] = {
                        id: e['id'],
                        timestamp: e['timestamp'] === undefined ? timenow : e['timestamp'],
                        current: e['current'] === undefined ? 0 : e['current'],
                        status: e['status'],
                    };
                });
                fs.writeFileSync(path.join(this.achievementDataPath, `./${uid}.json`), JSON.stringify(list, null, 4), 'utf-8');
            } catch (error) {
                return { msg: error.message };
            }
            return { msg: msg };
        } else {
            return { msg: 'Unknown type' };
        }
    }

    public async setAchievementStatus(uid: string, achievementIds: string[], achievementStatus: number) {
        // status:
        //      <1 - Invalid
        //      =1 - Unfinished
        //      >1 - Finished
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (this.achievementUids[uid] === undefined) return { msg: 'UID not found' };
        const data = JSON.parse(fs.readFileSync(path.join(this.achievementDataPath, `./${uid}.json`), 'utf-8'));
        let ret = [];
        if (achievementStatus === 1) {
            achievementIds.forEach((achievementId) => delete data[achievementId]);
            ret = null;
        } else {
            const ts = Math.floor(new Date().getTime() / 1000);
            achievementIds.forEach((achievementId) => {
                data[achievementId] = {
                    id: achievementId,
                    timestamp: ts,
                    current: 0,
                    status: achievementStatus,
                };
                ret.push(data[achievementId]);
            });
        }
        fs.writeFileSync(path.join(this.achievementDataPath, `./${uid}.json`), JSON.stringify(data, null, 4), 'utf-8');
        return { msg: 'OK', data: ret };
    }

    public async refreshAchievementFromMYS(keepCookie = false) {
        return new Promise(async (resolve) => {
            this.mysBrowserWindow = new BrowserWindow({
                width: 720,
                height: 480,
                minWidth: 720,
                minHeight: 480,
            });
            this.mysBrowserWindow.on('closed', () => {
                this.mysBrowserWindow = null;
                resolve('Canceled');
            });
            if (!keepCookie) await this.mysBrowserWindow.webContents.session.clearStorageData({ storages: ['cookies'] });
            this.mysBrowserWindow.loadURL('https://act.mihoyo.com/sr/event/cultivation-tool/index.html#/tools/achievement');
            let flag = false;
            this.mysBrowserWindow.webContents.session.webRequest.onBeforeSendHeaders({ urls: ['*://*.mihoyo.com/event/rpgcultivate/achievement/list*'] }, (details, callback) => {
                if (details.method === 'OPTIONS') return callback({});
                if (flag) return callback({});
                flag = true;
                const newURL = details.url.replace('need_all=false', 'need_all=true').replace('show_hide=false', 'show_hide=true');
                fetch(newURL, { headers: details.requestHeaders })
                    .then((response) => response.json())
                    .then(async (data) => {
                        if (data.retcode === 0) {
                            const uid = newURL.match(/badge_uid=(\d+)/)[1];
                            if (this.achievementUids[uid] === undefined) {
                                await this.newAchievementData(uid, 'Trailblazer');
                            }
                            await settingService.setAppSettings('LastAchievementUid', uid);
                            const achievementMetaIds = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(__dirname, '../static/json/AchievementData.json'), 'utf-8'))));
                            const finishedIds = [];
                            data.data.achievement_list.forEach((achievement: { finished: boolean; id: string }) => {
                                if (achievement.finished && achievementMetaIds.has(achievement.id)) {
                                    finishedIds.push(achievement.id);
                                }
                            });
                            const oldData = JSON.parse(fs.readFileSync(path.join(this.achievementDataPath, `./${uid}.json`), 'utf-8'));
                            const newData = {};
                            const timeNow = Math.floor(new Date().getTime() / 1000);
                            finishedIds.forEach((achievementId) => {
                                if (oldData[achievementId] === undefined) {
                                    newData[achievementId] = {
                                        id: achievementId,
                                        timestamp: timeNow,
                                        current: 0,
                                        status: 2,
                                    };
                                } else {
                                    newData[achievementId] = oldData[achievementId];
                                }
                            });
                            fs.writeFileSync(path.join(this.achievementDataPath, `./${uid}.json`), JSON.stringify(newData, null, 4), 'utf-8');
                            resolve(uid);
                        } else {
                            resolve(data);
                        }
                        this.mysBrowserWindow?.close();
                        this.mysBrowserWindow = null;
                    });
                callback({});
            });
        });
    }

    public async cancelRefreshAchievementFromMYS() {
        this.mysBrowserWindow?.close();
        this.mysBrowserWindow = null;
    }
}

export default new AchievementService();
