import { createRouter, createWebHashHistory } from 'vue-router';

import AchievementView from '@renderer/views/Achievement/Achievement.vue';
import GachaView from '@renderer/views/Gacha/Gacha.vue';
import SettingView from '@renderer/views/Setting/Setting.vue';

const routes = [
    { path: '/achievement', component: AchievementView },
    { path: '/gacha', component: GachaView },
    { path: '/setting', component: SettingView },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
