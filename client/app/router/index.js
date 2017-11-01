import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import Index from '@/components/Index';
import PostPage from '@/components/PostPage';

Vue.use(Router);

const routes = [
  {
    path: '/hello',
    name: 'Hello',
    component: HelloWorld
  },
  {
    path: '/',
    component: Index,
    name: 'index'
  },
  {
    path: '/articles',
    component: Index,
    name: 'articles'
  },
  {
    path: '/tags/:tag_name',
    component: PostPage
  },
  {
    path: '/:year/:month/:day/:article_name',
    component: PostPage,
    name: 'post_per_date'
  },
  {
    path: '/categories/:category1',
    name: 'category1',
    component: PostPage
  },
  {
    path: '/categories/:category1/:category2',
    name: 'category2',
    component: PostPage
  },
  {
    path: '/categories/:category1/:category2/:category3',
    name: 'category3',
    component: PostPage
  },
  {
    path: '/categories/:category1/:category2/:category3/:category4',
    name: 'category4',
    component: PostPage
  },
  {
    path: '/categories/:category1/:category2/:category3/:category4/:category5',
    name: 'category5',
    component: PostPage
  }
];

export default new Router({
  routes: routes,
  mode: 'history'
});
