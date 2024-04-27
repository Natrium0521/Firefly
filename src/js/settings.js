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
    let is_unlocking = false
    switch_unlock_fps.addEventListener('click', async () => {
        if (is_unlocking) return
        is_unlocking = true
        Alert.info(`正在尝试${switch_unlock_fps.checked ? '' : '取消'}解锁帧率`, '请耐心等待', 5)

        is_unlocking = false
    })
}