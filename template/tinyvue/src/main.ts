import { createApp } from 'vue';
import globalComponents from '@/components';
import TinySearchBox from '@opentiny/vue-search-box';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';
import App from './App.vue';
import '@/api/interceptor';
import '@/assets/style/global.less';
import '@opentiny/vue-search-box/dist/index.css';
import 'virtual:uno.css';
import "@opentiny/icons/style/all.css";

const app = createApp(App);

app.use(router);
app.use(store);
app.use(i18n({ locale: localStorage.getItem('tiny-locale') }));
app.use(globalComponents);
app.use(directive);
app.use(TinySearchBox);

app.mount('#app');
