const { app, BrowserWindow, Tray, Menu, ipcMain, dialog } = require('electron/main')

const path = require('path')
const fs = require('fs')

const iconPath = path.join(__dirname, './src/img/icon.jpg')
const userDataPath = app.getPath('userData');

// 软件的设置信息等
const appDataPath = path.join(userDataPath, './data/')
if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath)
}
const appSettingsPath = path.join(appDataPath, './settings.json')
if (!fs.existsSync(appSettingsPath)) {
    const initSettings = {
        Debug: false,
        CloseDirectly: true,
        ThemeColor: [115, 93, 141],
        LastAchievementUid: '000000000'
    }
    fs.writeFileSync(appSettingsPath, JSON.stringify(initSettings, null, 4))
}
var appSettings = JSON.parse(fs.readFileSync(appSettingsPath, 'utf-8'))
ipcMain.handle('getAppSettings', async () => { return appSettings })
const saveAppSettings = () => {
    fs.writeFileSync(appSettingsPath, JSON.stringify(appSettings, null, 4))
}

// 读取src/json资源
ipcMain.handle('getJson', async (e, name) => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, `./src/json/${name}.json`), 'utf-8'))
})

// 成就
const achiDataPath = path.join(appDataPath, './achievement/')
if (!fs.existsSync(achiDataPath)) {
    fs.mkdirSync(achiDataPath)
}
if (!fs.existsSync(path.join(achiDataPath, './uids.json'))) {
    const initUids = { '000000000': 'Trailblazer' }
    fs.writeFileSync(path.join(achiDataPath, './uids.json'), JSON.stringify(initUids, null, 4))
    fs.writeFileSync(path.join(achiDataPath, './000000000.json'), JSON.stringify({}, null, 4))
}
var uids = JSON.parse(fs.readFileSync(path.join(achiDataPath, './uids.json'), 'utf-8'))
ipcMain.handle('getAchiUids', async () => {
    return { 'msg': 'OK', 'data': uids }
})
ipcMain.handle('getAchiData', async (e, uid, changeLastAchievementUid = false) => {
    if (uid.match(/\d{9}/)[0] != uid) return { 'msg': 'Invalid UID' }
    if (uids[uid] === undefined) return { 'msg': 'UID not found' }
    if (changeLastAchievementUid) appSettings['LastAchievementUid'] = uid
    saveAppSettings()
    return { 'msg': 'OK', 'data': JSON.parse(fs.readFileSync(path.join(achiDataPath, `./${uid}.json`), 'utf-8')) }
})
ipcMain.handle('newAchi', async (e, uid, nick) => {// uid存在就是重命名，不存在就是创建  前端判断一下
    if (uid.match(/\d{9}/)[0] != uid) return { 'msg': 'Invalid UID' }
    if (uids[uid] === undefined) {
        fs.writeFileSync(path.join(achiDataPath, `./${uid}.json`), JSON.stringify({}, null, 4))
    }
    uids[uid] = nick
    fs.writeFileSync(path.join(achiDataPath, './uids.json'), JSON.stringify(uids, null, 4))
    return { 'msg': 'OK' }
})
ipcMain.handle('delAchi', async (e, uid) => {
    if (uid.match(/\d{9}/)[0] != uid) return { 'msg': 'Invalid UID' }
    if (uids[uid] === undefined) return { 'msg': 'UID not found' }
    if (Object.keys(uids).length == 1) return { 'msg': 'The last UID cant be deleted' }
    delete uids[uid]
    fs.writeFileSync(path.join(achiDataPath, './uids.json'), JSON.stringify(uids, null, 4))
    return { 'msg': 'OK' }
})
ipcMain.handle('exportAchi', async (e, uid, type) => {
    if (uid.match(/\d{9}/)[0] != uid) return { 'msg': 'Invalid UID' }
    if (uids[uid] === undefined) return { 'msg': 'UID not found' }
    if (type == 'firefly') {
        exportData = {
            'info': {
                'export_app': 'Firefly',
                'export_app_version': '0.1.0',
                'export_timestamp': Math.floor(new Date().getTime() / 1000)
            },
            'list': Object.values(JSON.parse(fs.readFileSync(path.join(achiDataPath, `./${uid}.json`), 'utf-8')))
        }
        let msg = 'OK'
        try {
            await dialog.showSaveDialog(BrowserWindow.getAllWindows()[0], {
                title: '导出存档',
                buttonLabel: '导出',
                defaultPath: `%USERPROFILE%/Desktop/Firefly_v0.1.0_${uids[uid]}_${uid}.json`,
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
    if (type == 'firefly') {
        if (uid.match(/\d{9}/)[0] != uid) return { 'msg': 'Invalid UID' }
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
                if (Number(e['id']) == NaN || Number(e['status'] == NaN))
                    return { 'msg': 'Invalid data' }
                list[e['id']] = {
                    'id': e['id'],
                    'timestamp': e['timestamp'] === undefined ? ts : e['timestamp'],
                    'current': e['current'] === undefined ? 0 : e['current'],
                    'status': e['status']
                }
            })
            fs.writeFileSync(path.join(achiDataPath, `./${uid}.json`), JSON.stringify(list, null, 4))
        } catch (error) {
            console.log(error)
            return { 'msg': error.message }
        }
        return { 'msg': msg }
    } else {
        return { 'msg': 'Unknown type' }
    }
})
ipcMain.handle('setAchiStatus', async (e, uid, achi_id, achi_status) => {
    // status:
    //      <1 - Invalid
    //      =1 - Unfinished
    //      >1 - Finished
    if (uid.match(/\d{9}/)[0] != uid) return { 'msg': 'Invalid UID' }
    if (uids[uid] === undefined) return { 'msg': 'UID not found' }
    data = JSON.parse(fs.readFileSync(path.join(achiDataPath, `./${uid}.json`), 'utf-8'))
    if (achi_status == 1) {
        delete data[achi_id]
    } else {
        ts = Math.floor(new Date().getTime() / 1000)
        data[achi_id] = {
            "id": achi_id,
            "timestamp": ts,
            "current": 0,
            "status": achi_status
        }
    }
    fs.writeFileSync(path.join(achiDataPath, `./${uid}.json`), JSON.stringify(data, null, 4))
    return { 'msg': 'OK', 'data': achi_status != 1 ? data[achi_id] : null }
})

// Debug?
if (!appSettings.Debug)
    Menu.setApplicationMenu(null)

const createWindow = () => {
    // 主界面
    const mainWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        frame: false,
        resizable: false,
        // fullscreenable: false,
        maximizable: false,
        icon: iconPath,
        webPreferences: {
            backgroundThrottling: false,
            nodeIntegration: true,
            preload: path.join(__dirname, './preload.js')
        }
    })
    mainWindow.loadFile('./src/index.html')
    const switchVisibility = (win) => {
        if (win.isVisible()) {
            win.hide()
        } else {
            win.show()
        }
    }
    ipcMain.on('mainWindowMsg', (event, msg) => {
        switch (msg) {
            case 'close':
                appSettings.CloseDirectly ? app.quit() : switchVisibility(mainWindow)
                break
            case 'esc':
                switchVisibility(mainWindow)
                break
            case 'maxize':
                mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
                break
            case 'minize':
                mainWindow.minimize()
                break
            case 'reload':
                mainWindow.loadFile('./src/index.html')
                break
        }
    })

    // 托盘
    var tray = new Tray(iconPath)
    tray.setToolTip('流萤工具箱')
    tray.on('click', () => { mainWindow.isVisible() ? mainWindow.focus() : switchVisibility(mainWindow) })
    tray.on('right-click', () => {
        const menuConfig = Menu.buildFromTemplate([
            {
                label: mainWindow.isVisible() ? '隐藏主界面' : '显示主界面',
                click: () => switchVisibility(mainWindow)
            },
            {
                label: '退出',
                click: () => app.quit()
            },
        ])
        tray.popUpContextMenu(menuConfig)
    })
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

