const initSetting_CloseDirectly = async () => {
    switch_close_directly.checked = appSettings.CloseDirectly
    switch_close_directly.addEventListener('click', async () => {
        appSettings = (await window.fireflyAPI.setAppSettings('CloseDirectly', switch_close_directly.checked))
    })
}

const initSetting_Debug = async () => {
    switch_debug.checked = appSettings.Debug
    switch_debug.addEventListener('click', async () => {
        appSettings = (await window.fireflyAPI.setAppSettings('Debug', switch_debug.checked))
    })
}

const initSetting_UnlockFPS = async () => {
    let tmp = switch_unlock_fps.closest('.switchitem').querySelector('.text .desc').innerHTML
    switch_unlock_fps.closest('.switchitem').querySelector('.text .desc').innerHTML = '检测中'
    switch_unlock_fps.disabled = true
    switch_unlock_fps.checked = (await window.fireflyAPI.isFPSUnlocked()).msg == 'unlocked'
    switch_unlock_fps.disabled = false
    switch_unlock_fps.closest('.switchitem').querySelector('.text .desc').innerHTML = tmp
    switch_unlock_fps.addEventListener('click', async (e) => {
        switch_unlock_fps.disabled = true
        Alert.info(`正在尝试${switch_unlock_fps.checked ? '' : '取消'}解锁帧率`, '请耐心等待', 7)
        ret = await window.fireflyAPI.unlockFPS()
        if (ret.msg == 'OK') {
            Alert.success(`${switch_unlock_fps.checked ? '' : '取消'}解锁成功`, switch_unlock_fps.checked ? '游戏中图像设置界面可能显示异常，是正常现象<br>改变图像设置后，需退出游戏重新解锁' : '已将帧率设为60', 15)
        } else if (ret.msg == 'reg not found') {
            Alert.error(`${switch_unlock_fps.checked ? '' : '取消'}解锁失败`, '请先在游戏中修改任意图像设置（使图像质量显示为自定义）并退出游戏重试')
            switch_unlock_fps.checked = !switch_unlock_fps.checked
        }
        else {
            Alert.error(`${switch_unlock_fps.checked ? '' : '取消'}解锁失败`, ret.msg)
            switch_unlock_fps.checked = !switch_unlock_fps.checked
        }
        switch_unlock_fps.disabled = false
    })
}

const initSettings = async () => {
    initSetting_CloseDirectly()
    initSetting_Debug()
    initSetting_UnlockFPS()
}