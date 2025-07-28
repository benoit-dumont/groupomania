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
            <h1>{{ t('USEREDIT.TITLE') }}</h1>
            <div class="update-container">
              <label for="post-image" class="design">
                <div class="message">
                  <img :src="user.avatar" :alt="t('ALTIMAGEPROFILE')" />
                  <p>{{ t('USEREDIT.IMGOPACITYMESSAGE') }}</p>
                </div>
                <input id="post-image" type="file" class="upload" @change="updateImage" />
              </label>
              <div class="update-form">
                <form class="form-user-edit" @submit.prevent="submit">
                  <div class="champ">
                    <label>{{ t('USEREDIT.NAMELABEL') }} *</label>
                    <br />
                    <input
                      v-model="user.name"
                      type="text"
                      name="nom"
                      :placeholder="t('USEREDIT.NAMEPLACEHOLDER')"
                      :pattern="patternNameString"
                    />
                  </div>
                  <div class="champ">
                    <label>{{ t('USEREDIT.FIRSTNAMELABEL') }} *</label>
                    <br />
                    <input
                      v-model="user.firstname"
                      type="text"
                      name="prenom"
                      :placeholder="t('USEREDIT.FIRSTNAMEPLACEHOLDER')"
                      :pattern="patternFirstnameString"
                    />
                  </div>
                  <div class="champ">
                    <label>{{ t('USEREDIT.USERNAMELABEL') }} *</label>
                    <br />
                    <input
                      v-model="user.username"
                      type="text"
                      name="username"
                      :placeholder="t('USEREDIT.USERNAMEPLACEHOLDER')"
                      :pattern="patternUsernameString"
                    />
                  </div>
                  <div class="champ">
                    <label>{{ t('USEREDIT.EMAILLABEL') }} *</label>
                    <br />
                    <input
                      v-model="user.email"
                      type="email"
                      name="email"
                      :placeholder="t('USEREDIT.EMAILPLACEHOLDER')"
                    />
                  </div>
                  <div class="champ">
                    <label>{{ t('USEREDIT.QUESTIONLABEL') }} *</label>
                    <br />
                    <input
                      v-model="user.question"
                      type="text"
                      name="question"
                      :placeholder="t('USEREDIT.QUESTIONPLACEHOLDER')"
                      :pattern="patternQuestionString"
                    />
                  </div>
                  <div class="champ">
                    <label>{{ t('USEREDIT.RESPONSELABEL') }} *</label>
                    <br />
                    <input
                      v-model="user.reponse"
                      type="text"
                      name="reponse"
                      :placeholder="t('USEREDIT.RESPONSEPLACEHOLDER')"
                      :pattern="patternReponseString"
                    />
                  </div>
                  <br />
                  <input
                    type="submit"
                    name="submit"
                    :value="t('USEREDIT.SUBMITBUTTON')"
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
import { Ref, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';
import { useRoute } from 'vue-router';

import { useUserStore } from '@/stores/';
import { User, UserId } from '@/types';
import { getImage } from '@/utils';
import { useConnectedUser, useToast } from '@/composables';

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();
const toast = useToast();
const getConnectedUser = useConnectedUser();

useHead({
  title: t('USEREDIT.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page d’accueil du site Groupomania',
    },
  ],
});

const patternNameString = ref(
  '[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-zàèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ]{2,15}',
);
const patternFirstnameString = ref(
  '[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-zàèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ]{2,15}',
);
const patternUsernameString = ref(
  '[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ_-]{4,20}',
);
const patternEmailString = ref('([\w-]+(?:\.[\w-]+)*)@groupomania\.fr');
const patternQuestionString = ref(
  '[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ,.?"\'/ _-]{4,15}',
);
const patternReponseString = ref(
  '[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ,.`\'"/ _-]{4,15}',
);
const user: Ref<User> = ref({
  id: 0,
  name: '',
  firstname: '',
  username: '',
  email: '',
  password: '',
  avatar: '',
  maxSecurity: false,
  rank: 3,
  question: '',
  reponse: '',
  createdAt: '',
  updatedAt: '',
});
const menuDisplayed: Ref<boolean> = ref(false);

onMounted(async () => {
  await getConnectedUser();
  fetchUserProfile();
});

function updateImage(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];

  const data = new FormData();
  data.append('avatar', file);
  const token = userStore.token;
  if (+route.params.UserId < 0) return false;
  return fetch(`http://localhost:3000/api/user/${+route.params.UserId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  }).then(() => fetchUserProfile());
}

function submit() {
  const patternName = new RegExp(patternNameString.value);
  const patternFirstname = new RegExp(patternFirstnameString.value);
  const patternUsername = new RegExp(patternUsernameString.value);
  const patternEmail = new RegExp(patternEmailString.value);
  const patternQuestion = new RegExp(patternQuestionString.value);
  const patternReponse = new RegExp(patternReponseString.value);
  const { name, firstname, username, email, question, reponse } = user.value;
  if (
    !patternName.test(name) ||
    !patternFirstname.test(firstname) ||
    !patternUsername.test(username) ||
    !patternEmail.test(email) ||
    !patternQuestion.test(question) ||
    !patternReponse.test(reponse)
  ) {
    return false;
  }
  const token = userStore.token;
  if (+route.params.UserId < 0) return false;
  return fetch(`http://localhost:3000/api/user/${+route.params.UserId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      firstname,
      username,
      email,
      question,
      reponse,
    }),
  }).then(() => fetchUserProfile());
}
function fetchUserProfile() {
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
    .then((data: UserId) => {
      user.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
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

.icons img {
  margin: 2vh;
  width: 85px;
  height: 85px;
  object-fit: cover;
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

.update {
  background: var(--app-background-color);
  height: 100%;
  border-top-left-radius: 30px;
}

.update h1 {
  padding: 5vh;
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

.upload {
  display: none;
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

.form-user-edit {
  margin: 4vh;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 500px;
  width: 100%;
}

.champ {
  padding: 1vh;
}

.champ input {
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

  .form-user-edit {
    width: 100%;
    max-width: 400px;
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
