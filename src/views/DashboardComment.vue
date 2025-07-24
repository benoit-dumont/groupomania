<template>
  <div class="test">
    <div class="content">
      <div class="side">
        <div class="side-container">
          <router-link :to="{ name: 'Accueil' }">
            <p>
              <img :src="this.getImage()" alt="Logo Groupomania" />
            </p>
          </router-link>
          <div class="icons">
            <router-link
              v-if="
                $store.state.connectedUser.rank === 1 ||
                $store.state.connectedUser.rank === 2
              "
              :to="{ name: 'Home Dashboard' }"
            >
              <p>
                <i class="fas fa-home"></i>
                <span>{{ $t('DASHBOARD.LISTDASHBOARD') }}</span>
              </p>
            </router-link>
            <router-link
              v-if="$store.state.connectedUser.rank === 1"
              :to="{ name: 'User Dashboard' }"
            >
              <p>
                <i class="fas fa-user"></i>
                <span>{{ $t('DASHBOARD.LISTUSER') }}</span>
              </p>
            </router-link>
            <router-link :to="{ name: 'Post Dashboard' }">
              <p>
                <i class="fas fa-comment-alt"></i>
                <span>{{ $t('DASHBOARD.LISTPOST') }}</span>
              </p>
            </router-link>
            <router-link :to="{ name: 'Comment Dashboard' }">
              <p>
                <i class="fas fa-comment"></i>
                <span>{{ $t('DASHBOARD.LISTCOMMENT') }}</span>
              </p>
            </router-link>
            <router-link
              v-if="$store.state.connectedUser.rank === 1"
              :to="{ name: 'Token Dashboard' }"
            >
              <p>
                <i class="fas fa-ticket-alt"></i>
                <span>{{ $t('DASHBOARD.LISTTOKEN') }}</span>
              </p>
            </router-link>
          </div>
          <div class="logout" v-if="this.menuDisplayed === true">
            <p @click="$store.dispatch('logout')">
              <i class="fas fa-sign-out-alt"></i>{{ $t('LOGOUT') }}
            </p>
          </div>
          <div class="account">
            <img
              :src="$store.state.connectedUser.avatar"
              :alt="$t('ALTIMAGEPROFILE')"
            />
            <i
              @click="toggleLogout()"
              v-if="this.menuDisplayed === false"
              class="fas fa-sort-down"
            ></i>
            <i @click="toggleLogout()" v-else class="fas fa-sort-up"></i>
          </div>
        </div>
      </div>
      <div class="middle">
        <div class="middle-container">
          <h2>{{ $t('DASHBOARDCOMMENT.TITLE') }}</h2>
          <div class="list-comments">
            <div class="comment" v-for="comment in comments" :key="comment.id">
              <div class="comment-container">
                <img :src="comment.User.avatar" :alt="$t('ALTIMAGEPROFILE')" />
                <div class="align">
                  <p>
                    {{ comment.User.name }} {{ comment.User.firstname }} <br />
                    {{ formatDate(comment.createdAt) }}
                  </p>
                </div>
              </div>
              <div class="comment-content">
                <p>
                  {{ comment.content }}
                </p>
              </div>
              <div class="comment-actions">
                <div class="update" @click="updateComment(comment)">
                  <i class="fa fa-pencil"></i>
                </div>
                <deleteAction :data="comment" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '../EventBus';
import deleteAction from '../components/DeleteAction.vue';
import LogoBlack from '../assets/logo_full_black.png';
import LogoWhite from '../assets/logo_full_white.png';

export default {
  metaInfo() {
    const title = this.$t('DASHBOARDCOMMENT.TITLE');
    return {
      title,
    };
  },
  components: { deleteAction },
  data() {
    return {
      comments: [],
      menuDisplayed: false,
    };
  },
  mounted() {
    EventBus.$on('deleteActionPressed', this.deleteComment);
    this.getComments();
  },
  created() {
    const { token } = this.$store.state.token;
    fetch('http://localhost:3000/api/user/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer: ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.$store.dispatch('saveConnectedUser', data.user);
      })
      .catch(() => {
        return this.$vToastify.error(this.$t('ERROR.GENERAL'));
      });
  },
  methods: {
    getComments() {
      const { token } = this.$store.state.token;
      fetch('http://localhost:3000/api/comment/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer' ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.comments = data;
        })
        .catch(() => {
          return this.$vToastify.error(this.$t('ERROR.GENERAL'));
        });
    },
    updateComment(comment) {
      this.$router.push({
        name: 'Comment Modification',
        params: { CommentId: comment.id },
      });
    },
    deleteComment(comment) {
      // eslint-disable-next-line no-alert
      const validation = window.confirm(this.$t('CONFIRM.COMMENT'));
      if (validation === true) {
        const { token } = this.$store.state.token;
        fetch(`http://localhost:3000/api/comment/${comment.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer:' ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(() => this.getComments());
      }
    },
    getImage() {
      const theme = localStorage.getItem('theme');
      if (theme === 'light') {
        return LogoBlack;
      }
      return LogoWhite;
    },
    toggleLogout() {
      this.menuDisplayed = !this.menuDisplayed;
    },
  },
};
</script>

<style scoped lang="scss">
.content {
  background-color: var(--app-background-color);
  display: flex;
}

.content-container {
  display: flex;
  justify-content: space-between;
  background-color: #2d3036;
  padding-top: 5vh;
}

.side {
  flex-shrink: 2;
  background: var(--app-sidebar-color);
}

.side-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
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

.logout {
  position: fixed;
  bottom: 10vh;
  color: var(--app-text-primary-color);
  cursor: pointer;
}

.middle {
  background-color: var(--app-background-color);
  width: 100%;
  color: var(--app-text-primary-color);
  height: 100vh;
}

.middle-container h2 {
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

.update :hover {
  color: var(--app-text-primary-color);
  transform: scale(1.11);
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
