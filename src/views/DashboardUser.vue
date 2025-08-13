<template>
  <div class="middle">
    <div class="middle-container">
      <h1>{{ t('DASHBOARDUSER.TITLE') }}</h1>
      <EasyDataTable :headers="columns" :items="userReturned">
        <template #modify="{ row }">
          <modifyActionAdmin :data="row.id" />
        </template>
        <template #delete="{ row }">
          <deleteActionAdmin :data="row.id" />
        </template>
      </EasyDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import EventBus from '../EventBus';
import { Ref, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';

import modifyActionAdmin from '../components/ModifyAction.vue';
import deleteActionAdmin from '../components/DeleteAction.vue';

import { useUserStore } from '@/stores/';
import { User } from '@/types';
import { formatDate } from '@/utils';
import { useConnectedUser, useToast } from '@/composables';
import type { Header } from 'vue3-easy-data-table';

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();
const toast = useToast();
const getConnectedUser = useConnectedUser();

useHead({
  title: t('DASHBOARDUSER.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page d’accueil du site Groupomania',
    },
  ],
});

const users: Ref<User[]> = ref([]);

const columns: Header[] = [
  {
    text: 'Id',
    value: 'id',
    sortable: true,
  },
  {
    text: t('DATATABLE.NAME'),
    value: 'name',
    sortable: true,
  },
  {
    text: t('DATATABLE.FIRSTNAME'),
    value: 'firstname',
    sortable: true,
  },
  {
    text: t('DATATABLE.USERNAME'),
    value: 'username',
    sortable: true,
  },
  {
    text: 'Email',
    value: 'email',
    sortable: true,
  },
  {
    text: t('DATATABLE.CREATEDAT'),
    value: 'createdAt',
    sortable: true,
  },
  {
    text: t('DATATABLE.UPDATEDAT'),
    value: 'updatedAt',
    sortable: true,
  },
  {
    text: t('DATATABLE.MODIFY'),
    value: 'modify',
    sortable: false,
  },
  {
    text: t('DATATABLE.DELETE'),
    value: 'delete',
    sortable: false,
  },
];

onMounted(async () => {
  await getConnectedUser();
  EventBus.on('modifyActionPressed', (_payload: number) => modifyUser);
  EventBus.on('deleteActionPressed', (_payload: number) => deleteUser);
  getUsers();
});

function getUsers() {
  const token = userStore.token!.token;
  fetch('http://localhost:3000/api/user/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer:' ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: User[]) => {
      users.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function modifyUser(id: User['id']) {
  router.push({
    name: 'User Modification',
    params: { UserId: id },
  });
}

function deleteUser(id: User['id']) {
  // eslint-disable-next-line no-alert
  const validation = window.confirm(t('CONFIRM.USER'));
  if (validation === true) {
    const token = userStore.token!.token;
    fetch(`http://localhost:3000/api/user/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer:' ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(() => getUsers());
  }
}

const userReturned = computed(() => {
  return users.value.map((user) => {
    const parsedCreatedAt = formatDate(user.createdAt);
    const parsedUpdatedAt = formatDate(user.updatedAt);
    const userModified = {
      ...user,
      updatedAt: parsedUpdatedAt,
      createdAt: parsedCreatedAt,
    };
    return userModified;
  });
});
</script>

<style scoped lang="scss">
.middle {
  width: 100%;
}

.middle-container {
  background-color: var(--app-background-color);
  width: 100%;
  min-height: 100vh;
}

.middle-container h1 {
  padding: 5vh 0 0 5vh;
  color: var(--app-text-primary-color);
}

.list-users {
  display: flex;
  height: 100%;
  flex-wrap: wrap;
}

.user {
  color: var(--app-text-primary-color);
  border: 1px solid var(--app-text-primary-color);
  margin: 2vh 4vh;
  border-radius: 30px;
  max-width: 150px;
  max-height: 300px;
  text-align: center;
}

.user img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  margin: 1vh;
  border-radius: 20px;
}

.user-content {
  text-align: center;
}

.user-actions {
  display: inline-flex;
  margin: 1vh;
}

.update,
.delete {
  padding: 1vh;
  width: 100%;
  text-align: center;
  transition: all 450ms ease-in-out;
}

.update {
  border-top-right-radius: 20px;
}

.update :hover {
  transition: all 450ms ease-in-out;
  transform: scale(1.11);
  color: var(--app-text-primary-color);
}

.delete {
  border-bottom-right-radius: 20px;
}

.delete :hover {
  transition: all 450ms ease-in-out;
  transform: scale(1.11);
  color: red;
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
