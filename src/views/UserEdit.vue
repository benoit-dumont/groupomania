<template>
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
          <input type="submit" name="submit" :value="t('USEREDIT.SUBMITBUTTON')" class="btn" />
        </form>
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
  const token = userStore.token!.token;
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
  const token = userStore.token!.token;
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
    .then((data: UserId) => {
      user.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}
</script>

<style scoped lang="scss">
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
  .form-user-edit {
    width: 100%;
    max-width: 400px;
    margin: 0;
    padding-top: 2vh;
    padding-bottom: 15vh;
  }
}
</style>
