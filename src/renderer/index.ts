import { createApp } from 'vue';
import router from './router/route';
import App from './App.vue';
import { createPinia } from 'pinia';

const app = createApp(App);

app.use(router);

const pinia = createPinia();
app.use(pinia);

app.mount('#app');
