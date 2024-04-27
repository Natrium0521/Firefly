const initSettings = async () => {
    switch_close_directly.checked = appSettings.CloseDirectly
    switch_close_directly.addEventListener('click', async () => {
        appSettings = (await window.fireflyAPI.setAppSettings('CloseDirectly', switch_close_directly.checked))
    })

    switch_debug.checked = appSettings.Debug
    switch_debug.addEventListener('click', async () => {
        appSettings = (await window.fireflyAPI.setAppSettings('Debug', switch_debug.checked))
    })

    let tmp = switch_unlock_fps.closest('.switchitem').querySelector('.text .desc').innerHTML
    switch_unlock_fps.closest('.switchitem').querySelector('.text .desc').innerHTML = '检测中'
    switch_unlock_fps.checked = (await window.fireflyAPI.isFPSUnlocked()).msg == 'unlocked'
    switch_unlock_fps.closest('.switchitem').querySelector('.text .desc').innerHTML = tmp
    switch_unlock_fps.addEventListener('click', async (e) => {
        switch_unlock_fps.disabled = true
        Alert.info(`正在尝试${switch_unlock_fps.checked ? '' : '取消'}解锁帧率`, '请耐心等待', 7)
        ret = await window.fireflyAPI.unlockFPS()
        if (ret.msg == 'OK') {
            Alert.success(`${switch_unlock_fps.checked ? '' : '取消'}解锁成功`, switch_unlock_fps.checked ? '游戏中图像设置界面显示异常为正常现象' : '请启动游戏查看', 7)
        } else if (ret.msg == 'reg not found') {
            switch_unlock_fps.checked = !switch_unlock_fps.checked
            Alert.error(`${switch_unlock_fps.checked ? '' : '取消'}解锁失败`, '请先在游戏中修改任意图像设置（使图像质量显示为自定义）并退出游戏重试')
        }
        else {
            switch_unlock_fps.checked = !switch_unlock_fps.checked
            Alert.error(`${switch_unlock_fps.checked ? '' : '取消'}解锁失败`, ret.msg)
        }
        switch_unlock_fps.disabled = false
    })
}