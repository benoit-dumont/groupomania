<template>
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
        v-for="{ id, title, content, media, UserId, User, Reactions, Comments, createdAt } in posts"
        :key="id"
        class="post"
      >
        <div class="post-container">
          <router-link :to="{ name: 'Profil', params: { UserId } }">
            <img :src="User!.avatar" :alt="t('ALTIMAGEPROFILE')" />
            <div class="align">
              <p>
                {{ User!.name }} {{ User!.firstname }} <br />
                {{ formatDate(createdAt) }}
              </p>
            </div>
          </router-link>
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
              <img :src="media.toString()" :alt="t('ALTMEDIA')" />
            </router-link>
          </div>

          <div v-if="media && isVideo(media)" class="post-video">
            <video controls width="350" height="200">
              <source :src="media.toString()" type="video/mp4" />
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
</template>

<script setup lang="ts">
import EventBus from '../EventBus';
import { ref, onMounted, Ref, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';

import DeleteAction from '../components/DeleteAction.vue';

import { useUserStore } from '@/stores/';
import { Post } from '@/types';
import { formatDate } from '@/utils';
import { useConnectedUser, useToast } from '@/composables';

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();
const toast = useToast();
const getConnectedUser = useConnectedUser();

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
const comContent = ref('');

// getConnectedUser();

onMounted(() => {
  EventBus.on('deleteActionPressed', (payload: number) => deletePost(payload));
  fetchPosts();
});

function fetchPosts() {
  const token = userStore.token!.token;
  fetch('http://localhost:3000/api/post', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => (posts.value = data))
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

async function submit() {
  if (title.value.length === 0) {
    return toast.error(t('TITLE.INPUT'));
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

  const token = userStore.token!.token;
  if (media.value) {
    const data = new FormData();
    data.append('media', media.value);
    data.append('title', title.value);
    data.append('content', contentPost.value);
    try {
      return fetch('http://localhost:3000/api/post', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      })
        .then((response) => response.json())
        .then(() => {
          fetchPosts();
          return toast.success(t('POST.CREATED.WITHMEDIA'));
        });
    } catch (error) {
      return toast.error('error');
    }
  }
  try {
    return await fetch('http://localhost:3000/api/post', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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
  } catch (error) {
    return toast.error('error');
  }
}

function createComment(data: Post['id']) {
  const regexContent =
    /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ'"?!., _-]{4,255}$/;
  if (!regexContent.test(comContent.value)) {
    return toast.error(t('COMMENT.CONTENT.FORMAT'));
  }
  const token = userStore.token!.token;
  return fetch('http://localhost:3000/api/comment', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
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
    const token = userStore.token!.token;
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
.align a {
  text-decoration: none;
}

.post a {
  text-decoration: none;
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
  cursor: pointer;
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
}

.post-container a {
  display: flex;
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
