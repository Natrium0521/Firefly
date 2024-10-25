<template>
    <div class="gacha-head">
        <div class="gacha-head-uid">
            <UidDropdown :uids="gachaUids" :showing-uid="showingUid" @select-uid="selectUid" />
        </div>
        <GachaHeadButton :icon-path="RefreshIcon" btn-title="刷新" btn-class="white" @click="showingAlert = 'refresh'" />
        <Alert id="alert-refresh" v-if="showingAlert === 'refresh'" @close="!isRefreshing && (showingAlert = 'none')" title="刷新记录" @vue:mounted="refreshingItems = []">
            <div class="url-area" :class="{ shrink: refreshingItems.length > 0 }">
                <div class="label">URL:</div>
                <div class="btn" @click="onGetUrlConfirm">自动获取</div>
                <textarea ref="refreshUrlTextarea" spellcheck="false" placeholder="https://public-operation-hkrpg.mihoyo.com/common/gacha_record/api/getGachaLog?"></textarea>
            </div>
            <div class="card-area" :class="{ show: refreshingItems.length > 0 }" ref="refreshCardArea">
                <CardGridItem v-for="item in refreshingItems" :key="item.id" :item="item" />
            </div>
            <div class="warning-area" ref="refreshWarningArea">自动获取URL前请先在游戏内查看一次跃迁记录并多翻看几页<br />未被记录过的UID会自动新建记录并保存</div>
            <div class="button-area">
                <div class="button" @click="!isRefreshing && (showingAlert = 'none')">取消</div>
                <div class="button theme" title="请求能获取的所有记录" @click="onRefreshConfirm(false)">全量</div>
                <div class="button theme" title="请求到已存在的记录就立即停止" @click="onRefreshConfirm(true)">增量</div>
            </div>
        </Alert>
        <GachaHeadButton :icon-path="RenameIcon" btn-title="重命名" btn-class="white" @click="showingAlert = 'rename'" />
        <Alert id="alert-rename" v-if="showingAlert === 'rename'" @close="showingAlert = 'none'" title="修改当前记录名称" @vue:mounted="renameInput.focus()">
            <div class="input-item-area">
                <span>名称：</span>
                <input ref="renameInput" type="text" :placeholder="gachaUids[showingUid]" spellcheck="false" @keydown="$event.key === 'Enter' && onRenameConfirm()" />
            </div>
            <div class="warning-area" ref="renameWarningArea"></div>
            <div class="button-area">
                <div class="button" @click="showingAlert = 'none'">取消</div>
                <div class="button theme" @click="onRenameConfirm">重命名</div>
            </div>
        </Alert>
        <GachaHeadButton :icon-path="SwitchIcon" :btn-title="gachaViewTypeNext" btn-class="theme" @click="switchGachaPool" ref="switchButton" />
        <GachaHeadButton :icon-path="ImportIcon" btn-title="导入" btn-class="hover-drop" class="import-button" @mouseenter="showImportDropdown = true" @mouseleave="showImportDropdown = false">
            <div class="import-dropdown" :class="{ show: showImportDropdown }">
                <div class="import-dropdown-item" @click="showingAlert = 'import'">
                    <img :src="FromFileIcon" />
                    <div>从文件导入</div>
                </div>
                <div class="import-dropdown-item" @click="showingAlert = 'refresh'">
                    <img :src="FromLinkIcon" />
                    <div>从链接导入</div>
                </div>
            </div>
        </GachaHeadButton>
        <Alert id="alert-import" v-if="showingAlert === 'import'" @close="showingAlert = 'none'" title="导入记录">
            <div class="select-item-area">
                <span>导入格式：</span>
                <select ref="importTypeSelect">
                    <option value="uigf_v4.0">UIGF v4.0</option>
                    <option value="srgf_v1.0">SRGF v1.0</option>
                </select>
            </div>
            <div class="warning-area" ref="importWarningArea">若UID已存在将合并记录，不存在则自动新建记录</div>
            <div class="button-area">
                <div class="button" @click="showingAlert = 'none'">取消</div>
                <div class="button theme" @click="onImportConfirm">导入</div>
            </div>
        </Alert>
        <GachaHeadButton :icon-path="ExportIcon" btn-title="导出" btn-class="white" @click="showingAlert = 'export'" />
        <Alert id="alert-export" v-if="showingAlert === 'export'" @close="showingAlert = 'none'" title="导出记录" @vue:mounted="onSelectExportFormat">
            <div class="select-item-area">
                <span>导出格式：</span>
                <select ref="exportTypeSelect" @change="onSelectExportFormat">
                    <option value="uigf_v4.0">UIGF v4.0</option>
                    <option value="srgf_v1.0">SRGF v1.0</option>
                </select>
            </div>
            <div class="warning-area" ref="exportWarningArea"></div>
            <div class="button-area">
                <div class="button" @click="showingAlert = 'none'">取消</div>
                <div class="button theme" @click="onExportConfirm">导出</div>
            </div>
        </Alert>
        <GachaHeadButton :icon-path="DeleteIcon" btn-title="删除" btn-class="red" @click="showingAlert = 'delete'" />
        <Alert id="alert-delete" v-if="showingAlert === 'delete'" @close="showingAlert = 'none'" title="删除当前记录">
            <div class="input-item-area">
                <span>确认：</span>
                <input ref="deleteInput" type="text" placeholder="请输入 删除" spellcheck="false" @keydown="$event.key === 'Enter' && onDeleteConfirm()" />
            </div>
            <div class="warning-area" ref="deleteWarningArea">注意：该操作将导致跃迁记录被永久删除无法恢复</div>
            <div class="button-area">
                <div class="button" @click="showingAlert = 'none'">取消</div>
                <div class="button theme" @click="onDeleteConfirm">删除</div>
            </div>
        </Alert>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import emitter from '../../../utils/mitt';
import UidDropdown from '../../../components/UidDropdown.vue';
import GachaHeadButton from './GachaHeadButton.vue';
import Alert from '../../../components/Alert.vue';
import CardGridItem from './CardGridItem.vue';
import RefreshIcon from '../../../assets/image/svg/refresh.svg';
import RenameIcon from '../../../assets/image/svg/rename.svg';
import SwitchIcon from '../../../assets/image/svg/switch.svg';
import ImportIcon from '../../../assets/image/svg/import.svg';
import ExportIcon from '../../../assets/image/svg/export.svg';
import DeleteIcon from '../../../assets/image/svg/delete.svg';
import FromFileIcon from '../../../assets/image/svg/file-code.svg';
import FromLinkIcon from '../../../assets/image/svg/link.svg';
import { useUserGacha } from '../../../store/usergacha';

const gachaViewTypeNext = ref('卡池');
const userGachaStore = useUserGacha();

const gachaUids = computed(() => userGachaStore.gachaUids ?? {});
const showingUid = computed(() => userGachaStore.gachaCurrUid);

function selectUid(uid: string) {
    userGachaStore.setCurrGachaUid(uid);
}

const switchButton = ref<{ icon: HTMLImageElement }>(null);
function switchGachaPool() {
    switchButton.value.icon.animate([{ rotate: '0deg' }, { rotate: '180deg' }], { duration: 300, fill: 'backwards', easing: 'ease' });
    emitter.emit('gacha:toggleGachaView', gachaViewTypeNext.value);
    gachaViewTypeNext.value = gachaViewTypeNext.value === '卡池' ? '分类' : '卡池';
}

const showImportDropdown = ref(false);

const isRefreshing = ref(false);
const refreshingItems = ref([]);

const refreshWarningArea = ref<HTMLDivElement>(null);
const refreshUrlTextarea = ref<HTMLTextAreaElement>(null);
const refreshCardArea = ref<HTMLDivElement>(null);
const onRefreshConfirm = async (isIncremental: boolean) => {
    const warningSpan = refreshWarningArea.value;
    if (isRefreshing.value) return;
    warningSpan.innerHTML = '<br>准备请求数据';
    // 检查URL合法性
    const url = refreshUrlTextarea.value.value + '';
    if (url == '') {
        warningSpan.innerHTML = '<br>请先填入链接或尝试自动获取链接';
        return;
    }
    let urlObj: URL = null;
    try {
        urlObj = new URL(url);
    } catch (error) {
        warningSpan.innerHTML = '<br>URL错误';
        return;
    }
    if (!urlObj.hostname.endsWith('mihoyo.com') || !urlObj.pathname.match(/gacha/i)) {
        warningSpan.innerHTML = '<br>非米哈游抽卡分析链接';
        return;
    }
    // 检查URL状态
    const baseKeys = ['authkey_ver', 'authkey', 'game_biz', 'lang'];
    const baseParams = new URLSearchParams(Array.from(urlObj.searchParams.entries()).filter(([k]) => baseKeys.includes(k)));
    urlObj.search = baseParams.toString() + '&size=20';
    let region_time_zone = 0;
    let flag = true;
    await fetch(urlObj)
        .then((response) => response.json())
        .then((data) => {
            if (data['retcode'] == 0) {
                flag = false;
                region_time_zone = data['data']['region_time_zone'];
            } else if (data['retcode'] == -101) {
                warningSpan.innerHTML = '链接已过期<br>请在游戏内重新查看跃迁记录并多翻看几页再尝试自动获取';
            } else {
                warningSpan.innerHTML = `数据请求失败<br>${data['retcode']}: ${data['message']}`;
            }
        })
        .catch(() => {
            warningSpan.innerHTML = '<br>GET请求失败，请检查网络连接';
        });
    if (flag) return;
    // 请求
    isRefreshing.value = true;
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const data = { info: {}, list: [] };
    let fetchingGachaUid = undefined;
    let fetchingGachaData = {};
    const GachaTypes = { '1': '常驻', '2': '新手', '11': '限定角色', '12': '限定光锥' };
    for (let [gachaTypeId, gachaTypeName] of Object.entries(GachaTypes)) {
        warningSpan.innerHTML = `<br>正在请求${gachaTypeName}池数据`;
        let cnt = 0;
        let endId = '0';
        let exitFlag = false;
        while (true) {
            let items = [];
            await fetch(urlObj.href + `&gacha_type=${gachaTypeId}&end_id=${endId}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data['retcode'] != 0) {
                        warningSpan.innerHTML = `数据请求失败<br>${data['retcode']}: ${data['message']}`;
                        exitFlag = true;
                    } else {
                        items = data['data']['list'];
                    }
                })
                .catch(() => {
                    warningSpan.innerHTML = '<br>GET请求失败，请检查网络连接';
                    exitFlag = true;
                });
            if (exitFlag) {
                isRefreshing.value = false;
                return;
            }
            if (isIncremental && items.length > 0) {
                if (fetchingGachaUid === undefined) {
                    fetchingGachaUid = items[0]['uid'];
                    if (gachaUids.value[fetchingGachaUid] !== undefined) {
                        fetchingGachaData = (await window.fireflyAPI.gacha.getGachaData(fetchingGachaUid))['data'];
                    }
                }
                let tmp = items;
                items = [];
                tmp.forEach((item) => {
                    if (fetchingGachaData[item.id] === undefined) items.push(item);
                });
            }
            if (items.length == 0) {
                warningSpan.innerHTML = `${gachaTypeName}池数据请求完成<br>共获取 ${cnt} 条记录`;
                break;
            }
            endId = items.at(-1).id;
            if (Object.keys(data.info).length == 0) {
                data.info = {
                    srgf_version: 'v1.0',
                    uid: items[0]['uid'],
                    lang: items[0]['lang'],
                    region_time_zone: region_time_zone,
                };
            }
            items.forEach((item) => data.list.push(item));
            let delta = items.splice(0, 5);
            while (delta.length > 0) {
                cnt += delta.length;
                delta.forEach((item) => {
                    refreshingItems.value.push({
                        id: item['id'],
                        itemId: item['item_id'],
                        name: item['name'],
                        iconType: `star${item['rank_type']}`,
                        time: item['time'],
                    });
                });
                requestAnimationFrame(() => (refreshCardArea.value.scrollTop = refreshCardArea.value.scrollHeight));
                warningSpan.innerHTML = `正在请求UID: ${data.info['uid']} 的跃迁记录<br>已获取${cnt}条${gachaTypeName}池记录`;
                await sleep(100);
                delta = items.splice(0, 5);
            }
        }
        await sleep(500);
    }
    isRefreshing.value = false;
    if (fetchingGachaUid === undefined && data.info['uid'] === undefined) {
        warningSpan.innerHTML = '未获取到跃迁记录<br>请确认游戏内是否可以查询到跃迁记录';
        return;
    }
    warningSpan.innerHTML = `UID: ${fetchingGachaUid ?? data.info['uid']} 跃迁记录请求完成<br>共获取 ${data.list.length} 条记录`;
    if (data.list.length) {
        const ret = await userGachaStore.refreshGachaData('srgf_v1.0', data);
        if (ret['msg'] == 'OK') {
            warningSpan.innerHTML = `UID: ${fetchingGachaUid ?? data.info['uid']} 跃迁记录请求完成<br>共获取 ${data.list.length} 条记录，数据已保存`;
        } else {
            warningSpan.innerHTML = ret['msg'];
        }
    }
};
const onGetUrlConfirm = async () => {
    const warningSpan = refreshWarningArea.value;
    if (isRefreshing.value) return;
    const ret = await userGachaStore.getGachaURL();
    if (ret['msg'] == 'OK') {
        refreshUrlTextarea.value.value = ret['data']['url'];
        warningSpan.innerHTML = '<br>获取成功，正在检测是否有效';
        isRefreshing.value = true;
        fetch(ret['data']['url'])
            .then((response) => response.json())
            .then((data) => {
                if (data['retcode'] == 0) {
                    warningSpan.innerHTML = '成功从网页缓存中获取URL<br>点击下方按钮开始请求数据';
                } else if (data['retcode'] == -101) {
                    warningSpan.innerHTML = '链接已过期<br>请在游戏内重新查看跃迁记录并多翻看几页再尝试自动获取';
                } else {
                    warningSpan.innerHTML = `数据请求失败<br>${data['retcode']}: ${data['message']}`;
                }
            })
            .catch(() => {
                warningSpan.innerHTML = '<br>GET请求失败，请检查网络连接';
            })
            .finally(() => {
                isRefreshing.value = false;
            });
    } else {
        warningSpan.innerHTML = '<br>自动获取URL失败，请先在游戏内打开跃迁记录页面并翻看几次';
    }
};

const renameWarningArea = ref<HTMLDivElement>(null);
const renameInput = ref<HTMLInputElement>(null);
const onRenameConfirm = async () => {
    const nickname = renameInput.value.value + '';
    const warningSpan = renameWarningArea.value;
    if (nickname.length == 0) {
        warningSpan.innerText = '新名称不能为空';
    } else {
        const ret = await userGachaStore.newGachaUser(showingUid.value, nickname);
        if (ret['msg'] === 'OK') {
            showingAlert.value = 'none';
        } else {
            warningSpan.innerText = ret['msg'];
        }
    }
};

const importWarningArea = ref<HTMLDivElement>(null);
const importTypeSelect = ref<HTMLSelectElement>(null);
const onImportConfirm = async () => {
    const type = importTypeSelect.value.value + '';
    const warningSpan = importWarningArea.value;
    const ret = await userGachaStore.importGachaData(type);
    if (ret['msg'] === 'OK') {
        showingAlert.value = 'none';
    } else {
        warningSpan.innerText = ret['msg'];
    }
};

let exportable = false;
const exportWarningArea = ref<HTMLDivElement>(null);
const exportTypeSelect = ref<HTMLSelectElement>(null);
const onSelectExportFormat = async () => {
    const type = exportTypeSelect.value.value + '';
    const warningSpan = exportWarningArea.value;
    warningSpan.innerHTML = '';
    exportable = false;
    if (type == 'srgf_v1.0') {
        if (!(await userGachaStore.checkExportable(showingUid.value))) {
            warningSpan.innerHTML = '当前记录存在未知角色/光锥<br>为避免导出数据有误，请更新后再尝试导出';
            return;
        }
        exportable = true;
    } else if (type == 'uigf_v4.0') {
        for (let uid of Object.keys(gachaUids.value)) {
            if (!(await userGachaStore.checkExportable(uid))) {
                warningSpan.innerHTML = `uid为 ${uid} 的记录存在未知角色/光锥<br>为避免导出数据有误，请更新后再尝试导出`;
                return;
            }
        }
        warningSpan.innerHTML = '注意：UIGFv4.0 会将所有 uid 的跃迁记录导出到一个文件';
        exportable = true;
    }
};
const onExportConfirm = async () => {
    if (!exportable) return;
    const type = exportTypeSelect.value.value + '';
    const warningSpan = exportWarningArea.value;
    const ret = await userGachaStore.exportGachaData(type);
    if (ret['msg'] === 'OK') {
        showingAlert.value = 'none';
    } else {
        warningSpan.innerHTML = ret['msg'];
    }
};

const deleteWarningArea = ref<HTMLDivElement>(null);
const deleteInput = ref<HTMLInputElement>(null);
const onDeleteConfirm = async () => {
    const confirmed = deleteInput.value.value + '' === '删除';
    const warningSpan = deleteWarningArea.value;
    if (!confirmed) {
        warningSpan.innerText = '要确认删除当前记录，请在上方输入框内输入删除两字';
    } else if (Object.keys(gachaUids.value).length == 1) {
        warningSpan.innerText = '最后一个记录无法删除';
    } else {
        const ret = await userGachaStore.deleteGachaUser(showingUid.value);
        if (ret['msg'] == 'OK') {
            showingAlert.value = 'none';
        } else {
            warningSpan.innerText = ret['msg'];
        }
    }
};

const showingAlert = ref<'refresh' | 'rename' | 'import' | 'export' | 'delete' | 'none'>('none');
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (showingAlert.value !== 'none' && !isRefreshing.value) {
            showingAlert.value = 'none';
            e.stopPropagation();
        }
    }
});
</script>

<style scoped lang="scss">
.gacha-head {
    position: relative;
    z-index: 1;
    height: 50px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 2px 2px 3px #0004;
    background-color: #fff8;
    padding: 0 8px;
}

.import-button {
    margin-left: auto;

    &::after {
        content: '';
        position: absolute;
        height: 5px;
        bottom: -5px;
        left: 0;
        right: 0;
    }
}

.import-dropdown {
    position: absolute;
    background-color: #fffc;
    border-radius: 5px;
    top: 45px;
    left: 0;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 300ms ease;

    &.show {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
    }
}

.import-dropdown-item {
    border-radius: 5px;
    background-color: #fffe;
    margin: 4px 3px;
    padding: 0 10px;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;

    img {
        height: 24px;
    }

    div {
        white-space: nowrap;
    }

    &:hover {
        scale: 1.01;
    }

    &:active {
        scale: 1;
    }
}

.input-item-area {
    margin-top: 10px;
    display: grid;
    grid-template-columns: 50px 150px;

    input {
        border: solid 1px var(--theme-color);
        border-radius: 3px;
        padding: 0 4px;
    }
}

.warning-area {
    color: red;
    font-size: 0.67em;
    margin: 5px 0;
    text-align: center;
}

.button-area {
    display: flex;
    align-items: center;
    gap: 20px;

    .button {
        padding: 5px 15px;
        width: 50px;
        border: solid 1px var(--theme-color);
        border-radius: 4px;
        text-align: center;
        background-color: #fff;

        &:hover {
            scale: 1.02;
            filter: brightness(0.95);
        }

        &:active {
            scale: 1.01;
            filter: brightness(0.9);
        }

        &.theme {
            color: #fff;
            background-color: var(--theme-color);
        }
    }
}

.select-item-area {
    margin-top: 10px;
    display: grid;
    grid-template-columns: auto 100px;

    select {
        border: solid 1px var(--theme-color);
        border-radius: 3px;
        padding: 0 4px;
    }
}

.url-area {
    width: 300px;
    position: relative;

    &.shrink {
        textarea {
            height: 40px;
        }
    }

    .label {
        position: absolute;
        left: 0;
        top: 0;
        line-height: 30px;
    }

    .btn {
        position: absolute;
        right: 0;
        top: 0;
        background-color: var(--theme-color);
        border-radius: 5px;
        color: #fff;
        font-size: 0.8em;
        padding: 5px;

        &:hover {
            scale: 1.01;
            filter: brightness(0.97);
        }

        &:active {
            scale: 1;
            filter: brightness(0.95);
        }
    }

    textarea {
        word-break: break-all;
        resize: none;
        border: solid 1px var(--theme-color);
        border-radius: 5px;
        width: calc(100% - 6px);
        height: 120px;
        margin-top: 30px;
        padding: 3px;
        overflow-y: scroll;
        transition: all 300ms ease;

        &::-webkit-scrollbar-track {
            margin: 3px;
        }
    }
}

.card-area {
    width: 290px;
    position: relative;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 1px 1px 2px #0003 inset;
    padding: 5px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
    grid-template-rows: repeat(auto-fill, 60px);
    gap: 5px;
    overflow-y: scroll;
    scroll-behavior: smooth;
    transition: all 300ms ease;
    visibility: hidden;
    opacity: 0;
    height: 0;
    margin: -5px 0;

    &::-webkit-scrollbar-track {
        margin: 5px;
    }

    &.show {
        visibility: visible;
        opacity: 1;
        height: 200px;
        margin: 0;
    }
}
</style>
