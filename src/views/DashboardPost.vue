<template>
  <div class="test">
    <div class="content">
      <div class="side">
        <div class="side-container">
          <router-link :to="{ name: 'Accueil' }">
            <p>
              <img :src="getImage()" alt="Logo Groupomania" />
            </p>
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
          <h2>{{ t('DASHBOARDPOST.TITLE') }}</h2>
          <div class="list-posts">
            <div
              v-for="{ id, title, content, media, User, createdAt } in posts"
              :key="id"
              class="post"
            >
              <div class="post-container">
                <img :src="User!.avatar" :alt="t('ALTIMAGEPROFILE')" />
                <div class="align">
                  <p>
                    {{ User!.name }} {{ User!.firstname }} <br />
                    {{ formatDate(createdAt) }}
                  </p>
                </div>
              </div>
              <div class="post-content">
                <h2>{{ title }}</h2>
                <p>
                  {{ content }}
                </p>
                <div v-if="media && isImage(media)" class="post-image">
                  <img :src="getMediaUrl(media)" :alt="t('ALTMEDIA')" />
                </div>
                <div v-if="media && isVideo(media)" class="post-video">
                  <video controls width="350" height="200">
                    <source :src="getMediaUrl(media)" type="video/mp4" />
                  </video>
                </div>
              </div>
              <div class="post-actions">
                <div class="update" @click="updatePost(id)">
                  <i class="fa fa-pencil"></i>
                </div>
                <deleteAction :data="id" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EventBus from '../EventBus';
import { Ref, ref, onMounted, onBeforeUnmount } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { toast } from 'vue3-toastify';

import deleteAction from '../components/DeleteAction.vue';

import { useUserStore } from '@/stores/';
import { Post } from '@/types';
import { formatDate, getImage } from '@/utils';

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();

useHead({
  title: t('DASHBOARDPOST.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page des posts du tableau de bord du site Groupomania',
    },
  ],
});

const posts: Ref<Post[]> = ref([]);
const supportedExtensions = ref({
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
  video: ['mp4', 'avi'],
});
const menuDisplayed: Ref<boolean> = ref(false);
const objectUrlMap = new Map<File, string>();

const token = userStore.token;
fetch('http://localhost:3000/api/user/me', {
  method: 'GET',
  headers: {
    Authorization: `Bearer: ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then((data) => {
    userStore.saveConnectedUser(data.user);
  })
  .catch(() => {
    return toast.error(t('ERROR.GENERAL'));
  });

onMounted(() => {
  EventBus.on('deleteActionPressed', (_payload) => deletePost);
  getPosts();
});

function getExtension(media: Post['media']): string | null {
  if (!media) return null;

  if (typeof media === 'string') {
    return media.split('.').pop()?.toLowerCase() ?? null;
  }

  if (media instanceof File) {
    return media.name.split('.').pop()?.toLowerCase() ?? null;
  }

  return null;
}

function isImage(media: Post['media']): boolean {
  const ext = getExtension(media);
  if (!ext) return false;
  return supportedExtensions.value.image.includes(ext);
}

function isVideo(media: Post['media']): boolean {
  const ext = getExtension(media);
  if (!ext) return false;
  return supportedExtensions.value.video.includes(ext);
}

function getMediaUrl(media: Post['media']): string {
  if (!media) return '';
  if (typeof media === 'string') return media;

  // Si c'est un File
  if (objectUrlMap.has(media)) {
    return objectUrlMap.get(media)!;
  }

  const objectUrl = URL.createObjectURL(media);
  objectUrlMap.set(media, objectUrl);
  return objectUrl;
}

onBeforeUnmount(() => {
  objectUrlMap.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  objectUrlMap.clear();
});

function getPosts() {
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
      posts.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function updatePost(id: Post['id']) {
  router.push({
    name: 'Post Modification',
    params: { PostId: id },
  });
}

function deletePost(id: Post['id']) {
  // eslint-disable-next-line no-alert
  const validation = window.confirm(t('CONFIRM.POST'));
  if (validation === true) {
    const token = userStore.token;
    fetch(`http://localhost:3000/api/post/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer:' ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(() => getPosts());
  }
}
</script>

<style scoped lang="scss">
.content {
  background-color: var(--app-sidebar-color);
  display: flex;
}

.content-container {
  display: flex;
  justify-content: space-between;
  background-color: var(--app-sidebar-color);
  padding-top: 5vh;
}

.side {
  height: 100vh;
  flex-shrink: 2;
}

.side-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background: var(--app-sidebar-color);
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
  color: var(--app-action-icons-color);
  transition: all 450ms ease-in-out;

  &:hover {
    opacity: 0.8;
  }
}

.account {
  display: inline-flex;
  align-items: center;
  color: var(--app-text-primary-color);
  padding: 2vh;
  position: fixed;
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

.logout {
  position: fixed;
  bottom: 10vh;
  color: var(--app-text-primary-color);
  cursor: pointer;
}

.middle {
  background-color: var(--app-background-color);
  width: 100%;
  color: var(--app-text-primary-color);
  height: 100vh;
}

.middle-container h2 {
  padding: 5vh 0 0 5vh;
}

.list-posts {
  display: inline-flex;
  flex-wrap: wrap;
  width: 100%;
}

.post-content {
  text-align: justify;
  padding: 0 2vh;
}

.post-content h2 {
  padding: 0;
  color: var(--app-text-primary-color);
}

.post {
  display: inline-flex;
  flex-direction: column;
  margin: 2.5vh;
  padding: 2vh;
  border: 1px solid var(--app-text-primary-color);
  border-radius: 20px;
  position: relative;
  width: 100%;
}

.post p {
  color: var(--app-text-primary-color);
  font-size: 20px;
}

.post p span {
  font-size: medium;
}

.post-container {
  display: inline-flex;
  align-items: center;
}

.post-container img {
  margin: 0;
  width: 85px;
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
}

.align {
  display: flex;
  flex-direction: column;
  padding-left: 2vh;
}

.post-image img {
  width: 350px;
  height: 200px;
  object-fit: cover;
  margin: 0;
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 4vh;
  top: 2vh;
  color: var(--app-text-primary-color);
}

.update {
  padding: 1vh;
}

.update :hover {
  color: var(--app-text-primary-color);
  transform: scale(1.11);
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

  .list-posts {
    padding-bottom: 10vh;
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
  }

  .middle-container h2 {
    text-align: center;
    padding: 0;
    padding-top: 4vh;
  }

  .package-info {
    height: 100%;
    padding-bottom: 10vh;
  }

  .data-container span {
    padding: 1vh;
  }

  .post {
    padding: 2vh;
  }

  .align {
    text-align: center;
  }

  .posts {
    margin-bottom: 0;
    height: initial;
    padding: 2vh 2.5vh;
    width: initial;
  }

  .posts h1 {
    text-align: center;
  }

  .posts form {
    flex-direction: column;
    gap: 20px;
  }

  .post-container {
    flex-direction: column;
  }

  .post-content {
    padding-top: 0;
    padding-bottom: 4vh;
    text-align: center;
  }

  .post-image img {
    width: 100%;
    height: 100%;
    padding-top: 2vh;
  }

  .post-video video {
    width: 100%;
    height: 100%;
  }

  .post-actions {
    justify-content: center;
    right: 0;
    left: 0;
    bottom: 0;
    top: initial;
  }

  .logout {
    top: 12vh;
    left: 0;
    right: 0;
    bottom: initial;
    text-align: center;
    position: absolute;
  }

  .account {
    bottom: initial;
    top: 3vh;
    right: 2vh;
    position: absolute;
  }

  .account i {
    padding-left: 1vh;
    cursor: pointer;
  }

  .data-table {
    padding-bottom: 10vh;
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
