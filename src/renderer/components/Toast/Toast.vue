<template>
    <div class="toast-container">
        <div class="toast-box" v-for="toast in toastList" :key="toast.id" :class="toast.type ?? 'info'" :ref="(el) => setToastItemRefs(el, toast.id)" :style="{ order: toast.id }">
            <div class="icon">
                <img :src="IconMap[toast.type ?? 'info']" />
            </div>
            <div class="text">
                <div class="title">{{ toast.title }}</div>
                <div class="desc">{{ toast.content }}</div>
            </div>
            <div class="close-btn" @click="toast.close()">
                <svg width="24" height="24">
                    <circle cy="12" cx="12" r="11" :style="toast.showtime > 0 ? { animationDuration: toast.showtime + 'ms' } : { animationPlayState: 'paused' }"></circle>
                </svg>
                <img :src="CloseIcon" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import toast from './index';
import CloseIcon from '@renderer/assets/image/svg/close-small.svg';
import InfoIcon from '@renderer/assets/image/svg/info.svg';
import SuccessIcon from '@renderer/assets/image/svg/success.svg';
import WarningIcon from '@renderer/assets/image/svg/warning.svg';
import ErrorIcon from '@renderer/assets/image/svg/error.svg';

const IconMap = {
    info: InfoIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    success: SuccessIcon,
};

const toastList = ref<ToastItem[]>(null);
const toastItemRefs: Record<number, HTMLElement> = {};
const setToastItemRefs = (el: any, id: number) => {
    if (!el) return;
    toastItemRefs[id] = el;
};

const updateToastList = (newToastList: ToastItem[]) => {
    const oldPosition = {};
    toastList.value?.forEach((toast: ToastItem) => {
        oldPosition[toast.id] = toastItemRefs[toast.id].getBoundingClientRect().bottom;
    });
    toastList.value = newToastList;
    requestAnimationFrame(() => {
        toastList.value.forEach((toast: ToastItem) => {
            const newPosition = toastItemRefs[toast.id].getBoundingClientRect();
            if (!oldPosition[toast.id]) {
                oldPosition[toast.id] = newPosition.bottom + newPosition.height + 50;
            }
            const diff = oldPosition[toast.id] - newPosition.bottom;
            const keyframes = [{ transform: `translateY(${diff}px)` }, { transform: `translateY(0px)` }];
            toastItemRefs[toast.id].animate(keyframes, { duration: 500, easing: 'ease' });
        });
    });
};

toast.update(updateToastList);
</script>

<style lang="scss" scoped>
.toast-container {
    position: absolute;
    z-index: 20;
    inset: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding-bottom: 20px;
    overflow: hidden;
}

.toast-box {
    min-width: 300px;
    max-width: calc(100% - 400px);
    height: fit-content;
    min-height: 60px;
    flex-shrink: 0;
    pointer-events: auto;
    border-radius: 5px;
    box-shadow: 0px 0px 2px #0003;
    display: flex;
    gap: 10px;
    padding: 0 10px;

    .icon {
        height: 60px;
        opacity: 0.8;

        img {
            margin-top: 18px;
        }
    }

    .text {
        flex-grow: 1;
        word-break: break-all;

        .title {
            user-select: text;
            margin-top: 13px;
        }

        .desc {
            user-select: text;
            margin-bottom: 10px;
            color: #0008;
            font-size: 0.8em;
        }
    }

    .close-btn {
        height: 60px;
        width: 24px;
        opacity: 0.8;
        position: relative;
        flex-shrink: 0;

        &:hover {
            scale: 1.05;
        }

        &:active {
            scale: 1.03;
        }

        & > svg {
            position: absolute;
            top: 50%;
            transform: translateY(-50%) rotate(-90deg);
        }

        & > svg > circle {
            fill: none;
            stroke: #0004;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-dasharray: 69.08;
            stroke-dashoffset: 69.08;
            animation: circle-anim 1s linear forwards;
            animation-delay: -0s;
        }

        img {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
        }
    }
}

.info {
    background: #fffe;
    border: solid 1px #eee;
}

.warning {
    background: #ffae;
    border: solid 1px #dd0;
}

.error {
    background: #faae;
    border: solid 1px #f77;
}

.success {
    background: #afae;
    border: solid 1px #7f7;
}

@keyframes circle-anim {
    0% {
        stroke-dashoffset: 69.08;
    }

    100% {
        stroke-dashoffset: 0;
    }
}
</style>
