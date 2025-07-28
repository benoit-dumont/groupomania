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
              v-if="userStore.connectedUser?.rank === 1 || userStore.connectedUser?.rank === 2"
              :to="{ name: 'Home Dashboard' }"
              ><i class="fas fa-tools"></i
            ></router-link>
          </div>
        </div>
        <div class="box-posts">
          <div class="up">
            <div class="account">
              <img :src="userStore.connectedUser?.avatar" :alt="t('ALTIMAGEPROFILE')" />
              <i
                v-if="menuDisplayed === false"
                class="fas fa-sort-down"
                @click="() => (menuDisplayed = !menuDisplayed)"
              ></i>
              <i v-else class="fas fa-sort-up" @click="() => (menuDisplayed = !menuDisplayed)"></i>
            </div>
            <transition name="logout">
              <div v-if="menuDisplayed === true" class="logout">
                <p @click="() => userStore.logout()">
                  <i class="fas fa-sign-out-alt"></i>{{ t('LOGOUT') }}
                </p>
              </div>
            </transition>
          </div>
          <div class="posts">
            <h1>{{ t('ACCUEIL.CREATEPOST') }}</h1>
            <form @submit.prevent="submit">
              <input
                v-model="title"
                type="text"
                name="title"
                class="title-form"
                :placeholder="t('ACCUEIL.TITLEPLACEHOLDER')"
              />
              <input
                v-model="contentPost"
                type="text"
                class="content-form-post"
                :placeholder="t('ACCUEIL.CONTENTPLACEHOLDER')"
              />
              <label for="post-image"><i class="fas fa-camera"></i></label>
              <input id="post-image" type="file" @change="tempStoreImage" />

              <input type="submit" :value="t('ACCUEIL.BUTTONPOSTVALUE')" class="btn" />
              <p v-if="media" class="filename">
                {{ t('ACCUEIL.SELECTEDIMAGE') }}
                <i class="fas fa-check-circle"></i>
              </p>
            </form>
            <div v-if="posts.length !== 0">
              <div
                v-for="{
                  id,
                  content,
                  media,
                  UserId,
                  User,
                  Reactions,
                  Comments,
                  createdAt,
                } in posts"
                :key="id"
                class="post"
              >
                <div class="post-container">
                  <router-link :to="{ name: 'Profil', params: { UserId } }">
                    <img :src="User!.avatar" :alt="t('ALTIMAGEPROFILE')" />
                  </router-link>
                  <div class="align">
                    <router-link :to="{ name: 'Profil', params: { UserId } }">
                      <p>
                        {{ User!.name }} {{ User!.firstname }} <br />
                        {{ formatDate(createdAt) }}
                      </p>
                    </router-link>
                  </div>
                </div>
                <div class="post-content">
                  <router-link :to="{ name: 'Post', params: { PostId: id } }">
                    <h2>{{ title }}</h2>
                  </router-link>
                  <router-link :to="{ name: 'Post', params: { PostId: id } }">
                    <p>
                      {{ content }}
                    </p>
                  </router-link>
                  <div v-if="media && isImage(media)" class="post-image">
                    <router-link :to="{ name: 'Post', params: { PostId: id } }">
                      <img :src="mediaUrl" :alt="t('ALTMEDIA')" />
                    </router-link>
                  </div>

                  <div v-if="media && isVideo(media)" class="post-video">
                    <video controls width="350" height="200">
                      <source :src="mediaUrl" type="video/mp4" />
                    </video>
                  </div>
                  <div class="comments">
                    <form class="form-add-comment" @submit.prevent="createComment(id)">
                      <input
                        v-model="comContent"
                        type="text"
                        name="comContent"
                        class="comment-content"
                        placeholder="Ajouter un commentaire"
                      />
                      <input type="submit" :value="t('ACCUEIL.BUTTONPOSTVALUE')" class="btn" />
                    </form>
                  </div>
                </div>
                <div
                  v-if="
                    userStore.connectedUser?.id === User!.id ||
                    userStore.connectedUser?.rank === 1 ||
                    userStore.connectedUser?.rank === 2
                  "
                  class="post-actions"
                >
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
            <div v-else class="no-post">
              <h2>{{ t('NO.POST.HOME') }}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EventBus from '../EventBus';
import { ref, onMounted, Ref, computed, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';
import { toast } from 'vue3-toastify';

import DeleteAction from '../components/DeleteAction.vue';

import { useUserStore } from '@/stores/';
import { Post } from '@/types';
import { formatDate, getImage } from '@/utils';

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();

useHead({
  title: t('ACCUEIL.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page d’accueil du site Groupomania',
    },
  ],
});

const title = ref('');
const contentPost = ref('');
const media: Ref<Post['media']> = ref(null);
const posts: Ref<Post[]> = ref([]);
const supportedExtensions = ref({
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
  video: ['mp4', 'avi'],
});
const menuDisplayed: Ref<boolean> = ref(false);
const comContent = ref('');

const token = userStore.token;
fetch('http://localhost:3000/api/user/me', {
  method: 'GET',
  headers: {
    Authorization: `Bearer: ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then(({ user }) => {
    userStore.saveConnectedUser(user);
  })
  .catch(() => {
    return toast.success(t('ERROR.GENERAL'), {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
  });

onMounted(() => {
  EventBus.on('deleteActionPressed', (_payload) => deletePost);
  fetchPosts();
});

function fetchPosts() {
  const token = userStore.token;
  fetch('http://localhost:3000/api/post', {
    method: 'GET',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => (posts.value = data))
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'), {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    });
}

function submit() {
  if (title.value.length === 0) {
    return toast.error(t('TITLE.INPUT'), {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
  }
  if (contentPost.value.length === 0) {
    return toast.error(t('CONTENT.INPUT'));
  }
  const regexTitle =
    /^[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-z0-9àèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ?'"! _-]{2,15}$/;
  const regexContent =
    /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ'"?!., _-]{4,255}$/;
  if (!regexTitle.test(title.value)) {
    return toast.error(t('TITLE.FORMAT'));
  }
  if (!regexContent.test(contentPost.value)) {
    return toast.error(t('CONTENT.FORMAT'));
  }
  const token = userStore.token;
  if (media.value) {
    const data = new FormData();
    data.append('media', media.value);
    data.append('title', title.value);
    data.append('content', contentPost.value);
    return fetch('http://localhost:3000/api/post', {
      method: 'POST',
      headers: {
        Authorization: `Bearer: ${token}`,
      },
      body: data,
    })
      .then((response) => response.json())
      .then(() => {
        fetchPosts();
        return toast.success(t('POST.CREATED.WITHMEDIA'));
      });
  }
  return fetch('http://localhost:3000/api/post', {
    method: 'POST',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title.value,
      content: contentPost.value,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      fetchPosts();
      return toast.success(t('POST.CREATED.WITHOUTMEDIA'));
    });
}

function createComment(data: Post['id']) {
  const regexContent =
    /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ'"?!., _-]{4,255}$/;
  if (!regexContent.test(comContent.value)) {
    return toast.error(t('COMMENT.CONTENT.FORMAT'));
  }
  const token = userStore.token;
  return fetch('http://localhost:3000/api/comment', {
    method: 'POST',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: comContent.value,
      PostId: data,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      fetchPosts();
      return toast.success(t('COMMENT.SUCCESS'));
    });
}

function tempStoreImage(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    media.value = file;
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

const mediaUrl = computed(() => {
  if (!media.value) return '';
  if (typeof media.value === 'string') return media.value;
  return URL.createObjectURL(media.value);
});

// Pour éviter les fuites mémoire, on révoque l’URL quand le media change
let currentObjectUrl: string | null = null;
watch(media, (newVal, oldVal) => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  if (newVal instanceof File) {
    currentObjectUrl = URL.createObjectURL(newVal);
  }
});

onBeforeUnmount(() => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }
});

function updatePost(id: Post['id']) {
  router.push({
    name: 'Post Modification',
    params: { PostId: id },
  });
}

function deletePost(id: Post['id']) {
  const validation = window.confirm(t('CONFIRM.POST'));
  if (validation) {
    const token = userStore.token;
    fetch(`http://localhost:3000/api/post/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer:' ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(() => fetchPosts());
  }
}
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

.icons i {
  font-size: 32px;
  padding: 1vh;
}

.align a {
  text-decoration: none;
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

.icon-container {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  transition: color 450ms ease-in-out;
  height: 70%;
}

.up {
  height: 10vh;
  display: flex;
  justify-content: flex-end;
  padding-right: 4vh;
  position: relative;
}

.account {
  display: inline-flex;
  align-items: center;
  color: var(--app-text-primary-color);
  padding: 2vh;
}

.account img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 30px;
  border: 1px solid #2d3036;
}

.account i {
  padding-left: 1vh;
  cursor: pointer;
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

.box-posts {
  overflow: hidden;
  position: relative;
  width: 100%;
}

.no-post {
  color: var(--app-text-primary-color);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.posts {
  padding: 5vh;
  overflow-x: hidden;
  overflow-y: scroll;
  width: calc(100% + 20px);
  height: 100%;
  background-color: var(--app-background-color);
  border-radius: 30px;
  padding-bottom: 10vh;
  position: relative;
}

.posts h1 {
  font-size: 45px;
  color: var(--app-text-primary-color);
  text-align: left;
  margin-bottom: 0;
}

.title-form {
  max-width: 300px;
  padding-left: 2vh;
}

.content-form-post {
  max-width: 70%;
  padding-left: 2vh;
}

.filename {
  position: absolute;
  right: 1px;
  bottom: -1vh;
  color: var(--app-text-primary-color);
}

.filename i {
  font-size: 16px !important;
}

.btn {
  width: fit-content !important;
}

.posts form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4vh 0;
  flex-wrap: wrap;
  position: relative;
}

.posts form i {
  font-size: 48px;
}

.posts form label i {
  -webkit-text-stroke: 1px #707070;
  color: #3a3a3a;
  -webkit-text-fill-color: transparent;
  transition: all 450ms ease-in-out;
  cursor: pointer;
}

.update :hover {
  color: var(--app-text-primary-color);
  transform: scale(1.11);
}

.posts form label :hover,
.posts form label :active {
  -webkit-text-stroke: 1px var(--app-text-primary-color);
}

.posts form input {
  background-color: var(--app-input-background-color);
  border: 1px #707070 solid;
  border-radius: 30px;
  height: 42px;
  width: 100%;
  color: var(--app-text-primary-color);
}

.posts form input:focus-visible {
  outline: 1px solid var(--app-border-color);
}

.posts form input::placeholder {
  font-family: Nunito, sans-serif;
  font-size: large;
}

.post-content {
  text-align: justify;
  padding-top: 2vh;
}

.post-content h2 {
  color: var(--app-text-primary-color);
}

#post-image {
  display: none;
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
}

.post {
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--app-text-primary-color);
  padding: 4vh 0 0 4vh;
  border-radius: 30px;
  margin: 1vh 0;
  position: relative;
  font-size: 20px;
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

.update {
  padding: 1vh;
}

.form-add-comment {
  padding-right: 4vh !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-content {
  padding-left: 2vh;
  max-width: 95%;
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
    bottom: -2vh;
    right: -1vh;
    width: initial;
    text-align: center;
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
    padding: 0 0 2vh;
  }

  .align {
    text-align: center;
  }

  .list-posts {
    padding-bottom: 10vh;
  }

  .posts {
    margin-bottom: 0;
    height: initial;
    padding: 2vh 2.5vh;
    width: initial;
    min-height: 80vh;
    border-radius: 0;
  }

  .posts h1 {
    text-align: center;
  }

  .posts form {
    flex-direction: column;
    gap: 20px;
    padding: 2vh 0;
  }

  .posts form ::placeholder {
    text-align: center;
  }

  .post-container {
    flex-direction: column;
    padding: 2vh;
  }

  .post-content {
    padding: 2vh;
    padding-top: 0;
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

  .title-form {
    padding-left: 0;
    max-width: 80%;
  }

  .content-form-post {
    padding-left: 0;
    max-width: 80%;
  }

  .no-post {
    text-align: center;
  }

  .post-infos {
    right: initial;
    justify-content: center;
  }

  .comments form ::placeholder {
    text-align: center;
  }

  .post-infos p {
    text-align: center;
  }

  .form-add-comment {
    padding-right: 0 !important;
  }

  .comment-content {
    padding-left: 0;
    max-width: initial;
  }
}
</style>
