const { ipcMain } = require('electron/main')
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