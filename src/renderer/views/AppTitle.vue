<template>
    <div class="app-title draggable">
        <img class="app-title-icon" src="../assets/image/favicon.ico" />
        <div class="app-title-text">流萤工具箱</div>
        <div class="app-title-close undraggable" @click="onCloseClick">
            <img src="../assets/image/svg/app-title-close.svg" />
        </div>
        <div class="app-title-maxize undraggable" @click="onMaxizeClick">
            <img src="../assets/image/svg/app-title-maxize.svg" />
        </div>
        <div class="app-title-minize undraggable" @click="onMinizeClick">
            <img src="../assets/image/svg/app-title-minize.svg" />
        </div>
    </div>
</template>

<script setup lang="ts" name="AppTitle">
const onCloseClick = () => {
    window.fireflyAPI.sendMainWindowMsg('close');
};
const onMaxizeClick = () => {
    window.fireflyAPI.sendMainWindowMsg('maxize');
};
const onMinizeClick = () => {
    window.fireflyAPI.sendMainWindowMsg('minize');
};
</script>

<style lang="scss" scoped>
.app-title {
    width: 100%;
    height: 45px;
    background-color: #fff8;
    backdrop-filter: blur(6px);
    box-shadow: 2px 2px 3px #0004;
}

.draggable {
    -webkit-app-region: drag;
}

.undraggable {
    -webkit-app-region: no-drag;
}

.app-title-icon {
    float: left;
    height: 100%;
    margin-left: 10px;
}

.app-title-text {
    position: relative;
    left: 10px;
    float: left;
    height: 100%;
    line-height: 45px;
    font-size: 1.2em;
}

.app-title-close,
.app-title-minize,
.app-title-maxize {
    position: relative;
    float: right;
    height: 100%;
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.1s ease;

    img {
        transform: translateY(-2px);
    }

    &:hover {
        background-color: #fff8;
    }
}

.app-title-close:hover {
    background-color: #f339 !important;
}
</style>
