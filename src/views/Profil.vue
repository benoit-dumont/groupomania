<template>
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
                <ModifyAction :data="id" />
                <DeleteAction :data="id" />
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
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch, onBeforeUnmount } from 'vue';
import EventBus from '../EventBus';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';

import ModifyAction from '../components/ModifyAction.vue';
import DeleteAction from '../components/DeleteAction.vue';

import { useUserStore } from '@/stores/';
import { Post, UserId } from '@/types';
import { formatDate } from '@/utils';
import { useToast, useConnectedUser } from '@/composables';

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const getConnectedUser = useConnectedUser();

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

onMounted(async () => {
  await getConnectedUser();
  EventBus.on('modifyActionPressed', (_payload: number) => updatePost);
  EventBus.on('deleteActionPressed', (_payload: number) => deletePost);
  getPosts();
});

function getPosts() {
  const token = userStore.token!.token;
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
    const token = userStore.token!.token;
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
.post a {
  text-decoration: none;
}

.post-title {
  text-align: left;
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
  background-color: var(--app-sidebar-color);
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
  gap: 1vh;
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
