textMap = {}// 字典
const textReplaceMap = {
    '{NICKNAME}': '-2090701432',
    '{TEXTJOIN#54}': '-262052143',
    '{TEXTJOIN#87}': '-978224911'
}
meAchievement = []// 互斥成就
achievementSeries = {}
achievementData = {}
achievementCount = {}
achievementVersion = {}
achiFlip = new flip()
achiUids = {}
achiCurrUid = ''
achiCurrData = {}
achiSearchMap = {}
const achiFilterDefault = {
    Version: [],
    IncompFirst: true,
    ShowComp: false,
    ShowIncomp: false,
    ShowHidden: false,
    ShowVisible: false,
    ShowMEOnly: false
}
achiFilter = JSON.parse(JSON.stringify(achiFilterDefault))

const isMEAchievement = (aid) => {
    const iaid = parseInt(aid)
    let flag = false
    meAchievement.forEach((mearr) => {
        if (mearr.indexOf(iaid) != -1) flag = true
    })
    return flag
}

const getMEAchievement = (aid) => {
    const iaid = parseInt(aid)
    let arr = []
    meAchievement.forEach((mearr) => {
        if (mearr.indexOf(iaid) != -1) {
            mearr.forEach(i => arr.push(i + ''))
        }
    })
    return arr
}

const toggleAchievementStatus = async (achi_id) => {
    stat = 1
    if (achiCurrData[achi_id] === undefined || achiCurrData[achi_id].status == 1)
        stat = 2
    ret = await window.fireflyAPI.setAchiStatus(achiCurrUid, [achi_id], stat)
    if (ret.data === null) {
        delete achiCurrData[achi_id]
    } else {
        achiCurrData[achi_id] = ret.data[0]
    }
}

const setAchievementsStatus = async (achi_ids, stat) => {
    ret = await window.fireflyAPI.setAchiStatus(achiCurrUid, achi_ids, stat)
    if (ret.data === null) {
        achi_ids.forEach(achi_id => delete achiCurrData[achi_id])
    } else {
        ret.data.forEach(achi => {
            achiCurrData[achi['id']] = achi
        })
    }
}

const loadAchiData = (data) => {
    finishedCount = {}
    Object.entries(achievementCount['series']).forEach(([sid, cnt]) => {
        finishedCount[sid] = { 'tot': cnt.fix, 'fin': 0 }
    })
    document.querySelectorAll('.achi_box .item').forEach(el => {
        achi_id = el.getAttribute('achievement_id') + ''
        if (data[achi_id] != undefined) {
            finishedCount[el.getAttribute('series_id')]['fin'] += 1
            effected_div = []
            if (isMEAchievement(achi_id + '')) {
                mearr = getMEAchievement(achi_id)
                document.querySelectorAll('.achi_box .item').forEach((achi_div) => {
                    if (mearr.indexOf(achi_div.getAttribute('achievement_id') + '') != -1) effected_div.push(achi_div)
                })
            } else {
                effected_div = [el]
            }
            date = new Date(data[achi_id].timestamp * 1000)
            time_string = date.toLocaleString().replace(' ', '<br>')
            effected_div.forEach(ele => {
                ele.querySelector('.time').innerHTML = time_string
                ele.querySelector('.checkbox').classList.add('disabled')
                ele.style.order = -(ele.getAttribute('achievement_priority') * 1 + ele.getAttribute('series_priority') * 10000) + (achiFilter.IncompFirst ? 100000 : 0)
            })
            el.querySelector('.checkbox').classList.replace('disabled', 'checked')
        } else {
            if (isMEAchievement(achi_id + '')) {
                mearr = getMEAchievement(achi_id)
                isEffectedByOtherAchievement = false
                mearr.forEach(i => { if (data[i] != undefined) isEffectedByOtherAchievement = true })
                if (isEffectedByOtherAchievement) return
            }
            el.querySelector('.time').innerHTML = ''
            el.querySelector('.checkbox').classList.remove('disabled')
            el.querySelector('.checkbox').classList.remove('checked')
            el.style.order = -(el.getAttribute('achievement_priority') * 1 + el.getAttribute('series_priority') * 10000)
        }
    })
    // progress refresh
    tot = 0
    fin = 0
    Object.values(finishedCount).forEach(v => {
        tot += v.tot
        fin += v.fin
    })
    finishedCount['0'] = { 'tot': tot, 'fin': fin }
    pct0 = 0
    document.querySelectorAll('.achi_series .series').forEach(el => {
        sid = el.getAttribute('series_id')
        tot = finishedCount[sid]['tot']
        fin = finishedCount[sid]['fin']
        pct = (fin / tot * 100).toFixed(2)
        el.querySelector('.info').innerText = `${fin}/${tot} - ${pct}%`
        if (sid == 0) {
            document.querySelector('.achievement_head .achi_info').innerText = `${fin}/${tot} - ${pct}%`
            pct0 = pct
        }
        el.querySelector('.progress .bar').style.width = `${pct}%`
    })
    // uid drop down refresh
    document.querySelectorAll('.achievement_head .uid_wrap .uid_dropdown .uid').forEach(el => {
        if (el.innerHTML == achiCurrUid) {
            el.closest('.user').querySelector('.percentage').innerText = `${Number(pct0).toFixed(0)}%`
        }
    })
    // filter refresh
    achiFilterRefresh()
}

// 初始化成就页面
const initAchievement = async () => {
    // 成就集初始化
    document.querySelector('.achi_series').innerHTML = `
    <div class="series select" series_id="0" style="order: -99;" id="allAchiSeries">
        <div class="ico">
            <img src="./img/hsr/achievement/Prize1.png">
        </div>
        <div class="title">所有成就</div>
        <div class="info"></div>
        <div class="progress">
            <div class="bar"></div>
        </div>
    </div>`
    Object.values(achievementSeries).forEach((series) => {
        seriesDiv = document.createElement('div')
        seriesDiv.setAttribute('class', 'series')
        seriesDiv.setAttribute('series_id', series['SeriesID'])
        seriesDiv.style.order = -series['Priority']
        ico = series['MainIconPath'].split('/').reverse()[0].replace(/.{4}$/, '1.png')
        tit = textMap[series['SeriesTitle']['Hash']]
        seriesDiv.innerHTML =
            `<div class="ico"><img src="./img/hsr/achievement/${ico}"></div>
            <div class="title">${tit}</div>
            <div class="info"></div>
            <div class="progress"><div class="bar"></div></div>`
        document.querySelector('.achi_series').appendChild(seriesDiv)
    })
    document.querySelectorAll('.achi_series .series').forEach(ele => {
        ele.addEventListener('click', (e) => {
            series = e.target.closest('.series')
            achiFlip.refresh()
            selectSeries(series, true)
            achiFlip.play(200)
        })
    })

    // 向成就数据中添加版本信息
    for (let [ver, achis] of Object.entries(achievementVersion)) {
        achis.forEach(aid => achievementData[aid]['Version'] = ver)
    }

    // 筛选框添加版本
    let version_rows = {}
    Object.keys(achievementVersion).forEach(k => {
        let r = k.split('.')[0]
        if (version_rows[r] === undefined) version_rows[r] = ''
        version_rows[r] += `<div class="item">${k}</div>`
    })
    let tmp = ''
    Object.values(version_rows).forEach(v => tmp += `<div class="row">${v}</div>`)
    page_achievement.querySelector('.achi_filter .dropdown .version').innerHTML = tmp
    // 筛选选项添加点击事件
    page_achievement.querySelectorAll('.achi_filter .dropdown .item').forEach(ele => {
        ele.addEventListener('click', e => {
            e.target.classList.toggle('on')
            let v = e.target.innerText
            let reload = false
            switch (v) {
                case '重置所有选项':
                    e.target.classList.toggle('on')
                    achiFilter = JSON.parse(JSON.stringify(achiFilterDefault))
                    page_achievement.querySelectorAll('.achi_filter .dropdown .item').forEach(e => {
                        e.classList.remove('on')
                    })
                    page_achievement.querySelector('.achi_filter .dropdown .order .item').classList.add('on')
                    reload = true
                    break
                case '未完成优先':
                    achiFilter.IncompFirst = !achiFilter.IncompFirst
                    reload = true
                    break
                case '已完成成就':
                    achiFilter.ShowComp = !achiFilter.ShowComp
                    break
                case '未完成成就':
                    achiFilter.ShowIncomp = !achiFilter.ShowIncomp
                    break
                case '隐藏成就':
                    achiFilter.ShowHidden = !achiFilter.ShowHidden
                    break
                case '非隐藏成就':
                    achiFilter.ShowVisible = !achiFilter.ShowVisible
                    break
                case '只显示互斥成就':
                    achiFilter.ShowMEOnly = !achiFilter.ShowMEOnly
                    break
                default:
                    let i = achiFilter.Version.indexOf(v)
                    if (i != -1)
                        achiFilter.Version.splice(i, 1)
                    else
                        achiFilter.Version.push(v)
            }
            let eq = true
            Object.keys(achiFilter).forEach(k => {
                if (k == 'Version') {
                    if (achiFilter['Version'].length != 0) {
                        eq = false
                    }
                } else if (achiFilter[k] != achiFilterDefault[k]) {
                    eq = false
                }
            })
            page_achievement.querySelector('.achi_filter .btn').classList.add('filtered')
            if (eq) page_achievement.querySelector('.achi_filter .btn').classList.remove('filtered')
            achiFlip.refresh()
            achiFilterRefresh(reload)
            achiFlip.play(200)
        })
    })

    // 批量操作选项添加点击事件
    page_achievement.querySelectorAll('.achi_batch_op .dropdown .batch .item').forEach(ele => {
        ele.addEventListener('click', async (e) => {
            if (e.target.innerText.slice(0, 2) != '确认') {
                e.target.innerText = '确认' + e.target.innerText
                return
            }
            let achiIDs = []
            let selectAll = e.target.innerText == '确认全选'
            page_achievement.querySelectorAll('.achi_box .item').forEach(i => {
                if (i.style.display == 'none') return
                let aid = i.getAttribute('achievement_id')
                if (isMEAchievement(aid)) return
                if (selectAll && (achiCurrData[aid] === undefined || achiCurrData[aid].status <= 1)) achiIDs.push(aid)
                if (!selectAll && (achiCurrData[aid] !== undefined && achiCurrData[aid].status > 1)) achiIDs.push(aid)
            })
            achiFlip.refresh()
            await setAchievementsStatus(achiIDs, e.target.innerText == '确认全选' ? 2 : 1)
            loadAchiData(achiCurrData)
            achiFlip.play(300)
            e.target.innerText = e.target.innerText.slice(2)
        })
        ele.addEventListener('mouseout', e => {
            if (e.target.innerText.slice(0, 2) == '确认') {
                e.target.innerText = e.target.innerText.slice(2)
                return
            }
        })
    })

    // 成就列表初始化
    Object.values(achievementData).forEach((achievement) => {
        itemDiv = document.createElement('div')
        itemDiv.setAttribute('class', 'item')
        itemDiv.setAttribute('series_id', achievement['SeriesID'])
        itemDiv.setAttribute('achievement_id', achievement['AchievementID'])
        itemDiv.setAttribute('series_priority', achievementSeries[achievement['SeriesID']]['Priority'])
        itemDiv.setAttribute('achievement_priority', achievement['Priority'])
        itemDiv.style.order = -(achievement['Priority'] + achievementSeries[achievement['SeriesID']]['Priority'] * 10000)
        const rarity_map = {
            'High': {
                'ico': 1,
                'rew': 20
            },
            'Mid': {
                'ico': 2,
                'rew': 10
            },
            'Low': {
                'ico': 3,
                'rew': 5
            }
        }
        let ico = achievementSeries[achievement['SeriesID']]['MainIconPath'].split('/').reverse()[0].replace(/.{4}$/, `${rarity_map[achievement['Rarity']]['ico']}.png`)
        let tit = textMap[achievement['AchievementTitle']['Hash']]
        let ver = achievement['Version']
        let showtype = achievement['ShowType'] == 'ShowAfterFinish' ? '隐藏' : ''
        let desc = textMap[achievement['AchievementDesc']['Hash']].replaceAll('\\n', '').replaceAll('<unbreak>', '').replaceAll('</unbreak>', '').replaceAll('</color>', '').replaceAll(/<color=.*?>/g, '').replaceAll('<u>', '').replaceAll('</u>', '')
        achievement['ParamList'].forEach((p, i) => {
            i += 1
            desc = desc.replaceAll(`#${i}[i]%`, `${p['Value'] * 100}%`)
            desc = desc.replaceAll(`#${i}[i]`, p['Value'])
            desc = desc.replaceAll(`#${i}[m]`, p['Value'])
            desc = desc.replaceAll(`#${i}`, p['Value'])
        })
        Object.entries(textReplaceMap).forEach(([k, hash]) => {
            desc = desc.replaceAll(k, textMap[hash])
        })
        main_desc = desc.includes('※') ? desc.split('※')[0] : desc
        sub_desc = desc.includes('※') ? '※' + desc.split('※')[1] : ''
        rew = rarity_map[achievement['Rarity']]['rew']
        itemDiv.innerHTML =
            `<div class="checkbox"> </div>
            <div class="ico"><img src="./img/hsr/achievement/${ico}"></div>
            <div class="title">
            <div class="content">${tit}</div>
                <div class="tags">
                    <div class="tag version">${ver}</div>
                    <div class="tag showtype">${showtype}</div>
                </div>
            </div>
            <div class="desc">
                <div class="main" title="${main_desc}">${main_desc}</div>
                <div class="sub" title="${sub_desc}">${sub_desc}</div>
            </div>
            <div class="time"></div>
            <div class="reward">
                <div class="pic"></div>
                <div class="txt">${rew}</div>
            </div>`
        document.querySelector('.achi_box').appendChild(itemDiv)
        achiSearchMap[achievement['AchievementID']] = `${tit}\n${main_desc}\n${sub_desc}`
    })
    document.querySelectorAll('.achi_box .item').forEach((e) => achiFlip.append(e))

    // 互斥成就复选框初始化
    document.querySelectorAll('.achi_box .item').forEach(e => {
        if (isMEAchievement(e.getAttribute('achievement_id'))) {
            let mearr = getMEAchievement(e.getAttribute('achievement_id'))
            let title = '互斥成就：\n'
            mearr.forEach(i => [
                title += `  ${textMap[achievementData[i]['AchievementTitle']['Hash']]}\n`
            ])
            e.setAttribute('title', title)
        }
    })

    // 成就数量统计
    achievementCount['series'] = {}
    Object.values(achievementSeries).forEach((series) => {
        achievementCount['series'][series['SeriesID']] = {
            'ori': 0,
            'me': 0,
            'fix': 0,
        }
    })
    Object.values(achievementData).forEach((achievement) => {
        achievementCount['series'][achievement['SeriesID']]['ori'] += 1
    })
    meAchievement.forEach((arr) => {
        achievementCount['series'][achievementData[arr[0]]['SeriesID']]['me'] += 1
        achievementCount['series'][achievementData[arr[0]]['SeriesID']]['fix'] -= arr.length - 1
    })
    achievementCount['ori'] = 0
    achievementCount['me'] = 0
    achievementCount['fix'] = 0
    Object.keys(achievementCount['series']).forEach((sid) => {
        achievementCount['series'][sid]['fix'] += achievementCount['series'][sid]['ori']
        achievementCount['ori'] += achievementCount['series'][sid]['ori']
        achievementCount['me'] += achievementCount['series'][sid]['me']
        achievementCount['fix'] += achievementCount['series'][sid]['fix']
    })

    // 加载上次查看的存档
    achiCurrUid = appSettings.LastAchievementUid
    achiCurrData = (await window.fireflyAPI.getAchiData(achiCurrUid)).data
    loadAchiData(achiCurrData)

    // 存档下拉框初始化
    achiUids = (await window.fireflyAPI.getAchiUids()).data
    document.querySelector('.achievement_head .uid_show .uid').innerText = achiCurrUid
    document.querySelector('.achievement_head .uid_show .nickname').innerText = achiUids[achiCurrUid]
    Object.keys(achiUids).forEach(async (uid) => {
        let userDiv = document.createElement('div')
        userDiv.setAttribute('class', 'user')
        userDiv.style.order = uid
        tmpAchiData = (await window.fireflyAPI.getAchiData(uid)).data
        userDiv.innerHTML =
            `<div class="nickname">${achiUids[uid]}</div>
            <div class="uid">${uid}</div>
            <div class="percentage">${(Object.keys(tmpAchiData).length / achievementCount['fix'] * 100).toFixed(0)}%</div>`
        document.querySelector('.achievement_head .uid_wrap .uid_dropdown').appendChild(userDiv)
    })

    // 成就复选框事件
    document.querySelectorAll('.achi_box .item .checkbox').forEach((checkbox) => {
        checkbox.addEventListener('click', async (e) => {
            if (!e.target.classList.contains('disabled')) {
                achiFlip.refresh()
                achidiv = e.target.closest('.item')
                achi_id = achidiv.getAttribute('achievement_id')
                await toggleAchievementStatus(achi_id)
                loadAchiData(achiCurrData)
                achiFlip.play(300)
            }
        })
    })
}

// 防抖函数（好像没用到？懒得删了）
var timeoutId
const debounce = (fun, delay) => {
    return () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(fun, delay)
    }
}

const achiDispalyRefresh = (blockAchiIDs) => {
    page_achievement.querySelectorAll('.achi_box .item').forEach(e => {
        if (blockAchiIDs.indexOf(e.getAttribute('achievement_id')) != -1)
            e.style.display = 'block'
        else
            e.style.display = 'none'
    })
}

const doFilter = (aids) => {
    if (achiFilter.ShowMEOnly) {
        let tmp = []
        aids.forEach(aid => {
            if (isMEAchievement(aid)) {
                tmp.push(aid)
            }
        })
        aids = tmp
    }
    if (achiFilter.ShowHidden || achiFilter.ShowVisible) {
        let tmp = []
        aids.forEach(aid => {
            if (achiFilter.ShowHidden && achievementData[aid]['ShowType'] == 'ShowAfterFinish') {
                tmp.push(aid)
            }
            if (achiFilter.ShowVisible && achievementData[aid]['ShowType'] != 'ShowAfterFinish') {
                tmp.push(aid)
            }
        })
        aids = tmp
    }
    if (achiFilter.ShowComp || achiFilter.ShowIncomp) {
        let tmp = []
        let comp_meachis = []
        Object.values(achiCurrData).forEach(achi => {
            if (achi['status'] > 1 && isMEAchievement(achi['id'])) {
                getMEAchievement(achi['id']).forEach(i => comp_meachis.push(i))
            }
        })
        aids.forEach(aid => {
            if (isMEAchievement(aid)) {
                if (achiFilter.ShowComp && comp_meachis.indexOf(aid) != -1) {
                    tmp.push(aid)
                }
                if (achiFilter.ShowIncomp && comp_meachis.indexOf(aid) == -1) {
                    tmp.push(aid)
                }
                return
            }
            if (achiFilter.ShowComp && (achiCurrData[aid] !== undefined && achiCurrData[aid]['status'] > 1)) {
                tmp.push(aid)
            }
            if (achiFilter.ShowIncomp && (achiCurrData[aid] === undefined || achiCurrData[aid]['status'] <= 1)) {
                tmp.push(aid)
            }
        })
        aids = tmp
    }
    if (achiFilter.Version.length != 0) {
        let tmp = []
        aids.forEach(aid => {
            if (achiFilter.Version.indexOf(achievementData[aid]['Version']) != -1) {
                tmp.push(aid)
            }
        })
        aids = tmp
    }

    return aids
}

const achiFilterRefresh = (reload = false) => {
    if (reload) loadAchiData(achiCurrData) // `未完成优先`切换后重排顺序
    let flag = true
    page_achievement.querySelectorAll('.achi_series .series').forEach(ele => {
        if (ele.classList.contains('select') && ele != allAchiSeries) {
            selectSeries(ele, false, false)
            flag = false
        }
    })
    if (flag) {
        doSearch(page_achievement.querySelector('.achi_search>.search_box').value, false)
    }
}

const selectSeries = (series, clearSearchbox = false, scrollTop = true) => {
    if (clearSearchbox) {
        page_achievement.querySelector('.achi_search>.search_box').value = ''
        page_achievement.querySelector('.achi_search>.search_clr').style.display = 'none'
        clearTimeout(timeoutId)
    }
    page_achievement.querySelectorAll('.achi_series .series').forEach(el => el.classList.remove('select'))
    series.classList.add('select')
    let sid = series.getAttribute('series_id')
    let blockIDs = []
    if (sid == 0) {
        blockIDs = Object.keys(achievementData)
    } else {
        Object.values(achievementData).forEach(achievement => {
            if (sid == achievement['SeriesID']) {
                blockIDs.push(achievement['AchievementID'] + '')
            }
        })
    }
    achiDispalyRefresh(doFilter(blockIDs))
    if (scrollTop) page_achievement.querySelector('.achi_box').scrollTop = 0
}

const doSearch = (str, playAnim = true) => {
    page_achievement.querySelector('.achi_series').scrollTop = 0
    if (playAnim) achiFlip.refresh()
    page_achievement.querySelectorAll('.achi_series .series').forEach(el => el.classList.remove('select'))
    allAchiSeries.classList.add('select')
    let blockIDs = []
    if (str == '') {
        blockIDs = Object.keys(achievementData)
    } else {
        for (let [aid, achistr] of Object.entries(achiSearchMap)) {
            if (aid == str || achistr.includes(str)) {
                blockIDs.push(aid)
            }
        }
    }
    achiDispalyRefresh(doFilter(blockIDs))
    if (playAnim) achiFlip.play(400)
}

const doDebounceSearch = (str) => debounce(() => doSearch(str), 500)()

var isComposed = true
document.querySelector('.achi_search>.search_box').addEventListener('compositionstart', () => isComposed = false)
document.querySelector('.achi_search>.search_box').addEventListener('compositionend', (e) => {
    isComposed = true
    v = e.target.value != '' ? 'block' : 'none'
    document.querySelector('.achi_search>.search_clr').style.setProperty('display', v)
    // doDebounceSearch(e.target.value)
})
document.querySelector('.achi_search>.search_box').addEventListener('input', (e) => {
    if (!isComposed) return
    v = e.target.value != '' ? 'block' : 'none'
    document.querySelector('.achi_search>.search_clr').style.setProperty('display', v)
    // doDebounceSearch(e.target.value)
})
document.querySelector('.achi_search>.search_box').addEventListener('keydown', e => {
    if (e.key == 'Enter') {
        clearTimeout(timeoutId)
        // document.querySelector('.achi_search>.search_box').blur()
        doSearch(e.target.value)
    }
})
document.querySelector('.achi_search>.search_clr').addEventListener('click', (e) => {
    document.querySelector('.achi_search>.search_box').value = ''
    e.target.style.setProperty('display', 'none')
    clearTimeout(timeoutId)
    doSearch('')
})
document.querySelector('.achi_search>.search_ico').addEventListener('click', (e) => {
    clearTimeout(timeoutId)
    document.querySelector('.achi_search>.search_box').blur()
    doSearch(document.querySelector('.achi_search>.search_box').value)
})

const toggleAchiUid = (forceHidden) => {
    let show = page_achievement.querySelector('.achievement_head .uid_show')
    let box = page_achievement.querySelector('.achievement_head .uid_dropdown')
    let ico = page_achievement.querySelector('.achievement_head .dropdown_ico')
    let isShow = ico.classList.contains('show')
    if (isShow || forceHidden) {
        show.classList.remove('show')
        box.classList.remove('show')
        ico.classList.remove('show')
    } else {
        show.classList.add('show')
        box.classList.add('show')
        ico.classList.add('show')
    }
}
const toggleAchiOp = (forceHidden) => {
    let btn = page_achievement.querySelector('.achievement_head .op_btn')
    let box = page_achievement.querySelector('.achievement_head .op_dropdown')
    let isShow = btn.classList.contains('show')
    if (isShow || forceHidden) {
        btn.classList.remove('show')
        box.classList.remove('show')
    } else {
        btn.classList.add('show')
        box.classList.add('show')
    }
}
const toggleAchiFilterDropdown = (forceHidden) => {
    let wrap = page_achievement.querySelector('.achievement_head .achi_filter')
    let isShow = wrap.classList.contains('show')
    if (isShow || forceHidden) {
        wrap.classList.remove('show')
    } else {
        wrap.classList.add('show')
    }
}
const toggleAchiBatchDropdown = (forceHidden) => {
    let wrap = page_achievement.querySelector('.achievement_head .achi_batch_op')
    let isShow = wrap.classList.contains('show')
    if (isShow || forceHidden) {
        wrap.classList.remove('show')
    } else {
        wrap.classList.add('show')
    }
}
page_achievement.querySelector('.achievement_head .uid_show').addEventListener('click', (e) => {
    toggleAchiUid(false)
    toggleAchiOp(true)
})
page_achievement.querySelector('.achievement_head .op_btn').addEventListener('click', (e) => {
    toggleAchiOp(false)
    toggleAchiUid(true)
})
page_achievement.querySelector('.achievement_head .achi_filter .btn').addEventListener('click', (e) => {
    toggleAchiFilterDropdown(false)
})
page_achievement.querySelector('.achievement_head .achi_batch_op .btn').addEventListener('click', (e) => {
    toggleAchiBatchDropdown(false)
})
// 点其他地方关闭下拉框
document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.achi_account') == null) {
        toggleAchiOp(true)
        toggleAchiUid(true)
    }
    if (e.target.closest('.achi_filter') == null) toggleAchiFilterDropdown(true)
    if (e.target.closest('.achi_batch_op') == null) toggleAchiBatchDropdown(true)
})

// 存档切换事件
document.querySelector('.achievement_head .uid_wrap .uid_dropdown').addEventListener('click', async (e) => {
    user = e.target.closest('.user')
    if (user == null) return
    achiCurrUid = user.querySelector('.uid').innerHTML
    achiCurrData = (await window.fireflyAPI.getAchiData(achiCurrUid, true)).data
    loadAchiData(achiCurrData)
    document.querySelector('.achievement_head .uid_show .uid').innerText = achiCurrUid
    document.querySelector('.achievement_head .uid_show .nickname').innerText = achiUids[achiCurrUid]
})

// 存档操作事件
const op_map = {
    '新建': {
        'class': 'achievement_newuser',
    },
    '重命名': {
        'class': 'achievement_rename',
    },
    '删除': {
        'class': 'achievement_deluser',
        'msg': '注意：该操作将导致成就存档被永久删除无法恢复'
    },
    '导入': {
        'class': 'achievement_import',
        'msg': '注意：该操作会覆盖当前存档，现有数据将永久丢失'
    },
    '导出': {
        'class': 'achievement_export'
    },
}
document.querySelector('.achievement_head .op_wrap .op_dropdown').addEventListener('click', (e) => {
    opdiv = e.target.closest('.item')
    if (opdiv == null) return
    qs = op_map[opdiv.querySelector('.text').innerText]
    if (qs === undefined) return
    switch (qs.class) {
        case 'achievement_rename':
            layer.querySelector(`.${qs.class} input`).setAttribute('placeholder', achiUids[achiCurrUid])
            break;
    }
    layer.querySelector(`.${qs.class} .msgbox`).innerText = (qs.msg === undefined ? '' : qs.msg)
    layer.querySelectorAll(`.${qs.class} input`).forEach(el => el.value = '')
    toggleAchiOp(true)
    layer.classList.add('show')
    layer.querySelector(`.${qs.class}`).classList.add('show')
})

// 新建存档
layer.querySelector('.achievement_newuser .btnarea .submit').addEventListener('click', async () => {
    const inputs = layer.querySelectorAll('.achievement_newuser .input_area input')
    let uid = inputs[0].value
    let nickname = inputs[1].value
    let msgbox = layer.querySelector('.achievement_newuser .msgbox')
    if (!/^\d{9}$/.test(uid)) {
        msgbox.innerText = 'UID应为9位数字'
    } else if (achiUids[uid] !== undefined) {
        msgbox.innerText = 'UID已存在'
    } else if (nickname == '') {
        msgbox.innerText = '备注不能为空'
    } else {
        ret = await window.fireflyAPI.newAchi(uid, nickname)
        if (ret.msg == 'OK') {
            layer.querySelector('.achievement_newuser').classList.remove('show')
            layer.classList.remove('show')
            achiUids[uid] = nickname
            achiCurrUid = uid
            achiCurrData = await window.fireflyAPI.getAchiData(uid, true)
            loadAchiData(achiCurrData)
            document.querySelector('.achievement_head .uid_show .uid').innerText = uid
            document.querySelector('.achievement_head .uid_show .nickname').innerText = nickname
            let newDiv = document.createElement('div')
            newDiv.setAttribute('class', 'user')
            newDiv.style.order = uid
            newDiv.innerHTML =
                `<div class="nickname">${nickname}</div>
                <div class="uid">${uid}</div>
                <div class="percentage">${(Object.keys(achiCurrData).length / achievementCount['fix'] * 100).toFixed(0)}%</div>`
            document.querySelector('.achievement_head .uid_wrap .uid_dropdown').appendChild(newDiv)
        } else {
            msgbox.innerText = ret.msg
        }
    }
})

// 重命名存档
layer.querySelector('.achievement_rename .btnarea .submit').addEventListener('click', async () => {
    const input = layer.querySelector('.achievement_rename input')
    let new_nickname = input.value
    let msgbox = layer.querySelector('.achievement_rename .msgbox')
    if (new_nickname == '') {
        msgbox.innerText = '新名称不能为空'
    } else {
        ret = await window.fireflyAPI.newAchi(achiCurrUid, new_nickname)
        if (ret.msg == 'OK') {
            layer.querySelector('.achievement_rename').classList.remove('show')
            layer.classList.remove('show')
            achiUids[achiCurrUid] = new_nickname
            document.querySelector('.achievement_head .uid_show .nickname').innerText = new_nickname
            document.querySelectorAll('.achievement_head .uid_wrap .uid_dropdown .user').forEach(el => {
                if (el.querySelector('.uid').innerHTML == achiCurrUid) {
                    el.querySelector('.nickname').innerText = new_nickname
                }
            })
        } else {
            msgbox.innerText = ret.msg
        }
    }
})

// 删除存档
layer.querySelector('.achievement_deluser .btnarea .submit').addEventListener('click', async () => {
    const input = layer.querySelector('.achievement_deluser input')
    let msgbox = layer.querySelector('.achievement_deluser .msgbox')
    if (input.value != '删除') {
        msgbox.innerText = '要确认删除当前存档，请在上方输入框内输入删除两字'
    } else if (Object.keys(achiUids).length == 1) {
        msgbox.innerText = '最后一个存档无法删除'
    } else {
        ret = await window.fireflyAPI.delAchi(achiCurrUid)
        if (ret.msg == 'OK') {
            layer.querySelector('.achievement_deluser').classList.remove('show')
            layer.classList.remove('show')
            delete achiUids[achiCurrUid]
            document.querySelectorAll('.achievement_head .uid_wrap .uid_dropdown .user').forEach(el => {
                if (el.querySelector('.uid').innerHTML == achiCurrUid) {
                    el.parentElement.removeChild(el)
                }
            })
            achiCurrUid = Object.keys(achiUids)[0]
            achiCurrData = (await window.fireflyAPI.getAchiData(achiCurrUid, true)).data
            loadAchiData(achiCurrData)
            document.querySelector('.achievement_head .uid_show .uid').innerText = achiCurrUid
            document.querySelector('.achievement_head .uid_show .nickname').innerText = achiUids[achiCurrUid]
            Alert.success('操作成功', '成就存档已删除', 5)
        } else {
            msgbox.innerText = ret.msg
        }
    }
})

// 导入存档
layer.querySelector('.achievement_import .btnarea .submit').addEventListener('click', async () => {
    let msgbox = layer.querySelector('.achievement_import .msgbox')
    let select = layer.querySelector('.achievement_import .input_area select')
    let ret = await window.fireflyAPI.importAchi(achiCurrUid, select.value)
    if (ret.msg == 'OK') {
        layer.querySelector('.achievement_import').classList.remove('show')
        layer.classList.remove('show')
        achiCurrData = (await window.fireflyAPI.getAchiData(achiCurrUid, true)).data
        loadAchiData(achiCurrData)
        Alert.success('操作成功', '成就存档已保存', 5)
    } else {
        msgbox.innerText = ret.msg
    }
})

// 导出存档
layer.querySelector('.achievement_export .btnarea .submit').addEventListener('click', async () => {
    let msgbox = layer.querySelector('.achievement_export .msgbox')
    let select = layer.querySelector('.achievement_export .input_area select')
    let ret = await window.fireflyAPI.exportAchi(achiCurrUid, select.value)
    if (ret.msg == 'OK') {
        layer.querySelector('.achievement_export').classList.remove('show')
        layer.classList.remove('show')
        Alert.success('操作成功', '成就存档已导出', 5)
    } else {
        msgbox.innerText = ret.msg
    }
})

layer.querySelectorAll('.layerbox .input_area').forEach(el => {
    el.addEventListener('keydown', (e) => {
        if (e.key == 'Tab') {
            let inputs = []
            e.target.closest('.input_area').querySelectorAll('input').forEach(ele => {
                if (ele.type == 'text') inputs.push(ele)
            })
            let target_index = -1
            inputs.forEach((input, i) => {
                if (input === e.target) target_index = i
            })
            if (target_index >= 0)
                inputs[(target_index + 1) % inputs.length].focus()
        } else if (e.key == 'Enter') {
            e.target.closest('.layerbox').querySelector('.submit').click()
        }
    })
})