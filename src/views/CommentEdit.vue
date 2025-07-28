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
          <div class="update">
            <h1>{{ t('COMMENTEDIT.TITLE') }}</h1>
            <div class="update-container">
              <div class="update-form">
                <form class="form-com-edit" @submit.prevent="submit">
                  <div class="champ">
                    <label>{{ t('COMMENTEDIT.CONTENTLABEL') }} *</label>
                    <br />
                    <textarea
                      v-model="comment.content"
                      name="content"
                      :placeholder="t('COMMENTEDIT.CONTENTPLACEHOLDER')"
                      :pattern="patternContent"
                    ></textarea>
                  </div>
                  <br />
                  <input
                    type="submit"
                    name="submit"
                    :value="t('COMMENTEDIT.SUBMITBUTTON')"
                    class="btn"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { useUserStore } from '@/stores/';
import { getImage } from '@/utils';
import { CommentId } from '@/types';
import { useConnectedUser, useToast } from '@/composables';

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();
const toast = useToast();
const getConnectedUser = useConnectedUser();

useHead({
  title: t('COMMENTEDIT.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page de modification de commentaire du site Groupomania',
    },
  ],
});

const patternContent = ref(
  '[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ\'"?!., _-]{4,255}',
);
const comment = ref<CommentId>({
  id: 0,
  content: '',
  createdAt: '',
  updatedAt: '',
  UserId: 0,
  PostId: 0,
});
const menuDisplayed: Ref<boolean> = ref(false);

onMounted(async () => {
  await getConnectedUser();
  fetchCommentData();
});

function fetchCommentData() {
  const token = userStore.token;
  if (+route.params.CommentId < 0) return;
  fetch(`http://localhost:3000/api/comment/${+route.params.CommentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: CommentId) => {
      comment.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function submit() {
  const regexContent =
    /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ'"?!., _-]{4,255}$/;
  const { content } = comment.value;
  if (!regexContent.test(content)) {
    return false;
  }
  const token = userStore.token;
  if (+route.params.CommentId < 0) return false;
  return fetch(`http://localhost:3000/api/comment/${+route.params.CommentId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
    }),
  }).then(() => fetchCommentData());
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
  background: var(--app-background-color);
  z-index: 99999;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  transform: translateY(100%);
  cursor: pointer;
}

.logout p {
  color: var(--app-text-primary-color);
}

.logout i {
  padding: 0.5vh;
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
  height: 100%;
}

.update {
  background: var(--app-background-color);
  height: 100%;
  border-top-left-radius: 30px;
}

.update h1 {
  padding-top: 3vh;
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

.form-com-edit {
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
  color: var(--app-text-primary-color);
  transition: all 450ms ease-in-out;
}

.btn:hover {
  background-color: var(--app-text-primary-color);
  color: var(--app-background-color);
}
@media (max-width: 700px) {
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

  .update {
    border-top-left-radius: 0;
  }

  .form-comment-edit {
    width: 100%;
    margin: 0;
    padding-top: 2vh;
    padding-bottom: 15vh;
  }

  .logout {
    height: 8vh;
    padding: 0.5vh;
    width: 100%;
    text-align: center;
    bottom: -4vh;
    right: -2vh;
  }
}
</style>
