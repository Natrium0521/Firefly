<template>
    <div class="achievement-head">
        <div class="achievement-head-info">{{ achiHeadInfo }}</div>
        <div class="achievement-head-search">
            <input
                type="text"
                spellcheck="false"
                placeholder="搜索成就名称、描述、编号"
                v-model="searchBoxValue"
                @keydown="
                    ($event) => {
                        if ($event.key === 'Enter') {
                            doSearch();
                        }
                    }
                "
            />
            <img class="achievement-head-search-clear" :src="CloseIcon" alt="清除" v-if="searchBoxValue !== ''" @click="doSearch('')" />
            <img class="achievement-head-search-icon" :src="SearchIcon" alt="搜索" @click="doSearch()" />
        </div>
        <div class="achievement-head-uid">
            <UidDropdown :uids="achievementUids" :showing-uid="showingUid" @select-uid="selectUid" />
        </div>
        <div class="achievement-head-filter">
            <Dropdown>
                <template #button="params">
                    <div class="filter-icon" :class="{ show: params.isShowing, filter: isFiltering }">
                        <img :src="FilterIcon" />
                    </div>
                </template>
                <template #content>
                    <div class="filter-content">
                        <div class="filter-content-item-wrapper">
                            <div class="row" v-for="versionGroup in groupedVersionList">
                                <div class="item" v-for="version in versionGroup" :class="{ on: filterSetting.Version.includes(version) }" @click="filterSetting.Version.includes(version) ? filterSetting.Version.splice(filterSetting.Version.indexOf(version), 1) : filterSetting.Version.push(version)">{{ version }}</div>
                            </div>
                        </div>
                        <div class="filter-content-item-wrapper">
                            <div class="row">
                                <div class="item" :class="{ on: filterSetting.IncompFirst }" @click="filterSetting.IncompFirst = !filterSetting.IncompFirst">未完成优先</div>
                            </div>
                        </div>
                        <div class="filter-content-item-wrapper">
                            <div class="row">
                                <div class="item" :class="{ on: filterSetting.ShowComp }" @click="filterSetting.ShowComp = !filterSetting.ShowComp">已完成成就</div>
                                <div class="item" :class="{ on: filterSetting.ShowIncomp }" @click="filterSetting.ShowIncomp = !filterSetting.ShowIncomp">未完成成就</div>
                            </div>
                        </div>
                        <div class="filter-content-item-wrapper">
                            <div class="row">
                                <div class="item" :class="{ on: filterSetting.ShowHidden }" @click="filterSetting.ShowHidden = !filterSetting.ShowHidden">隐藏成就</div>
                                <div class="item" :class="{ on: filterSetting.ShowVisible }" @click="filterSetting.ShowVisible = !filterSetting.ShowVisible">非隐藏成就</div>
                            </div>
                        </div>
                        <div class="filter-content-item-wrapper">
                            <div class="row">
                                <div class="item" :class="{ on: filterSetting.ShowMEOnly }" @click="filterSetting.ShowMEOnly = !filterSetting.ShowMEOnly">只显示互斥成就</div>
                            </div>
                        </div>
                        <div class="filter-content-item-wrapper">
                            <div class="row">
                                <div class="item-clear-filter" @click="filterSetting = JSON.parse(JSON.stringify(filterSettingDefault))">重置所有选项</div>
                            </div>
                        </div>
                    </div>
                </template>
            </Dropdown>
        </div>
        <div class="achievement-head-batch">
            <Dropdown>
                <template #button="params">
                    <div class="batch-icon" :class="{ show: params.isShowing }">
                        <img :src="BatchIcon" />
                    </div>
                </template>
                <template #content>
                    <div class="batch-content">
                        <div class="batch-content-desc">
                            <span>批量操作当前展示的所有成就</span>
                            <span>（互斥成就除外）</span>
                            <span class="warning">注意：该操作无法撤销！</span>
                        </div>
                        <div class="batch-content-button-row">
                            <div class="batch-content-button" @click="setAllAchievementStatus($event, 2)" @mouseleave="($event.target as HTMLElement).innerHTML = '全选'">全选</div>
                            <div class="batch-content-button" @click="setAllAchievementStatus($event, 1)" @mouseleave="($event.target as HTMLElement).innerHTML = '全不选'">全不选</div>
                        </div>
                    </div>
                </template>
            </Dropdown>
        </div>
        <div class="achievement-head-more">
            <Dropdown>
                <template #button="params">
                    <div class="more-icon" :class="{ show: params.isShowing }">
                        <img :src="MoreIcon" />
                    </div>
                </template>
                <template #content="params">
                    <div class="more-content">
                        <div class="more-item" @click="(showingAlert = 'newly'), params.toggleDropdown()">
                            <img class="more-item-icon" :src="NewlyIcon" />
                            <div class="more-item-name">新建</div>
                            <Alert v-if="showingAlert === 'newly'" @close="showingAlert = 'none'" title="新建存档" @vue:mounted="onNewlyAlertMounted">
                                <div class="input-item-area">
                                    <span>UID：</span>
                                    <input ref="newlyUidInput" type="text" placeholder="九位数字UID" spellcheck="false" />
                                </div>
                                <div class="input-item-area">
                                    <span>名称：</span>
                                    <input ref="newlyNicknameInput" type="text" placeholder="展示在成就页面的名称" spellcheck="false" />
                                </div>
                                <div class="warning-area" ref="newlyWarningArea"></div>
                                <div class="button-area">
                                    <div class="button" @click="showingAlert = 'none'">取消</div>
                                    <div class="button theme" @click="onNewlyConfirm">新建</div>
                                </div>
                                <a href="" style="margin-top: 5px" @click.prevent="showingAlert = 'refresh'">从米游社导入</a>
                            </Alert>
                        </div>
                        <div class="more-item" @click="(showingAlert = 'refresh'), params.toggleDropdown()">
                            <img class="more-item-icon" :src="RefreshIcon" />
                            <div class="more-item-name">刷新</div>
                            <Alert v-if="showingAlert === 'refresh'" @close="!isMYSBrowserWindowOpen && (showingAlert = 'none')" title="从米游社刷新/导入">
                                <div class="warning-area" ref="refreshWarningArea">从米游社刷新需要登录米游社账号，只会影响登录账号对应UID的成就存档<br />本次登录仅用于获取成就数据，不会保存或泄漏任何凭证</div>
                                <div class="button-area">
                                    <div class="button" @click="onRefreshCancel">取消</div>
                                    <div class="button theme" @click="onRefreshConfirm">登录</div>
                                </div>
                            </Alert>
                        </div>
                        <div class="more-item" @click="(showingAlert = 'import'), params.toggleDropdown()">
                            <img class="more-item-icon" :src="ImportIcon" />
                            <div class="more-item-name">导入</div>
                            <Alert v-if="showingAlert === 'import'" @close="showingAlert = 'none'" title="导入存档">
                                <div class="select-item-area">
                                    <span>导入格式：</span>
                                    <select ref="importTypeSelect">
                                        <option value="firefly">流萤</option>
                                    </select>
                                </div>
                                <div class="warning-area" ref="importWarningArea">注意：该操作会覆盖当前存档，现有数据将永久丢失</div>
                                <div class="button-area">
                                    <div class="button" @click="showingAlert = 'none'">取消</div>
                                    <div class="button theme" @click="onImportConfirm">导入</div>
                                </div>
                                <a href="" style="margin-top: 5px" @click.prevent="showingAlert = 'refresh'">从米游社导入</a>
                            </Alert>
                        </div>
                        <div class="more-item" @click="(showingAlert = 'export'), params.toggleDropdown()">
                            <img class="more-item-icon" :src="ExportIcon" />
                            <div class="more-item-name">导出</div>
                            <Alert v-if="showingAlert === 'export'" @close="showingAlert = 'none'" title="导出存档">
                                <div class="select-item-area">
                                    <span>导出格式：</span>
                                    <select ref="exportTypeSelect">
                                        <option value="firefly">流萤</option>
                                    </select>
                                </div>
                                <div class="warning-area" ref="exportWarningArea"></div>
                                <div class="button-area">
                                    <div class="button" @click="showingAlert = 'none'">取消</div>
                                    <div class="button theme" @click="onExportConfirm">导出</div>
                                </div>
                            </Alert>
                        </div>
                        <div class="more-item" @click="(showingAlert = 'rename'), params.toggleDropdown()">
                            <img class="more-item-icon" :src="RenameIcon" />
                            <div class="more-item-name">重命名</div>
                            <Alert v-if="showingAlert === 'rename'" @close="showingAlert = 'none'" title="修改当前存档名称" @vue:mounted="onRenameAlertMounted">
                                <div class="input-item-area">
                                    <span>名称：</span>
                                    <input ref="renameInput" type="text" :placeholder="achievementUids[showingUid]" spellcheck="false" />
                                </div>
                                <div class="warning-area" ref="renameWarningArea"></div>
                                <div class="button-area">
                                    <div class="button" @click="showingAlert = 'none'">取消</div>
                                    <div class="button theme" @click="onRenameConfirm">重命名</div>
                                </div>
                            </Alert>
                        </div>
                        <div class="more-item" @click="(showingAlert = 'delete'), params.toggleDropdown()">
                            <img class="more-item-icon" :src="DeleteIcon" />
                            <div class="more-item-name">删除</div>
                            <Alert v-if="showingAlert === 'delete'" @close="showingAlert = 'none'" title="删除当前存档">
                                <div class="input-item-area">
                                    <span>确认：</span>
                                    <input ref="deleteInput" type="text" placeholder="请输入 删除" spellcheck="false" @keydown="$event.key === 'Enter' && onDeleteConfirm()" />
                                </div>
                                <div class="warning-area" ref="deleteWarningArea">注意：该操作将导致成就存档被永久删除无法恢复</div>
                                <div class="button-area">
                                    <div class="button" @click="showingAlert = 'none'">取消</div>
                                    <div class="button theme" @click="onDeleteConfirm">删除</div>
                                </div>
                            </Alert>
                        </div>
                    </div>
                </template>
            </Dropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import emitter from '../../../utils/mitt';
import UidDropdown from '../../../components/UidDropdown.vue';
import Dropdown from '../../../components/Dropdown.vue';
import CloseIcon from '../../../assets/image/svg/close.svg';
import SearchIcon from '../../../assets/image/svg/search.svg';
import FilterIcon from '../../../assets/image/svg/filter.svg';
import BatchIcon from '../../../assets/image/svg/done-all.svg';
import MoreIcon from '../../../assets/image/svg/more.svg';
import NewlyIcon from '../../../assets/image/svg/newlybuild.svg';
import RefreshIcon from '../../../assets/image/svg/refresh.svg';
import ImportIcon from '../../../assets/image/svg/import.svg';
import ExportIcon from '../../../assets/image/svg/export.svg';
import RenameIcon from '../../../assets/image/svg/rename.svg';
import DeleteIcon from '../../../assets/image/svg/delete.svg';
import { useUserAchievement } from '../../../store/userachievement';
import Alert from '../../../components/Alert.vue';
import Toast from '@renderer/components/Toast';

let searchBoxValue = ref('');
let groupedVersionList = ref([]);
const userAchievementStore = useUserAchievement();

const achievementUids = computed(() => userAchievementStore.achiUids ?? {});
const showingUid = computed(() => userAchievementStore.achiCurrUid);
const achiHeadInfo = computed(() => userAchievementStore.achiHeadInfo);
const filterSettingDefault = {
    Version: [],
    IncompFirst: true,
    ShowComp: false,
    ShowIncomp: false,
    ShowHidden: false,
    ShowVisible: false,
    ShowMEOnly: false,
};
const filterSetting = ref(JSON.parse(JSON.stringify(filterSettingDefault)));

function selectUid(uid: string) {
    userAchievementStore.setCurrAchiUid(uid);
}

onMounted(async () => {
    const achievementVersion = await window.fireflyAPI.loadJson('AchievementVersion');
    const versions = Object.keys(achievementVersion);
    const versionMap = versions.reduce((map, cur) => {
        if (map[cur.split('.')[0]] === undefined) {
            map[cur.split('.')[0]] = [];
        }
        map[cur.split('.')[0]].push(cur);
        return map;
    }, {});
    Object.values(versionMap).forEach((versionList: Array<string>) => {
        groupedVersionList.value.push(versionList.sort((a, b) => +a.split('.')[1] - +b.split('.')[1]));
    });
    groupedVersionList.value.sort((a, b) => +a[0].split('.')[0] - +b[0].split('.')[0]);
});

function setAllAchievementStatus(e: DOMEvent, s: number) {
    const btnText = (e.target as HTMLElement).innerHTML;
    if (btnText.slice(0, 2) == '确认') {
        emitter.emit('achievement:setAllShowingAchievementsStatus', s);
        (e.target as HTMLElement).innerHTML = btnText.slice(2);
    } else {
        (e.target as HTMLElement).innerHTML = '确认' + btnText;
    }
}

const isFiltering = computed(() => {
    emitter.emit('achievement:setFilterSetting', filterSetting.value);
    let eq = true;
    Object.keys(filterSetting.value).forEach((k) => {
        if (k == 'Version' && filterSetting.value[k].length > 0) eq = false;
        else if (k != 'Version' && filterSetting.value[k] != filterSettingDefault[k]) eq = false;
    });
    return !eq;
});

function doSearch(search_str = undefined) {
    if (search_str !== undefined) searchBoxValue.value = search_str;
    emitter.emit('achievement:doSearch', searchBoxValue.value);
}

emitter.on('achievement:clearSearch', () => {
    searchBoxValue.value = '';
});

const newlyUidInput = ref<HTMLInputElement>(null);
const newlyNicknameInput = ref<HTMLInputElement>(null);
const newlyWarningArea = ref<HTMLSpanElement>(null);
const onNewlyConfirm = async () => {
    const uid = newlyUidInput.value.value + '';
    const nickname = newlyNicknameInput.value.value + '';
    const warningSpan = newlyWarningArea.value;
    if (!/^\d{9}$/.test(uid)) {
        warningSpan.textContent = 'UID应为9位数字';
    } else if (nickname.length == 0) {
        warningSpan.textContent = '备注不能为空';
    } else if (achievementUids.value[uid] !== undefined) {
        warningSpan.textContent = 'UID已存在';
    } else {
        const ret = await userAchievementStore.newAchiUser(uid, nickname);
        if (ret['msg'] === 'OK') {
            showingAlert.value = 'none';
        } else {
            warningSpan.textContent = ret['msg'];
        }
    }
};
const onNewlyAlertMounted = () => {
    newlyUidInput.value.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' || e.key === 'Enter') {
            newlyNicknameInput.value.focus();
        }
    });
    newlyNicknameInput.value.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            newlyUidInput.value.focus();
        } else if (e.key === 'Enter') {
            onNewlyConfirm();
        }
    });
    newlyUidInput.value.focus();
};

const refreshWarningArea = ref<HTMLSpanElement>(null);
let isMYSBrowserWindowOpen = false;
const onRefreshConfirm = async () => {
    if (isMYSBrowserWindowOpen) return;
    isMYSBrowserWindowOpen = true;
    window.fireflyAPI.achievement.refreshAchievementFromMYS().then((ret) => {
        isMYSBrowserWindowOpen = false;
        if (/\d+/.test(`${ret}`)) {
            userAchievementStore.init();
            showingAlert.value = 'none';
            Toast.success('刷新成功', `UID: ${ret}<br>数据可能有10分钟延迟，若刷新不完全可稍后再试`, 10000);
        } else {
            refreshWarningArea.value.innerHTML = `刷新失败<br>${JSON.stringify(ret)}`;
        }
    });
};
const onRefreshCancel = async () => {
    if (isMYSBrowserWindowOpen) window.fireflyAPI.achievement.cancelRefreshAchievementFromMYS();
    else showingAlert.value = 'none';
};

const importTypeSelect = ref<HTMLSelectElement>(null);
const importWarningArea = ref<HTMLSpanElement>(null);
const onImportConfirm = async () => {
    const type = importTypeSelect.value.value + '';
    const warningSpan = importWarningArea.value;
    const ret = await userAchievementStore.importAchiData(type);
    if (ret['msg'] === 'OK') {
        showingAlert.value = 'none';
    } else {
        warningSpan.textContent = ret['msg'];
    }
};

const exportTypeSelect = ref<HTMLSelectElement>(null);
const exportWarningArea = ref<HTMLSpanElement>(null);
const onExportConfirm = async () => {
    const type = exportTypeSelect.value.value + '';
    const warningSpan = exportWarningArea.value;
    const ret = await userAchievementStore.exportAchiData(type);
    if (ret['msg'] === 'OK') {
        showingAlert.value = 'none';
    } else {
        warningSpan.textContent = ret['msg'];
    }
};

const renameInput = ref<HTMLInputElement>(null);
const renameWarningArea = ref<HTMLSpanElement>(null);
const onRenameConfirm = async () => {
    const nickname = renameInput.value.value + '';
    const warningSpan = renameWarningArea.value;
    if (nickname.length === 0) {
        warningSpan.textContent = '新名称不能为空';
    } else {
        const ret = await userAchievementStore.newAchiUser(showingUid.value, nickname);
        if (ret['msg'] === 'OK') {
            showingAlert.value = 'none';
        } else {
            warningSpan.textContent = ret['msg'];
        }
    }
};
const onRenameAlertMounted = () => {
    renameInput.value.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            onRenameConfirm();
        }
    });
    renameInput.value.focus();
};

const deleteInput = ref<HTMLInputElement>(null);
const deleteWarningArea = ref<HTMLSpanElement>(null);
const onDeleteConfirm = async () => {
    const confirmed = deleteInput.value.value + '' === '删除';
    const warningSpan = deleteWarningArea.value;
    if (!confirmed) {
        warningSpan.textContent = '要确认删除当前存档，请在上方输入框内输入删除两字';
    } else if (Object.keys(achievementUids.value).length === 1) {
        warningSpan.textContent = '最后一个存档无法删除';
    } else {
        const ret = await userAchievementStore.deleteAchiUser(showingUid.value);
        if (ret['msg'] === 'OK') {
            showingAlert.value = 'none';
        } else {
            warningSpan.textContent = ret['msg'];
        }
    }
};

const showingAlert = ref<'newly' | 'refresh' | 'import' | 'export' | 'rename' | 'delete' | 'none'>('none');
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (showingAlert.value !== 'none') {
            showingAlert.value = 'none';
            e.stopPropagation();
        }
    }
});
</script>

<style scoped lang="scss">
.achievement-head {
    position: relative;
    z-index: 1;
    height: 50px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.achievement-head-info {
    font-size: 1.2em;
    margin-left: 10px;
}

.achievement-head-search {
    flex-grow: 1;
    position: relative;
    height: 40px;

    input {
        background-color: #fffa;
        position: absolute;
        height: 100%;
        right: 0;
        left: 0;
        min-width: 100px;
        border-radius: 5px;
        border: none;
        outline: none;
        font-size: 1em;
        padding: 0 65px 0 10px;
        box-shadow: 2px 2px 3px #0003;

        &:hover {
            background-color: #fffc;
        }

        &:focus {
            background-color: #fff;
        }
    }

    .achievement-head-search-icon {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 10px;
        margin: auto;
        transition: all 50ms ease;

        &:hover {
            scale: 1.1;
            filter: drop-shadow(2px 2px 3px #0003);
        }

        &:active {
            scale: 1.05;
            filter: drop-shadow(2px 2px 3px #0007);
        }
    }

    .achievement-head-search-clear {
        position: absolute;
        height: 16px;
        top: 0;
        bottom: 0;
        right: 40px;
        margin: auto;
        transition: all 50ms ease;
        scale: 1.1;

        &:hover {
            scale: 1.2;
            filter: drop-shadow(2px 2px 3px #0003);
        }

        &:active {
            scale: 1.1;
            filter: drop-shadow(2px 2px 3px #0007);
        }
    }
}

.achievement-head-filter {
    position: relative;
    filter: drop-shadow(2px 2px 3px #0003);

    .filter-icon {
        background-color: #fffa;
        height: 36px;
        width: 36px;
        border-radius: 5px;
        position: relative;
        transition: all 100ms ease;

        &:hover {
            scale: 1.01;
            background-color: #fffc;
        }

        &.show {
            scale: 1;
            background-color: #fffe;
        }

        &.filter {
            background-color: var(--theme-color);

            img {
                filter: invert(1);
            }
        }

        img {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            margin: auto;
        }
    }

    .filter-content {
        background-color: #fffa;
        border-radius: 5px;
        position: absolute;
        width: max-content;
        right: -80px;
        top: 7px;

        .filter-content-item-wrapper {
            background-color: #fff8;
            border-radius: 5px;
            margin: 3px;
            display: flex;
            flex-direction: column;

            .row {
                padding: 2px;
                display: flex;

                .item {
                    background-color: #fff1;
                    border-radius: 5px;
                    line-height: 26px;
                    margin: 2px;
                    padding: 0 6px;
                    transition: all 100ms ease;

                    &:hover {
                        background: #cccc;
                    }

                    &.on {
                        background: var(--theme-color);
                        color: #fff;
                    }
                }

                .item-clear-filter {
                    border-radius: 5px;
                    text-align: center;
                    line-height: 30px;
                    width: 100%;
                    color: var(--theme-color);

                    &:hover {
                        background: #cccc;
                    }
                }
            }
        }
    }
}

.achievement-head-batch {
    position: relative;
    filter: drop-shadow(2px 2px 3px #0003);
    margin-left: -5px;

    .batch-icon {
        background-color: #fffa;
        height: 36px;
        width: 36px;
        border-radius: 5px;
        position: relative;
        transition: all 100ms ease;

        &:hover {
            scale: 1.01;
            background-color: #fffc;
        }

        &.show {
            scale: 1;
            background-color: #fffe;
        }

        img {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            margin: auto;
        }
    }

    .batch-content {
        background-color: #fffd;
        border-radius: 5px;
        position: absolute;
        width: max-content;
        right: -40px;
        top: 7px;

        .batch-content-desc {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 5px 10px;

            span {
                font-size: 0.9em;
            }

            .warning {
                color: red;
                font-size: 0.75em;
            }
        }

        .batch-content-button-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
            padding: 5px;

            .batch-content-button {
                flex-grow: 1;
                flex-shrink: 0;
                background-color: #fff8;
                color: var(--theme-color);
                text-align: center;
                border-radius: 5px;
                white-space: nowrap;
                width: 100px;
                overflow: hidden;
                line-height: 1.8em;

                &:hover {
                    scale: 1.05;
                    background-color: #dddd;
                }
            }
        }
    }
}

.achievement-head-more {
    position: relative;
    filter: drop-shadow(2px 2px 3px #0003);
    margin-left: -5px;
    margin-right: 5px;

    .more-icon {
        background-color: var(--theme-color);
        height: 36px;
        width: 36px;
        border-radius: 5px;
        position: relative;
        transition: all 100ms ease;

        &:hover {
            scale: 1.01;
        }

        &.show {
            scale: 1;

            img {
                transform: rotate(-90deg);
            }
        }

        &.filter {
            background-color: var(--theme-color);

            img {
                filter: invert(1);
            }
        }

        img {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            margin: auto;
            filter: invert(1);
            transition: all 300ms ease;
        }
    }

    .more-content {
        position: absolute;
        background-color: #fffa;
        width: max-content;
        right: 0;
        top: 7px;
        border-radius: 5px;
        padding: 0 3px;

        .more-item {
            position: relative;
            width: 115px;
            height: 40px;
            background-color: #fff8;
            border-radius: 5px;
            margin: 3px 0;
            transition: all 50ms ease;

            &:hover {
                scale: 1.01;
            }

            &:active {
                scale: 1;
            }

            .more-item-icon {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 15px;
                margin: auto;
            }

            .more-item-name {
                position: absolute;
                line-height: 40px;
                left: 50px;
            }
        }
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
</style>
