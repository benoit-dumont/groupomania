<template>
  <div class="test">
    <div class="contents">
      <div class="sidebar">
        <div class="icon">
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
              <img :src="userStore.connectedUser!.avatar" :alt="$t('ALTIMAGEPROFILE')" />
              <i
                v-if="menuDisplayed === false"
                class="fas fa-sort-down"
                @@click="() => (menuDisplayed = !menuDisplayed)"
              ></i>
              <i v-else class="fas fa-sort-up" @@click="() => (menuDisplayed = !menuDisplayed)"></i>
            </div>
            <transition name="logout">
              <div v-if="menuDisplayed === true" class="logout">
                <p @click="userStore.logout()">
                  <i class="fas fa-sign-out-alt"></i>{{ $t('LOGOUT') }}
                </p>
              </div>
            </transition>
          </div>
          <div class="settings">
            <h1>{{ $t('SETTINGS.TITLE') }}</h1>
            <div class="lang">
              <div class="text">
                <h2>{{ $t('SETTINGS.LANGTITLE') }}</h2>
                <p>{{ $t('SETTINGS.LANGDESC') }}</p>
              </div>
              <div class="params">
                <Multiselect
                  v-model="valueLang"
                  :placeholder="$t('SETTINGS.LANGOPTIONPLACEHOLDER')"
                  label="lang"
                  track-by="lang"
                  :options="[
                    { flag: 'fi-fr', lang: 'Français' },
                    { flag: 'fi-us', lang: 'English' },
                  ]"
                  :option-height="2"
                  :show-labels="false"
                  @input="switchLanguage"
                >
                  <template #singleLabel="{ option }">
                    <span class="fi" :class="option.flag"></span>
                    - <span class="colored">{{ option.lang }}</span>
                  </template>

                  <template #option="{ option }">
                    <span class="fi" :class="option.flag"></span>
                    - <span class="colored">{{ option.lang }}</span>
                  </template>
                </Multiselect>
              </div>
            </div>
            <div class="mode">
              <div class="text">
                <h2>{{ $t('SETTINGS.THEMETITLE') }}</h2>
                <p>{{ $t('SETTINGS.THEMEDESC') }}</p>
              </div>
              <div class="colors">
                <input id="mod" v-model="darkMode" type="checkbox" class="colors" /><label
                  for="mod"
                  class="colors"
                  >Toggle</label
                >
              </div>
            </div>
            <div class="security">
              <div class="text">
                <h2>{{ $t('SETTINGS.SECURITYTITLE') }}</h2>
                <p>{{ $t('SETTINGS.SECURITYDESC') }}</p>
              </div>
              <div class="params">
                <input
                  id="security"
                  v-model="userStore.connectedUser!.maxSecurity"
                  type="checkbox"
                  @change="toggleMaxSecurity"
                /><label for="security">Toggle</label>
              </div>
            </div>
            <div class="history">
              <p
                v-if="tokenListDisplayed === false"
                @click="() => (tokenListDisplayed = !tokenListDisplayed)"
              >
                {{ $t('SETTINGS.HISTORYTITLE') }}
              </p>
              <div v-if="tokenListDisplayed === true" class="history-token">
                <i
                  class="fas fa-window-close"
                  @click="() => (tokenListDisplayed = !tokenListDisplayed)"
                ></i>
                <EasyDataTable :headers="headers" :data="tokenReturned">
                  <template #token="{ row }">
                    <div class="token-style">{{ row.token }}</div>
                  </template>
                </EasyDataTable>
              </div>
            </div>
            <div class="action">
              <div class="supprimer" @click="deleteUser()">
                <p>
                  {{ $t('SETTINGS.DELETEACCOUNT') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';

import { Token } from '@/types';
import { formatDate, getImage } from '@/utils';
import { useToast, useConnectedUser } from '@/composables';
import { useUserStore } from '@/stores';
import { useRouter } from 'vue-router';
import { Header } from 'vue3-easy-data-table';

const { t, locale } = useI18n();
const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const getConnectedUser = useConnectedUser();

useHead({
  title: t('SETTINGS.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page des paramètres du site Groupomania',
    },
  ],
});

const valueLang = ref({
  flag: localStorage.getItem('lang') === 'English' ? 'fi-us' : 'fi-fr',
  lang: localStorage.getItem('lang') || 'Français',
});

const darkMode: Ref<boolean> = ref(true);
const menuDisplayed: Ref<boolean> = ref(false);
const tokenListDisplayed: Ref<boolean> = ref(false);
const tokens: Ref<Token[]> = ref([]);
const headers: Header[] = [
  {
    value: 'createdAt',
    text: t('DATATABLE.CREATEDAT'),
  },
  {
    value: 'token',
    text: t('DATATABLE.TOKEN'),
  },
  {
    value: 'userAgent',
    text: 'User Agent',
  },
  {
    value: 'ipAddress',
    text: t('DATATABLE.IPADDRESS'),
  },
];

onMounted(async () => {
  await getConnectedUser();
  getTokens();
});

const tokenReturned = computed(() => {
  return tokens.value.map((token) => ({
    ...token,
    createdAt: formatDate(token.createdAt),
  }));
});

watch(
  darkMode,
  (value) => {
    const htmlElement = document.documentElement;
    localStorage.setItem('theme', value ? 'dark' : 'light');
    htmlElement.setAttribute('theme', value ? 'dark' : 'light');
  },
  { immediate: true },
);

function switchLanguage() {
  if (!valueLang.value) return;
  localStorage.setItem('lang', valueLang.value.lang);
  locale.value = valueLang.value.lang === 'Français' ? 'fr' : 'en';
}

function toggleMaxSecurity() {
  const token = userStore.token;
  if (+userStore.connectedUser!.id < 1) return;
  fetch(`http://localhost:3000/api/user/${userStore.connectedUser!.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      maxSecurity: userStore.connectedUser!.maxSecurity,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      return toast.success(t('USER.SUCCESS'));
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function getTokens() {
  const token = userStore.token;
  fetch(`http://localhost:3000/api/token/user/${userStore.connectedUser!.id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      tokens.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function deleteUser() {
  const token = userStore.token;
  fetch(`http://localhost:3000/api/user/${userStore.connectedUser!.id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then(() => {
      router.push({
        name: 'Login',
      });
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}
</script>

<style scoped lang="scss">
.contents {
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

.icon img {
  margin: 2vh;
  width: 85px;
  height: 85px;
  object-fit: cover;
}

.icon {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  transition: color 450ms ease-in-out;
  height: 70%;
}

.icon i {
  font-size: 32px;
  padding: 1vh;
}

.icon a {
  transition: color 450ms ease-in-out;
  color: var(--app-text-primary-color);
}

.icon a :hover {
  opacity: 0.8;
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
  background: var(--app-text-primary-color);
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
  color: var(--app-background-color);
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

.settings {
  background-color: var(--app-background-color);
  color: var(--app-text-primary-color);
  padding: 5vh 5vh 10vh;
  border-top-left-radius: 30px;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  width: calc(100% + 20px);
  margin-bottom: 10vh;
}

.settings h1 {
  padding-bottom: 4vh;
}

.lang,
.mode,
.security {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4vh;
}

.history {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5vh 0;
  border: 1px solid #707070;
  flex-direction: column;
  position: relative;
}

.history-token i {
  position: absolute;
  right: 4vh;
  font-size: x-large;
}

.history p {
  color: #707070;
  font-size: x-large;
  margin: 0;
  text-align: center;
}

.action {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 5vh 0;
}

.supprimer {
  text-align: center;
  padding: 2.5vh;
  border: 1px solid #e61919;
  cursor: pointer;
}

.supprimer p {
  color: #e61919;
  font-size: x-large;
  margin: 0;
}

.colored {
  vertical-align: middle;
  color: var(--app-text-primary-color);
}

.params input {
  height: 0;
  width: 0;
  visibility: hidden;
}

.params label {
  cursor: pointer;
  text-indent: -9999px;
  width: 70px;
  height: 40px;
  background: #e61919;
  display: block;
  border-radius: 100px;
  position: relative;
}

.params label::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  width: 30px;
  height: 30px;
  background: var(--app-background-color);
  border-radius: 90px;
  transition: 0.3s;
}

.colors label {
  cursor: pointer;
  text-indent: -9999px;
  width: 70px;
  height: 40px;
  background: var(--app-action-icons-color);
  display: block;
  border-radius: 100px;
  position: relative;
}

.colors input {
  height: 0;
  width: 0;
  visibility: hidden;
}

.params input:checked + label {
  background: green;
}

.colors label::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  width: 30px;
  height: 30px;
  background: var(--app-background-color);
  border-radius: 90px;
  transition: 0.3s;
}

.params input:checked + label::after {
  left: calc(100% - 5px);
  transform: translateX(-100%);
}

.colors input:checked + label::after {
  left: calc(100% - 5px);
  transform: translateX(-100%);
}

@media (max-width: 700px) {
  .sidebar {
    display: initial;
    height: initial;
  }

  .box-posts {
    position: initial;
  }

  .icon {
    height: 0;
  }

  .logout {
    height: 8vh;
    padding: 0.5vh;
    width: initial;
    text-align: center;
    bottom: -3vh;
    right: -1vh;
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
    top: 2vh;
    right: 2vh;
    padding-right: 0;
  }

  .settings {
    border-top-left-radius: 0;
    margin-bottom: 0;
    height: initial;
    padding: 2vh 2.5vh;
    width: initial;
  }

  .lang,
  .mode,
  .security {
    flex-direction: column;
    align-items: flex-start;
  }

  .action {
    padding-bottom: 5vh;
  }

  .history {
    display: block;
  }

  .history-token i {
    right: 2.5vh;
  }

  .data-table {
    grid-template-columns: 100%;
    grid-template-areas:
      'search'
      'perPage'
      'table'
      'pagination'
      'info'
      'download';
    padding: 0;
  }
}
</style>
