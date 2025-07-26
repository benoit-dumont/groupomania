import { defineStore } from 'pinia';
import type { User, TokenData } from '../types';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null as TokenData | null,
    connectedUser: null as User | null,
    myPosts: null as any,
  }),
  actions: {
    saveToken(newToken: TokenData) {
      this.token = newToken;
    },
    saveConnectedUser(user: User) {
      this.connectedUser = user;
    },
    saveMyPosts(posts: any) {
      this.myPosts = posts;
    },
    logout() {
      this.token = null;
      this.connectedUser = null;
      this.myPosts = null;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage,
        paths: ['token', 'connectedUser'],
      },
    ],
  },
});
