const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
})

contextBridge.exposeInMainWorld('fireflyAPI', {
    getAppSettings: () => ipcRenderer.invoke('getAppSettings'),

    getJson: (name) => ipcRenderer.invoke('getJson', name),

    getAchiUids: () => ipcRenderer.invoke('getAchiUids'),
    getAchiData: (uid, changeLastAchievementUid) => ipcRenderer.invoke('getAchiData', uid, changeLastAchievementUid),
    newAchi: (uid, nick) => ipcRenderer.invoke('newAchi', uid, nick),
    delAchi: (uid) => ipcRenderer.invoke('delAchi', uid),
    exportAchi: (uid, type) => ipcRenderer.invoke('exportAchi', uid, type),
    importAchi: (uid, type) => ipcRenderer.invoke('importAchi', uid, type),
    setAchiStatus: (uid, achi_id, achi_status) => ipcRenderer.invoke('setAchiStatus', uid, achi_id, achi_status),

    sendMainWindow: (msg) => ipcRenderer.send('mainWindowMsg', msg),
})