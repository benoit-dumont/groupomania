<template>
  <div class="test">
    <div class="content">
      <div class="side">
        <div class="side-container">
          <router-link :to="{ name: 'Accueil' }">
            <img :src="logoSrc" alt="Logo Groupomania" />
          </router-link>
          <div class="icons">
            <router-link
              v-if="userStore.connectedUser!.rank === 1 || userStore.connectedUser!.rank === 2"
              :to="{ name: 'Home Dashboard' }"
            >
              <p>
                <i class="fas fa-home"></i>
              </p>
            </router-link>
            <router-link
              v-if="userStore.connectedUser!.rank === 1"
              :to="{ name: 'User Dashboard' }"
            >
              <p>
                <i class="fas fa-user"></i>
              </p>
            </router-link>
            <router-link :to="{ name: 'Post Dashboard' }">
              <p>
                <i class="fas fa-comment-alt"></i>
              </p>
            </router-link>
            <router-link :to="{ name: 'Comment Dashboard' }">
              <p>
                <i class="fas fa-comment"></i>
              </p>
            </router-link>
            <router-link
              v-if="userStore.connectedUser!.rank === 1"
              :to="{ name: 'Token Dashboard' }"
            >
              <p>
                <i class="fas fa-ticket-alt"></i>
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
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserStore } from '@/stores/';
import { useTheme } from '@/composables/useTheme';
const { logoSrc } = useTheme();

const userStore = useUserStore();
const { t } = useI18n();

const menuDisplayed: Ref<boolean> = ref(false);
</script>

<style scoped lang="scss">
.content {
  background-color: var(--app-background-color);
  display: flex;
  height: 100%;
}
.side {
  flex-shrink: 2;
  display: inline-flex;
  height: 100vh;
  width: 100%;
}

.side-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  background-color: var(--app-sidebar-color);
  position: relative;
}

.side-container img {
  margin: 3vh;
  width: 85px;
  height: 85px;
  object-fit: cover;
}

.icons {
  display: inline-flex;
  flex-direction: column;
}

.icons a {
  text-decoration: none;
  color: var(--app-text-primary-color) !important;

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
  position: absolute;
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
  position: absolute;
  bottom: 10vh;
  color: var(--app-text-primary-color);
  cursor: pointer;
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

  .logout {
    top: 12vh;
    left: 0;
    right: 0;
    bottom: initial;
    text-align: center;
  }

  .account {
    bottom: initial;
    top: 3vh;
    right: 2vh;
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
