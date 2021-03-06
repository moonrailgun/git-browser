import Vue from 'vue';
import axios from 'axios';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import VueHighlightJS from 'vue-highlightjs';
import 'highlight.js/styles/default.css';

import './global.css';
import App from './App';
import router from './router';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.use(ElementUI);
Vue.use(VueHighlightJS);
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.config.errorHandler = (error, vm) => {
  console.error(error, vm);
  vm.$message.error(error.toString());
};

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
