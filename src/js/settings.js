const initSettings = async () => {
    switch_close_directly.checked = appSettings.CloseDirectly
    switch_close_directly.addEventListener('click', async () => {
        appSettings = (await window.fireflyAPI.setAppSettings('CloseDirectly', switch_close_directly.checked))
    })
    switch_debug.checked = appSettings.Debug
    switch_debug.addEventListener('click', async () => {
        appSettings = (await window.fireflyAPI.setAppSettings('Debug', switch_debug.checked))
    })
}