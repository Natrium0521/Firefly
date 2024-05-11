const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('path')
const fs = require('fs')

const appDataPath = require('../main.js').appDataPath
const appSettings = require('../main.js').appSettings
const getJson = require('../main.js').getJson
const saveAppSettings = require('../main.js').saveAppSettings

const gachaDataPath = path.join(appDataPath, './gacha/')
if (!fs.existsSync(gachaDataPath)) {
    fs.mkdirSync(gachaDataPath)
}
if (!fs.existsSync(path.join(gachaDataPath, './uids.json'))) {
    const initUids = { '000000000': 'Trailblazer' }
    fs.writeFileSync(path.join(gachaDataPath, './uids.json'), JSON.stringify(initUids, null, 4))
    fs.writeFileSync(path.join(gachaDataPath, './000000000.json'), JSON.stringify({}, null, 4))
}

let gachaUids = JSON.parse(fs.readFileSync(path.join(gachaDataPath, './uids.json'), 'utf-8'))
ipcMain.handle('getGachaUids', async () => {
    return { 'msg': 'OK', 'data': gachaUids }
})
ipcMain.handle('getGachaData', async (e, uid, changeLastGachaUid = false) => {
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (gachaUids[uid] === undefined) return { 'msg': 'UID not found' }
    if (changeLastGachaUid) appSettings['LastGachaUid'] = uid
    saveAppSettings()
    return { 'msg': 'OK', 'data': JSON.parse(fs.readFileSync(path.join(gachaDataPath, `./${uid}.json`), 'utf-8')) }
})
ipcMain.handle('newGacha', async (e, uid, nick) => {
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (gachaUids[uid] === undefined) {
        fs.writeFileSync(path.join(gachaDataPath, `./${uid}.json`), JSON.stringify({}, null, 4))
    }
    gachaUids[uid] = nick
    fs.writeFileSync(path.join(gachaDataPath, './uids.json'), JSON.stringify(gachaUids, null, 4))
    return { 'msg': 'OK' }
})
ipcMain.handle('delGacha', async (e, uid) => {
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (gachaUids[uid] === undefined) return { 'msg': 'UID not found' }
    if (Object.keys(gachaUids).length == 1) return { 'msg': 'The last UID cant be deleted' }
    delete gachaUids[uid]
    fs.writeFileSync(path.join(gachaDataPath, './uids.json'), JSON.stringify(gachaUids, null, 4))
    return { 'msg': 'OK' }
})
ipcMain.handle('exportGacha', async (e, uid, type = 'srgf_v1.0') => {
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (gachaUids[uid] === undefined) return { 'msg': 'UID not found' }
    if (type == 'srgf_v1.0') {
        let exportData = {
            'info': {
                'srgf_version': 'v1.0',
                'uid': `${uid}`,
                'lang': 'zh-cn',
                'region_time_zone': 8,
                "export_app": "Firefly",
                "export_app_version": app.getVersion(),
                "export_timestamp": Math.floor(new Date().getTime() / 1000)
            },
            'list': []
        }
        const AvatarConfig = getJson('AvatarConfig')
        const EquipmentConfig = getJson('EquipmentConfig')
        const TextMapCHS = getJson('TextMapCHS')
        Object.values(JSON.parse(fs.readFileSync(path.join(gachaDataPath, `./${uid}.json`), 'utf-8'))).forEach(item => {
            let node = item
            node['count'] = '1'
            if (node['item_id'].length == 4) {
                node['item_type'] = '角色'
                node['name'] = TextMapCHS[AvatarConfig[node['item_id']]['AvatarName']['Hash']]
                node['rank_type'] = AvatarConfig[node['item_id']]['Rarity'].at(-1)
            } else {
                node['item_type'] = '光锥'
                node['name'] = TextMapCHS[EquipmentConfig[node['item_id']]['EquipmentName']['Hash']]
                node['rank_type'] = EquipmentConfig[node['item_id']]['Rarity'].at(-1)
            }
            exportData['list'].push(node)
        })
        let msg = 'OK'
        try {
            await dialog.showSaveDialog(BrowserWindow.getAllWindows()[0], {
                title: '导出跃迁记录为SRGF',
                buttonLabel: '导出',
                defaultPath: `%USERPROFILE%/Desktop/Firefly_GachaExport_v${app.getVersion()}_${gachaUids[uid]}_${uid}.json`,
                filters: [{ name: 'SRGF json', extensions: ['json'] }]
            }).then(result => {
                if (result.canceled) {
                    msg = 'Canceled'
                } else {
                    fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 4))
                }
            }).catch(err => {
                msg = err.message
            })
        } catch (error) {
            return { 'msg': error.message }
        }
        return { 'msg': msg }
    } else {
        return { 'msg': 'Unknown type' }
    }
})
ipcMain.handle('importGacha', async (e, type = 'srgf_v1.0', data = {}) => {
    // 已存在的uid就是更新记录 不存在的uid就新建并导入 nick默认Trailblazer
    if (Object.keys(data).length == 0) {
        if (type == 'srgf_v1.0') {
            let msg = 'OK'
            try {
                await dialog.showOpenDialog(BrowserWindow.getAllWindows()[0], {
                    title: '导入SRGF格式跃迁记录',
                    buttonLabel: '导入',
                    defaultPath: '%USERPROFILE%/Desktop/',
                    filters: [{ name: 'SRGF json', extensions: ['json'] }]
                }).then(result => {
                    if (result.canceled) {
                        msg = 'Canceled'
                    } else {
                        data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'))
                    }
                }).catch(err => {
                    msg = err.message
                })
                if (msg != 'OK') return { 'msg': msg }
                if (data.info.srgf_version != 'v1.0') return { 'msg': 'Unsupport SRGF version' }
                if (data.list === undefined) return { 'msg': 'No data' }
            } catch (error) {
                return { 'msg': error.message }
            }
        }
    }
    let uid = data.info.uid
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (gachaUids[uid] === undefined) {
        fs.writeFileSync(path.join(gachaDataPath, `./${uid}.json`), JSON.stringify({}, null, 4))
        gachaUids[uid] = 'Trailblazer'
        fs.writeFileSync(path.join(gachaDataPath, './uids.json'), JSON.stringify(gachaUids, null, 4))
    }
    // 确保存下的数据都是北京时间
    if (data.info.region_time_zone != 8) {
        data.list.forEach(item => {
            let tmp = new Date(item.time)
            tmp.setHours(tmp.getHours() - data.info.region_time_zone + 8)
            item.time = `${tmp.getFullYear()}-` + `0${tmp.getMonth() + 1}-`.slice(-3) + `0${tmp.getDate()} `.slice(-3) +
                `0${tmp.getHours()}:`.slice(-3) + `0${tmp.getMinutes()}:`.slice(-3) + `0${tmp.getSeconds()}`.slice(-2)
        })
    }
    let list = JSON.parse(fs.readFileSync(path.join(gachaDataPath, `./${uid}.json`), 'utf-8'))
    let isInvalid = false
    const item_keys = ['gacha_id', 'gacha_type', 'item_id', 'time', 'id']
    data.list.forEach(item => {
        if (list[item.id] === undefined) {
            let tmp = {}
            item_keys.forEach(key => {
                if (item[key] === undefined) isInvalid = true
                else tmp[key] = item[key]
            })
            list[item.id] = tmp
        }
    })
    if (isInvalid) return { 'msg': 'Invalid data' }
    list = Object.fromEntries(Object.entries(list).sort())
    fs.writeFileSync(path.join(gachaDataPath, `./${uid}.json`), JSON.stringify(list, null, 4))
    appSettings['LastGachaUid'] = uid
    saveAppSettings()
    return { 'msg': 'OK', 'data': { 'uid': uid } }
})
ipcMain.handle('getGachaUrl', async (e, server = 'cn') => {
    let url = ''
    if (server == 'cn') {
        let playerLogPath = path.join(appDataPath, '../../../LocalLow/miHoYo/崩坏：星穹铁道/Player.log')
        let gameDataPath = fs.readFileSync(playerLogPath, 'utf-8').match(/Loading player data from (.*)data\.unity3d/)[1]
        let webCachePath = path.join(gameDataPath, './webCaches/')
        let maxVersion = '0.0.0.0'
        fs.readdirSync(webCachePath).forEach(fname => {
            if (fs.statSync(path.join(webCachePath, fname)).isDirectory() && /\d+.\d+.\d+.\d/.test(fname)) {
                let max = maxVersion.split('.')
                let now = fname.split('.')
                for (let i = 0; i < 4; ++i) {
                    if (parseInt(now[i]) > parseInt(max[i])) {
                        maxVersion = fname
                    }
                }
            }
        })
        let urlWebCachePath = path.join(gameDataPath, `./webCaches/${maxVersion}/Cache/Cache_Data/data_2`)
        let urlLines = fs.readFileSync(urlWebCachePath, 'utf-8').split('1/0/')
        urlLines.forEach(line => {
            if (line.startsWith('https://api-takumi.mihoyo.com/common/gacha_record/api/getGachaLog?')) {
                url = line.match(/^.*?\x00/)[0].slice(0, -1)
            }
        })
    }
    if (url == '') return { 'msg': 'URL not found' }
    let params = {}
    for ([k, v] of new URL(url).searchParams) {
        params[k] = encodeURIComponent(v)
    }
    url = `https://api-takumi.mihoyo.com/common/gacha_record/api/getGachaLog?authkey_ver=${params['authkey_ver']}&authkey=${params['authkey']}&game_biz=${params['game_biz']}&lang=${params['lang']}`
    return { 'msg': 'OK', 'data': { 'url': url } }
})