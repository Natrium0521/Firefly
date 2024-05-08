avatarConfig = {}
equipmentConfig = {}
gachaBasicInfo = {}
gachaPoolInfo = {}
gachaUids = {}
gachaCurrUid = ''
gachaCurrData = {}

let needUpdate = false

let cached_ret = {}
const getItemInfo = (item_id) => {
    item_id = item_id + ''
    if (cached_ret[item_id] !== undefined) return cached_ret[item_id]
    const lightcone_default = {
        icon_path: 'itemfigures/lightcone/Icon_TestLightcone01.png',
        name: item_id,
        rank_type: 5,
        is_lightcone: true,
        is_avatar: false,
    }
    const avatar_default = {
        icon_path: 'avataricon/999.png',
        name: item_id,
        rank_type: 5,
        is_lightcone: false,
        is_avatar: true,
    }
    let ret = {}
    if (item_id.length == 5) {
        if (equipmentConfig[item_id] === undefined) {
            needUpdate = true
            cached_ret[item_id] = lightcone_default
            return lightcone_default
        }
        ret.icon_path = `itemfigures/lightcone/${item_id}.png`
        ret.name = textMap[equipmentConfig[item_id].EquipmentName.Hash]
        ret.rank_type = equipmentConfig[item_id].Rarity.at(-1)
        ret.is_lightcone = true
        ret.is_avatar = false
    } else {
        if (avatarConfig[item_id] === undefined) {
            needUpdate = true
            cached_ret[item_id] = avatar_default
            return avatar_default
        }
        ret.icon_path = `avataricon/${item_id}.png`
        ret.name = textMap[avatarConfig[item_id].AvatarName.Hash]
        ret.rank_type = avatarConfig[item_id].Rarity.at(-1)
        ret.is_lightcone = false
        ret.is_avatar = true
    }
    cached_ret[item_id] = ret
    return ret
}


const loadGachaData = (data) => {
    data = Object.fromEntries(Object.entries(data).sort())
    let avatarPool = []
    let equipmentPool = []
    let normalPool = []
    let newbiePool = []
    Object.values(data).forEach(item => {
        switch (item['gacha_type']) {
            // gacha_type:
            //  11 限定角色
            //  12 限定光锥
            //  1 常驻
            //  2 新手
            case '11':
                avatarPool.push(item)
                break
            case '12':
                equipmentPool.push(item)
                break
            case '1':
                normalPool.push(item)
                break
            case '2':
                newbiePool.push(item)
                break
        }
    })

    // 限定角色
    let avatarBox = page_gacha.querySelector('.gacha_body .gacha_pool.avatar')
    avatarBox.querySelector('.show_box .card_view').innerHTML = ''
    avatarBox.querySelector('.show_box .list_view').innerHTML = ''
    avatarBox.querySelector('.count .total .number').innerText = avatarPool.length
    let guarantee5 = 0
    for (let i = avatarPool.length - 1; i >= 0; --i) {
        if (getItemInfo(avatarPool[i]['item_id']).rank_type == '5') {
            break
        }
        ++guarantee5
    }
    let guarantee4 = 0
    for (let i = avatarPool.length - 1; i >= 0; --i) {
        if (getItemInfo(avatarPool[i]['item_id']).rank_type == '4') {
            break
        }
        ++guarantee4
    }
    avatarBox.querySelector('.count .guarantee .star5 .number').innerText = guarantee5
    avatarBox.querySelector('.count .guarantee .star5 .bar').style.width = `${(guarantee5 / 90 * 100).toFixed(0)}%`
    avatarBox.querySelector('.count .guarantee .star4 .number').innerText = guarantee4
    avatarBox.querySelector('.count .guarantee .star4 .bar').style.width = `${(guarantee4 / 10 * 100).toFixed(0)}%`
    if (avatarPool.length > 0) {
        let firstDate = avatarPool[0]['time'].split(' ')[0].replaceAll('-', '.')
        let lastDate = avatarPool.at(-1)['time'].split(' ')[0].replaceAll('-', '.')
        avatarBox.querySelector('.analyze .time').innerText = `${firstDate} ~ ${lastDate}`
    } else {
        avatarBox.querySelector('.analyze .time').innerText = '~'
    }
    let star5AllCount = 0
    let star5UpCount = 0
    let star5History = []
    let cnt = 0
    avatarPool.forEach(item => {
        ++cnt
        let itemInfo = getItemInfo(item['item_id'])
        if (itemInfo.rank_type == '5') {
            ++star5AllCount
            let tmp = {
                'item_id': item['item_id'],
                'count': cnt,
                'time': item['time'],
                'is_up': false,
                'name': itemInfo.name,
                'icon_path': itemInfo.icon_path
            }
            if (gachaPoolInfo[item['gacha_id']] !== undefined && gachaPoolInfo[item['gacha_id']]['UpItems5'].indexOf(Number(item['item_id'])) != -1) {
                ++star5UpCount
                tmp['is_up'] = true
            }
            star5History.push(tmp)
            cnt = 0
        }
    })
    avatarBox.querySelector('.analyze .blocks .block:nth-child(1) .value .number').innerText = star5AllCount
    avatarBox.querySelector('.analyze .blocks .block:nth-child(2) .value .number').innerText = star5UpCount == 0 ? 0 : ((2 * star5UpCount - star5AllCount) / star5UpCount * 100).toFixed(0)
    avatarBox.querySelector('.analyze .blocks .block:nth-child(3) .value .number').innerText = star5AllCount == 0 ? 0 : ((avatarPool.length - guarantee5) / star5AllCount).toFixed(0)
    avatarBox.querySelector('.analyze .blocks .block:nth-child(4) .value .number').innerText = star5UpCount == 0 ? 0 : ((avatarPool.length - guarantee5) / star5UpCount).toFixed(0)
    star5History.reverse()
    star5History.forEach(item => {
        let card = document.createElement('div')
        card.classList.add('card')
        if (!item['is_up']) card.classList.add('noup')
        card.setAttribute('title', `${item['name']}\n${item['time']}`)
        card.innerHTML = `<div class="img"><img src="./img/hsr/${item['icon_path']}"></div><div class="txt">${item['count']}</div>`
        avatarBox.querySelector('.show_box .card_view').appendChild(card)
        let bar = document.createElement('div')
        bar.classList.add('bar')
        bar.setAttribute('title', item['time'])
        bar.innerHTML =
            `<div class="bgbar" style="animation-delay: -${(item['count'] / 90).toFixed(2)}s;"></div>
            <div class="img"><img src="./img/hsr/${item['icon_path']}"></div>
            <div class="name">${item['name']}</div>
            <div class="tag">${item['is_up'] ? 'UP' : '歪'}</div>
            <div class="txt">${item['count']}</div>`
        avatarBox.querySelector('.show_box .list_view').appendChild(bar)
    })

    // 限定光锥
    let equipmentBox = page_gacha.querySelector('.gacha_body .gacha_pool.lightcone')
    equipmentBox.querySelector('.show_box .card_view').innerHTML = ''
    equipmentBox.querySelector('.show_box .list_view').innerHTML = ''
    equipmentBox.querySelector('.count .total .number').innerText = equipmentPool.length
    guarantee5 = 0
    for (let i = equipmentPool.length - 1; i >= 0; --i) {
        if (getItemInfo(equipmentPool[i]['item_id']).rank_type == '5') {
            break
        }
        ++guarantee5
    }
    guarantee4 = 0
    for (let i = equipmentPool.length - 1; i >= 0; --i) {
        if (getItemInfo(equipmentPool[i]['item_id']).rank_type == '4') {
            break
        }
        ++guarantee4
    }
    equipmentBox.querySelector('.count .guarantee .star5 .number').innerText = guarantee5
    equipmentBox.querySelector('.count .guarantee .star5 .bar').style.width = `${(guarantee5 / 80 * 100).toFixed(0)}%`
    equipmentBox.querySelector('.count .guarantee .star4 .number').innerText = guarantee4
    equipmentBox.querySelector('.count .guarantee .star4 .bar').style.width = `${(guarantee4 / 10 * 100).toFixed(0)}%`
    if (equipmentPool.length > 0) {
        let firstDate = equipmentPool[0]['time'].split(' ')[0].replaceAll('-', '.')
        let lastDate = equipmentPool.at(-1)['time'].split(' ')[0].replaceAll('-', '.')
        equipmentBox.querySelector('.analyze .time').innerText = `${firstDate} ~ ${lastDate}`
    } else {
        equipmentBox.querySelector('.analyze .time').innerText = '~'
    }
    star5AllCount = 0
    star5UpCount = 0
    star5History = []
    cnt = 0
    equipmentPool.forEach(item => {
        ++cnt
        let itemInfo = getItemInfo(item['item_id'])
        if (itemInfo.rank_type == '5') {
            ++star5AllCount
            let tmp = {
                'item_id': item['item_id'],
                'count': cnt,
                'time': item['time'],
                'is_up': false,
                'name': itemInfo.name,
                'icon_path': itemInfo.icon_path
            }
            if (gachaPoolInfo[item['gacha_id']] !== undefined && gachaPoolInfo[item['gacha_id']]['UpItems5'].indexOf(Number(item['item_id'])) != -1) {
                ++star5UpCount
                tmp['is_up'] = true
            }
            star5History.push(tmp)
            cnt = 0
        }
    })
    equipmentBox.querySelector('.analyze .blocks .block:nth-child(1) .value .number').innerText = star5AllCount
    equipmentBox.querySelector('.analyze .blocks .block:nth-child(2) .value .number').innerText = star5UpCount == 0 ? 0 : ((2 * star5UpCount - star5AllCount) / star5UpCount * 100).toFixed(0)
    equipmentBox.querySelector('.analyze .blocks .block:nth-child(3) .value .number').innerText = star5AllCount == 0 ? 0 : ((equipmentPool.length - guarantee5) / star5AllCount).toFixed(0)
    equipmentBox.querySelector('.analyze .blocks .block:nth-child(4) .value .number').innerText = star5UpCount == 0 ? 0 : ((equipmentPool.length - guarantee5) / star5UpCount).toFixed(0)
    star5History.reverse()
    star5History.forEach(item => {
        let card = document.createElement('div')
        card.classList.add('card')
        if (!item['is_up']) card.classList.add('noup')
        card.setAttribute('title', `${item['name']}\n${item['time']}`)
        card.innerHTML = `<div class="img"><img src="./img/hsr/${item['icon_path']}"></div><div class="txt">${item['count']}</div>`
        equipmentBox.querySelector('.show_box .card_view').appendChild(card)
        let bar = document.createElement('div')
        bar.classList.add('bar')
        bar.setAttribute('title', item['time'])
        bar.innerHTML =
            `<div class="bgbar" style="animation-delay: -${(item['count'] / 80).toFixed(2)}s;"></div>
            <div class="img"><img src="./img/hsr/${item['icon_path']}"></div>
            <div class="name">${item['name']}</div>
            <div class="tag">${item['is_up'] ? 'UP' : '歪'}</div>
            <div class="txt">${item['count']}</div>`
        equipmentBox.querySelector('.show_box .list_view').appendChild(bar)
    })

    // 常驻+新手
    let normalBox = page_gacha.querySelector('.gacha_body .gacha_pool.normal')
    normalBox.querySelector('.show_box .card_view').innerHTML = ''
    normalBox.querySelector('.show_box .list_view').innerHTML = ''
    normalBox.querySelector('.count .total .number').innerText = normalPool.length
    guarantee5 = 0
    for (let i = normalPool.length - 1; i >= 0; --i) {
        if (getItemInfo(normalPool[i]['item_id']).rank_type == '5') {
            break
        }
        ++guarantee5
    }
    guarantee4 = 0
    for (let i = normalPool.length - 1; i >= 0; --i) {
        if (getItemInfo(normalPool[i]['item_id']).rank_type == '4') {
            break
        }
        ++guarantee4
    }
    normalBox.querySelector('.count .guarantee .star5 .number').innerText = guarantee5
    normalBox.querySelector('.count .guarantee .star5 .bar').style.width = `${(guarantee5 / 90 * 100).toFixed(0)}%`
    normalBox.querySelector('.count .guarantee .star4 .number').innerText = guarantee4
    normalBox.querySelector('.count .guarantee .star4 .bar').style.width = `${(guarantee4 / 10 * 100).toFixed(0)}%`
    if (normalPool.length > 0) {
        let firstDate = normalPool[0]['time'].split(' ')[0].replaceAll('-', '.')
        let lastDate = normalPool.at(-1)['time'].split(' ')[0].replaceAll('-', '.')
        normalBox.querySelector('.analyze .time').innerText = `${firstDate} ~ ${lastDate}`
    } else {
        normalBox.querySelector('.analyze .time').innerText = '~'
    }
    star5AllCount = 0
    star5History = []
    cnt = 0
    normalPool.forEach(item => {
        ++cnt
        let itemInfo = getItemInfo(item['item_id'])
        if (itemInfo.rank_type == '5') {
            ++star5AllCount
            star5History.push({ 'item_id': item['item_id'], 'count': cnt, 'time': item['time'], 'name': itemInfo.name, 'icon_path': itemInfo.icon_path })
            cnt = 0
        }
    })
    normalBox.querySelector('.analyze .blocks .block:nth-child(1) .value .number').innerText = star5AllCount
    normalBox.querySelector('.analyze .blocks .block:nth-child(2) .value .number').innerText = star5AllCount == 0 ? 0 : ((normalPool.length - guarantee5) / star5AllCount).toFixed(0)
    star5History.reverse()
    star5History.forEach(item => {
        let card = document.createElement('div')
        card.classList.add('card')
        card.setAttribute('title', `${item['name']}\n${item['time']}`)
        card.innerHTML = `<div class="img"><img src="./img/hsr/${item['icon_path']}"></div><div class="txt">${item['count']}</div>`
        normalBox.querySelector('.show_box .card_view').appendChild(card)
        let bar = document.createElement('div')
        bar.classList.add('bar')
        bar.setAttribute('title', item['time'])
        bar.innerHTML =
            `<div class="bgbar" style="animation-delay: -${(item['count'] / 90).toFixed(2)}s;"></div>
            <div class="img"><img src="./img/hsr/${item['icon_path']}"></div>
            <div class="name">${item['name']}</div>
            <div class="txt">${item['count']}</div>`
        normalBox.querySelector('.show_box .list_view').appendChild(bar)
    })


    star5AllCount = 0
    star5History = []
    cnt = 0
    newbiePool.forEach(item => {
        ++cnt
        itemInfo = getItemInfo(item['item_id'])
        if (itemInfo.rank_type == '5') {
            ++star5AllCount
            star5History.push({ 'item_id': item['item_id'], 'count': cnt, 'time': item['time'], 'name': itemInfo.name, 'icon_path': itemInfo.icon_path })
            cnt = 0
        }
    })
    normalBox.querySelector('.analyze .blocks .block:nth-child(3) .value .number').innerText = star5AllCount
    normalBox.querySelector('.analyze .blocks .block:nth-child(4) .value .number').innerText = star5AllCount == 0 ? 0 : ((newbiePool.length - cnt) / star5AllCount).toFixed(0)
    star5History.reverse()
    star5History.forEach(item => {
        let card = document.createElement('div')
        card.classList.add('card')
        card.classList.add('newbie')
        card.setAttribute('title', `${item['name']}\n${item['time']}`)
        card.innerHTML = `<div class="img"><img src="./img/hsr/${item['icon_path']}"></div><div class="txt">${item['count']}</div>`
        normalBox.querySelector('.show_box .card_view').appendChild(card)
        let bar = document.createElement('div')
        bar.classList.add('bar')
        bar.setAttribute('title', item['time'])
        bar.innerHTML =
            `<div class="bgbar" style="animation-delay: -${(item['count'] / 90).toFixed(2)}s;"></div>
            <div class="img"><img src="./img/hsr/${item['icon_path']}"></div>
            <div class="name">${item['name']}</div>
            <div class="tag">新</div>
            <div class="txt">${item['count']}</div>`
        normalBox.querySelector('.show_box .list_view').appendChild(bar)
    })

    if (needUpdate) Alert.warning('工具箱需要更新', '当前工具箱已不适配新游戏版本<br>这将导致图片资源等显示异常（不会影响数据的正确性，更新后可恢复正常）<br>建议尽早前往设置中的GitHub链接下载更新')
}

const initGacha = async () => {
    // 加载上次查看跃迁记录
    gachaCurrUid = appSettings.LastGachaUid
    gachaCurrData = (await window.fireflyAPI.getGachaData(gachaCurrUid)).data
    loadGachaData(gachaCurrData)
    // uid下拉框
    gachaUids = (await window.fireflyAPI.getGachaUids()).data
    document.querySelector('.gacha_head .uid_show .uid').innerText = gachaCurrUid
    document.querySelector('.gacha_head .uid_show .nickname').innerText = gachaUids[gachaCurrUid]
    document.querySelector('.gacha_head .uid_wrap .uid_dropdown').innerHTML = ''
    Object.keys(gachaUids).forEach(uid => {
        let userDiv = document.createElement('div')
        userDiv.classList.add('user')
        userDiv.style.order = uid
        userDiv.innerHTML =
            `<div class="nickname">${gachaUids[uid]}</div>
            <div class="uid">${uid}</div>`
        document.querySelector('.gacha_head .uid_wrap .uid_dropdown').appendChild(userDiv)
    })
}


// uid
const toggleGachaUid = (forceHidden) => {
    show = document.querySelector('.gacha_head .uid_show')
    box = document.querySelector('.gacha_head .uid_dropdown')
    ico = document.querySelector('.gacha_head .dropdown_ico')
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
document.querySelector('.gacha_head .uid_show').addEventListener('click', (e) => {
    toggleGachaUid(false)
})

// refresh
document.querySelector('.gacha_head .refresh_wrap').addEventListener('click', (e) => {
    layer.querySelector('.gacha_refresh .title').innerText = '刷新记录'
    layer.querySelector('.gacha_refresh .btnarea .submit').innerText = '刷新'
    layer.querySelector('.gacha_refresh .url_area textarea').value = ''
    layer.querySelector('.gacha_refresh .card_area').innerHTML = ''
    layer.querySelector('.gacha_refresh .msgbox').innerHTML = '自动获取URL前请在游戏内先查看一次跃迁记录页面<br>若从URL中读取的UID不存在将自动新建对应记录'
    layer.classList.add('show')
    layer.querySelector('.gacha_refresh').classList.add('show')
    layer.querySelector('.gacha_refresh').classList.remove('expand')
})
layer.querySelector('.gacha_refresh .url_area .btn').addEventListener('click', async (e) => {
    let ret = await window.fireflyAPI.getGachaUrl()
    let urlinput = layer.querySelector('.gacha_refresh .url_area textarea')
    let msgbox = layer.querySelector('.gacha_refresh .msgbox')
    if (ret.msg == 'OK') {
        urlinput.value = ret.data.url
        msgbox.innerHTML = "成功从网页缓存中获取URL<br>点击下方按钮开始请求数据"
    } else {
        msgbox.innerHTML = "自动获取URL失败，请先在游戏内打开跃迁记录页面并翻看几次"
    }
})
layer.querySelector('.gacha_refresh .btnarea .submit').addEventListener('click', async (e) => {
    if (!layerCanBeHidden) return
    let msgbox = layer.querySelector('.gacha_refresh .msgbox')
    let showbox = layer.querySelector('.gacha_refresh .card_area')
    showbox.innerHTML = ''
    // check url is mihoyo link
    let url = layer.querySelector('.gacha_refresh .url_area textarea').value
    if (url == '') {
        msgbox.innerHTML = '请先填入链接或尝试自动获取链接'
        return
    }
    try {
        url = new URL(url)
    } catch (error) {
        msgbox.innerHTML = 'URL错误'
        return
    }
    if (url.hostname != 'api-takumi.mihoyo.com' || url.pathname != '/common/gacha_record/api/getGachaLog') {
        msgbox.innerHTML = '非米哈游抽卡分析链接'
        return
    }
    // check authkey expire? error?
    const baseKeys = ['authkey_ver', 'authkey', 'game_biz', 'lang']
    let params = {}
    for ([k, v] of url.searchParams) {
        if (baseKeys.indexOf(k) != -1)
            params[k] = encodeURIComponent(v)
    }
    let baseURL = `https://api-takumi.mihoyo.com/common/gacha_record/api/getGachaLog?authkey_ver=${params['authkey_ver']}&authkey=${params['authkey']}&game_biz=${params['game_biz']}&lang=${params['lang']}&size=20`
    let region_time_zone = 0
    let flag = true
    await fetch(baseURL).then(response => response.json()).then(ret => {
        if (ret.retcode == 0) {
            flag = false
            region_time_zone = ret.data.region_time_zone
        } else if (ret.retcode == -101) {
            msgbox.innerHTML = '链接已过期<br>请在游戏内重新查看跃迁记录页面再尝试自动获取'
        } else {
            msgbox.innerHTML = `请求数据失败<br>${ret.retcode}: ${ret.message}`
        }
    }).catch(error => { msgbox.innerHTML = error })
    if (flag) return
    // set css show and disable layerHidden
    layer.querySelector('.gacha_refresh').classList.add('expand')
    layerCanBeHidden = false
    // fetch and show
    let data = { 'info': {}, 'list': [] }
    const sleep = (time) => {
        return new Promise(res => {
            setTimeout(res, time)
        })
    }
    const isIncrementallyRefresh = layer.querySelector('.gacha_refresh .btnarea .submit').innerText == '刷新'
    let fetchingGachaUid = undefined
    let fetchingGachaData = {}
    const GachaTypes = { '1': '常驻', '2': '新手', '11': '限定角色', '12': '限定光锥' }
    for (let [gacha_type, gacha_name] of Object.entries(GachaTypes)) {
        let cnt = 0
        let end_id = '0'
        let exitFlag = false
        while (true) {
            let items = []
            await fetch(baseURL + `&gacha_type=${gacha_type}&end_id=${end_id}`).then(response => response.json()).then(ret => {
                if (ret.retcode != 0) {
                    msgbox.innerHTML = `请求数据失败<br>${ret.retcode}: ${ret.message}`
                    exitFlag = true
                } else {
                    items = ret.data.list
                }
            }).catch(error => {
                msgbox.innerHTML = error
                exitFlag = true
            })
            if (exitFlag) {
                layerCanBeHidden = true
                return
            }
            let containsRepeat = false
            if (isIncrementallyRefresh && items.length != 0) {
                if (fetchingGachaUid === undefined) {
                    fetchingGachaUid = items[0].uid
                    if (gachaUids[fetchingGachaUid] !== undefined) {
                        fetchingGachaData = (await window.fireflyAPI.getGachaData(fetchingGachaUid)).data
                    }
                }
                let tmp = items
                items = []
                tmp.forEach(item => {
                    if (fetchingGachaData[item.id] === undefined) items.push(item)
                })
                if (tmp.length != items.length) containsRepeat = true
            }
            if (items.length == 0) break
            end_id = items.at(-1).id
            if (Object.keys(data.info) == 0) {
                data.info = {
                    'srgf_version': 'v1.0',
                    'uid': items[0].uid,
                    'lang': items[0].lang,
                    'region_time_zone': region_time_zone
                }
            }
            items.forEach(i => data.list.push(i))
            let showing = items.splice(0, 5)
            while (showing.length > 0) {
                cnt += showing.length
                showing.forEach(item => {
                    let tmp = document.createElement('div')
                    tmp.classList.add('card')
                    tmp.classList.add(`star${item.rank_type}`)
                    tmp.innerHTML = `<img src="./img/hsr/${getItemInfo(item.item_id).icon_path}">`
                    // tmp.innerHTML = `<img src="./img/hsr/${item.item_id.length == 5 ? 'itemfigures/lightcone' : 'avataricon'}/${item.item_id}.png">`
                    tmp.setAttribute('title', `${item.name}\n${item.time}`)
                    showbox.appendChild(tmp)
                })
                showbox.scrollTop = showbox.scrollHeight - showbox.clientHeight;
                msgbox.innerHTML = `正在请求UID: ${data.info.uid} 的跃迁记录<br>已获取${cnt}条${gacha_name}池记录`
                await sleep(100)
                showing = items.splice(0, 5)
            }
            if (isIncrementallyRefresh && containsRepeat) break
        }
        await sleep(500)
    }
    // save data and enable layerHidden
    // switch to new gacha record
    layerCanBeHidden = true
    if (data.list.length == 0) {
        msgbox.innerHTML = '未从链接中获取跃迁数据'
        if (isIncrementallyRefresh) {
            msgbox.innerHTML = '增量刷新失败：无新跃迁记录<br>可尝试从链接导入以进行全量刷新'
            Alert.warning('增量刷新失败', '无跃迁记录', 5)
        }
    } else {
        let ret = await window.fireflyAPI.importGacha('srgf_v1.0', data)
        if (ret.msg == 'OK') {
            appSettings.LastGachaUid = ret.data.uid
            await initGacha()
            msgbox.innerHTML = `UID: ${ret.data.uid} 跃迁记录${layer.querySelector('.gacha_refresh .btnarea .submit').innerText}成功`
            Alert.success('操作成功', '记录已保存', 5)
        } else {
            msgbox.innerHTML = ret.msg
        }
    }
})

// rename
document.querySelector('.gacha_head .rename_wrap').addEventListener('click', (e) => {
    layer.querySelector('.gacha_rename .msgbox').innerText = ''
    layer.querySelector('.gacha_rename input').value = ''
    layer.querySelector('.gacha_rename input').setAttribute('placeholder', gachaUids[gachaCurrUid])
    layer.classList.add('show')
    layer.querySelector('.gacha_rename').classList.add('show')
})
layer.querySelector('.gacha_rename .submit').addEventListener('click', async (e) => {
    let new_nickname = layer.querySelector('.gacha_rename input').value
    let msgbox = layer.querySelector('.gacha_rename .msgbox')
    if (new_nickname == '') {
        msgbox.innerText = '新名称不能为空'
    } else {
        ret = await window.fireflyAPI.newGacha(gachaCurrUid, new_nickname)
        if (ret.msg == 'OK') {
            layer.querySelector('.gacha_rename').classList.remove('show')
            layer.classList.remove('show')
            gachaUids[gachaCurrUid] = new_nickname
            document.querySelector('.gacha_head .uid_show .nickname').innerText = new_nickname
            document.querySelectorAll('.gacha_head .uid_wrap .uid_dropdown .user').forEach(ele => {
                if (ele.querySelector('.uid').innerHTML == gachaCurrUid) {
                    ele.querySelector('.nickname').innerText = new_nickname
                }
            })
        } else {
            msgbox.innerText = ret.msg
        }
    }
})

// import
document.querySelector('.gacha_head .import_wrap .dropdown .file').addEventListener('click', (e) => {
    layer.querySelector('.gacha_import .msgbox').innerText = '若UID已存在将合并记录，不存在则自动新建记录'
    layer.classList.add('show')
    layer.querySelector('.gacha_import').classList.add('show')
})
layer.querySelector('.gacha_import .submit').addEventListener('click', async () => {
    let msgbox = layer.querySelector('.gacha_import .msgbox')
    let select = layer.querySelector('.gacha_import .input_area select')
    let ret = await window.fireflyAPI.importGacha(select.value)
    if (ret.msg == 'OK') {
        layer.querySelector('.gacha_import').classList.remove('show')
        layer.classList.remove('show')
        appSettings.LastGachaUid = ret.data.uid
        await initGacha()
    } else {
        msgbox.innerText = ret.msg
    }
})
document.querySelector('.gacha_head .import_wrap .dropdown .url').addEventListener('click', (e) => {
    layer.querySelector('.gacha_refresh .title').innerText = '从链接导入'
    layer.querySelector('.gacha_refresh .btnarea .submit').innerText = '导入'
    layer.querySelector('.gacha_refresh .url_area textarea').value = ''
    layer.querySelector('.gacha_refresh .card_area').innerHTML = ''
    layer.querySelector('.gacha_refresh .msgbox').innerHTML = '自动获取URL前请在游戏内先查看一次跃迁记录页面<br>若从URL中读取的UID不存在将自动新建对应记录'
    layer.classList.add('show')
    layer.querySelector('.gacha_refresh').classList.add('show')
    layer.querySelector('.gacha_refresh').classList.remove('expand')
})

// export
document.querySelector('.gacha_head .export_wrap').addEventListener('click', (e) => {
    if (needUpdate) {
        Alert.warning('工具箱需要更新', '为防止导出数据有误，请前往设置中的GitHub链接下载更新后再尝试导出')
        return
    }
    layer.querySelector('.gacha_export .msgbox').innerText = ''
    layer.classList.add('show')
    layer.querySelector('.gacha_export').classList.add('show')
})
layer.querySelector('.gacha_export .submit').addEventListener('click', async () => {
    let msgbox = layer.querySelector('.gacha_export .msgbox')
    let select = layer.querySelector('.gacha_export .input_area select')
    let ret = await window.fireflyAPI.exportGacha(gachaCurrUid, select.value)
    if (ret.msg == 'OK') {
        layer.querySelector('.gacha_export').classList.remove('show')
        layer.classList.remove('show')
    } else {
        msgbox.innerText = ret.msg
    }
})

// delete
document.querySelector('.gacha_head .delete_wrap').addEventListener('click', (e) => {
    layer.querySelector('.gacha_delete .msgbox').innerText = '注意：该操作将导致跃迁记录被永久删除无法恢复'
    layer.querySelector('.gacha_delete input').value = ''
    layer.classList.add('show')
    layer.querySelector('.gacha_delete').classList.add('show')
})
layer.querySelector('.gacha_delete .submit').addEventListener('click', async (e) => {
    let msgbox = layer.querySelector('.gacha_delete .msgbox')
    if (layer.querySelector('.gacha_delete input').value != '删除') {
        msgbox.innerText = '要确认删除当前记录，请在上方输入框内输入删除两字'
    } else if (Object.keys(gachaUids).length == 1) {
        msgbox.innerText = '最后一个记录无法删除'
    } else {
        ret = await window.fireflyAPI.delGacha(gachaCurrUid)
        if (ret.msg == 'OK') {
            layer.querySelector('.gacha_delete').classList.remove('show')
            layer.classList.remove('show')
            delete gachaUids[gachaCurrUid]
            document.querySelectorAll('.gacha_head .uid_wrap .uid_dropdown .user').forEach(ele => {
                if (ele.querySelector('.uid').innerHTML == gachaCurrUid) {
                    ele.parentElement.removeChild(ele)
                }
            })
            gachaCurrUid = Object.keys(gachaUids)[0]
            gachaCurrData = (await window.fireflyAPI.getGachaData(gachaCurrUid, true)).data
            loadGachaData(gachaCurrData)
            document.querySelector('.gacha_head .uid_show .uid').innerText = gachaCurrUid
            document.querySelector('.gacha_head .uid_show .nickname').innerText = gachaUids[gachaCurrUid]
        } else {
            msgbox.innerText = ret.msg
        }
    }
})


// 点其他地方关闭下拉框
document.addEventListener('click', (e) => {
    if (e.target.closest('.gacha_head .uid_wrap') == null) {
        toggleGachaUid(true)
    }
})

// uid切换事件
document.querySelector('.gacha_head .uid_wrap .uid_dropdown').addEventListener('click', async (e) => {
    user = e.target.closest('.user')
    if (user == null) return
    gachaCurrUid = user.querySelector('.uid').innerHTML
    gachaCurrData = (await window.fireflyAPI.getGachaData(gachaCurrUid, true)).data
    loadGachaData(gachaCurrData)
    document.querySelector('.gacha_head .uid_show .uid').innerText = gachaCurrUid
    document.querySelector('.gacha_head .uid_show .nickname').innerText = gachaUids[gachaCurrUid]
})

// 跃迁记录展示区域切换卡片视图和列表视图
document.querySelectorAll('.gacha_pool .title .btns .btn').forEach(ele => {
    ele.addEventListener('click', e => {
        let btn = e.target.closest('.btn')
        if (btn.classList.contains('on')) return
        btn.closest('.btns').querySelector('.listview').classList.toggle('on')
        btn.closest('.btns').querySelector('.cardview').classList.toggle('on')
        btn.closest('.gacha_pool').querySelector('.show_box .card_view').classList.toggle('show')
        btn.closest('.gacha_pool').querySelector('.show_box .list_view').classList.toggle('show')
        btn.closest('.btns').querySelector('.slider').classList.toggle('toggle')
    })
})

