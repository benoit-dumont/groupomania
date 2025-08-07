import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import i18n from './I18n/index';

import 'flag-icons/css/flag-icons.min.css';

import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

// @ts-ignore
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import { createHead } from '@vueuse/head';

const app = createApp(App);
const head = createHead();
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(head);

app.component('Multiselect', Multiselect);

app.use(Vue3Toastify);

app.component('EasyDataTable', Vue3EasyDataTable);

app.use(router);
app.use(pinia);
app.use(i18n);

const existing = document.querySelector(
  `script[src*="${import.meta.env.VITE_FONT_AWESOME_KIT_ID}"]`,
);

if (!existing) {
  const faScript = document.createElement('script');
  faScript.src = `https://kit.fontawesome.com/${import.meta.env.VITE_FONT_AWESOME_KIT_ID}.js`;
  faScript.crossOrigin = 'anonymous';
  document.head.appendChild(faScript);
}

app.mount('#app');
