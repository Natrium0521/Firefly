textMap = {}// 字典
meAchievement = []// 互斥成就
achievementSeries = {}
achievementData = {}
achievementCount = {}
achiFlip = new flip()
achiUids = {}
achiCurrUid = ''
achiCurrData = {}

const isMEAchievement = (aid) => {
    flag = false
    meAchievement.forEach((mearr) => {
        if (mearr.indexOf(aid) != -1) flag = true
    })
    return flag
}

const getMEAchievement = (aid) => {
    arr = []
    meAchievement.forEach((mearr) => {
        if (mearr.indexOf(aid) != -1) arr = mearr
    })
    return arr
}

const toggleAchievementStatus = async (achi_id) => {
    stat = 1
    if (achiCurrData[achi_id] === undefined || achiCurrData[achi_id].status == 1)
        stat = 2
    ret = await window.fireflyAPI.setAchiStatus(achiCurrUid, achi_id, stat)
    if (ret.data === null) {
        delete achiCurrData[achi_id]
    } else {
        achiCurrData[achi_id] = ret.data
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
                ele.style.order = -(ele.getAttribute('achievement_priority') * 1 + ele.getAttribute('series_priority') * 10000) + 100000
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
            document.querySelector('.achievement_head .achi_info').innerText = el.querySelector('.info').innerText
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

    // 成就列表初始化
    Object.values(achievementData).forEach((achievement) => {
        itemDiv = document.createElement('div')
        itemDiv.setAttribute('class', 'item')
        itemDiv.setAttribute('series_id', achievement['SeriesID'])
        itemDiv.setAttribute('achievement_id', achievement['AchievementID'])
        itemDiv.setAttribute('series_priority', achievementSeries[achievement['SeriesID']]['Priority'])
        itemDiv.setAttribute('achievement_priority', achievement['Priority'])
        itemDiv.style.order = -(achievement['Priority'] + achievementSeries[achievement['SeriesID']]['Priority'] * 10000)
        rarity_map = {
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
        ico = achievementSeries[achievement['SeriesID']]['MainIconPath'].split('/').reverse()[0].replace(/.{4}$/, `${rarity_map[achievement['Rarity']]['ico']}.png`)
        tit = textMap[achievement['AchievementTitle']['Hash']]
        desc = textMap[achievement['AchievementDesc']['Hash']].replaceAll('\\n', '').replaceAll('<unbreak>', '').replaceAll('</unbreak>', '').replaceAll('</color>', '').replaceAll(/<color=.*?>/g, '').replaceAll('<u>', '').replaceAll('</u>', '')
        achievement['ParamList'].forEach((p, i) => {
            i += 1
            desc = desc.replaceAll(`#${i}[i]%`, `${p['Value'] * 100}%`)
            desc = desc.replaceAll(`#${i}[i]`, p['Value'])
            desc = desc.replaceAll(`#${i}[m]`, p['Value'])
            desc = desc.replaceAll(`#${i}`, p['Value'])
        })
        desc = desc.replaceAll('{TEXTJOIN#54}', textMap['-262052143'])
        desc = desc.replaceAll('{NICKNAME}', textMap['-2090701432'])
        main_desc = desc.includes('※') ? desc.split('※')[0] : desc
        sub_desc = desc.includes('※') ? '※' + desc.split('※')[1] : ''
        rew = rarity_map[achievement['Rarity']]['rew']
        itemDiv.innerHTML =
            `<div class="checkbox"> </div>
            <div class="ico"><img src="./img/hsr/achievement/${ico}"></div>
            <div class="title">${tit}</div>
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
            e.querySelector('.checkbox').setAttribute('title', title)
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

// 防抖函数
var timeoutId
const debounce = (fun, delay) => {
    return () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(fun, delay)
    }
}

const selectSeries = (series, clearSearchbox = false) => {
    if (clearSearchbox) {
        document.querySelector('.achi_search>.search_box').value = ''
        document.querySelector('.achi_search>.search_clr').style.display = 'none'
        clearTimeout(timeoutId)
    }
    document.querySelectorAll('.achi_series .series').forEach(el => el.classList.remove('select'))
    series.classList.add('select')
    sid = series.getAttribute('series_id')
    document.querySelectorAll('.achi_box .item').forEach((el) => {
        if (sid == 0 || sid == el.getAttribute('series_id'))
            el.style.display = 'block'
        else
            el.style.display = 'none'
    })
    document.querySelector('.achi_box').scrollTop = 0
}

const doSearch = (str) => {
    achiFlip.refresh()
    selectSeries(allAchiSeries)
    document.querySelectorAll('.achi_box .item').forEach(ele => {
        if (str == '' || ele.querySelector('.title').innerText.includes(str) || ele.querySelector('.desc').innerText.includes(str))
            ele.style.display = 'block'
        else
            ele.style.display = 'none'
    })
    achiFlip.play(500)
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

const toggleUid = (forceHidden) => {
    show = document.querySelector('.uid_show')
    box = document.querySelector('.uid_dropdown')
    ico = document.querySelector('.dropdown_ico')
    isShow = ico.classList.contains('show')
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
const toggleOp = (forceHidden) => {
    btn = document.querySelector('.op_btn')
    box = document.querySelector('.op_dropdown')
    isShow = btn.classList.contains('show')
    if (isShow || forceHidden) {
        btn.classList.remove('show')
        box.classList.remove('show')
    } else {
        btn.classList.add('show')
        box.classList.add('show')
    }
}
document.querySelector('.uid_show').addEventListener('click', (e) => {
    toggleUid(false)
    toggleOp(true)
})
document.querySelector('.op_btn').addEventListener('click', (e) => {
    toggleOp(false)
    toggleUid(true)
})
// 点其他地方关闭下拉框
document.addEventListener('click', (e) => {
    if (e.target.closest('.achi_account') == null) {
        toggleOp(true)
        toggleUid(true)
    }
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

// 选择存档操作事件
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
    toggleOp(true)
    layer.classList.add('show')
    layer.querySelector(`.${qs.class}`).classList.add('show')
})

// 隐藏layer
layer.querySelectorAll('.layer .close').forEach(el => {
    el.addEventListener('click', (e) => {
        e.target.closest('.layerbox').classList.remove('show')
        layer.classList.remove('show')
    })
})
layer.addEventListener('click', (e) => {
    if (e.target == layer) {
        layer.querySelectorAll('.layerbox').forEach(el => { el.classList.remove('show') })
        layer.classList.remove('show')
    }
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