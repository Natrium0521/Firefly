const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
})

contextBridge.exposeInMainWorld('fireflyAPI', {
    getAppSettings: () => ipcRenderer.invoke('getAppSettings'),
    setAppSettings: (setting_name, setting_value) => ipcRenderer.invoke('setAppSettings', setting_name, setting_value),
    getAppVersion: () => ipcRenderer.invoke('getAppVersion'),

    getJson: (name) => ipcRenderer.invoke('getJson', name),

    getAchiUids: () => ipcRenderer.invoke('getAchiUids'),
    getAchiData: (uid, changeLastAchievementUid) => ipcRenderer.invoke('getAchiData', uid, changeLastAchievementUid),
    newAchi: (uid, nick) => ipcRenderer.invoke('newAchi', uid, nick),
    delAchi: (uid) => ipcRenderer.invoke('delAchi', uid),
    exportAchi: (uid, type) => ipcRenderer.invoke('exportAchi', uid, type),
    importAchi: (uid, type) => ipcRenderer.invoke('importAchi', uid, type),
    setAchiStatus: (uid, achi_ids, achi_status) => ipcRenderer.invoke('setAchiStatus', uid, achi_ids, achi_status),

    getGachaUids: () => ipcRenderer.invoke('getGachaUids'),
    getGachaData: (uid, changeLastGachaUid) => ipcRenderer.invoke('getGachaData', uid, changeLastGachaUid),
    newGacha: (uid, nick) => ipcRenderer.invoke('newGacha', uid, nick),
    delGacha: (uid) => ipcRenderer.invoke('delGacha', uid),
    exportGacha: (uid, type) => ipcRenderer.invoke('exportGacha', uid, type),
    importGacha: (type, data) => ipcRenderer.invoke('importGacha', type, data),
    getGachaUrl: (server) => ipcRenderer.invoke('getGachaUrl', server),

    sendMainWindow: (msg) => ipcRenderer.send('mainWindowMsg', msg),
    openURL: (url) => ipcRenderer.send('openURL', url),
})