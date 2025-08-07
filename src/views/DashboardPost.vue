<template>
  <div class="middle">
    <div class="middle-container">
      <h1>{{ t('DASHBOARDPOST.TITLE') }}</h1>
      <div class="list-posts">
        <div v-for="{ id, title, content, media, User, createdAt } in posts" :key="id" class="post">
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
</template>

<script setup lang="ts">
import EventBus from '../EventBus';
import { Ref, ref, onMounted, onBeforeUnmount } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import deleteAction from '../components/DeleteAction.vue';

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
const objectUrlMap = new Map<File, string>();

onMounted(async () => {
  await getConnectedUser();
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
    const token = userStore.token!.token;
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
.middle {
  background-color: var(--app-background-color);
  width: 100%;
  color: var(--app-text-primary-color);
  height: 100vh;
}

.middle-container h1 {
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

  .data-table {
    padding-bottom: 10vh;
  }
}
</style>
