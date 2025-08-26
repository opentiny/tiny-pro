import { createApp } from 'vue';
import { HwcClient } from '@opentiny/hwc-client';
import globalComponents from '@/components';
import TinySearchBox from '@opentiny/vue-search-box';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';
import App from './App.vue';
import '@/api/interceptor';
import '@/assets/style/global.less';
import config from '../hwc-exports.json';
import '@opentiny/vue-search-box/index.css';
import 'virtual:uno.css';
import "@opentiny/icons/style/all.css";

const app = createApp(App);

// 增加华为云相关配置
HwcClient.configure({
  ...config.hwcConfig,
  accessKey: '',
  secretKey: '',
});

app.use(router);
app.use(store);
app.use(i18n({ locale: localStorage.getItem('tiny-locale') }));
app.use(globalComponents);
app.use(directive);
app.use(TinySearchBox);

// 检测设备类型
const detectDevice = () => {
  const width = window.innerWidth;
  if (width < 768) {
    app.config.globalProperties.tiny_mode = { value: 'mobile' };
    app.config.globalProperties.isMobile = true;
  } else {
    app.config.globalProperties.tiny_mode = { value: 'pc' };
    app.config.globalProperties.isMobile = false;
  }
};

detectDevice();

window.addEventListener('resize', detectDevice);

app.mount('#app');
