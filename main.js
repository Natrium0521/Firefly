const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, shell } = require('electron/main')

// 禁用硬件加速
app.disableHardwareAcceleration()

// 安装包不运行
if (require('electron-squirrel-startup')) return app.quit();

// 单例运行
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (!mainWindow.isVisible()) mainWindow.show()
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

const path = require('path')
const fs = require('fs')

const iconPath = path.join(__dirname, './src/img/icon.png')
const iconPathBlur = path.join(__dirname, './src/img/icon_blur.png')
const userDataPath = app.getPath('userData');

// 软件的设置信息等
const saveAppSettings = () => {
    fs.writeFileSync(appSettingsPath, JSON.stringify(appSettings, null, 4))
}
const appDataPath = path.join(userDataPath, './data/')
if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath)
}
const appSettingsPath = path.join(appDataPath, './settings.json')
const initSettings = {
    Debug: false,
    CloseDirectly: true,
    ThemeColor: [115, 93, 141],
    LastAchievementUid: '000000000',
    LastGachaUid: '000000000',
}
if (!fs.existsSync(appSettingsPath)) {
    fs.writeFileSync(appSettingsPath, JSON.stringify(initSettings, null, 4))
}
var appSettings = JSON.parse(fs.readFileSync(appSettingsPath, 'utf-8'))
// 更新后新增的设置项
Object.keys(initSettings).forEach(k => {
    if (appSettings[k] === undefined) {
        appSettings[k] = initSettings[k]
    }
})
saveAppSettings()
ipcMain.handle('getAppSettings', async () => { return appSettings })
ipcMain.handle('setAppSettings', async (e, setting_name, setting_value) => {
    if (appSettings[setting_name] !== undefined && typeof (appSettings[setting_name]) === typeof (setting_value)) {
        appSettings[setting_name] = setting_value
        saveAppSettings()
    }
    return appSettings
})
ipcMain.handle('getAppVersion', async () => { return app.getVersion() })

// 读取src/json资源
json_cache = {}
const getJson = (name) => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, `./src/json/${name}.json`), 'utf-8'))
    if (json_cache[name] === undefined)
        json_cache[name] = JSON.parse(fs.readFileSync(path.join(__dirname, `./src/json/${name}.json`), 'utf-8'))
    return json_cache[name]
}
ipcMain.handle('getJson', async (e, name) => {
    return getJson(name)
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
ipcMain.handle('newAchi', async (e, uid, nick) => {// uid存在就是重命名，不存在就是创建  前端判断一下
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

// 跃迁
const gachaDataPath = path.join(appDataPath, './gacha/')
if (!fs.existsSync(gachaDataPath)) {
    fs.mkdirSync(gachaDataPath)
}
if (!fs.existsSync(path.join(gachaDataPath, './uids.json'))) {
    const initUids = { '000000000': 'Trailblazer' }
    fs.writeFileSync(path.join(gachaDataPath, './uids.json'), JSON.stringify(initUids, null, 4))
    fs.writeFileSync(path.join(gachaDataPath, './000000000.json'), JSON.stringify({}, null, 4))
}
var gachaUids = JSON.parse(fs.readFileSync(path.join(gachaDataPath, './uids.json'), 'utf-8'))
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

// 解锁FPS
const { promisify } = require('util')
const Registry = require('winreg')
ipcMain.handle('isFPSUnlocked', async (e, server = 'cn') => {
    try {
        let gameReg = undefined
        if (server == 'cn') {
            gameReg = new Registry({ hive: Registry.HKCU, key: '\\SOFTWARE\\miHoYo\\崩坏：星穹铁道' })
        }
        gameReg.asyncValues = promisify(gameReg.values)
        const gameRegItems = await gameReg.asyncValues()
        let targetRegItem = undefined
        gameRegItems.forEach(i => {
            if (i.name.startsWith('GraphicsSettings_Model'))
                targetRegItem = i
        })
        if (targetRegItem === undefined) return { 'msg': 'reg not found' }
        const hexPairs = targetRegItem.value.slice(0, -2).match(/.{2}/g)
        let buffer = Buffer.alloc(hexPairs.length)
        hexPairs.forEach((hexPair, index) => {
            buffer.writeUInt8(parseInt(hexPair, 16), index)
        })
        let json = JSON.parse(buffer.toString())
        if (json['FPS'] === undefined) {
            return { 'msg': 'no fps setting' }
        }
        if (json['FPS'] == 120) {
            return { 'msg': 'unlocked' }
        }
        return { 'msg': 'locked' }
    } catch (error) {
        return { 'msg': error.message }
    }
})
ipcMain.handle('unlockFPS', async (e, server = 'cn') => {
    try {
        let gameReg = undefined
        if (server == 'cn') {
            gameReg = new Registry({ hive: Registry.HKCU, key: '\\SOFTWARE\\miHoYo\\崩坏：星穹铁道' })
        }
        gameReg.asyncValues = promisify(gameReg.values)
        const gameRegItems = await gameReg.asyncValues()
        let targetRegItem = undefined
        gameRegItems.forEach(i => {
            if (i.name.startsWith('GraphicsSettings_Model'))
                targetRegItem = i
        })
        if (targetRegItem === undefined) return { 'msg': 'reg not found' }
        const hexPairs = targetRegItem.value.slice(0, -2).match(/.{2}/g)
        let buffer = Buffer.alloc(hexPairs.length)
        hexPairs.forEach((hexPair, index) => {
            buffer.writeUInt8(parseInt(hexPair, 16), index)
        })
        let json = JSON.parse(buffer.toString())
        if (json['FPS'] === undefined) {
            return { 'msg': 'no fps setting' }
        }
        if (json['FPS'] == 120) {
            json['FPS'] = 60
        } else {
            json['FPS'] = 120
        }
        buffer = Buffer.from(JSON.stringify(json))
        let newValue = ''
        buffer.forEach(v => newValue += `00${v.toString(16)}`.slice(-2).toUpperCase())
        newValue += '00'
        gameReg.asyncSet = promisify(gameReg.set)
        await gameReg.asyncSet(targetRegItem.name, Registry.REG_BINARY, newValue)
        return { 'msg': 'OK' }
    } catch (error) {
        return { 'msg': error.message }
    }
})


ipcMain.on('openURL', (e, url) => { shell.openExternal(url) })

// Debug?
if (!appSettings.Debug) Menu.setApplicationMenu(null)

var mainWindow = null
var tray = null
const createWindow = () => {
    // 主界面
    mainWindow = new BrowserWindow({
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
    mainWindow.on('close', (e) => {
        if (!appSettings.CloseDirectly) {
            e.preventDefault()
            mainWindow.hide()
        }
    })

    // 托盘
    tray = new Tray(iconPathBlur)
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
                click: () => app.exit(0)
            },
        ])
        tray.popUpContextMenu(menuConfig)
    })
}
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
            appSettings.CloseDirectly ? app.exit(0) : switchVisibility(mainWindow)
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

