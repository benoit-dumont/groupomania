<template>
  <div class="test">
    <div class="content">
      <div class="sidebar">
        <div class="icons">
          <img :src="getImage()" alt="Logo" />
          <div class="icon-container">
            <router-link :to="{ name: 'Accueil' }"><i class="fas fa-home"></i></router-link>
            <router-link
              :to="{
                name: 'Profil',
                params: { UserId: userStore.connectedUser!.id },
              }"
              ><i class="fas fa-user"></i
            ></router-link>
            <router-link :to="{ name: 'Settings' }"><i class="fas fa-cog"></i></router-link>
            <router-link
              v-if="userStore.connectedUser!.rank === 1 || userStore.connectedUser!.rank === 2"
              :to="{ name: 'Home Dashboard' }"
              ><i class="fas fa-tools"></i
            ></router-link>
          </div>
        </div>
        <div class="box-posts">
          <div class="up">
            <div class="account">
              <img :src="userStore.connectedUser!.avatar" :alt="t('ALTIMAGEPROFILE')" />
              <i
                v-if="menuDisplayed === false"
                class="fas fa-sort-down"
                @click="() => (menuDisplayed = !menuDisplayed)"
              ></i>
              <i v-else class="fas fa-sort-up" @click="() => (menuDisplayed = !menuDisplayed)"></i>
            </div>
            <transition name="logout">
              <div v-if="menuDisplayed === true" class="logout">
                <p @click="userStore.logout()">
                  <i class="fas fa-sign-out-alt"></i>{{ t('LOGOUT') }}
                </p>
              </div>
            </transition>
          </div>
          <div class="profile">
            <div class="profile-container">
              <div class="infos">
                <img :src="userStore.connectedUser!.avatar" :alt="t('ALTIMAGEPROFILE')" />
                <h1>
                  {{ userStore.connectedUser!.name }}
                  {{ userStore.connectedUser!.firstname }}
                </h1>
                <h2>{{ t('PROFIL.LATESTPOSTS') }}</h2>
              </div>
              <div v-if="posts.length !== 0" class="latest-posts">
                <div class="list-posts">
                  <div
                    v-for="{ id, title, content, createdAt, Reactions, Comments, media } in posts"
                    :key="id"
                    class="post"
                  >
                    <div class="post-title">
                      <h2>{{ title }}</h2>
                      <p>{{ formatDate(createdAt) }}</p>
                    </div>
                    <div class="post-content">
                      {{ content }}
                      <div v-if="media && isImage(media)" class="post-image">
                        <img :src="getMediaUrl(media)" :alt="t('ALTMEDIA')" />
                      </div>
                      <div v-if="media && isVideo(media)" class="post-video">
                        <video controls width="350" height="200">
                          <source :src="getMediaUrl(media)" type="video/mp4" />
                        </video>
                      </div>
                      <div class="post-actions">
                        <div class="update" @click="updatePost(id)">
                          <i class="fa fa-pencil"></i>
                        </div>
                        <deleteAction :data="id" />
                      </div>
                      <div class="post-infos">
                        <router-link :to="{ name: 'Post', params: { PostId: id } }">
                          <p>
                            {{ Reactions.length }}
                            <span>{{ t('DASHBOARD.LISTREACTS') }}</span>
                          </p>
                        </router-link>
                        <router-link :to="{ name: 'Post', params: { PostId: id } }">
                          <p>
                            {{ Comments.length }}
                            <span>{{ t('DASHBOARD.LISTCOMMENT') }}</span>
                          </p>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-posts">
                <h2>{{ t('NO.POST.PROFILE') }}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, computed, watch, onBeforeUnmount } from 'vue';
import EventBus from '../EventBus';
import { useRouter, useRoute } from 'vue-router';

import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';
import { toast } from 'vue3-toastify';

import deleteAction from '../components/DeleteAction.vue';

import { useUserStore } from '@/stores/';
import { Post, UserId } from '@/types';
import { formatDate, getImage } from '@/utils';

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

useHead({
  title: t('PROFIL.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page de profil du site Groupomania',
    },
  ],
});

const posts: Ref<Post[]> = ref([]);
const supportedExtensions = ref({
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
  video: ['mp4', 'avi'],
});
const menuDisplayed: Ref<boolean> = ref(false);

const token = userStore.token;
fetch('http://localhost:3000/api/user/me', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then((data) => userStore.saveConnectedUser(data.user))
  .catch(() => {
    return toast.error(t('ERROR.GENERAL'));
  });

onMounted(() => {
  EventBus.on('deleteActionPressed', (_payload) => deletePost);
  getPosts();
});

function getPosts() {
  const token = userStore.token;
  if (+route.params.UserId < 0) return;
  fetch(`http://localhost:3000/api/user/${+route.params.UserId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then(({ Posts }: UserId) => {
      posts.value = Posts;
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
    }).then(() => {
      getPosts();
      return toast.success(t('POST.SUCCESS.DELETE'));
    });
  }
}

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

const objectUrls = new Map<File, string>();

function getMediaUrl(media: Post['media']): string {
  if (!media) return '';

  if (typeof media === 'string') {
    return media;
  }

  if (!objectUrls.has(media)) {
    const url = URL.createObjectURL(media);
    objectUrls.set(media, url);
  }
  return objectUrls.get(media)!;
}

watch(
  () => posts.value.map((post) => post.media),
  (newMedias, oldMedias) => {
    oldMedias.forEach((media) => {
      if (media instanceof File && !newMedias.includes(media)) {
        const url = objectUrls.get(media);
        if (url) {
          URL.revokeObjectURL(url);
          objectUrls.delete(media);
        }
      }
    });
  },
);

onBeforeUnmount(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls.clear();
});
</script>

<style scoped lang="scss">
.content {
  background-color: var(--app-background-color);
  display: flex;
}

.content-container {
  display: flex;
  justify-content: space-between;
  background-color: var(--app-background-color);
  padding-top: 5vh;
}

.sidebar {
  background-color: var(--app-sidebar-color);
  display: inline-flex;
  z-index: 99999;
  width: 100%;
  height: 100vh;
}

.icons {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  transition: color 450ms ease-in-out;
  height: 70%;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  transition: color 450ms ease-in-out;
  height: 70%;
}

.icons i {
  font-size: 32px;
  padding: 1vh;
}

.post a {
  text-decoration: none;
}

.icons a {
  transition: color 450ms ease-in-out;
  color: var(--app-text-primary-color) !important;

  &:hover {
    opacity: 0.8;
  }
}

.icons img {
  margin: 2vh;
  width: 85px;
  height: 85px;
  object-fit: cover;
}

.box-posts {
  overflow: hidden;
  position: relative;
  width: 100%;
}

.up {
  height: 10vh;
  display: flex;
  justify-content: flex-end;
  padding-right: 4vh;
  position: relative;
}

.post-title {
  text-align: left;
}

.account {
  display: inline-flex;
  align-items: center;
  color: var(--app-text-primary-color);
  padding: 2vh;
}

.account i {
  padding-left: 1vh;
  cursor: pointer;
}

.account img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 30px;
  border: 1px solid #2d3036;
}

.logout {
  height: 5vh;
  padding: 1.5vh;
  position: absolute;
  bottom: 0;
  background: var(--app-text-primary-color);
  z-index: 99999;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  transform: translateY(100%);
  cursor: pointer;
}

.logout i {
  padding: 0.5vh;
}

.logout p {
  color: var(--app-background-color);
}

.logout-enter {
  opacity: 0.5;
}

.logout-enter-active {
  opacity: 1;
}

.profile {
  padding: 0 3vh;
  overflow-x: hidden;
  overflow-y: scroll;
  width: calc(100% + 20px);
  height: 100%;
  background-color: var(--app-background-color);
  border-radius: 30px;
  padding-bottom: 10vh;
  color: var(--app-text-primary-color);
  border-top-left-radius: 30px;
}

.infos {
  text-align: center;
}

.infos h1 {
  padding-top: 2vh;
}

.infos img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 1px solid var(--app-text-primary-color);
  object-fit: cover;
}

.profile-container {
  padding: 2vh;
}

.latest-posts {
  text-align: center;
}

.list-posts {
  border-radius: 30px;
  margin: 0 auto;
}

.no-posts {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 50vh;
}

.post {
  border: 1px solid var(--app-text-primary-color);
  border-radius: 30px;
  margin: 4vh;
  padding: 4vh 0 0 4vh;
  position: relative;
  font-size: 20px;
}

.post-content {
  text-align: left;
}

.post-image img {
  width: 350px;
  height: 200px;
  object-fit: cover;
  padding-top: 2vh;
}

.post-video {
  padding-top: 2vh;
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 4vh;
  top: 2vh;
}

.update {
  padding: 1vh;
  transition: all 450ms ease-in-out;
}

.update :hover {
  color: var(--app-text-primary-color);
  transform: scale(1.11);
}

.post-infos {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  bottom: 0;
  right: 2vh;
}

.post-infos p {
  padding: 1vh;
  cursor: pointer;
  font-size: medium;
  color: var(--app-text-primary-color);
}

@media (max-width: 700px) {
  .sidebar {
    display: initial;
    height: initial;
  }

  .box-posts {
    position: initial;
    padding-bottom: 10vh;
  }

  .icon {
    height: 0;
  }

  .icons {
    height: initial;
  }

  .logout {
    height: 8vh;
    padding: 0.5vh;
    text-align: center;
    bottom: -4vh;
    right: -1vh;
  }

  .icon-container {
    flex-direction: row;
    position: fixed;
    bottom: 0;
    height: initial;
    width: 100%;
    left: 0;
    right: 0;
    padding: 2vh;
    background: var(--app-sidebar-color);
    z-index: 9999;
    margin-top: 5vh;
  }

  .up {
    position: absolute;
    top: 2vh;
    right: 2vh;
    padding-right: 0;
  }

  .post {
    padding: 2vh;
    position: relative;
    margin: 2vh;
  }

  .post p {
    font-size: 20px;
  }

  .align {
    text-align: center;
  }

  .no-posts h2 {
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

  .profile {
    padding: 0;
    border-radius: 0;
    width: initial;
  }

  .post-title {
    text-align: center;
  }

  .post-infos {
    right: initial;
    justify-content: center;
  }

  .post-infos p {
    text-align: center;
  }

  .profile-container {
    padding: initial;
  }
}
</style>
