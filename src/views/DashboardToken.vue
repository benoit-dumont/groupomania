<template>
  <div class="middle">
    <div class="middle-container">
      <h1>{{ t('DASHBOARDTOKEN.TITLE') }}</h1>
      <EasyDataTable
        :items="tokenReturned"
        :headers="headers"
        :searchable="true"
        :sortable="true"
        :pagination="true"
        :per-page="5"
      >
        <template #revoke="{ row }">
          <deleteAction :data="row.id" />
        </template>
      </EasyDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import EventBus from '../EventBus';
import { computed, onMounted, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';

import DeleteAction from '../components/DeleteAction.vue';

import type { Header } from 'vue3-easy-data-table';
import { useUserStore } from '@/stores/';
import { Token } from '@/types';
import { formatDate } from '@/utils';
import { useConnectedUser, useToast } from '@/composables';

const { t } = useI18n();
const userStore = useUserStore();
const toast = useToast();
const getConnectedUser = useConnectedUser();

useHead({
  title: t('DASHBOARDTOKEN.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page des tokens du tableau de bord du site Groupomania',
    },
  ],
});

const tokens: Ref<Token[]> = ref([]);
const headers: Header[] = [
  {
    text: 'Id',
    value: 'id',
  },
  {
    text: t('DATATABLE.CREATEDAT'),
    value: 'createdAt',
  },
  {
    text: t('DATATABLE.TOKEN'),
    value: 'token',
  },
  {
    text: 'User Agent',
    value: 'userAgent',
  },
  {
    text: t('DATATABLE.IPADDRESS'),
    value: 'ipAddress',
  },
  {
    text: t('DATATABLE.REVOKE'),
    value: 'revoke',
    sortable: false,
  },
];

onMounted(async () => {
  await getConnectedUser();
  EventBus.on('deleteActionPressed', (_payload) => revokeToken);
  getTokens();
});

const tokenReturned = computed(() =>
  tokens.value.map((token) => ({
    ...token,
    createdAt: formatDate(token.createdAt),
  })),
);

function getTokens() {
  const token = userStore.token!.token;
  fetch('http://localhost:3000/api/token/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer:' ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: Token[]) => {
      tokens.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}
function revokeToken(id: Token['id']) {
  const validation = window.confirm(t('CONFIRM.TOKEN'));
  if (validation === true) {
    const token = userStore.token!.token;
    fetch(`http://localhost:3000/api/token/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer:' ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(() => getTokens());
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

.token {
  border: 1px solid var(--app-text-primary-color);
  margin: 2vh 4vh;
  border-radius: 30px;
  padding: 2vh;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.wrap {
  word-wrap: break-word;
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

  .data-table {
    padding-bottom: 10vh;
  }
}
</style>
