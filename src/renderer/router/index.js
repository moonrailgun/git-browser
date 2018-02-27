import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/components/Home').default,
    },
    {
      path: '/repository/:repositoryName',
      name: 'repo',
      component: require('@/components/Repository').default,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
