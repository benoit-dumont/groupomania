<template>
  <div class="update">
    <h1>{{ t('COMMENTEDIT.TITLE') }}</h1>
    <div class="update-container">
      <div class="update-form">
        <form class="form-com-edit" @submit.prevent="submit">
          <div class="champ">
            <label>{{ t('COMMENTEDIT.CONTENTLABEL') }} *</label>
            <br />
            <textarea
              v-model="comment.content"
              name="content"
              :placeholder="t('COMMENTEDIT.CONTENTPLACEHOLDER')"
              :pattern="patternContent"
            ></textarea>
          </div>
          <br />
          <input type="submit" name="submit" :value="t('COMMENTEDIT.SUBMITBUTTON')" class="btn" />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { useUserStore } from '@/stores/';
import { CommentId } from '@/types';
import { useConnectedUser, useToast } from '@/composables';

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();
const toast = useToast();
const getConnectedUser = useConnectedUser();

useHead({
  title: t('COMMENTEDIT.TITLE'),
  meta: [
    {
      name: 'description',
      content: 'Page de modification de commentaire du site Groupomania',
    },
  ],
});

const patternContent = ref(
  '[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ\'"?!., _-]{4,255}',
);
const comment = ref<CommentId>({
  id: 0,
  content: '',
  createdAt: '',
  updatedAt: '',
  UserId: 0,
  PostId: 0,
});

onMounted(async () => {
  await getConnectedUser();
  fetchCommentData();
});

function fetchCommentData() {
  const token = userStore.token!.token;
  if (+route.params.CommentId < 0) return;
  fetch(`http://localhost:3000/api/comment/${+route.params.CommentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data: CommentId) => {
      comment.value = data;
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}

function submit() {
  const regexContent =
    /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ'"?!., _-]{4,255}$/;
  const { content } = comment.value;
  if (!regexContent.test(content)) {
    return false;
  }
  const token = userStore.token!.token;
  if (+route.params.CommentId < 0) return false;
  return fetch(`http://localhost:3000/api/comment/${+route.params.CommentId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
    }),
  }).then(() => fetchCommentData());
}
</script>

<style scoped lang="scss">
.update {
  background: var(--app-background-color);
  height: 100%;
  border-top-left-radius: 30px;
}

.update h1 {
  padding-top: 3vh;
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

.update-image input {
  color: var(--app-text-primary-color);
}

.upload {
  display: none;
}

.design {
  color: var(--app-text-primary-color);
}

.design i {
  padding: 0.5vh;
}

.form-com-edit {
  margin: 2vh;
}

.champ input,
.champ textarea {
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

.champ textarea {
  height: 200px;
  resize: none;
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
  .update {
    border-top-left-radius: 0;
  }

  .form-comment-edit {
    width: 100%;
    margin: 0;
    padding-top: 2vh;
    padding-bottom: 15vh;
  }
}
</style>
