import { app, BrowserWindow, Tray, Menu, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';

import settingService from './service/settingService';

// 禁用硬件加速，更流畅
app.disableHardwareAcceleration();

// 安装包不运行
if (require('electron-squirrel-startup')) app.quit();

// 单例运行
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (!mainWindow.isVisible()) mainWindow.show();
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// Debug?
if (!settingService.getAppSettingsSync()['Debug']) Menu.setApplicationMenu(null);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const createMainWindow = () => {
    if (mainWindow) return;
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        minWidth: 1080,
        minHeight: 720,
        frame: false,
        // resizable: false,
        // fullscreenable: false,
        maximizable: false,
        icon: path.join(__dirname, '../static/image/icon.png'),
        webPreferences: {
            backgroundThrottling: false,
            nodeIntegration: false,
            preload: path.join(__dirname, '../preload/index.js'),
        },
    });
    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
    mainWindow.on('close', (e) => {
        if (!settingService.getAppSettingsSync()['CloseDirectly']) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    // mainWindow.webContents.openDevTools();
};

const switchWindowVisibility = (win: BrowserWindow) => {
    if (win.isVisible()) {
        win.hide();
    } else {
        win.show();
    }
};

const createTray = () => {
    if (tray) return;
    tray = new Tray(path.join(__dirname, '../static/image/icon_blur.png'));
    tray.setToolTip('流萤工具箱');
    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.focus() : switchWindowVisibility(mainWindow);
    });
    tray.on('right-click', () => {
        const menuConfig = Menu.buildFromTemplate([
            {
                label: mainWindow.isVisible() ? '隐藏主界面' : '显示主界面',
                click: () => switchWindowVisibility(mainWindow),
            },
            {
                label: '退出',
                click: () => app.exit(0),
            },
        ]);
        tray.popUpContextMenu(menuConfig);
    });
};

app.on('ready', () => {
    createMainWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    createMainWindow();
    createTray();
});

// 注册IPC
import ipcFireflyAPI from '../preload/ipcFireflyAPI.json';
import service from './service';

Object.entries(ipcFireflyAPI).forEach(([serviceName, fnNames]) => {
    fnNames.forEach((fnName) => {
        ipcMain.handle(`${serviceName}.${fnName}`, async (ev, ...args) => {
            return await service[serviceName][fnName](...args);
        });
    });
});

// 打开外部链接
ipcMain.on('openURL', (ev, url) => {
    shell.openExternal(url);
});

ipcMain.on('sendMainWindowMsg', (ev, msg) => {
    switch (msg) {
        case 'close':
            settingService.getAppSettingsSync()['CloseDirectly'] ? app.exit(0) : switchWindowVisibility(mainWindow);
            break;
        case 'esc':
            switchWindowVisibility(mainWindow);
            break;
        case 'maxize':
            mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
            break;
        case 'minize':
            mainWindow.minimize();
            break;
        case 'reload':
            mainWindow.loadFile('../renderer/index.html');
            break;
    }
});

ipcMain.handle('loadJson', async (ev, fName) => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, `../static/json/${fName}.json`), 'utf-8'));
});
