<template>
  <div class="middle">
    <div class="middle-container">
      <h1>{{ t('DASHBOARDCOMMENT.TITLE') }}</h1>
      <div class="list-comments">
        <div v-for="{ id, content, User, createdAt } in comments" :key="id" class="comment">
          <div class="comment-container">
            <img :src="User!.avatar" :alt="t('ALTIMAGEPROFILE')" />
            <div class="align">
              <p>
                {{ User!.name }} {{ User!.firstname }} <br />
                {{ formatDate(createdAt) }}
              </p>
            </div>
          </div>
          <div class="comment-content">
            <p>
              {{ content }}
            </p>
          </div>
          <div class="comment-actions">
            <div class="update">
              <router-link
                :to="{
                  name: 'Comment Modification',
                  params: { CommentId: id },
                }"
              >
                <i class="fa fa-pencil"></i>
              </router-link>
            </div>
            <DeleteAction :data="id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EventBus from '../EventBus';
import { Ref, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';

import DeleteAction from '../components/DeleteAction.vue';

import { useUserStore } from '@/stores/';
import { Comment } from '@/types';
import { formatDate } from '@/utils';
import { useConnectedUser, useToast } from '@/composables';

const { t } = useI18n();
const userStore = useUserStore();
const toast = useToast();
const getConnectedUser = useConnectedUser();

useHead({
  title: t('DASHBOARDCOMMENT.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page du dashboard commentaires du site Groupomania',
    },
  ],
});

const comments: Ref<Comment[]> = ref([]);

onMounted(async () => {
  await getConnectedUser();
  EventBus.on('deleteActionPressed', (_payload: number) => deleteComment);
  getComments();
});

function getComments() {
  const token = userStore.token!.token;
  fetch('http://localhost:3000/api/comment/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer' ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: Comment[]) => {
      comments.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function deleteComment(data: Comment['id']) {
  const validation = window.confirm(t('CONFIRM.COMMENT'));
  if (validation === true) {
    const token = userStore.token!.token;
    fetch(`http://localhost:3000/api/comment/${data}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer:' ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(() => getComments());
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

.list-comments {
  display: inline-flex;
  flex-wrap: wrap;
  width: 100%;
}

.comment-content {
  text-align: justify;
  padding: 0 2vh;
}

.comment-content h2 {
  padding: 0;
  color: var(--app-text-primary-color);
}

.comment {
  display: inline-flex;
  flex-direction: column;
  margin: 2.5vh 2.5vh 2.5vh 5vh;
  padding: 2vh;
  border: 1px solid var(--app-text-primary-color);
  border-radius: 20px;
  position: relative;
  width: 100%;
}

.comment p {
  color: var(--app-text-primary-color);
  font-size: 20px;
}

.comment p span {
  font-size: medium;
}

.comment-container {
  display: inline-flex;
  align-items: center;
  padding: 0 2vh 2vh;
}

.comment-container img {
  margin: 0;
  width: 85px;
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
}

.align {
  display: flex;
  flex-direction: column;
  padding-left: 2vh;
}

.comment-image img {
  width: 350px;
  height: 200px;
  object-fit: cover;
  margin: 0;
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 4vh;
  bottom: 2vh;
}

.update {
  padding: 1vh;
  transition: all 450ms ease-in-out;
}

.update i {
  color: var(--app-text-primary-color);
}

.update :hover {
  color: var(--app-text-primary-color);
  transform: scale(1.11);
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

  .list-comments {
    padding-bottom: 10vh;
  }

  .align {
    padding-left: 0;
  }

  .comment {
    margin: 2vh;
  }

  .comment p {
    text-align: center;
  }

  .comment-container {
    flex-direction: column;
    padding: 0;
  }

  .comment-content {
    padding: 2vh 0 4vh;
  }

  .comment-actions {
    justify-content: center;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>
