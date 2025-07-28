<template>
  <div v-if="post" class="test">
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
          <div class="page">
            <div class="post">
              <div class="post-title">
                <img :src="post.User!.avatar" :alt="t('ALTIMAGEPROFILE')" />
                <div class="align">
                  <p>
                    {{ post.User!.name }} {{ post.User!.firstname }} <br />
                    {{ formatDate(post.createdAt) }}
                  </p>
                </div>
              </div>
              <div class="post-content">
                <h2>{{ post.title }}</h2>
                <p>
                  {{ post.content }}
                </p>
              </div>
              <div v-if="mediaUrl && isImage(mediaUrl)" class="post-image">
                <img :src="mediaUrl" :alt="t('ALTMEDIA')" />
              </div>
              <div v-if="mediaUrl && isVideo(mediaUrl)" class="post-video">
                <video controls width="350" height="200">
                  <source :src="mediaUrl" type="video/mp4" />
                </video>
              </div>
              <div
                v-if="
                  userStore.connectedUser!.id === post.User!.id ||
                  userStore.connectedUser!.rank === 1 ||
                  userStore.connectedUser!.rank === 2
                "
                class="post-actions"
              >
                <div class="update" @click="updatePost(post.id)">
                  <i class="fa fa-pencil"></i>
                </div>
                <deleteAction :data="post.id" />
              </div>
              <div class="reactions">
                <h3>Réactions :</h3>
                <div class="reactions-container">
                  <div
                    v-for="reaction in reactionsList"
                    :key="reaction.type"
                    :class="reaction.active ? reaction.onClass : reaction.offClass"
                    @click="toggleReaction(reaction.type)"
                  >
                    <i :class="reaction.icon"></i>
                    <span>{{ reaction.count }}</span>
                  </div>
                </div>
              </div>
            </div>
            <ul v-if="post.Comments.length !== 0" class="comments">
              <li v-for="comment in post.Comments" :key="comment.id" class="comment">
                <div class="comment-title">
                  <img :src="comment.User!.avatar" />
                  <p>
                    {{ comment.User!.name }} {{ comment.User!.firstname }} <br />
                    {{ formatDate(comment.createdAt) }}
                  </p>
                </div>
                <div class="comment-content">
                  <p>{{ comment.content }}</p>
                </div>
                <div
                  v-if="
                    userStore.connectedUser!.id === comment.User!.id ||
                    userStore.connectedUser!.rank === 1 ||
                    userStore.connectedUser!.rank === 2
                  "
                  class="comment-actions"
                >
                  <div class="update" @click="updateComment(comment.id)">
                    <i class="fa fa-pencil"></i>
                  </div>
                  <deleteAction :data="comment.id" />
                </div>
              </li>
            </ul>
            <div v-else class="no-comment">
              <h2>{{ t('NO.COMMENT') }}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EventBus from '../EventBus';
import { Ref, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';
import { toast } from 'vue3-toastify';

import deleteAction from '../components/DeleteAction.vue';

import { useUserStore } from '@/stores/';
import { formatDate, getImage } from '@/utils';
import { Post, User, Comment, ReactionTypes, Reaction } from '@/types';

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

useHead({
  title: t('POST.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page concernant un post sur le site Groupomania',
    },
  ],
});

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
const menuDisplayed: Ref<boolean> = ref(false);

const token = userStore.token;
fetch('http://localhost:3000/api/user/me', {
  method: 'GET',
  headers: {
    Authorization: `Bearer: ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then((response) => response.json())
  .then(({ user }) => userStore.saveConnectedUser(user))
  .catch((error) => {
    return toast.error(`An error occurred: ${error}`);
  });

onMounted(() => {
  EventBus.on('deleteActionPressed', (_payload) => deleteResource);
  fetchPostData();
});

function fetchPostData() {
  const token = userStore.token;
  if (+route.params.PostId < 0) return;
  fetch(`http://localhost:3000/api/post/${+route.params.PostId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: Post) => {
      post.value = data;
    })
    .catch((error) => {
      return toast.error(`An error occurred: ${error}`);
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

function updatePost(id: Post['id']) {
  router.push({
    name: 'Post Modification',
    params: { PostId: id },
  });
}
function deletePost({ id }: Post) {
  // eslint-disable-next-line no-alert
  const validation = window.confirm('Are you sure you want to delete this post ?');
  if (validation === true) {
    const token = userStore.token;
    fetch(`http://localhost:3000/api/post/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(() => {
      return router.push({
        name: 'Accueil',
      });
    });
  }
}

function updateComment(id: Comment['id']) {
  router.push({
    name: 'Comment Modification',
    params: { CommentId: id },
  });
}
function deleteComment({ id }: Comment) {
  // eslint-disable-next-line no-alert
  const validation = window.confirm('Are you sure you want to delete this comment ?');
  if (validation === true) {
    const token = userStore.token;
    fetch(`http://localhost:3000/api/comment/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(() => fetchPostData());
  }
}

function isPost(data: Post | Comment): data is Post {
  return 'Comments' in data;
}

function deleteResource(data: Comment | Post) {
  isPost(data) ? deletePost(data) : deleteComment(data);
}

const reactionTypes: ReactionTypes[] = [
  {
    type: '1',
    icon: 'fas fa-thumbs-up',
    onClass: 'likes-on',
    offClass: 'likes-off',
  },
  {
    type: '2',
    icon: 'fas fa-thumbs-down',
    onClass: 'dislikes-on',
    offClass: 'dislikes-off',
  },
  {
    type: '3',
    icon: 'fas fa-heart',
    onClass: 'loves-on',
    offClass: 'loves-off',
  },
];

// Fonctions utilitaires pour calculer les réactions
const getReactionsByType = (type: ReactionTypes['type']) =>
  post.value.Reactions.filter((r) => r.type === type);

const getHasReactedTo = (type: ReactionTypes['type']) =>
  post.value.Reactions.find((r) => r.type === type && r.UserId === +userStore.connectedUser!.id);

// Construction de la liste dynamique pour la boucle dans le template
const reactionsList = computed(() =>
  reactionTypes.map((rt) => {
    const reactions = getReactionsByType(rt.type);
    const userReaction = getHasReactedTo(rt.type);
    return {
      ...rt,
      count: reactions.length,
      active: !!userReaction,
      userReaction,
    };
  }),
);

// Méthodes à adapter selon ton implémentation
const addReaction = (type: ReactionTypes['type']) => {
  const token = userStore.token;
  fetch(`http://localhost:3000/api/reaction/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      PostId: +route.params.PostId,
      type,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      fetchPostData();
      return toast.success('Successfully Created the Reaction');
    })
    .catch((error) => {
      return toast.error(`An error occurred: ${error}`);
    });
};

const deleteReaction = (id: Reaction['id']) => {
  const token = userStore.token;
  if (+id < 0) return;
  fetch(`http://localhost:3000/api/reaction/${+id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then(() => {
      fetchPostData();
      toast.success('Successfully Deleted the Reaction');
    })
    .catch((error) => {
      return toast.error(`An error occurred: ${error}`);
    });
};

const updateReaction = (id: Reaction['id'], type: ReactionTypes['type']) => {
  const token = userStore.token;
  if (+id < 0) return;
  fetch(`http://localhost:3000/api/reaction/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      PostId: +route.params.PostId,
      type,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      fetchPostData();
      return toast.success('Successfully Modified the Reaction');
    })
    .catch((error) => {
      return toast.error(`An error occurred: ${error}`);
    });
};

// Fonction de gestion du clic
const toggleReaction = (type: ReactionTypes['type']) => {
  const current = post.value.Reactions.find((r) => r.UserId === userStore.connectedUser!.id);
  if (!current) return addReaction(type);
  if (current.type === type) return deleteReaction(current.id);
  return updateReaction(current.id, type);
};
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
  height: 100vh;
  display: inline-flex;
  z-index: 99999;
  width: 100%;
}

.icons {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  transition: color 450ms ease-in-out;
  height: 70%;
}

.icons img {
  margin: 2vh;
  width: 85px;
  height: 85px;
  object-fit: cover;
}

.icons i {
  font-size: 32px;
  padding: 1vh;
}

.icons a {
  transition: color 450ms ease-in-out;
  color: var(--app-text-primary-color);

  &:hover {
    opacity: 0.8;
  }
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

.post-title {
  display: flex;
  align-items: center;
  padding-bottom: 2vh;
}

.align {
  display: inline-flex;
  flex-direction: column;
  padding-left: 2vh;
}

.align p {
  font-size: large;
}

.logout {
  height: 5vh;
  padding: 1.5vh;
  position: absolute;
  bottom: 0;
  background: var(--app-background-color);
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
  color: var(--app-text-primary-color);
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

.page {
  background: var(--app-background-color);
  height: 100%;
  border-top-left-radius: 30px;
  display: flex;
}

.post {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: stretch;
  height: 100%;
  flex-grow: 0;
  color: var(--app-text-primary-color);
  padding: 10vh 5vh;
  position: relative;
  flex-direction: column;
  overflow-x: scroll;
}

.post img {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
}

.post p {
  font-size: large;
}

.post-image img {
  max-width: 500px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  margin: 0;
}

.post-video video {
  max-width: 500px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  margin: 0;
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 10vh;
  top: 10vh;
  color: var(--app-text-primary-color);
}

.comments {
  padding: 2vh;
  overflow-y: scroll;
  height: 100%;
  padding-bottom: 10vh;
  overflow-x: hidden;
  border-left: solid 2vh var(--app-sidebar-color);
  flex-grow: 1;
}

.comment-container h1 {
  color: var(--app-text-primary-color);
  padding: 2vh;
}

.comment {
  color: var(--app-text-primary-color);
  padding: 2vh;
  border: 1px solid var(--app-border-color);
  margin: 2vh;
  border-radius: 30px;
  list-style-type: none;
  position: relative;
}

.comment img {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
}

.update {
  padding: 1vh;
}

.comment-title {
  display: inline-flex;
  align-items: center;
  padding-bottom: 4vh;
  width: 100%;
}

.comment-title p {
  padding-left: 2vh;
  font-size: large;
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 5vh;
  top: 5vh;
  color: var(--app-text-primary-color);
}

.reactions {
  height: 100%;
  padding: 2vh 0;
}

.reactions-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 25%;
}

.likes-off i,
.dislikes-off i,
.loves-off i {
  padding: 1vh;
  font-size: large;
}

.likes-on i {
  padding: 1vh;
  font-size: large;
  color: green;
}

.dislikes-on i {
  padding: 1vh;
  font-size: large;
  color: red;
}

.loves-on i {
  padding: 1vh;
  font-size: large;
  color: red;
}

.no-comment {
  color: var(--app-text-primary-color);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-left: 2vh solid var(--app-sidebar-color);
  flex-grow: 1;
}

@media (max-width: 1000px) {
  .sidebar {
    display: initial;
  }

  .box-posts {
    position: initial;
  }

  .icons {
    height: initial;
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
    top: 3vh;
    right: 2vh;
    padding-right: 0;
  }

  .page {
    display: block;
    border-top-left-radius: 0;
  }

  .post {
    width: 100%;
  }

  .comments {
    border-left: 0;
  }

  .logout {
    height: 8vh;
    padding: 0.5vh;
    width: 100%;
    text-align: center;
    bottom: -4vh;
    right: -2vh;
  }

  .no-comment {
    border-left: 0;
    min-height: 30vh;
    text-align: center;
    height: 100%;
    align-items: initial;
    padding-top: 2vh;
  }
}
@media (max-width: 400px) {
  .post {
    padding: 2vh;
    padding-bottom: 4vh;
  }

  .post-title {
    flex-direction: column;
  }

  .comment-title {
    flex-direction: column;
  }

  .comment-title p {
    text-align: center;
  }

  .comment-content p {
    padding-bottom: 5vh;
  }

  .reactions-container {
    width: 100%;
  }

  .post-actions {
    right: 0;
    left: 0;
    bottom: 1vh;
    top: initial;
    justify-content: center;
  }

  .comment-actions {
    right: 0;
    left: 0;
    bottom: 1vh;
    top: initial;
    justify-content: center;
  }
}
</style>
