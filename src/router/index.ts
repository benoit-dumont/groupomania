import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
} from 'vue-router';

import { layouts, type LayoutName } from '@/layouts';

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

import { useUserStore } from '../stores/user';
import { TokenData } from '@/types';

declare module 'vue-router' {
  interface RouteMeta {
    layout: LayoutName;
  }
}
const routes: Array<RouteRecordRaw> = [
  { path: '/signup', name: 'Signup', component: Signup, meta: { layout: 'DefaultLayout' } },
  { path: '/login', name: 'Login', component: Login, meta: { layout: 'DefaultLayout' } },
  {
    path: '/',
    name: 'Accueil',
    component: Accueil,
    meta: { auth: true, layout: 'ConnectedLayout' },
  },
  {
    path: '/post/:PostId',
    name: 'Post',
    component: Post,
    meta: { auth: true, layout: 'ConnectedLayout' },
  },
  {
    path: '/profil/:UserId',
    name: 'Profil',
    component: Profil,
    meta: { auth: true, layout: 'ConnectedLayout' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { auth: true, layout: 'ConnectedLayout' },
  },
  {
    path: '/user/:UserId/edit',
    name: 'User Modification',
    component: UserEdit,
    meta: {
      auth: true,
      layout: 'ConnectedLayout',
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
      layout: 'ConnectedLayout',
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
      layout: 'ConnectedLayout',
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
      layout: 'AdminLayout',
      rights: { rank: 2, owner: false, apiPath: '', ownerKey: '' },
    },
  },
  {
    path: '/admin/user',
    name: 'User Dashboard',
    component: DashboardUser,
    meta: {
      auth: true,
      layout: 'AdminLayout',
      rights: { rank: 1, owner: false, apiPath: '', ownerKey: '' },
    },
  },
  {
    path: '/admin/post',
    name: 'Post Dashboard',
    component: DashboardPost,
    meta: {
      auth: true,
      layout: 'AdminLayout',
      rights: { rank: 2, owner: false, apiPath: '', ownerKey: '' },
    },
  },
  {
    path: '/admin/comment',
    name: 'Comment Dashboard',
    component: DashboardComment,
    meta: {
      auth: true,
      layout: 'AdminLayout',
      rights: { rank: 2, owner: false, apiPath: '', ownerKey: '' },
    },
  },
  {
    path: '/admin/token',
    name: 'Token Dashboard',
    component: DashboardToken,
    meta: {
      auth: true,
      layout: 'AdminLayout',
      rights: { rank: 1, owner: false, apiPath: '', ownerKey: '' },
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Guard pour l'authentification
router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    if (!to.meta.auth) {
      return next();
    }
    const userStore = useUserStore();
    const tokenData: TokenData | null = userStore.token;

    if (!tokenData) {
      return next({ name: 'Login' });
    }

    // Exemple d'expiration token (suppose que tokenData.time est timestamp)
    if ('time' in tokenData && tokenData.time && Date.now() > Number(tokenData.time) + 86400000) {
      return next({ name: 'Login' });
    }

    next();
  },
);

router.beforeEach((to, from, next) => {
  const layout = to.meta.layout ?? 'DefaultLayout';
  if (!(layout in layouts)) {
    to.meta.layout = 'DefaultLayout';
  }
  next();
});

// Guard pour les droits (ownership & rank)
router.beforeEach(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    if (!to.meta.rights) {
      return next();
    }

    const userStore = useUserStore();

    if (!userStore.connectedUser || userStore.connectedUser.rank > to.meta.rights.rank) {
      return next({ name: 'Accueil' });
    }

    if (to.meta.rights.owner) {
      const apiPath = to.meta.rights.apiPath;
      const paramMatch = apiPath.match(/:([A-Za-z]+)/);
      if (!paramMatch) {
        console.error('API Path does not have a param name');
        return next({ name: 'Accueil' });
      }
      const paramName = paramMatch[1];
      const paramValue = to.params[paramName];

      if (!paramValue) {
        console.error('Unable to find API Path param in URL');
        return next({ name: 'Accueil' });
      }

      const fetchURL = apiPath.replace(`:${paramName}`, paramValue as string);

      try {
        const res = await fetch(`http://localhost:3000${fetchURL}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userStore.token?.token}`,
          },
        });
        if (!res.ok) {
          return next({ name: 'Accueil' });
        }
        const data = await res.json();
        if (data[to.meta.rights.ownerKey] !== userStore.connectedUser.id) {
          return next({ name: 'Accueil' });
        }
        return next();
      } catch (error) {
        console.error(error);
        return next({ name: 'Accueil' });
      }
    } else {
      return next();
    }
  },
);

export default router;
