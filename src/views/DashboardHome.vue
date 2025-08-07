<template>
  <div class="middle">
    <div class="middle-container">
      <h1>{{ t('DASHBOARDHOME.TITLE') }}</h1>
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
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';

import AvailableUpdate from '../components/AvailableUpdate.vue';

import { useUserStore } from '@/stores/';
import { Comment, Post, Reaction, User } from '@/types';
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

onMounted(async () => {
  await getConnectedUser();
  getUsersCount();
  getPostsCount();
  getReactionsCount();
  getCommentsCount();
});

function getUsersCount() {
  const token = userStore.token!.token;
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
  const token = userStore.token!.token;
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
  const token = userStore.token!.token;
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
  const token = userStore.token!.token;
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
.middle {
  width: 100%;
}

.middle-container {
  width: 100%;
  background: var(--app-background-color) !important;
  padding: 2vh;
  min-height: 100vh;
}

.middle-container h1 {
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
}
</style>
