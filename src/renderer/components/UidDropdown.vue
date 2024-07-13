<template>
    <div class="uid-select">
        <Dropdown>
            <template #button="params">
                <div :class="['uid-show', { show: params.isShowing }]">
                    <div class="uid-show-nickname">{{ uids[showingUid] }}</div>
                    <div class="uid-show-uid">{{ showingUid }}</div>
                    <img class="uid-show-icon" :src="DropdownIcon" />
                </div>
            </template>
            <template #content>
                <div class="uid-dropdown">
                    <div class="uid-dropdown-item" v-for="(nickname, uid) in uids" :key="uid" @click="selectUid(uid)">
                        <div class="uid-dropdown-item-nickname">{{ nickname }}</div>
                        <div class="uid-dropdown-item-uid">{{ uid }}</div>
                    </div>
                </div>
            </template>
        </Dropdown>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dropdown from './Dropdown.vue';
import DropdownIcon from '../assets/image/svg/drop-down.svg';

let props = defineProps({
    uids: {
        type: Object,
    },
    showingUid: {
        type: String,
    },
});

let uids = computed(() => props.uids);
let showingUid = computed(() => props.showingUid);
const emits = defineEmits(['selectUid']);

function selectUid(uid: string) {
    emits('selectUid', uid);
}
</script>

<style scoped lang="scss">
.uid-select {
    position: relative;
    width: 140px;
    height: 40px;
    filter: drop-shadow(2px 2px 3px #0003);
}

.uid-show {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    background-color: #fffa;

    &:hover {
        scale: 1.01;
        background-color: #fffc;
    }

    &.show {
        scale: 1;
        background-color: #fffe;

        .uid-show-icon {
            transform: rotate(180deg);
        }
    }
}

.uid-show-nickname {
    position: absolute;
    left: 5px;
    top: 4px;
    white-space: nowrap;
    overflow: hidden;
    max-width: 100px;
}

.uid-show-uid {
    position: absolute;
    bottom: 4px;
    left: 10px;
    font-size: 0.75em;
    color: var(--theme-color);
}

.uid-show-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 5px;
    transition: transform 300ms ease;
}

.uid-dropdown {
    position: absolute;
    top: 45px;
    left: 0;
    right: 0;
    border-radius: 5px;
    background-color: #fffc;
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: 180px;
    scrollbar-gutter: stable;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        margin: 3px;
    }
}

.uid-dropdown-item {
    border-radius: 5px;
    background-color: #fffc;
    height: 40px;
    margin: 3px 4px;
    margin-right: 0;
    position: relative;
    transition: all 100ms ease;

    &:hover {
        scale: 1.01;
        background-color: #fff;
    }

    &:active {
        scale: 0.99;
        background-color: #fffd;
    }
}

.uid-dropdown-item-nickname {
    position: absolute;
    left: 5px;
    top: 4px;
    white-space: nowrap;
    overflow: hidden;
    max-width: 120px;
}

.uid-dropdown-item-uid {
    position: absolute;
    bottom: 3px;
    left: 10px;
    font-size: 0.75em;
    color: var(--theme-color);
}
</style>
