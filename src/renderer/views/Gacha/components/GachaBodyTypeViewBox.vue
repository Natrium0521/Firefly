<template>
    <div class="type-view-box">
        <div class="title-area">
            <div class="text">{{ gachaTitle }}</div>
            <div class="btns">
                <div class="slider" :class="{ toggle: currentDetailView == CardListView }"></div>
                <div class="gridview" :class="{ on: currentDetailView == CardGridView }" @click="currentDetailView = CardGridView">
                    <img src="../../../assets/image/svg/view-grid-card.svg" />
                </div>
                <div class="listview" :class="{ on: currentDetailView == CardListView }" @click="currentDetailView = CardListView">
                    <img src="../../../assets/image/svg/view-grid-list.svg" />
                </div>
            </div>
        </div>
        <div class="count-area">
            <div class="total">
                <div class="count">{{ gachaCount.total }}</div>
                <div class="unit">抽</div>
            </div>
            <div class="guarantee">
                <div class="star5">
                    <div class="bar" :style="{ width: `${gachaCount.star5percent}%` }"></div>
                    <div class="text">距上个五星</div>
                    <div class="text number">{{ gachaCount.star5 }}</div>
                </div>
                <div class="star4">
                    <div class="bar" :style="{ width: `${gachaCount.star4percent}%` }"></div>
                    <div class="text">距上个四星</div>
                    <div class="text number">{{ gachaCount.star4 }}</div>
                </div>
            </div>
        </div>
        <div class="analyze-area">
            <div class="time">{{ gachaAnalyze.startDate }} ~ {{ gachaAnalyze.endDate }}</div>
            <div class="blocks">
                <div class="block" v-for="item of gachaAnalyze.dataGroup">
                    <div class="value">
                        <div class="number">{{ item.value }}</div>
                        <div class="unit">{{ item.unit }}</div>
                    </div>
                    <div class="label">{{ item.label }}</div>
                </div>
            </div>
        </div>
        <div class="detail-area">
            <Transition :name="currentDetailView == CardGridView ? 'slide-left' : 'slide-right'">
                <KeepAlive>
                    <component :is="currentDetailView" :gacha-detail="gachaDetail" />
                </KeepAlive>
            </Transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toRef, shallowRef } from 'vue';
import CardGridView from './CardGridView.vue';
import CardListView from './CardListView.vue';

const currentDetailView = shallowRef(CardGridView);

const props = defineProps(['boxSize', 'gachaTitle', 'gachaCount', 'gachaAnalyze', 'gachaDetail']);
const boxSize = toRef(props, 'boxSize');
</script>

<style scoped lang="scss">
.type-view-box {
    position: relative;
    height: calc(v-bind('boxSize.height') * 1px);
    width: calc(v-bind('boxSize.width') * 1px);
    border-radius: 5px;
    box-shadow: 2px 2px 3px #0004;
    background-color: #fff8;
    margin-right: 5px;

    & > div {
        position: absolute;
        left: 5px;
        right: 5px;
    }
}
.title-area {
    background: #fffa;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
    top: 5px;
    height: 40px;

    .text {
        line-height: 40px;
        font-size: 1.25em;
        width: 120px;
        position: absolute;
        left: 6px;
        color: var(--theme-color);
        filter: brightness(0.9);
    }

    .btns {
        background: #eeea;
        width: 70px;
        height: 36px;
        position: absolute;
        right: 6px;
        top: 2px;
        border-radius: 5px;
        box-shadow: 1px 1px 1px #0003 inset;

        & > div {
            position: absolute;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
            top: 3px;

            &:hover {
                background: #0001;
            }

            &.on:hover {
                background: none;
            }
        }

        .gridview {
            left: 3px;
        }

        .listview {
            right: 3px;
        }

        .slider {
            width: 30px;
            height: 30px;
            box-shadow: 1px 1px 1px #0003;
            top: 3px;
            left: 3px;
            background: #fff;
            transition: all 300ms ease;

            &.toggle {
                transform: translateX(34px);
            }
        }
    }
}

.count-area {
    background: #fff6;
    top: 45px;
    height: 90px;

    .total {
        height: 45px;
        margin-top: 5px;
        margin-left: 5px;
        color: var(--theme-color);
        filter: brightness(0.4);

        .count {
            float: left;
            font-size: 2.25em;
            margin-left: 5px;
            line-height: 45px;
        }

        .unit {
            float: left;
            margin-left: 10px;
            margin-top: 20px;
        }
    }

    .guarantee {
        height: 35px;
        margin: 0 5px;
        position: relative;

        & > div {
            position: absolute;
            height: 100%;
            border-radius: 5px;
            overflow: hidden;
        }

        .star5 {
            border: solid 1px #ec9a1d77;
            left: 0;
            right: calc(50% + 2px);

            .bar {
                transition: all 100ms ease;
                background: #ec9a1d44;
                width: 0%;
            }

            .text {
                color: #ec9a1d;
            }
        }

        .star4 {
            border: solid 1px #a01dec77;
            left: calc(50% + 2px);
            right: 0;

            .bar {
                transition: all 100ms ease;
                background: #a01dec44;
                width: 0%;
            }

            .text {
                color: #a01dec;
            }
        }

        .bar {
            position: absolute;
            height: 100%;
        }

        .text {
            font-size: 0.8em;
            filter: brightness(0.8);
            line-height: 35px;
            position: absolute;
            left: 10px;
            right: 10px;
        }

        .number {
            text-align: right;
        }
    }
}

.analyze-area {
    background: #fff6;
    top: 135px;
    height: 65px;

    .time {
        color: #0007;
        font-size: 0.75em;
        text-align: center;
        line-height: 20px;
    }

    .blocks {
        padding: 0 5px;
        display: flex;
        justify-content: space-between;

        .block {
            border-radius: 5px;
            flex-basis: 24%;
            position: relative;
            height: 40px;

            .value {
                color: var(--theme-color);
                filter: brightness(0.9);
                display: flex;
                flex-direction: row;
                justify-content: center;

                .number {
                    font-size: 1.33em;
                }

                .unit {
                    font-size: 0.75em;
                    margin-left: 3px;
                    margin-top: 10px;
                }
            }

            .label {
                color: #000d;
                font-size: 0.8em;
                position: absolute;
                width: 100%;
                text-align: center;
                bottom: 0;
            }
        }
    }
}

.detail-area {
    background: #fff6;
    top: 200px;
    bottom: 5px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    overflow: hidden;
}

.detail-area {
    .slide-left-enter-active,
    .slide-left-leave-active,
    .slide-right-enter-active,
    .slide-right-leave-active {
        transition: all 300ms ease;
    }
    .slide-right-enter-from {
        opacity: 0;
        transform: translateX(-10px);
    }
    .slide-right-enter-to {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-right-leave-from {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-right-leave-to {
        opacity: 0;
        transform: translateX(10px);
    }
    .slide-left-enter-from {
        opacity: 0;
        transform: translateX(10px);
    }
    .slide-left-enter-to {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-left-leave-from {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-left-leave-to {
        opacity: 0;
        transform: translateX(-10px);
    }
}
</style>
