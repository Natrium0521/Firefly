<template>
    <div class="about-area">
        <div class="about">
            <div class="icon_"><img class="icon" src="../../../../static/image/icon.png" /></div>
            <div class="version"></div>
            <div class="links">
                <div>项目链接 <a href="https://github.com/Natrium0521/Firefly">GitHub</a></div>
                <div>游戏数据来自 <a href="https://github.com/Dimbreath/StarRailData">StarRailData</a></div>
                <div>跃迁记录导出标准 <a href="https://uigf.org/">SRGF</a></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import $ from 'jquery';
import { onMounted } from 'vue';

onMounted(() => {
    $('a').on('click', function (e) {
        e.preventDefault();
        const href = $(this).attr('href');
        if (href) {
            window.fireflyAPI.openURL(href);
        }
    });
    window.fireflyAPI.config.getAppVersion().then((version) => {
        $('.version').html(`工具箱版本 v${version}<br>适配游戏版本 v2.3`);
    });
});
</script>

<style scoped>
.about-area {
    position: relative;
    height: 200px;
}

.about {
    content: '';
    position: absolute;
    background: #fff8;
    border-radius: 5px;
    left: 5px;
    right: 5px;
    top: 5px;
    bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 50px;
}

.icon {
    height: 150px;
}
</style>
