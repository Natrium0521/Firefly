document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "Escape":
            if (layer.classList.contains('show'))
                layer.click()
            else
                window.fireflyAPI.sendMainWindow('esc')
            break
        case "F5":
            if (appSettings.Debug)
                window.fireflyAPI.sendMainWindow('reload')
            break
        case "Tab":
            e.preventDefault()
            break
        case " ":
            if (document.activeElement.type != 'text')
                e.preventDefault()
            break
    }
})

// 右上角按钮
// 最小化
document.querySelector(".minize").addEventListener('click', (e) => {
    window.fireflyAPI.sendMainWindow('minize')
})
// 最大化
document.querySelector(".maxize").addEventListener('click', (e) => {
    window.fireflyAPI.sendMainWindow('maxize')
})
// 关闭
document.querySelector(".close").addEventListener('click', (e) => {
    window.fireflyAPI.sendMainWindow('close')
})

document.querySelectorAll('a').forEach(ele => {
    ele.onclick = (e) => {
        e.preventDefault()
        window.fireflyAPI.openURL(e.target.getAttribute('href'))
    }
})

// 添加切换tab事件
document.querySelectorAll(".tablabel").forEach(ele => {
    ele.addEventListener('click', (e) => {
        tab = e.target.closest('.tablabel')
        if (tab.id != 'noid') {
            page = document.getElementById(tab.id.replace(/^tab_/, 'page_'))
            document.querySelectorAll(".tablabel").forEach(ele => { ele.classList.remove("select") })
            document.querySelectorAll(".pagebox").forEach(ele => { ele.classList.remove("show") })
            tab.classList.add("select")
            page.classList.add("show")
            page.scrollTop = 0
        }
    })
})

// 隐藏layer
var layerCanBeHidden = true
layer.querySelectorAll('.layer .close').forEach(el => {
    el.addEventListener('click', (e) => {
        if (layerCanBeHidden) {
            e.target.closest('.layerbox').classList.remove('show')
            layer.classList.remove('show')
        }
    })
})
var isLayerBgClicked = false
layer.addEventListener('mousedown', (e) => {
    isLayerBgClicked = e.target == layer
})
layer.addEventListener('mouseup', (e) => {
    if (e.target == layer && layerCanBeHidden && isLayerBgClicked) {
        layer.querySelectorAll('.layerbox').forEach(el => { el.classList.remove('show') })
        layer.classList.remove('show')
    }
    isLayerBgClicked = false
})

window.onload = async () => {
    appSettings = await window.fireflyAPI.getAppSettings()
    page_settings.querySelector('.about .area .version').innerHTML = `工具箱版本 v${await (window.fireflyAPI.getAppVersion())}<br>适配游戏版本 v2.1`
    const [r, g, b] = appSettings.ThemeColor
    t = (r + g + b) / 3 <= 128 ? '#fff' : '#000'
    document.documentElement.style.setProperty('--theme-background', `rgb(${r} ${g} ${b})`)
    document.documentElement.style.setProperty('--theme-text', t)
    document.documentElement.style.setProperty('--theme-svg-invert', t == '#000' ? '0' : '1')
    textMap = await window.fireflyAPI.getJson('TextMapCHS')
    meAchievement = await window.fireflyAPI.getJson('MutualExclusiveAchievement')
    achievementSeries = await window.fireflyAPI.getJson('AchievementSeries')
    achievementData = await window.fireflyAPI.getJson('AchievementData')
    initAchievement()
    avatarConfig = await window.fireflyAPI.getJson('AvatarConfig')
    equipmentConfig = await window.fireflyAPI.getJson('EquipmentConfig')
    gachaBasicInfo = await window.fireflyAPI.getJson('GachaBasicInfo')
    gachaPoolInfo = await window.fireflyAPI.getJson('GachaPoolInfo')
    initGacha()
    
    initSettings()
}