<template>
  <div class="test">
    <div class="content">
      <div class="sidebar">
        <div class="icons">
          <img :src="this.getImage()" alt="Logo" />
          <div class="icon-container">
            <router-link :to="{ name: 'Accueil' }"
              ><i class="fas fa-home"></i
            ></router-link>
            <router-link
              :to="{
                name: 'Profil',
                params: { UserId: $store.state.connectedUser.id },
              }"
              ><i class="fas fa-user"></i
            ></router-link>
            <router-link :to="{ name: 'Settings' }"
              ><i class="fas fa-cog"></i
            ></router-link>
            <router-link
              v-if="
                $store.state.connectedUser.rank === 1 ||
                $store.state.connectedUser.rank === 2
              "
              :to="{ name: 'Home Dashboard' }"
              ><i class="fas fa-tools"></i
            ></router-link>
          </div>
        </div>
        <div class="box-posts">
          <div class="up">
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
            <transition name="logout">
              <div class="logout" v-if="this.menuDisplayed === true">
                <p @click="$store.dispatch('logout')">
                  <i class="fas fa-sign-out-alt"></i>{{ $t('LOGOUT') }}
                </p>
              </div>
            </transition>
          </div>
          <div class="posts">
            <h1>{{ $t('ACCUEIL.CREATEPOST') }}</h1>
            <form @submit.prevent="submit">
              <input
                type="text"
                name="title"
                class="title-form"
                :placeholder="$t('ACCUEIL.TITLEPLACEHOLDER')"
                v-model="title"
              />
              <input
                type="text"
                class="content-form-post"
                :placeholder="$t('ACCUEIL.CONTENTPLACEHOLDER')"
                v-model="contentPost"
              />
              <label for="post-image"><i class="fas fa-camera"></i></label>
              <input type="file" id="post-image" @change="tempStoreImage" />

              <input
                type="submit"
                :value="$t('ACCUEIL.BUTTONPOSTVALUE')"
                class="btn"
              />
              <p class="filename" v-if="this.media">
                {{ $t('ACCUEIL.SELECTEDIMAGE') }}
                <i class="fas fa-check-circle"></i>
              </p>
            </form>
            <div v-if="posts.length !== 0">
              <div class="post" v-for="post in posts" :key="post.id">
                <div class="post-container">
                  <router-link
                    :to="{ name: 'Profil', params: { UserId: post.UserId } }"
                  >
                    <img :src="post.User.avatar" :alt="$t('ALTIMAGEPROFILE')" />
                  </router-link>
                  <div class="align">
                    <router-link
                      :to="{ name: 'Profil', params: { UserId: post.UserId } }"
                    >
                      <p>
                        {{ post.User.name }} {{ post.User.firstname }} <br />
                        {{ formatDate(post.createdAt) }}
                      </p>
                    </router-link>
                  </div>
                </div>
                <div class="post-content">
                  <router-link
                    :to="{ name: 'Post', params: { PostId: post.id } }"
                  >
                    <h2>{{ post.title }}</h2>
                  </router-link>
                  <router-link
                    :to="{ name: 'Post', params: { PostId: post.id } }"
                  >
                    <p>
                      {{ post.content }}
                    </p>
                  </router-link>
                  <div
                    class="post-image"
                    v-if="post.media && isImage(post.media)"
                  >
                    <router-link
                      :to="{ name: 'Post', params: { PostId: post.id } }"
                    >
                      <img :src="post.media" :alt="$t('ALTMEDIA')" />
                    </router-link>
                  </div>
                  <div
                    class="post-video"
                    v-if="post.media && isVideo(post.media)"
                  >
                    <video controls width="350" height="200">
                      <source :src="post.media" type="video/mp4" />
                    </video>
                  </div>
                  <div class="comments">
                    <form
                      class="form-add-comment"
                      @submit.prevent="createComment(post)"
                    >
                      <input
                        type="text"
                        name="comContent"
                        class="comment-content"
                        placeholder="Ajouter un commentaire"
                        v-model="comContent"
                      />
                      <input
                        type="submit"
                        :value="$t('ACCUEIL.BUTTONPOSTVALUE')"
                        class="btn"
                      />
                    </form>
                  </div>
                </div>
                <div
                  class="post-actions"
                  v-if="
                    $store.state.connectedUser.id === post.User.id ||
                    $store.state.connectedUser.rank === 1 ||
                    $store.state.connectedUser.rank === 2
                  "
                >
                  <div class="update" @click="updatePost(post)">
                    <i class="fa fa-pencil"></i>
                  </div>
                  <deleteAction :data="post" />
                </div>
                <div class="post-infos">
                  <router-link
                    :to="{ name: 'Post', params: { PostId: post.id } }"
                  >
                    <p>
                      {{ post.Reactions.length }}
                      <span>{{ $t('DASHBOARD.LISTREACTS') }}</span>
                    </p>
                  </router-link>
                  <router-link
                    :to="{ name: 'Post', params: { PostId: post.id } }"
                  >
                    <p>
                      {{ post.Comments.length }}
                      <span>{{ $t('DASHBOARD.LISTCOMMENT') }}</span>
                    </p>
                  </router-link>
                </div>
              </div>
            </div>
            <div class="no-post" v-else>
              <h2>{{ $t('NO.POST.HOME') }}</h2>
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
import LogoWhite from '../assets/logo_white.png';
import LogoBlack from '../assets/logo_black.png';

export default {
  name: 'Accueil',
  metaInfo() {
    const title = this.$t('ACCUEIL.TITLE');
    return {
      title,
    };
  },
  components: { deleteAction },
  data() {
    return {
      title: '',
      contentPost: '',
      media: '',
      posts: [],
      supportedExtensions: {
        image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
        video: ['mp4', 'avi'],
      },
      menuDisplayed: false,
      commentsDisplayed: false,
      comContent: '',
    };
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
        return this.$tvToastify.error(this.$t('ERROR.GENERAL'));
      });
  },
  mounted() {
    EventBus.$on('deleteActionPressed', this.deletePost);
    this.fetchPosts();
  },
  methods: {
    fetchPosts() {
      const { token } = this.$store.state.token;
      fetch('http://localhost:3000/api/post', {
        method: 'GET',
        headers: {
          Authorization: `Bearer: ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.posts = data;
        })
        .catch(() => {
          return this.$vToastify.error(this.$t('ERROR.GENERAL'));
        });
    },
    isImage(media) {
      if (
        this.supportedExtensions.image.includes(media.split('.').slice(-1)[0])
      ) {
        return true;
      }
      return false;
    },
    isVideo(media) {
      if (
        this.supportedExtensions.video.includes(media.split('.').slice(-1)[0])
      ) {
        return true;
      }
      return false;
    },
    submit() {
      if (this.title.length === 0) {
        return this.$vToastify.error(this.$t('TITLE.INPUT'));
      }
      if (this.contentPost.length === 0) {
        return this.$vToastify.error(this.$t('CONTENT.INPUT'));
      }
      const regexTitle =
        /^[A-ZÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÇßØÅÆ]{1}[a-z0-9àèìòùáéíóúýâêîôûãñõäëïöüÿçøåæœ?'"! _-]{2,15}$/;
      const regexContent =
        /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ'"?!., _-]{4,255}$/;
      if (!regexTitle.test(this.title)) {
        return this.$vToastify.error(this.$t('TITLE.FORMAT'));
      }
      if (!regexContent.test(this.contentPost)) {
        return this.$vToastify.error(this.$t('CONTENT.FORMAT'));
      }
      const { token } = this.$store.state.token;
      if (this.media) {
        const data = new FormData();
        data.append('media', this.media);
        data.append('title', this.title);
        data.append('content', this.contentPost);
        return fetch('http://localhost:3000/api/post', {
          method: 'POST',
          headers: {
            Authorization: `Bearer: ${token}`,
          },
          body: data,
        })
          .then((response) => response.json())
          .then(() => {
            this.fetchPosts();
            return this.$vToastify.success(this.$t('POST.CREATED.WITHMEDIA'));
          });
      }
      return fetch('http://localhost:3000/api/post', {
        method: 'POST',
        headers: {
          Authorization: `Bearer: ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: this.title,
          content: this.contentPost,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          this.fetchPosts();
          return this.$vToastify.success(this.$t('POST.CREATED.WITHOUTMEDIA'));
        });
    },
    createComment(post) {
      const regexContent =
        /^[a-zA-Z0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ'"?!., _-]{4,255}$/;
      if (!regexContent.test(this.comContent)) {
        return this.$vToastify.error(this.$t('COMMENT.CONTENT.FORMAT'));
      }
      const { token } = this.$store.state.token;
      return fetch('http://localhost:3000/api/comment', {
        method: 'POST',
        headers: {
          Authorization: `Bearer: ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: this.comContent,
          PostId: post.id,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          this.fetchPosts();
          return this.$vToastify.success(this.$t('COMMENT.SUCCESS'));
        });
    },
    tempStoreImage(e) {
      const file = e.target.files[0];
      this.media = file;
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
    updatePost(post) {
      this.$router.push({
        name: 'Post Modification',
        params: { PostId: post.id },
      });
    },
    deletePost(post) {
      // eslint-disable-next-line no-alert
      const validation = window.confirm(this.$t('CONFIRM.POST'));
      if (validation === true) {
        const { token } = this.$store.state.token;
        fetch(`http://localhost:3000/api/post/${post.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer:' ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(() => this.fetchPosts());
      }
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
  background-color: var(--app-background-color);
  padding-top: 5vh;
}

.sidebar {
  background-color: var(--app-sidebar-color);
  display: inline-flex;
  z-index: 99999;
  width: 100%;
  height: 100vh;
}

.icons {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  transition: color 450ms ease-in-out;
  height: 70%;
}

.icons i {
  font-size: 32px;
  padding: 1vh;
}

.align a {
  text-decoration: none;
}

.post a {
  text-decoration: none;
}

.icons a {
  transition: color 450ms ease-in-out;
  color: var(--app-text-primary-color) !important;

  &:hover {
    opacity: 0.8;
  }
}

.icons img {
  margin: 2vh;
  width: 85px;
  height: 85px;
  object-fit: cover;
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

.account img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 30px;
  border: 1px solid #2d3036;
}

.account i {
  padding-left: 1vh;
  cursor: pointer;
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

.no-post {
  color: var(--app-text-primary-color);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.posts {
  padding: 5vh;
  overflow-x: hidden;
  overflow-y: scroll;
  width: calc(100% + 20px);
  height: 100%;
  background-color: var(--app-background-color);
  border-radius: 30px;
  padding-bottom: 10vh;
  position: relative;
}

.posts h1 {
  font-size: 45px;
  color: var(--app-text-primary-color);
  text-align: left;
  margin-bottom: 0;
}

.title-form {
  max-width: 300px;
  padding-left: 2vh;
}

.content-form-post {
  max-width: 70%;
  padding-left: 2vh;
}

.filename {
  position: absolute;
  right: 1px;
  bottom: -1vh;
  color: var(--app-text-primary-color);
}

.filename i {
  font-size: 16px !important;
}

.btn {
  width: fit-content !important;
}

.posts form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4vh 0;
  flex-wrap: wrap;
  position: relative;
}

.posts form i {
  font-size: 48px;
}

.posts form label i {
  -webkit-text-stroke: 1px #707070;
  color: #3a3a3a;
  -webkit-text-fill-color: transparent;
  transition: all 450ms ease-in-out;
  cursor: pointer;
}

.update :hover {
  color: var(--app-text-primary-color);
  transform: scale(1.11);
}

.posts form label :hover,
.posts form label :active {
  -webkit-text-stroke: 1px var(--app-text-primary-color);
}

.posts form input {
  background-color: var(--app-input-background-color);
  border: 1px #707070 solid;
  border-radius: 30px;
  height: 42px;
  width: 100%;
  color: var(--app-text-primary-color);
}

.posts form input:focus-visible {
  outline: 1px solid var(--app-border-color);
}

.posts form input::placeholder {
  font-family: Nunito, sans-serif;
  font-size: large;
}

.post-content {
  text-align: justify;
  padding-top: 2vh;
}

.post-content h2 {
  color: var(--app-text-primary-color);
}

#post-image {
  display: none;
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 4vh;
  top: 2vh;
  color: var(--app-text-primary-color);
}

.post-infos {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  bottom: 0;
  right: 2vh;
}

.post-infos p {
  padding: 1vh;
  cursor: pointer;
}

.post {
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--app-text-primary-color);
  padding: 4vh 0 0 4vh;
  border-radius: 30px;
  margin: 1vh 0;
  position: relative;
  font-size: 20px;
}

.post p {
  color: var(--app-text-primary-color);
  font-size: 20px;
}

.post p span {
  font-size: medium;
}

.post-container {
  display: inline-flex;
  align-items: center;
}

.post-container img {
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

.post-image img {
  width: 350px;
  height: 200px;
  object-fit: cover;
  margin: 0;
}

.update {
  padding: 1vh;
}

.form-add-comment {
  padding-right: 4vh !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-content {
  padding-left: 2vh;
  max-width: 95%;
}

@media (max-width: 700px) {
  .sidebar {
    display: initial;
    height: initial;
  }

  .box-posts {
    position: initial;
    padding-bottom: 10vh;
  }

  .icon {
    height: 0;
  }

  .icons {
    height: initial;
  }

  .logout {
    height: 8vh;
    padding: 0.5vh;
    bottom: -2vh;
    right: -1vh;
    width: initial;
    text-align: center;
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

  .post {
    padding: 0 0 2vh;
  }

  .align {
    text-align: center;
  }

  .list-posts {
    padding-bottom: 10vh;
  }

  .posts {
    margin-bottom: 0;
    height: initial;
    padding: 2vh 2.5vh;
    width: initial;
    min-height: 80vh;
    border-radius: 0;
  }

  .posts h1 {
    text-align: center;
  }

  .posts form {
    flex-direction: column;
    gap: 20px;
    padding: 2vh 0;
  }

  .posts form ::placeholder {
    text-align: center;
  }

  .post-container {
    flex-direction: column;
    padding: 2vh;
  }

  .post-content {
    padding: 2vh;
    padding-top: 0;
    text-align: center;
  }

  .post-image img {
    width: 100%;
    height: 100%;
    padding-top: 2vh;
  }

  .post-video video {
    width: 100%;
    height: 100%;
  }

  .post-actions {
    justify-content: center;
    right: 0;
    left: 0;
    bottom: 0;
    top: initial;
  }

  .title-form {
    padding-left: 0;
    max-width: 80%;
  }

  .content-form-post {
    padding-left: 0;
    max-width: 80%;
  }

  .no-post {
    text-align: center;
  }

  .post-infos {
    right: initial;
    justify-content: center;
  }

  .comments form ::placeholder {
    text-align: center;
  }

  .post-infos p {
    text-align: center;
  }

  .form-add-comment {
    padding-right: 0 !important;
  }

  .comment-content {
    padding-left: 0;
    max-width: initial;
  }
}
</style>
