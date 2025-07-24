import Vue from 'vue';
import Multiselect from 'vue-multiselect';
import VueToastify from 'vue-toastify';
import DataTable from '@andresouzaabreu/vue-data-table';
import VueMeta from 'vue-meta';
import i18n from './I18n';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.component('multiselect', Multiselect);
Vue.use(VueToastify);
Vue.component('data-table', DataTable);
Vue.use(VueMeta);

Vue.config.productionTip = false;
Vue.mixin({
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString(
        this.$i18n.locale === 'en' ? 'en-US' : 'fr-FR',
      );
    },
  },
});

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
