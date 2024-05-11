const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('path')
const fs = require('fs')

const appDataPath = require('../main.js').appDataPath
const appSettings = require('../main.js').appSettings
const saveAppSettings = require('../main.js').saveAppSettings

const achiDataPath = path.join(appDataPath, './achievement/')
if (!fs.existsSync(achiDataPath)) {
    fs.mkdirSync(achiDataPath)
}
if (!fs.existsSync(path.join(achiDataPath, './uids.json'))) {
    const initUids = { '000000000': 'Trailblazer' }
    fs.writeFileSync(path.join(achiDataPath, './uids.json'), JSON.stringify(initUids, null, 4))
    fs.writeFileSync(path.join(achiDataPath, './000000000.json'), JSON.stringify({}, null, 4))
}
var achiUids = JSON.parse(fs.readFileSync(path.join(achiDataPath, './uids.json'), 'utf-8'))
ipcMain.handle('getAchiUids', async () => {
    return { 'msg': 'OK', 'data': achiUids }
})
ipcMain.handle('getAchiData', async (e, uid, changeLastAchievementUid = false) => {
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (achiUids[uid] === undefined) return { 'msg': 'UID not found' }
    if (changeLastAchievementUid) appSettings['LastAchievementUid'] = uid
    saveAppSettings()
    return { 'msg': 'OK', 'data': JSON.parse(fs.readFileSync(path.join(achiDataPath, `./${uid}.json`), 'utf-8')) }
})
ipcMain.handle('newAchi', async (e, uid, nick) => {
    // uid存在就是重命名，不存在就是创建  前端判断一下
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (achiUids[uid] === undefined) {
        fs.writeFileSync(path.join(achiDataPath, `./${uid}.json`), JSON.stringify({}, null, 4))
    }
    achiUids[uid] = nick
    fs.writeFileSync(path.join(achiDataPath, './uids.json'), JSON.stringify(achiUids, null, 4))
    return { 'msg': 'OK' }
})
ipcMain.handle('delAchi', async (e, uid) => {
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (achiUids[uid] === undefined) return { 'msg': 'UID not found' }
    if (Object.keys(achiUids).length == 1) return { 'msg': 'The last UID cant be deleted' }
    delete achiUids[uid]
    fs.writeFileSync(path.join(achiDataPath, './uids.json'), JSON.stringify(achiUids, null, 4))
    return { 'msg': 'OK' }
})
ipcMain.handle('exportAchi', async (e, uid, type) => {
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (achiUids[uid] === undefined) return { 'msg': 'UID not found' }
    if (type == 'firefly') {
        exportData = {
            'info': {
                'export_app': 'Firefly',
                'export_app_version': app.getVersion(),
                'export_timestamp': Math.floor(new Date().getTime() / 1000)
            },
            'list': Object.values(JSON.parse(fs.readFileSync(path.join(achiDataPath, `./${uid}.json`), 'utf-8')))
        }
        let msg = 'OK'
        try {
            await dialog.showSaveDialog(BrowserWindow.getAllWindows()[0], {
                title: '导出成就存档',
                buttonLabel: '导出',
                defaultPath: `%USERPROFILE%/Desktop/Firefly_AchievementExport_v${app.getVersion()}_${achiUids[uid]}_${uid}.json`,
                filters: [{ name: 'json', extensions: ['json'] }]
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
ipcMain.handle('importAchi', async (e, uid, type) => {
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (type == 'firefly') {
        let msg = 'OK'
        try {
            let importData = {}
            await dialog.showOpenDialog(BrowserWindow.getAllWindows()[0], {
                title: '导入存档',
                buttonLabel: '导入',
                defaultPath: '%USERPROFILE%/Desktop/',
                filters: [{ name: 'json', extensions: ['json'] }]
            }).then(result => {
                if (result.canceled) {
                    msg = 'Canceled'
                } else {
                    importData = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'))
                }
            }).catch(err => {
                msg = err.message
            })
            if (msg != 'OK') return { 'msg': msg }
            if (importData['info']['export_app'] != 'Firefly') return { 'msg': 'Unknown app' }
            if (importData['list'] === undefined) return { 'msg': 'No data' }
            list = {}
            ts = Math.floor(new Date().getTime() / 1000)
            importData['list'].forEach((e) => {
                if (isNaN(e['id']) || isNaN(e['status']))
                    throw new Error('Invalid data')
                list[e['id']] = {
                    'id': e['id'],
                    'timestamp': e['timestamp'] === undefined ? ts : e['timestamp'],
                    'current': e['current'] === undefined ? 0 : e['current'],
                    'status': e['status']
                }
            })
            fs.writeFileSync(path.join(achiDataPath, `./${uid}.json`), JSON.stringify(list, null, 4))
        } catch (error) {
            return { 'msg': error.message }
        }
        return { 'msg': msg }
    } else {
        return { 'msg': 'Unknown type' }
    }
})
ipcMain.handle('setAchiStatus', async (e, uid, achi_ids, achi_status) => {
    // status:
    //      <1 - Invalid
    //      =1 - Unfinished
    //      >1 - Finished
    if (!/^\d{9}$/.test(uid)) return { 'msg': 'Invalid UID' }
    if (achiUids[uid] === undefined) return { 'msg': 'UID not found' }
    let data = JSON.parse(fs.readFileSync(path.join(achiDataPath, `./${uid}.json`), 'utf-8'))
    let ret = []
    if (achi_status == 1) {
        achi_ids.forEach(achi_id => delete data[achi_id])
        ret = null
    } else {
        let ts = Math.floor(new Date().getTime() / 1000)
        achi_ids.forEach(achi_id => {
            data[achi_id] = {
                'id': achi_id,
                'timestamp': ts,
                'current': 0,
                'status': achi_status
            }
            ret.push(data[achi_id])
        })
    }
    fs.writeFileSync(path.join(achiDataPath, `./${uid}.json`), JSON.stringify(data, null, 4))
    return { 'msg': 'OK', 'data': ret }
})