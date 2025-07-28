<template>
  <div class="test">
    <div class="content-login">
      <div class="content-login-container">
        <img :src="getImage()" alt="Logo Groupomania" />
        <h2>{{ t('LOGIN.TITLE') }}</h2>
        <form @submit.prevent="submit">
          <label>{{ t('LOGIN.USERNAMEEMAILLABEL') }} *</label>
          <input
            v-model="identifiant"
            type="text"
            name="identifiant"
            :placeholder="t('LOGIN.USERNAMEEMAILPLACEHOLDER')"
          />
          <label>{{ t('LOGIN.PASSWORDLABEL') }} *</label>
          <input
            v-model="password"
            type="password"
            name="password"
            :placeholder="t('LOGIN.PASSWORDPLACEHOLDER')"
            pattern="^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$"
          />
          <input type="submit" name="submit" :value="t('LOGIN.SUBMITBUTTON')" class="btn" />
        </form>
        <h3>
          {{ t('LOGIN.DONTHAVEACCOUNT') }}
          <router-link :to="{ name: 'Signup' }">{{ t('LOGIN.SWITCHLOGINREGISTER') }}</router-link>
        </h3>
        <br />
        <h4>* = {{ t('LOGIN.REQUIRED') }}</h4>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useHead } from '@vueuse/head';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { useUserStore } from '@/stores/';
import { getImage } from '@/utils';
import { Token } from '@/types';
import { useToast } from '@/composables';

const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();
const toast = useToast();

useHead({
  title: t('LOGIN.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page de connexion du site Groupomania',
    },
  ],
});

const identifiant = ref('');
const password = ref('');
const user = ref({});

async function submit() {
  if (identifiant.value.length === 0) {
    return toast.error(t('LOGIN.IDENTIFIANT.INPUT'));
  }
  if (password.value.length === 0) {
    return toast.error(t('PASSWORD.INPUT'));
  }
  const regexPassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;

  if (!regexPassword.test(password.value)) {
    return toast.error(t('PASSWORD.FORMAT'));
  }
  if (identifiant.value.includes('@groupomania.fr')) {
    const regexEmail = /^([\w-]+(?:\.[\w-]+)*)@groupomania\.fr$/i;
    if (!regexEmail.test(identifiant.value)) {
      return toast.error(t('EMAIL.FORMAT'));
    }
    return await fetch('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: identifiant.value,
        password: password.value,
      }),
    })
      .then((response) => response.json())
      .then((data: Token['token']) => {
        user.value = data;
        const tokenData = {
          token: data,
          date: Date.now(),
        };
        userStore.saveToken(tokenData);
        setTimeout(() => router.push({ name: 'Accueil' }), 4000);
        return toast.success(t('LOGIN.SUCCESS'));
      });
  }

  await fetch('http://localhost:3000/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: identifiant.value,
      password: password.value,
    }),
  })
    .then((response: Response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => {
      user.value = data;
      const tokenData = {
        token: data.token,
        date: Date.now(),
      };
      userStore.saveToken(tokenData);
      setTimeout(() => router.push({ name: 'Accueil' }), 4000);
      return toast.success(t('LOGIN.SUCCESS'));
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
  return false;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.test {
  background-color: var(--app-background-color);
}

.content-login {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-login img {
  max-width: 350px;
  width: 100%;
  height: 150px;
  object-fit: cover;
  padding: 2vh;
}

.content-login h2 {
  font-size: 36px;
  font-weight: 400;
  margin-bottom: 0 !important;
  color: var(--app-text-primary-color);
}

.content-login h3 {
  font-size: large;
  font-weight: 300;
  color: var(--app-text-primary-color);
  padding: 2vh;
  text-align: center;
}

form input a {
  color: black;
}

.content-login h3 a {
  color: var(--app-text-primary-color);
}

.content-login h4 {
  font-size: medium;
  font-weight: 300;
  color: var(--app-text-primary-color);
}

.content-login-container {
  display: inline-flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  height: 100%;
}

form {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  padding: 2vh;
  width: 100%;
}

form label {
  font-size: 18px;
  text-align: left;
  margin-bottom: 14px;
  color: var(--app-text-primary-color);
}

form input {
  width: 100%;
  max-width: 418px;
  height: 48px;
  font-family: Nunito, sans-serif;
  text-align: center;
  font-size: 18px;
  margin-bottom: 30px;
  border-radius: 12px;
  border: 1px #707070 solid;
  background-color: var(--app-input-background-color);
  color: var(--app-text-primary-color);
}

form input::placeholder {
  color: var(--app-input-placeholder-color);
}

.btn {
  width: 190px;
  height: 60px;
  background-color: var(--app-text-primary-color);
  border: transparent;
  border-radius: 12px;
  color: var(--app-background-color);
  margin: 0 auto;

  &:hover {
    background: var(--app-background-color);
    color: var(--app-text-primary-color);
    border: 1px solid var(--app-text-primary-color);
  }
}
</style>
