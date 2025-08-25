<template>
  <div class="test">
    <div class="content-signup">
      <img :src="logoSrc" alt="Logo Groupomania" />
      <h2>{{ t('SIGNUP.TITLE') }}</h2>
      <form>
        <div class="champ">
          <label>{{ t('SIGNUP.NAMELABEL') }} *</label>
          <br />
          <input
            v-model="name"
            type="text"
            name="nom"
            :placeholder="t('SIGNUP.NAMEPLACEHOLDER')"
            :pattern="patternNameString"
          />
        </div>
        <div class="champ">
          <label>{{ t('SIGNUP.FIRSTNAMELABEL') }} *</label>
          <br />
          <input
            v-model="firstname"
            type="text"
            name="prenom"
            :placeholder="t('SIGNUP.FIRSTNAMEPLACEHOLDER')"
            :pattern="patternFirstnameString"
          />
        </div>
        <div class="champ">
          <label>{{ t('SIGNUP.USERNAMELABEL') }} *</label>
          <br />
          <input
            v-model="username"
            type="text"
            name="username"
            :placeholder="t('SIGNUP.USERNAMEPLACEHOLDER')"
            :pattern="patternUsernameString"
          />
        </div>
        <div class="champ">
          <label>{{ t('SIGNUP.EMAILLABEL') }} *</label>
          <br />
          <input
            v-model="email"
            type="email"
            name="email"
            :placeholder="t('SIGNUP.EMAILPLACEHOLDER', { email: 'example@groupomania.fr' })"
            :pattern="patternEmailString"
          />
        </div>
        <div class="champ">
          <label>{{ t('SIGNUP.PASSWORDLABEL') }} *</label>
          <br />
          <input
            v-model="password"
            type="text"
            name="password"
            :placeholder="t('SIGNUP.PASSWORDPLACEHOLDER')"
            :pattern="patternPasswordString"
          />
        </div>
        <div class="champ">
          <label>{{ t('SIGNUP.AVATARLABEL') }}</label>
          <br />
          <label for="post-image" class="design"
            ><i class="fas fa-upload"></i> {{ t('SIGNUP.AVATARSUBMIT') }}</label
          >
          <input id="post-image" type="file" class="upload" @change="tempStoreImage" />
        </div>
        <p v-if="avatar" class="filename">
          {{ t('SIGNUP.SELECTEDIMAGE') }} <i class="fas fa-check-circle"></i>
        </p>
        <div class="champ">
          <label>{{ t('SIGNUP.QUESTIONLABEL') }} *</label>
          <br />
          <input
            v-model="question"
            type="text"
            name="question"
            :placeholder="t('SIGNUP.QUESTIONPLACEHOLDER')"
            :pattern="patternQuestionString"
          />
        </div>
        <div class="champ">
          <label>{{ t('SIGNUP.RESPONSELABEL') }} *</label>
          <br />
          <input
            v-model="reponse"
            type="text"
            name="reponse"
            :placeholder="t('SIGNUP.RESPONSEPLACEHOLDER')"
            :pattern="patternReponseString"
          />
        </div>
        <br />
        <input
          type="submit"
          name="submit"
          :value="t('SIGNUP.SUBMITBUTTON')"
          class="btn"
          @click.prevent="submit"
        />
      </form>
      <h3>
        {{ t('SIGNUP.ALREADYREGISTER') }}
        <router-link :to="{ name: 'Login' }">{{ t('SIGNUP.SWITCHREGISTERLOGIN') }}</router-link>
      </h3>
      <h4>* = {{ t('SIGNUP.REQUIRED') }}</h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useTheme } from '@/composables/useTheme';
import { useToast } from '@/composables';
import { User } from '@/types';

const { t } = useI18n();
const { logoSrc } = useTheme();
const router = useRouter();
const toast = useToast();

useHead({
  title: t('SIGNUP.TITLE'),
  meta: [
    {
      name: 'description',
      content: "Page d'inscription du site Groupomania",
    },
  ],
});

const patternNameString = ref(
  '^[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-zàèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ]{2,15}$',
);
const patternFirstnameString = ref(
  '^[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-zàèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ]{2,15}$',
);
const patternUsernameString = ref(
  '^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ_-]{4,20}$',
);
const patternEmailString = ref('^([\w-]+(?:\.[\w-]+)*)@groupomania\.fr$/i');
const patternPasswordString = ref('^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$');
const patternQuestionString = ref(
  '^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ,.?"\'/ _-]{4,15}$',
);
const patternReponseString = ref(
  '^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ,.`\'"/ _-]{4,15}$',
);

const name: Ref<User['name']> = ref('');
const firstname: Ref<User['firstname']> = ref('');
const username: Ref<User['username']> = ref('');
const email: Ref<User['email']> = ref('');
const avatar = ref<File | null>(null);
const password: Ref<User['password']> = ref('');
const question: Ref<User['question']> = ref('');
const reponse: Ref<User['reponse']> = ref('');

function submit() {
  const patternName = RegExp(patternNameString.value);
  const patternFirstname = RegExp(patternFirstnameString.value);
  const patternUsername = RegExp(patternUsernameString.value);
  const patternEmail = RegExp(patternEmailString.value);
  const patternPassword = RegExp(patternPasswordString.value);
  const patternQuestion = RegExp(patternQuestionString.value);
  const patternReponse = RegExp(patternReponseString.value);

  if (name.value.length === 0) return toast.error(t('NAME.INPUT'));
  if (firstname.value.length === 0) return toast.error(t('FIRSTNAME.INPUT'));
  if (username.value.length === 0) return toast.error(t('USERNAME.INPUT'));
  if (email.value.length === 0) return toast.error(t('EMAIL.INPUT'));
  if (password.value.length === 0) return toast.error(t('PASSWORD.INPUT'));
  if (question.value.length === 0) return toast.error(t('QUESTION.INPUT'));
  if (reponse.value.length === 0) return toast.error(t('REPONSE.INPUT'));

  if (!patternName.test(name.value)) return toast.error(t('NAME.FORMAT'));
  if (!patternFirstname.test(firstname.value)) return toast.error(t('FIRSTNAME.FORMAT'));
  if (!patternUsername.test(username.value)) return toast.error(t('USERNAME.FORMAT'));
  if (!patternEmail.test(email.value)) return toast.error(t('EMAIL.FORMAT'));
  if (!patternPassword.test(password.value)) return toast.error(t('PASSWORD.FORMAT'));
  if (!patternQuestion.test(question.value)) return toast.error(t('QUESTION.FORMAT'));
  if (!patternReponse.test(reponse.value)) return toast.error(t('REPONSE.FORMAT'));

  if (avatar.value) {
    const data = new FormData();
    data.append('name', name.value);
    data.append('firstname', firstname.value);
    data.append('username', username.value);
    data.append('email', email.value);
    data.append('password', password.value);
    data.append('question', question.value);
    data.append('reponse', reponse.value);
    if (avatar.value instanceof File) {
      data.append('avatar', avatar.value);
    }
    return fetch('http://localhost:3000/api/user/signup', {
      method: 'POST',
      body: data,
    })
      .then((response) => response.json())
      .then(() => {
        setTimeout(() => router.push({ name: 'Login' }), 4000);
        return toast.success(t('SIGNUP.USER.SUCCESS.WITHAVATAR'));
      })
      .catch(() => {
        return toast.success(t('ERROR.GENERAL'));
      });
  }
  return fetch('http://localhost:3000/api/user/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      firstname,
      username,
      email,
      password,
      question,
      reponse,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      setTimeout(() => router.push({ name: 'Login' }), 4000);
      return toast.success(t('SIGNUP.USER.SUCCESS.WITHOUTAVATAR'));
    })
    .catch(() => {
      return toast.success(t('ERROR.GENERAL'));
    });
}

function tempStoreImage(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    avatar.value = input.files[0];
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.test {
  background-color: var(--app-background-color);
}

.content-signup {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.content-signup img {
  max-width: 350px;
  width: 100%;
  object-fit: cover;
  padding: 2vh;
}

h3,
h4,
h5 {
  font-weight: 300;
}

.content-signup h2 {
  font-size: 36px;
  font-weight: 400;
  margin-bottom: 0 !important;
  color: var(--app-text-primary-color);
}

.content-signup h3 {
  font-size: large;
  color: var(--app-text-primary-color);
}

form input a {
  color: black;
}

.content-signup h3 a {
  color: var(--app-text-primary-color);
}

.content-signup h4 {
  font-size: medium;
  color: var(--app-text-primary-color);
}

form {
  padding: 2vh;
  width: 100%;
}

form label {
  font-size: 18px;
  color: var(--app-text-primary-color);
}

form input {
  max-width: 418px;
  width: 100%;
  height: 48px;
  font-family: Nunito, sans-serif;
  color: var(--app-text-primary-color);
  text-align: center;
  font-size: 18px;
  border-radius: 12px;
  border: 1px #707070 solid;
  background-color: var(--app-input-background-color);
}

form input::placeholder {
  color: var(--app-input-placeholder-color);
}

.btn {
  width: 190px;
  height: 60px;
  background: var(--app-text-primary-color);
  border: transparent;
  border-radius: 12px;
  color: var(--app-background-color);
  margin: 1.5vh;
  transition: all 450ms ease-in-out;

  &:hover {
    background: var(--app-background-color);
    color: var(--app-text-primary-color);
    border: 1px solid var(--app-text-primary-color);
  }
}

button {
  font-size: large;
  font-family: Nunito, sans-serif;
}

.avatar {
  border: transparent;
  border-radius: initial;
}

.champ {
  display: inline-flex;
  flex-direction: column;
  padding: 1.5vh;
  width: 100%;
  max-width: 400px;
}

.champ label {
  text-align: left;
}

.champ i {
  font-size: 24px;
}

.upload {
  display: none;
}

.filename {
  width: 100%;
  color: var(--app-text-primary-color);
  margin: 0 auto;
}

.design {
  background-color: var(--app-input-background-color);
  color: var(--app-input-placeholder-color);
  border-radius: 12px;
  border: 1px #707070 solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  max-width: 418px;
  width: 100%;
  height: 48px;
}
</style>
