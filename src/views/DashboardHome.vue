<template>
  <div class="test">
    <div class="content">
      <div class="side">
        <div class="side-container">
          <router-link :to="{ name: 'Accueil' }">
            <img :src="getImage()" alt="Logo Groupomania" />
          </router-link>
          <div class="icons">
            <router-link
              v-if="userStore.connectedUser!.rank === 1 || userStore.connectedUser!.rank === 2"
              :to="{ name: 'Home Dashboard' }"
            >
              <p>
                <i class="fas fa-home"></i>
                <span>{{ t('DASHBOARD.LISTDASHBOARD') }}</span>
              </p>
            </router-link>
            <router-link
              v-if="userStore.connectedUser!.rank === 1"
              :to="{ name: 'User Dashboard' }"
            >
              <p>
                <i class="fas fa-user"></i>
                <span>{{ t('DASHBOARD.LISTUSER') }}</span>
              </p>
            </router-link>
            <router-link :to="{ name: 'Post Dashboard' }">
              <p>
                <i class="fas fa-comment-alt"></i>
                <span>{{ t('DASHBOARD.LISTPOST') }}</span>
              </p>
            </router-link>
            <router-link :to="{ name: 'Comment Dashboard' }">
              <p>
                <i class="fas fa-comment"></i>
                <span>{{ t('DASHBOARD.LISTCOMMENT') }}</span>
              </p>
            </router-link>
            <router-link
              v-if="userStore.connectedUser!.rank === 1"
              :to="{ name: 'Token Dashboard' }"
            >
              <p>
                <i class="fas fa-ticket-alt"></i>
                <span>{{ t('DASHBOARD.LISTTOKEN') }}</span>
              </p>
            </router-link>
          </div>
          <div v-if="menuDisplayed === true" class="logout">
            <p @click="userStore.logout()"><i class="fas fa-sign-out-alt"></i>{{ t('LOGOUT') }}</p>
          </div>
          <div class="account">
            <img :src="userStore.connectedUser!.avatar" :alt="t('ALTIMAGEPROFILE')" />
            <i
              v-if="menuDisplayed === false"
              class="fas fa-sort-down"
              @click="() => (menuDisplayed = !menuDisplayed)"
            ></i>
            <i v-else class="fas fa-sort-up" @click="() => (menuDisplayed = !menuDisplayed)"></i>
          </div>
        </div>
      </div>
      <div class="middle">
        <div class="middle-container">
          <h2>{{ t('DASHBOARDHOME.TITLE') }}</h2>
          <div class="data">
            <div v-if="userStore.connectedUser!.rank === 1" class="data-nb-users">
              <div class="data-container">
                <h3>{{ t('DASHBOARDHOME.NBUSERS') }}</h3>
                <span>{{ nbUsers }}</span>
              </div>
            </div>
            <div class="data-nb-posts">
              <div class="data-container">
                <h3>{{ t('DASHBOARDHOME.NBPOSTS') }}</h3>
                <span>{{ nbPosts }}</span>
              </div>
            </div>
            <div class="data-nb-reactions">
              <div class="data-container">
                <h3>{{ t('DASHBOARDHOME.NBREACTS') }}</h3>
                <span>{{ nbReactions }}</span>
              </div>
            </div>
            <div class="data-nb-commentaires">
              <div class="data-container">
                <h3>{{ t('DASHBOARDHOME.NBCOM') }}</h3>
                <span>{{ nbComments }}</span>
              </div>
            </div>
          </div>
          <div class="package-info">
            <AvailableUpdate v-if="userStore.connectedUser!.rank === 1" stack="back" />
            <AvailableUpdate v-if="userStore.connectedUser!.rank === 1" stack="front" />
            <p v-else class="no-dependencies">
              {{ t('NO.DEPENDENCIES') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';

import AvailableUpdate from '../components/AvailableUpdate.vue';

import { useUserStore } from '@/stores/';
import { Comment, Post, Reaction, User } from '@/types';
import { getImage } from '@/utils';
import { useConnectedUser, useToast } from '@/composables';

const { t } = useI18n();
const userStore = useUserStore();
const toast = useToast();
const getConnectedUser = useConnectedUser();

useHead({
  title: t('DASHBOARDHOME.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page d’accueil du dashboard du site Groupomania',
    },
  ],
});

const nbUsers = ref(0);
const nbPosts = ref(0);
const nbReactions = ref(0);
const nbComments = ref(0);
const menuDisplayed = ref(false);

onMounted(async () => {
  await getConnectedUser();
  getUsersCount();
  getPostsCount();
  getReactionsCount();
  getCommentsCount();
});

function getUsersCount() {
  const token = userStore.token;
  fetch('http://localhost:3000/api/user/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer:' ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: User[]) => {
      nbUsers.value = data.length;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function getPostsCount() {
  const token = userStore.token;
  fetch('http://localhost:3000/api/post/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer' ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: Post[]) => {
      nbPosts.value = data.length;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function getReactionsCount() {
  const token = userStore.token;
  fetch('http://localhost:3000/api/reaction/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer' ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: Reaction[]) => {
      nbReactions.value = data.length;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function getCommentsCount() {
  const token = userStore.token;
  fetch('http://localhost:3000/api/comment/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer' ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: Comment[]) => {
      nbComments.value = data.length;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}
</script>

<style scoped lang="scss">
.content {
  background-color: var(--app-background-color);
  display: flex;
  height: 100%;
}

.content-container {
  display: flex;
  justify-content: space-between;
  background-color: var(--app-background-color);
  padding-top: 5vh;
}

.side {
  flex-shrink: 2;
}

.side-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  background-color: var(--app-sidebar-color);
  position: relative;
}

.side-container img {
  width: 175px;
  height: 75px;
  object-fit: cover;
  margin: 3vh;
}

.icons {
  display: inline-flex;
  flex-direction: column;
}

.icons a {
  text-decoration: none;
  color: var(--app-text-primary-color) !important;

  &:hover {
    opacity: 0.8;
  }
}

.logout i {
  margin: 1vh;
  font-size: 24px;
}

.account i {
  padding-left: 1vh;
  cursor: pointer;
}

.icons a i {
  margin: 1vh;
  font-size: 24px;
}

.icons p {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.account {
  display: inline-flex;
  align-items: center;
  color: var(--app-text-primary-color);
  padding: 2vh;
  position: absolute;
  bottom: 1vh;
  margin: 0 2vh;
}

.account img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 30px;
  border: 1px solid #2d3036;
  margin: 0;
}

.logout {
  position: absolute;
  bottom: 10vh;
  color: var(--app-text-primary-color);
  cursor: pointer;
}

.middle {
  width: 100%;
}

.middle-container {
  width: 100%;
  background: var(--app-background-color) !important;
  padding: 2vh;
  min-height: 100vh;
}

.middle-container h2 {
  color: var(--app-text-primary-color);
  padding: 5vh 0 0 5vh;
}

.data {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  padding: 2vh 3vh 0;
}

.data-nb-users,
.data-nb-posts,
.data-nb-reactions,
.data-nb-commentaires {
  padding: 2vh;
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  background-color: var(--app-input-background-color);
  color: var(--app-text-primary-color);
  border-radius: 10px;
  max-width: 250px;
  width: 100%;
  margin: 2vh;
}

.data-nb-users span,
.data-nb-posts span,
.data-nb-reactions span,
.data-nb-commentaires span {
  font-size: x-large;
}

.data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-container h3 {
  font-size: large;
  text-align: center;
}

.package-info {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
  padding-top: 4vh;
}

.no-dependencies {
  padding-top: 5vh;
  color: var(--app-text-primary-color);
  font-size: x-large;
}

@media (max-width: 700px) {
  .content {
    display: initial;
  }

  .side {
    height: initial;
  }

  .side-container {
    height: 20vh;
    width: 100%;
    position: initial;
    align-items: initial;
  }

  .icons {
    flex-direction: row;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    background: var(--app-sidebar-color);
    padding: 2vh 2vh 0;
    z-index: 9999;
    justify-content: space-between;
  }

  .icons span {
    display: none;
  }

  .data {
    justify-content: center;
    margin: 0;
  }

  .middle-container {
    padding: initial;
  }

  .middle-container h2 {
    text-align: center;
    padding: 0;
    padding-top: 4vh;
  }

  .package-info {
    height: 100%;
    padding-bottom: 10vh;
    text-align: center;
  }

  .data-container span {
    padding: 1vh;
  }

  .logout {
    top: 12vh;
    left: 0;
    right: 0;
    bottom: initial;
    text-align: center;
  }

  .account {
    bottom: initial;
    top: 3vh;
    right: 2vh;
  }
}
@media (max-width: 400px) {
  .side-container a img {
    max-width: 175px;
    width: 50%;
  }

  .account {
    margin: 0;
    right: 1vh;
  }
}
</style>
