import Vue from 'vue';
import VueRouter from 'vue-router';
import Signup from '../views/Signup.vue';
import Login from '../views/Login.vue';
import Accueil from '../views/Accueil.vue';
import Post from '../views/Post.vue';
import Settings from '../views/Settings.vue';
import Profil from '../views/Profil.vue';
import DashboardHome from '../views/DashboardHome.vue';
import DashboardUser from '../views/DashboardUser.vue';
import DashboardPost from '../views/DashboardPost.vue';
import DashboardComment from '../views/DashboardComment.vue';
import DashboardToken from '../views/DashboardToken.vue';
import UserEdit from '../views/UserEdit.vue';
import PostEdit from '../views/PostEdit.vue';
import CommentEdit from '../views/CommentEdit.vue';
// eslint-disable-next-line import/no-cycle
import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    name: 'Accueil',
    component: Accueil,
    meta: {
      auth: true,
    },
  },
  {
    path: '/post/:PostId',
    name: 'Post',
    component: Post,
    meta: {
      auth: true,
    },
  },
  {
    path: '/profil/:UserId',
    name: 'Profil',
    component: Profil,
    meta: {
      auth: true,
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      auth: true,
    },
  },
  {
    path: '/user/:UserId/edit',
    name: 'User Modification',
    component: UserEdit,
    meta: {
      auth: true,
      rights: {
        owner: true,
        rank: 1,
        apiPath: '/api/user/:UserId',
        ownerKey: 'id',
      },
    },
  },
  {
    path: '/post/:PostId/edit',
    name: 'Post Modification',
    component: PostEdit,
    meta: {
      auth: true,
      rights: {
        owner: true,
        rank: 2,
        apiPath: '/api/post/:PostId',
        ownerKey: 'UserId',
      },
    },
  },
  {
    path: '/comment/:CommentId/edit',
    name: 'Comment Modification',
    component: CommentEdit,
    meta: {
      auth: true,
      rights: {
        owner: true,
        rank: 2,
        apiPath: '/api/comment/:CommentId',
        ownerKey: 'UserId',
      },
    },
  },
  {
    path: '/admin/dashboard',
    name: 'Home Dashboard',
    component: DashboardHome,
    meta: {
      auth: true,
      rights: {
        rank: 2,
      },
    },
  },
  {
    path: '/admin/user',
    name: 'User Dashboard',
    component: DashboardUser,
    meta: {
      auth: true,
      rights: {
        rank: 1,
      },
    },
  },
  {
    path: '/admin/post',
    name: 'Post Dashboard',
    component: DashboardPost,
    meta: {
      auth: true,
      rights: {
        rank: 2,
      },
    },
  },
  {
    path: '/admin/comment',
    name: 'Comment Dashboard',
    component: DashboardComment,
    meta: {
      auth: true,
      rights: {
        rank: 2,
      },
    },
  },
  {
    path: '/admin/token',
    name: 'Token Dashboard',
    component: DashboardToken,
    meta: {
      auth: true,
      rights: {
        rank: 1,
      },
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.auth !== true) {
    return next();
  }
  const tokenData = store.state.token;
  if (tokenData === null) return next({ name: 'Login' });

  const { token, time } = store.state.token || {};
  if (token === undefined || token.length < 1) {
    return next({ name: 'Login' });
  }

  if (time > time + 86400000) {
    return next({ name: 'Login' });
  }
  return next();
});

router.beforeEach(async (to, from, next) => {
  if (!to.meta.rights) {
    return next();
  }

  if (to.meta.rights.rank >= store.state.connectedUser.rank) {
    return next();
  }

  const { apiPath } = to.meta.rights;
  const paramName = apiPath.match(/:([A-Za-z]+)/)[1];
  if (paramName === undefined)
    throw new Error('API Path does not have a param name');
  const param = to.params[paramName];
  if (param === undefined)
    throw new Error('Unable to find API Path param in URL');
  const fetchURL = apiPath.replace(`:${paramName}`, param);
  fetch(`http://localhost:3000${fetchURL}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer:' ${store.state.token.token}`,
    },
  })
    .then((response) => response.json())
    .then((response) => {
      const ownerId = response[to.meta.rights.ownerKey];
      if (ownerId !== store.state.connectedUser.id) {
        return next({ name: 'Accueil' });
      }
      return next();
    })
    .catch((error) => {
      this.error = error;
    });
  return true;
});

export default router;
