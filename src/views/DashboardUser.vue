<template>
  <div class="test">
    <div class="content">
      <div class="side">
        <div class="side-container">
          <router-link :to="{ name: 'Accueil' }">
            <p>
              <img :src="getImage()" alt="Logo Groupomania" />
            </p>
          </router-link>
          <div class="icons">
            <router-link :to="{ name: 'Home Dashboard' }">
              <p>
                <i class="fas fa-home"></i>
                <span>{{ t('DASHBOARD.LISTDASHBOARD') }}</span>
              </p>
            </router-link>
            <router-link
              v-if="userStore.connectedUser!.rank === 1"
              :to="{ name: 'User Dashboard' }"
            >
              <p>
                <i class="fas fa-user"></i>
                <span>{{ t('DASHBOARD.LISTUSER') }}</span>
              </p>
            </router-link>
            <router-link :to="{ name: 'Post Dashboard' }">
              <p>
                <i class="fas fa-comment-alt"></i>
                <span>{{ t('DASHBOARD.LISTPOST') }}</span>
              </p>
            </router-link>
            <router-link :to="{ name: 'Comment Dashboard' }">
              <p>
                <i class="fas fa-comment"></i>
                <span>{{ t('DASHBOARD.LISTCOMMENT') }}</span>
              </p>
            </router-link>
            <router-link
              v-if="userStore.connectedUser!.rank === 1"
              :to="{ name: 'Token Dashboard' }"
            >
              <p>
                <i class="fas fa-ticket-alt"></i>
                <span>{{ t('DASHBOARD.LISTTOKEN') }}</span>
              </p>
            </router-link>
          </div>
          <div v-if="menuDisplayed === true" class="logout">
            <p @click="userStore.logout()"><i class="fas fa-sign-out-alt"></i>{{ t('LOGOUT') }}</p>
          </div>
          <div class="account">
            <img :src="userStore.connectedUser!.avatar" :alt="t('ALTIMAGEPROFILE')" />
            <i
              v-if="menuDisplayed === false"
              class="fas fa-sort-down"
              @click="() => (menuDisplayed = !menuDisplayed)"
            ></i>
            <i v-else class="fas fa-sort-up" @click="() => (menuDisplayed = !menuDisplayed)"></i>
          </div>
        </div>
      </div>
      <div class="middle">
        <div class="middle-container">
          <h2>{{ t('DASHBOARDUSER.TITLE') }}</h2>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import EventBus from '../EventBus';
import { Ref, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';
import { toast } from 'vue3-toastify';

import modifyActionAdmin from '../components/ModifyAction.vue';
import deleteActionAdmin from '../components/DeleteAction.vue';

import { useUserStore } from '@/stores/';
import { User } from '@/types';
import { formatDate, getImage } from '@/utils';
import type { Header } from 'vue3-easy-data-table';

const { t } = useI18n();
const userStore = useUserStore();
const router = useRouter();

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
const menuDisplayed: Ref<boolean> = ref(false);

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

onMounted(() => {
  EventBus.on('modifyActionPressed', (_payload) => modifyUser);
  EventBus.on('deleteActionPressed', (_payload) => deleteUser);
  getUsers();
});

function getUsers() {
  const token = userStore.token;
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
    const token = userStore.token;
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
.content {
  background-color: var(--app-sidebar-color);
  display: flex;
}

.content-container {
  display: flex;
  justify-content: space-between;
  background-color: #2d3036;
  padding-top: 5vh;
}

.side {
  height: 100vh;
  flex-shrink: 2;
}

.side-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background: var(--app-sidebar-color);
}

.side-container img {
  width: 175px;
  height: 75px;
  object-fit: cover;
  margin: 3vh;
}

.icons {
  display: inline-flex;
  flex-direction: column;
}

.icons a {
  text-decoration: none;
  color: var(--app-text-primary-color);

  &:hover {
    opacity: 0.8;
  }
}

.logout i {
  margin: 1vh;
  font-size: 24px;
}

.account i {
  padding-left: 1vh;
  cursor: pointer;
}

.icons a i {
  margin: 1vh;
  font-size: 24px;
}

.icons p {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.account {
  display: inline-flex;
  align-items: center;
  color: var(--app-text-primary-color);
  padding: 2vh;
  position: fixed;
  bottom: 1vh;
  margin: 0 2vh;
}

.account img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 30px;
  border: 1px solid #2d3036;
  margin: 0;
}

.logout {
  position: fixed;
  bottom: 10vh;
  color: var(--app-text-primary-color);
  cursor: pointer;
}

.middle {
  width: 100%;
}

.middle-container {
  background-color: var(--app-background-color);
  width: 100%;
  min-height: 100vh;
}

.middle-container h2 {
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
  .content {
    display: initial;
  }

  .side {
    height: initial;
  }

  .side-container {
    height: 20vh;
    width: 100%;
    position: initial;
    align-items: initial;
  }

  .icons {
    flex-direction: row;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    background: var(--app-sidebar-color);
    padding: 2vh 2vh 0;
    z-index: 9999;
    justify-content: space-between;
  }

  .icons span {
    display: none;
  }

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

  .logout {
    top: 12vh;
    left: 0;
    right: 0;
    bottom: initial;
    text-align: center;
    position: absolute;
  }

  .account {
    bottom: initial;
    top: 3vh;
    right: 2vh;
    position: absolute;
  }

  .account i {
    padding-left: 1vh;
    cursor: pointer;
  }

  .data-table {
    padding-bottom: 10vh;
  }
}
@media (max-width: 400px) {
  .side-container a img {
    max-width: 175px;
    width: 50%;
  }

  .account {
    margin: 0;
    right: 1vh;
  }
}
</style>
