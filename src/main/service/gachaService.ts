import { app, BrowserWindow, dialog } from 'electron';
import configService from './ConfigService';
import settingService from './SettingService';
import path from 'path';
import fs from 'fs';

class GachaService {
    private appDataPath: string;
    private gachaDataPath: string;
    private gachaUidsPath: string;
    private gachaUids: unknown;

    constructor() {
        this.appDataPath = configService.getAppDataPath();
        this.gachaDataPath = path.join(this.appDataPath + './gacha/');
        if (!fs.existsSync(this.gachaDataPath)) {
            fs.mkdirSync(this.gachaDataPath);
        }
        this.gachaUidsPath = path.join(this.gachaDataPath, './uids.json');
        if (!fs.existsSync(this.gachaUidsPath)) {
            fs.writeFileSync(this.gachaUidsPath, JSON.stringify({ '000000000': 'Trailblazer' }, null, 4), 'utf-8');
            fs.writeFileSync(path.join(this.gachaDataPath, './000000000.json'), JSON.stringify({}, null, 4), 'utf-8');
        }
        this.gachaUids = JSON.parse(fs.readFileSync(this.gachaUidsPath, 'utf-8'));
    }

    private saveGachaUids() {
        this.gachaUids = Object.keys(this.gachaUids)
            .sort()
            .reduce((sortedObj, key) => {
                sortedObj[key] = this.gachaUids[key];
                return sortedObj;
            }, {});
        fs.writeFileSync(this.gachaUidsPath, JSON.stringify(this.gachaUids, null, 4), 'utf-8');
    }

    private loadJson(fName: string) {
        return JSON.parse(fs.readFileSync(path.join(__dirname, `../static/json/${fName}.json`), 'utf-8'));
    }

    public async getGachaUids() {
        return { msg: 'OK', data: this.gachaUids };
    }

    public async getGachaData(uid: string, changeLastGachaUid = false) {
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (this.gachaUids[uid] === undefined) return { msg: 'UID not found' };
        if (changeLastGachaUid) {
            settingService.setAppSettings('LastGachaUid', uid);
        }
        return { msg: 'OK', data: JSON.parse(fs.readFileSync(path.join(this.gachaDataPath, `./${uid}.json`), 'utf-8')) };
    }

    public async newGachaData(uid: string, nickname: string) {
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (this.gachaUids[uid] === undefined) {
            fs.writeFileSync(path.join(this.gachaDataPath, `./${uid}.json`), JSON.stringify({}, null, 4), 'utf-8');
        }
        this.gachaUids[uid] = nickname;
        this.saveGachaUids();
        return { msg: 'OK' };
    }

    public async delGachaData(uid: string) {
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (this.gachaUids[uid] === undefined) return { msg: 'UID not found' };
        if (Object.keys(this.gachaUids).length === 1) return { msg: 'The last UID cant be deleted' };
        delete this.gachaUids[uid];
        this.saveGachaUids();
        return { msg: 'OK' };
    }

    public async exportGachaData(uid: string | string[], type = 'srgf_v1.0') {
        if (type === 'srgf_v1.0' && !Array.isArray(uid)) {
            if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
            if (this.gachaUids[uid] === undefined) return { msg: 'UID not found' };
            const exportData = {
                info: {
                    srgf_version: 'v1.0',
                    uid: `${uid}`,
                    lang: 'zh-cn',
                    region_time_zone: 8,
                    export_app: 'Firefly',
                    export_app_version: app.getVersion(),
                    export_timestamp: Math.floor(new Date().getTime() / 1000),
                },
                list: [],
            };
            const AvatarConfig = { ...this.loadJson('AvatarConfig'), ...this.loadJson('AvatarConfigLD') };
            const EquipmentConfig = this.loadJson('EquipmentConfig');
            const TextMapCHS = this.loadJson('TextMapCHS');
            Object.values(JSON.parse(fs.readFileSync(path.join(this.gachaDataPath, `./${uid}.json`), 'utf-8'))).forEach((item) => {
                const node = item;
                node['count'] = '1';
                if (node['item_id'].length === 4) {
                    node['item_type'] = '角色';
                    node['name'] = TextMapCHS[AvatarConfig[node['item_id']]['AvatarName']['Hash']];
                    node['rank_type'] = AvatarConfig[node['item_id']]['Rarity'].at(-1);
                } else {
                    node['item_type'] = '光锥';
                    node['name'] = TextMapCHS[EquipmentConfig[node['item_id']]['EquipmentName']['Hash']];
                    node['rank_type'] = EquipmentConfig[node['item_id']]['Rarity'].at(-1);
                }
                exportData['list'].push(node);
            });
            let msg = 'OK';
            let exportPath = '';
            try {
                await dialog
                    .showSaveDialog(BrowserWindow.getAllWindows()[0], {
                        title: '导出跃迁记录为SRGF',
                        buttonLabel: '导出',
                        defaultPath: path.join(app.getPath('desktop'), `Firefly_GachaExport_v${app.getVersion()}_${this.gachaUids[uid]}_${uid}.SRGF.json`),
                        filters: [{ name: 'SRGF json', extensions: ['json'] }],
                    })
                    .then((result) => {
                        if (result.canceled) {
                            msg = 'Canceled';
                        } else {
                            exportPath = result.filePath;
                            fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 4), 'utf-8');
                        }
                    })
                    .catch((err) => {
                        msg = err.message;
                    });
            } catch (error) {
                return { msg: error.message };
            }
            return { msg: msg, data: { path: encodeURI(exportPath) } };
        } else if (type === 'uigf_v4.1') {
            const exportData = {
                info: {
                    export_app: 'Firefly',
                    export_app_version: app.getVersion(),
                    export_timestamp: Math.floor(new Date().getTime() / 1000),
                    version: 'v4.1',
                },
                hkrpg: [],
            };
            const AvatarConfig = { ...this.loadJson('AvatarConfig'), ...this.loadJson('AvatarConfigLD') };
            const EquipmentConfig = this.loadJson('EquipmentConfig');
            const TextMapCHS = this.loadJson('TextMapCHS');
            (Array.isArray(uid) && uid.length > 0 ? uid : Object.keys(this.gachaUids)).forEach((uid) => {
                const userNode = {
                    uid: `${uid}`,
                    lang: 'zh-cn',
                    timezone: 8,
                    list: [],
                };
                Object.values(JSON.parse(fs.readFileSync(path.join(this.gachaDataPath, `./${uid}.json`), 'utf-8'))).forEach((item) => {
                    const node = item;
                    node['count'] = '1';
                    if (node['item_id'].length === 4) {
                        node['item_type'] = '角色';
                        node['name'] = TextMapCHS[AvatarConfig[node['item_id']]['AvatarName']['Hash']];
                        node['rank_type'] = AvatarConfig[node['item_id']]['Rarity'].at(-1);
                    } else {
                        node['item_type'] = '光锥';
                        node['name'] = TextMapCHS[EquipmentConfig[node['item_id']]['EquipmentName']['Hash']];
                        node['rank_type'] = EquipmentConfig[node['item_id']]['Rarity'].at(-1);
                    }
                    userNode.list.push(node);
                });
                exportData.hkrpg.push(userNode);
            });
            let msg = 'OK';
            let exportPath = '';
            try {
                await dialog
                    .showSaveDialog(BrowserWindow.getAllWindows()[0], {
                        title: '导出跃迁记录为UIGF',
                        buttonLabel: '导出',
                        defaultPath: path.join(app.getPath('desktop'), `Firefly_GachaExport_v${app.getVersion()}.UIGF.json`),
                        filters: [{ name: 'UIGF json', extensions: ['json'] }],
                    })
                    .then((result) => {
                        if (result.canceled) {
                            msg = 'Canceled';
                        } else {
                            exportPath = result.filePath;
                            fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 4), 'utf-8');
                        }
                    })
                    .catch((err) => {
                        msg = err.message;
                    });
            } catch (error) {
                return { msg: error.message };
            }
            return { msg: msg, data: { path: encodeURI(exportPath) } };
        } else {
            return { msg: 'Unknown type' };
        }
    }

    public async importGachaData(type = 'srgf_v1.0', data = {}) {
        // data 为空使用文件导入
        if (Object.keys(data).length === 0) {
            if (type === 'srgf_v1.0') {
                let msg = 'OK';
                try {
                    await dialog
                        .showOpenDialog(BrowserWindow.getAllWindows()[0], {
                            title: '导入SRGF格式跃迁记录',
                            buttonLabel: '导入',
                            defaultPath: app.getPath('desktop'),
                            filters: [{ name: 'SRGF json', extensions: ['json'] }],
                        })
                        .then((result) => {
                            if (result.canceled) {
                                msg = 'Canceled';
                            } else {
                                data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
                            }
                        })
                        .catch((err) => {
                            msg = err.message;
                        });
                    if (msg !== 'OK') return { msg: msg };
                    if (data['info']['srgf_version'] !== 'v1.0') return { msg: 'Unsupport SRGF version' };
                    if (data['list'] === undefined) return { msg: 'No data' };
                } catch (error) {
                    return { msg: error.message };
                }
            } else if (type === 'uigf_v4.0' || type === 'uigf_v4.1') {
                let msg = 'OK';
                let uid = '';
                try {
                    await dialog
                        .showOpenDialog(BrowserWindow.getAllWindows()[0], {
                            title: '导入UIGF格式跃迁记录',
                            buttonLabel: '导入',
                            defaultPath: app.getPath('desktop'),
                            filters: [{ name: 'UIGF json', extensions: ['json'] }],
                        })
                        .then((result) => {
                            if (result.canceled) {
                                msg = 'Canceled';
                            } else {
                                data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
                            }
                        })
                        .catch((err) => {
                            msg = err.message;
                        });
                    if (msg !== 'OK') return { msg: msg };
                    if (data['info']['version'] !== 'v4.0' && data['info']['version'] !== 'v4.1') return { msg: 'Unsupport UIGF version' };
                    if (data['hkrpg'] === undefined || data['hkrpg'].length === 0) return { msg: 'No StarRail data' };
                    data['hkrpg'].forEach((userNode: unknown) => {
                        if (!/^\d{9}$/.test(userNode['uid'])) throw new Error('Invalid UID');
                        if (userNode['list'] === undefined) throw new Error('Invalid UIGF');
                        if (userNode['timezone'] === undefined) throw new Error('Invalid UIGF');
                        const item_keys = ['gacha_id', 'gacha_type', 'item_id', 'time', 'id'];
                        userNode['list'].forEach((item: unknown) => {
                            item_keys.forEach((key) => {
                                if (item[key] === undefined) throw new Error('Invalid UIGF');
                            });
                        });
                    });
                    for (const userNode of data['hkrpg']) {
                        const srgfData = {
                            info: {
                                region_time_zone: userNode['timezone'],
                                uid: userNode['uid'],
                            },
                            list: userNode['list'],
                        };
                        await this.importGachaData('srgf_v1.0', srgfData);
                        uid = userNode['uid'];
                    }
                } catch (error) {
                    return { msg: error.message };
                }
                return { msg: 'OK', data: { uid: uid } };
            }
        }
        const uid = `${data['info']['uid']}`;
        if (!/^\d{9}$/.test(uid)) return { msg: 'Invalid UID' };
        if (this.gachaUids[uid] === undefined) {
            fs.writeFileSync(path.join(this.gachaDataPath, `./${uid}.json`), JSON.stringify({}, null, 4), 'utf-8');
            this.gachaUids[uid] = 'Trailblazer';
            fs.writeFileSync(path.join(this.gachaDataPath, './uids.json'), JSON.stringify(this.gachaUids, null, 4), 'utf-8');
        }
        // 存北京时间
        if (data['info']['region_time_zone'] != 8) {
            data['list'].forEach((item: unknown) => {
                const tmp = new Date(item['time']);
                tmp.setHours(tmp.getHours() - data['info']['region_time_zone'] + 8);
                item['time'] = `${tmp.getFullYear()}-` + `0${tmp.getMonth() + 1}-`.slice(-3) + `0${tmp.getDate()} `.slice(-3) + `0${tmp.getHours()}:`.slice(-3) + `0${tmp.getMinutes()}:`.slice(-3) + `0${tmp.getSeconds()}`.slice(-2);
            });
        }
        let list = JSON.parse(fs.readFileSync(path.join(this.gachaDataPath, `./${uid}.json`), 'utf-8'));
        let isInvalid = false;
        const item_keys = ['gacha_id', 'gacha_type', 'item_id', 'time', 'id'];
        data['list'].forEach((item: unknown) => {
            if (list[item['id']] === undefined) {
                const tmp = {};
                item_keys.forEach((key) => {
                    if (item[key] === undefined) isInvalid = true;
                    else tmp[key] = item[key];
                });
                list[item['id']] = tmp;
            }
        });
        if (isInvalid) return { msg: 'Invalid data' };
        list = Object.fromEntries(Object.entries(list).sort());
        fs.writeFileSync(path.join(this.gachaDataPath, `./${uid}.json`), JSON.stringify(list, null, 4), 'utf-8');
        settingService.setAppSettings('LastGachaUid', uid);
        return { msg: 'OK', data: { uid: uid } };
    }

    public async getGachaURL(server = 'cn') {
        let url = '';
        if (server === 'cn') {
            const playerLogPath = path.join(this.appDataPath, '../../../LocalLow/miHoYo/崩坏：星穹铁道/Player.log');
            const gameDataPath = fs.readFileSync(playerLogPath, 'utf-8').match(/Loading player data from (.*)data\.unity3d/)[1];
            const webCachePath = path.join(gameDataPath, './webCaches/');
            let maxVersion = '0.0.0.0';
            fs.readdirSync(webCachePath).forEach((fname) => {
                if (fs.statSync(path.join(webCachePath, fname)).isDirectory() && /\d+\.\d+\.\d+\.\d/.test(fname)) {
                    const max = maxVersion.split('.');
                    const now = fname.split('.');
                    for (let i = 0; i < 4; ++i) {
                        if (parseInt(now[i]) > parseInt(max[i])) {
                            maxVersion = fname;
                            break;
                        } else if (parseInt(now[i]) < parseInt(max[i])) {
                            break;
                        }
                    }
                }
            });
            if (maxVersion === '0.0.0.0') return { msg: 'URL not found' };
            const urlWebCachePath = path.join(gameDataPath, `./webCaches/${maxVersion}/Cache/Cache_Data/data_2`);
            const urlLines = fs.readFileSync(urlWebCachePath, 'utf-8').split('1/0/');
            urlLines.forEach((line) => {
                if (line.match(/^http.*(?:hkrpg|api).*mihoyo\.com.*?gacha.*\?/i)) {
                    url = line.match(/^.*?\x00/)[0].slice(0, -1);
                }
            });
            if (url === '') return { msg: 'URL not found' };
            const searchKeys = ['authkey_ver', 'authkey', 'game_biz', 'lang'];
            const urlObj = new URL(url);
            const params = urlObj.searchParams;
            const filteredParams = new URLSearchParams(Array.from(params.entries()).filter(([k]) => searchKeys.includes(k)));
            urlObj.search = filteredParams.toString();
            return { msg: 'OK', data: { url: urlObj.href } };
        } else {
            return { msg: 'Unsupport server' };
        }
    }
}

export default new GachaService();
