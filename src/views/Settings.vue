<template>
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
          :options="langOptions"
          track-by="value"
          label="lang"
          :placeholder="$t('SETTINGS.LANGOPTIONPLACEHOLDER')"
          :show-labels="false"
          :option-height="40"
          @update:model-value="() => switchLanguage(valueLang)"
        >
          <!-- Dropdown options -->
          <template #option="{ option, active, selected }">
            <div :class="['option-item', { 'option-hover': active, 'option-selected': selected }]">
              <span class="fi" :class="option.flag" style="margin-right: 8px"></span>
              <span class="colored">{{ option.lang }}</span>
            </div>
          </template>

          <!-- Selected value -->
          <template #value="{ selected }">
            <span class="fi" :class="selected.flag" style="margin-right: 8px"></span>
            <span class="colored">{{ selected.lang }}</span>
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
        <input id="mod" type="checkbox" class="colors" @click="toggleTheme" /><label
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
      <p v-if="!tokenListDisplayed" @click="() => (tokenListDisplayed = !tokenListDisplayed)">
        {{ $t('SETTINGS.HISTORYTITLE') }}
      </p>
      <div v-if="tokenListDisplayed" class="history-token">
        <i
          class="fas fa-window-close"
          @click="() => (tokenListDisplayed = !tokenListDisplayed)"
        ></i>
        <EasyDataTable :headers="headers" :items="tokenReturned" table-class-name="customize-table">
          <template #item-token="row">
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
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';

import { Token } from '@/types';
import { formatDate } from '@/utils';
import {
  useToast,
  useConnectedUser,
  useTheme,
  useLanguage,
  langOptions,
  savedLang,
} from '@/composables';
import { useUserStore } from '@/stores';
import { useRouter } from 'vue-router';
import { Header } from 'vue3-easy-data-table';

const { t, locale } = useI18n();
const router = useRouter();
const toast = useToast();
const { toggleTheme } = useTheme();
const userStore = useUserStore();
const getConnectedUser = useConnectedUser();
const { switchLanguage } = useLanguage();

useHead({
  title: t('SETTINGS.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page des paramètres du site Groupomania',
    },
  ],
});

const valueLang = ref(langOptions.find((l) => l.value === locale.value) || null);

const tokenListDisplayed = ref(false);
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

function toggleMaxSecurity() {
  const token = userStore.token!.token;
  if (+userStore.connectedUser!.id < 1) return;
  fetch(`http://localhost:3000/api/user/${userStore.connectedUser!.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
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
  const token = userStore.token!.token;
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
  const token = userStore.token!.token;
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
.customize-table {
  --easy-table-border: 1px solid var(--app-background-color);
  --easy-table-body-row-background-color: var(--app-background-color);
  --easy-table-header-background-color: var(--app-background-color);
  --easy-table-header-font-color: var(--app-text-primary-color);
  --easy-table-body-row-font-color: var(--app-text-primary-color);
  --easy-table-scrollbar-color: var(--app-sidebar-color);
  --easy-table-footer-background-color: var(--app-background-color);
  --easy-table-footer-font-color: var(--app-text-primary-color);
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
  border: 1px solid #707070;
  flex-direction: column;
  position: relative;
  padding: 2vh 0;
}

.history-token i {
  position: absolute;
  right: 0;
  top: 0;
  font-size: x-large;
  z-index: 999;
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
  color: var(--app-background-color) !important;
}

.lang > .params {
  width: 320px;
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

.multiselect {
  color: var(--app-text-primary-color) !important;
  background-color: var(--app-sidebar-color);
}

@media (max-width: 700px) {
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
