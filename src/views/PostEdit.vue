<template>
  <div class="update">
    <h1>{{ t('POSTEDIT.TITLE') }}</h1>
    <div class="update-container">
      <div class="media">
        <label for="post-image" class="design">
          <div class="message">
            <div v-if="mediaUrl && isImage(mediaUrl)" class="post-image">
              <img :src="mediaUrl" :alt="t('ALTMEDIA')" />
            </div>
            <div v-if="mediaUrl && isVideo(mediaUrl)" class="post-video">
              <video controls width="250">
                <source :src="mediaUrl" type="video/mp4" />
              </video>
            </div>
            <p>{{ t('POSTEDIT.MEDIAOPACITYMESSAGE') }}</p>
          </div>
          <input id="post-image" type="file" class="upload" @change="updateMedia" />
        </label>
      </div>
      <div v-if="post.media === null" class="upload-image">
        <label for="post-image" class="design"
          ><i class="fas fa-upload"></i> {{ t('POSTEDIT.MEDIAUPLOAD') }}</label
        >
        <input id="post-image" type="file" class="upload" @change="updateMedia" />
      </div>
      <div class="update-form">
        <form class="form-post-edit" @submit.prevent="submit">
          <div class="champ">
            <label>{{ t('POSTEDIT.TITLELABEL') }} *</label>
            <br />
            <input
              v-model="post.title"
              type="text"
              name="title"
              :placeholder="t('POSTEDIT.TITLEPLACEHOLDER')"
              :pattern="patternTitleString"
            />
          </div>
          <div class="champ">
            <label>{{ t('POSTEDIT.CONTENTLABEL') }} *</label>
            <br />
            <textarea
              v-model="post.content"
              name="content"
              :placeholder="t('POSTEDIT.CONTENTPLACEHOLDER')"
              :pattern="patternContentString"
            ></textarea>
          </div>
          <br />
          <input type="submit" name="submit" :value="t('POSTEDIT.SUBMITBUTTON')" class="btn" />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';
import { useRoute, useRouter } from 'vue-router';

import { useUserStore } from '@/stores/';
import { Post } from '@/types';
import { useToast } from '@/composables';

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

useHead({
  title: t('POSTEDIT.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page de modification du post du site Groupomania',
    },
  ],
});

const patternTitleString = ref(
  '[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-z0-9àèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ?\'"! _\\-]{2,15}',
);
const patternContentString = ref(
  '[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ\'"?!., _\\-]{4,255}',
);
const post: Ref<Post> = ref({
  id: 0,
  title: '',
  content: '',
  media: null,
  createdAt: '',
  updatedAt: '',
  UserId: 0,
  User: {
    id: 0,
    username: '',
    avatar: '',
    name: '',
    firstname: '',
  },
  Reactions: [],
  Comments: [],
});
const supportedExtensions = ref({
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
  video: ['mp4', 'avi'],
});

onMounted(async () => {
  fetchPostData();
});

function fetchPostData() {
  const token = userStore.token!.token;
  if (+route.params.PostId < 0) return;
  fetch(`http://localhost:3000/api/post/${+route.params.PostId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: Post) => {
      post.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function updateMedia(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];

  const data = new FormData();
  data.append('media', file);
  const token = userStore.token!.token;
  if (+route.params.PostId < 0) return;
  fetch(`http://localhost:3000/api/post/${+route.params.PostId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  }).then(() => fetchPostData());
}

function submit() {
  const patternTitle = new RegExp(patternTitleString.value);
  const patternContent = new RegExp(patternContentString.value);

  if (!patternTitle.test(post.value.title) || !patternContent.test(post.value.content)) {
    return false;
  }
  const token = userStore.token!.token;
  if (+route.params.PostId < 0) return false;
  return fetch(`http://localhost:3000/api/post/${+route.params.PostId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: post.value.title,
      content: post.value.content,
    }),
  }).then(() => {
    router.push({ name: 'Accueil' });
    fetchPostData();
  });
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
  if (!post.value.media) return '';
  if (typeof post.value.media === 'string') return post.value.media;
  return URL.createObjectURL(post.value.media);
});

let currentObjectUrl: string | null = null;
watch(
  () => post.value.media,
  (newVal, oldVal) => {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    if (newVal instanceof File) {
      currentObjectUrl = URL.createObjectURL(newVal);
    }
  },
);
</script>

<style scoped lang="scss">
.update {
  background-color: var(--app-background-color);
  height: 100%;
  border-top-left-radius: 30px;
}

.update h1 {
  padding: 3vh 0;
  color: var(--app-text-primary-color);
  text-align: center;
}

.update-container {
  text-align: center;
  width: 100%;
}

.update-container img {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.update-form {
  color: var(--app-text-primary-color);
  padding: 2vh;
}

.update-image input {
  color: var(--app-text-primary-color);
}

.upload {
  display: none;
}

.design {
  color: var(--app-text-primary-color);
}

.design i {
  padding: 0.5vh;
}

.message {
  position: relative;
  border-radius: 50%;
}

.message:hover img {
  opacity: 0.6;
  transition: all 450ms ease-in-out;
}

.message p {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  transition: all 450ms ease-in-out;
}

.message:hover p {
  display: block;
  color: var(--app-text-primary-color);
  transition: all 450ms ease-in-out;
}

.form-post-edit {
  margin: 2vh;
}

.champ input,
.champ textarea {
  max-width: 418px;
  width: 100%;
  height: 48px;
  font-family: Nunito, sans-serif;
  text-align: center;
  font-size: 18px;
  margin-bottom: 30px;
  border-radius: 12px;
  border: 1px #707070 solid;
}

.champ textarea {
  height: 200px;
  resize: none;
}

.btn {
  border: 1px solid #a6a6a6;
  color: var(--app-background-color);
  transition: all 450ms ease-in-out;
}

.btn:hover {
  background-color: var(--app-text-primary-color);
  color: var(--app-background-color);
}
@media (max-width: 700px) {
  .update {
    border-top-left-radius: 0;
  }

  .form-post-edit {
    width: 100%;
    margin: 0;
    padding-top: 2vh;
    padding-bottom: 15vh;
  }
}
</style>
