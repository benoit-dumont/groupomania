import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import i18n from './I18n/index';

import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
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

app.use(Vue3Toastify, {
  autoClose: 3000,
  draggable: true,
}) as ToastContainerOptions;

app.component('EasyDataTable', Vue3EasyDataTable);

app.use(router);
app.use(pinia);
app.use(i18n);

app.mount('#app');
