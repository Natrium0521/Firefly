const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require('electron/main')
const path = require('path')
const fs = require('fs')

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

// 打开外部链接
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

module.exports={
    appDataPath,
    appSettings,
    getJson,
    saveAppSettings
}

// 成就
require('./main/achievement.js')

// 跃迁
require('./main/gacha.js')

// 解锁FPS
require('./main/unlockfps.js')