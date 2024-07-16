<template>
    <div class="gacha-head">
        <div class="gacha-head-uid">
            <UidDropdown :uids="gachaUids" :showing-uid="showingUid" @select-uid="selectUid" />
        </div>
        <GachaHeadButton :icon-path="RefreshIcon" btn-title="刷新" btn-class="white" @click="showRefreshAlert = true" />
        <Alert id="alert-refresh" v-if="showRefreshAlert" @close="!isRefreshing ? (showRefreshAlert = false) : false" title="刷新记录" @vue:mounted="onRefreshAlertMounted">
            <div class="url-area" :class="{ shrink: refreshingItems.length > 0 }">
                <div class="label">URL:</div>
                <div class="btn">自动获取</div>
                <textarea spellcheck="false" placeholder="https://api-takumi.mihoyo.com/common/gacha_record/api/getGachaLog?"></textarea>
            </div>
            <div class="card-area" :class="{ show: refreshingItems.length > 0 }">
                <CardGridItem v-for="item in refreshingItems" :key="item.id" :item="item" />
            </div>
            <div class="warning-area">自动获取URL前请先在游戏内查看一次跃迁记录并多翻看几页<br />未被记录过的UID会自动新建记录并保存</div>
            <div class="button-area">
                <div id="button-cancel" class="button">取消</div>
                <div id="button-confirm-full-refresh" class="button theme" title="请求能获取的所有记录">全量</div>
                <div id="button-confirm-incremental-refresh" class="button theme" title="请求到已存在的记录就立即停止">增量</div>
            </div>
        </Alert>
        <GachaHeadButton :icon-path="RenameIcon" btn-title="重命名" btn-class="white" @click="showRenameAlert = true" />
        <Alert id="alert-rename" v-if="showRenameAlert" @close="showRenameAlert = false" title="修改当前记录名称" @vue:mounted="onRenameAlertMounted">
            <div class="input-item-area">
                <span>名称：</span>
                <input id="input-new-nickname" type="text" :placeholder="gachaUids[showingUid]" spellcheck="false" />
            </div>
            <div class="warning-area"></div>
            <div class="button-area">
                <div id="button-cancel" class="button">取消</div>
                <div id="button-confirm" class="button theme">重命名</div>
            </div>
        </Alert>
        <GachaHeadButton :icon-path="SwitchIcon" :btn-title="gachaViewTypeNext" btn-class="theme" @click="switchGachaPool" class="switch-button" />
        <div style="flex-grow: 1"></div>
        <GachaHeadButton :icon-path="ImportIcon" btn-title="导入" btn-class="hover-drop" class="import-button">
            <div class="import-dropdown">
                <div class="import-dropdown-item" @click="showImportAlert = true">
                    <img :src="FromFileIcon" />
                    <div>从文件导入</div>
                </div>
                <div class="import-dropdown-item" @click="showRefreshAlert = true">
                    <img :src="FromLinkIcon" />
                    <div>从链接导入</div>
                </div>
            </div>
        </GachaHeadButton>
        <Alert id="alert-import" v-if="showImportAlert" @close="showImportAlert = false" title="导入记录" @vue:mounted="onImportAlertMounted">
            <div class="select-item-area">
                <span>导入格式：</span>
                <select id="select-type">
                    <option value="srgf_v1.0">SRGF v1.0</option>
                </select>
            </div>
            <div class="warning-area">若UID已存在将合并记录，不存在则自动新建记录</div>
            <div class="button-area">
                <div id="button-cancel" class="button">取消</div>
                <div id="button-confirm" class="button theme">导入</div>
            </div>
        </Alert>
        <GachaHeadButton :icon-path="ExportIcon" btn-title="导出" btn-class="white" @click="showExportAlert = true" />
        <Alert id="alert-export" v-if="showExportAlert" @close="showExportAlert = false" title="导出记录" @vue:mounted="onExportAlertMounted">
            <div class="select-item-area">
                <span>导出格式：</span>
                <select id="select-type">
                    <option value="srgf_v1.0">SRGF v1.0</option>
                </select>
            </div>
            <div class="warning-area"></div>
            <div class="button-area">
                <div id="button-cancel" class="button">取消</div>
                <div id="button-confirm" class="button theme">导出</div>
            </div>
        </Alert>
        <GachaHeadButton :icon-path="DeleteIcon" btn-title="删除" btn-class="red" @click="showDeleteAlert = true" />
        <Alert id="alert-delete" v-if="showDeleteAlert" @close="showDeleteAlert = false" title="删除当前记录" @vue:mounted="onDeleteAlertMounted">
            <div class="input-item-area">
                <span>确认：</span>
                <input id="input-delete-confirm" type="text" placeholder="请输入 删除" spellcheck="false" />
            </div>
            <div class="warning-area">注意：该操作将导致跃迁记录被永久删除无法恢复</div>
            <div class="button-area">
                <div id="button-cancel" class="button">取消</div>
                <div id="button-confirm" class="button theme">删除</div>
            </div>
        </Alert>
    </div>
</template>

<script setup lang="ts">
import $ from 'jquery';
import { ref, onMounted, computed } from 'vue';
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

function switchGachaPool() {
    $('.switch-button .icon')[0].animate([{ rotate: '0deg' }, { rotate: '180deg' }], { duration: 300, fill: 'backwards', easing: 'ease' });
    emitter.emit('gacha:toggleGachaView', gachaViewTypeNext.value);
    gachaViewTypeNext.value = gachaViewTypeNext.value === '卡池' ? '分类' : '卡池';
}

onMounted(() => {
    $('.import-button').on('mouseenter', () => {
        $('.import-dropdown').addClass('show');
    });
    $('.import-button').on('mouseleave', () => {
        $('.import-dropdown').removeClass('show');
    });
});

const isRefreshing = ref(false);
const refreshingItems = ref([]);
const showRefreshAlert = ref(false);
const showRenameAlert = ref(false);
const showImportAlert = ref(false);
const showExportAlert = ref(false);
const showDeleteAlert = ref(false);

const onRefreshAlertMounted = () => {
    refreshingItems.value = [];
    const warningSpan = $('#alert-refresh .warning-area');
    const urlTextarea = $('#alert-refresh .url-area textarea');
    const cardArea = $('#alert-refresh .card-area')[0] as HTMLElement;
    $('#alert-refresh #button-cancel').on('click', () => {
        if (!isRefreshing.value) showRefreshAlert.value = false;
    });
    $('#alert-refresh .url-area .btn').on('click', async () => {
        if (isRefreshing.value) return;
        const ret = await userGachaStore.getGachaURL();
        if (ret['msg'] == 'OK') {
            urlTextarea.val(ret['data']['url']);
            warningSpan.html('<br>获取成功，正在检测是否有效');
            isRefreshing.value = true;
            fetch(ret['data']['url'])
                .then((response) => response.json())
                .then((data) => {
                    if (data['retcode'] == 0) {
                        warningSpan.html('成功从网页缓存中获取URL<br>点击下方按钮开始请求数据');
                    } else if (data['retcode'] == -101) {
                        warningSpan.html('链接已过期<br>请在游戏内重新查看跃迁记录并多翻看几页再尝试自动获取');
                    } else {
                        warningSpan.html(`数据请求失败<br>${data['retcode']}: ${data['message']}`);
                    }
                })
                .catch(() => {
                    warningSpan.html('<br>GET请求失败，请检查网络连接');
                })
                .finally(() => {
                    isRefreshing.value = false;
                });
        } else {
            warningSpan.html('<br>自动获取URL失败，请先在游戏内打开跃迁记录页面并翻看几次');
        }
    });
    const refresh = async (isIncremental: boolean) => {
        if (isRefreshing.value) return;
        warningSpan.html('<br>准备请求数据');
        // 检查URL合法性
        const url = urlTextarea.val() + '';
        if (url == '') {
            warningSpan.html('<br>请先填入链接或尝试自动获取链接');
            return;
        }
        let urlObj: URL = null;
        try {
            urlObj = new URL(url);
        } catch (error) {
            warningSpan.html('<br>URL错误');
            return;
        }
        if (urlObj.hostname != 'api-takumi.mihoyo.com' || urlObj.pathname != '/common/gacha_record/api/getGachaLog') {
            warningSpan.html('<br>非米哈游抽卡分析链接');
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
                    warningSpan.html('链接已过期<br>请在游戏内重新查看跃迁记录并多翻看几页再尝试自动获取');
                } else {
                    warningSpan.html(`数据请求失败<br>${data['retcode']}: ${data['message']}`);
                }
            })
            .catch(() => {
                warningSpan.html('<br>GET请求失败，请检查网络连接');
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
            warningSpan.html(`<br>正在请求${gachaTypeName}池数据`);
            let cnt = 0;
            let endId = '0';
            let exitFlag = false;
            while (true) {
                let items = [];
                await fetch(urlObj.href + `&gacha_type=${gachaTypeId}&end_id=${endId}`)
                    .then((response) => response.json())
                    .then((data) => {
                        if (data['retcode'] != 0) {
                            warningSpan.html(`数据请求失败<br>${data['retcode']}: ${data['message']}`);
                            exitFlag = true;
                        } else {
                            items = data['data']['list'];
                        }
                    })
                    .catch(() => {
                        warningSpan.html('<br>GET请求失败，请检查网络连接');
                        exitFlag = true;
                    });
                if (exitFlag) {
                    isRefreshing.value = false;
                    return;
                }
                let containsDuplicate = false;
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
                    if (tmp.length != items.length) containsDuplicate = true;
                }
                if (items.length == 0) {
                    warningSpan.html(`${gachaTypeName}池数据请求完成<br>共获取 ${cnt} 条记录`);
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
                    requestAnimationFrame(() => (cardArea.scrollTop = cardArea.scrollHeight));
                    warningSpan.html(`正在请求UID: ${data.info['uid']} 的跃迁记录<br>已获取${cnt}条${gachaTypeName}池记录`);
                    await sleep(100);
                    delta = items.splice(0, 5);
                }
            }
            await sleep(500);
        }
        isRefreshing.value = false;
        if (fetchingGachaUid === undefined && data.info['uid'] === undefined) {
            warningSpan.html('未获取到跃迁记录<br>请确认游戏内是否可以查询到跃迁记录');
            return;
        }
        warningSpan.html(`UID: ${fetchingGachaUid ?? data.info['uid']} 跃迁记录请求完成<br>共获取 ${data.list.length} 条记录`);
        if (data.list.length) {
            const ret = await userGachaStore.refreshGachaData('srgf_v1.0', data);
            if (ret['msg'] == 'OK') {
                warningSpan.html(`UID: ${fetchingGachaUid ?? data.info['uid']} 跃迁记录请求完成<br>共获取 ${data.list.length} 条记录，数据已保存`);
            } else {
                warningSpan.text(ret['msg']);
            }
        }
    };
    $('#alert-refresh #button-confirm-full-refresh').on('click', () => {
        refresh(false);
    });
    $('#alert-refresh #button-confirm-incremental-refresh').on('click', () => {
        refresh(true);
    });
};

const onRenameAlertMounted = () => {
    $('#alert-rename #button-cancel').on('click', () => {
        showRenameAlert.value = false;
    });
    $('#alert-rename #button-confirm').on('click', async () => {
        const nickname = $('#alert-rename #input-new-nickname').val() + '';
        const warningSpan = $('#alert-rename .warning-area');
        if (nickname.length == 0) {
            warningSpan.text('新名称不能为空');
        } else {
            const ret = await userGachaStore.newGachaUser(showingUid.value, nickname);
            if (ret['msg'] == 'OK') {
                showRenameAlert.value = false;
            } else {
                warningSpan.text(ret['msg']);
            }
        }
    });
    $('#alert-rename #input-new-nickname').on('keydown', (e) => {
        if (e.key == 'Enter') {
            $('#alert-rename #button-confirm').trigger('click');
        }
    });
    $('#alert-rename #input-new-nickname').trigger('focus');
};

const onImportAlertMounted = () => {
    $('#alert-import #button-cancel').on('click', () => {
        showImportAlert.value = false;
    });
    $('#alert-import #button-confirm').on('click', async () => {
        const type = $('#alert-import #select-type').val() + '';
        const warningSpan = $('#alert-import .warning-area');
        const ret = await userGachaStore.importGachaData(type);
        if (ret['msg'] == 'OK') {
            showImportAlert.value = false;
        } else {
            warningSpan.text(ret['msg']);
        }
    });
};

const onExportAlertMounted = () => {
    $('#alert-export #button-cancel').on('click', () => {
        showExportAlert.value = false;
    });
    $('#alert-export #button-confirm').on('click', async () => {
        const type = $('#alert-export #select-type').val() + '';
        const warningSpan = $('#alert-export .warning-area');
        const ret = await userGachaStore.exportGachaData(type);
        if (ret['msg'] == 'OK') {
            showExportAlert.value = false;
        } else {
            warningSpan.text(ret['msg']);
        }
    });
};

const onDeleteAlertMounted = () => {
    $('#alert-delete #button-cancel').on('click', () => {
        showDeleteAlert.value = false;
    });
    $('#alert-delete #button-confirm').on('click', async () => {
        const confirmed = $('#alert-delete #input-delete-confirm').val() + '' == '删除';
        const warningSpan = $('#alert-delete .warning-area');
        if (!confirmed) {
            warningSpan.text('要确认删除当前记录，请在上方输入框内输入删除两字');
        } else if (Object.keys(gachaUids.value).length == 1) {
            warningSpan.text('最后一个记录无法删除');
        } else {
            const ret = await userGachaStore.deleteGachaUser(showingUid.value);
            if (ret['msg'] == 'OK') {
                showDeleteAlert.value = false;
            } else {
                warningSpan.text(ret['msg']);
            }
        }
    });
    $('#alert-delete #input-delete-confirm').on('keydown', (e) => {
        if (e.key == 'Enter') {
            $('#alert-delete #button-confirm').trigger('click');
        }
    });
};
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
    line-height: 50px;
}

.import-dropdown {
    position: absolute;
    background-color: #fffa;
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
