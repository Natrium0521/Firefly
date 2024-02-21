document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "Escape":
            window.fireflyAPI.sendMainWindow('esc')
            break
        case "F5":
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

// 添加切换tab事件
document.querySelectorAll(".tablabel").forEach(ele => {
    ele.addEventListener('click', (e) => {
        tab = e.target.closest('.tablabel')
        document.querySelectorAll(".tablabel").forEach(ele => { ele.classList.remove("select") })
        document.querySelectorAll(".pagebox").forEach(ele => { ele.classList.remove("show") })
        tab.classList.add("select")
        if (tab.id != 'noid') {
            page = document.getElementById(tab.id.replace(/^tab_/, 'page_'))
            page.classList.add("show")
            page.scrollTop = 0
        }
    })
})

window.onload = async () => {
    appSettings = await window.fireflyAPI.getAppSettings()
    const [r, g, b] = appSettings.ThemeColor
    t = (r + g + b) / 3 <= 128 ? '#fff' : '#000'
    document.documentElement.style.setProperty('--theme-background', `rgb(${r} ${g} ${b})`)
    document.documentElement.style.setProperty('--theme-text', t)
    document.documentElement.style.setProperty('--theme-svg-invert', t == '#000' ? '0' : '1')
    textMap = await window.fireflyAPI.getJson('TextMapCHS')
    meAchievement = await window.fireflyAPI.getJson('MutualExclusiveAchievement')
    achievementSeries = await window.fireflyAPI.getJson('AchievementSeries')
    achievementData = await window.fireflyAPI.getJson('AchievementData')
    await initAchievement()
}