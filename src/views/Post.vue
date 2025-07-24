<template>
  <div class="test" v-if="post">
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
          <div class="page">
            <div class="post">
              <div class="post-title">
                <img :src="post.User.avatar" :alt="$t('ALTIMAGEPROFILE')" />
                <div class="align">
                  <p>
                    {{ post.User.name }} {{ post.User.firstname }} <br />
                    {{ formatDate(post.createdAt) }}
                  </p>
                </div>
              </div>
              <div class="post-content">
                <h2>{{ post.title }}</h2>
                <p>
                  {{ post.content }}
                </p>
              </div>
              <div class="post-image" v-if="post.media && isImage(post.media)">
                <img :src="post.media" :alt="$t('ALTMEDIA')" />
              </div>
              <div class="post-video" v-if="post.media && isVideo(post.media)">
                <video controls width="350" height="200">
                  <source :src="post.media" type="video/mp4" />
                </video>
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
              <div class="reactions">
                <h3>Réactions :</h3>
                <div class="reactions-container">
                  <div
                    class="likes-on"
                    v-if="hasLiked"
                    @click="toggleReaction(1)"
                  >
                    <i class="fas fa-thumbs-up"></i>
                    <span>{{ likes.length }}</span>
                  </div>
                  <div class="likes-off" v-else @click="toggleReaction(1)">
                    <i class="fas fa-thumbs-up"></i>
                    <span>{{ likes.length }}</span>
                  </div>
                  <div
                    class="dislikes-on"
                    v-if="hasDisliked"
                    @click="toggleReaction(2)"
                  >
                    <i class="fas fa-thumbs-down"></i>
                    <span>{{ dislikes.length }}</span>
                  </div>
                  <div class="dislikes-off" v-else @click="toggleReaction(2)">
                    <i class="fas fa-thumbs-down"></i>
                    <span>{{ dislikes.length }}</span>
                  </div>
                  <div
                    class="loves-on"
                    v-if="hasLoved"
                    @click="toggleReaction(3)"
                  >
                    <i class="fas fa-heart"></i>
                    <span>{{ loves.length }}</span>
                  </div>
                  <div class="loves-off" v-else @click="toggleReaction(3)">
                    <i class="fas fa-heart"></i>
                    <span>{{ loves.length }}</span>
                  </div>
                </div>
              </div>
            </div>
            <ul class="comments" v-if="post.Comments.length !== 0">
              <li
                class="comment"
                v-for="comment in post.Comments"
                :key="comment.id"
              >
                <div class="comment-title">
                  <img :src="comment.User.avatar" />
                  <p>
                    {{ comment.User.name }} {{ comment.User.firstname }} <br />
                    {{ formatDate(comment.createdAt) }}
                  </p>
                </div>
                <div class="comment-content">
                  <p>{{ comment.content }}</p>
                </div>
                <div
                  class="comment-actions"
                  v-if="
                    $store.state.connectedUser.id === comment.User.id ||
                    $store.state.connectedUser.rank === 1 ||
                    $store.state.connectedUser.rank === 2
                  "
                >
                  <div class="update" @click="updateComment(comment)">
                    <i class="fa fa-pencil"></i>
                  </div>
                  <deleteAction :data="comment" />
                </div>
              </li>
            </ul>
            <div class="no-comment" v-else>
              <h2>{{ $t('NO.COMMENT') }}</h2>
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
import LogoBlack from '../assets/logo_black.png';
import LogoWhite from '../assets/logo_white.png';

export default {
  name: 'Accueil',
  components: {
    deleteAction,
  },
  metaInfo() {
    const title = this.$t('POST.TITLE');
    return {
      title,
    };
  },
  data() {
    return {
      post: null,
      supportedExtensions: {
        image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
        video: ['mp4', 'avi'],
      },

      menuDisplayed: false,
    };
  },
  methods: {
    fetchPostData() {
      const { token } = this.$store.state.token;
      if (
        !typeof this.$route.params.PostId === 'number' ||
        this.$route.params.PostId < 0
      )
        return;
      fetch(`http://localhost:3000/api/post/${this.$route.params.PostId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer: ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.post = data;
        })
        .catch((error) => {
          return this.$vToastify.error(`An error occurred: ${error}`);
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
    updatePost(post) {
      this.$router.push({
        name: 'Post Modification',
        params: { PostId: post.id },
      });
    },
    deleteResource(data) {
      if (data.Comments) {
        return this.deletePost(data);
      }
      return this.deleteComment(data);
    },
    deletePost(post) {
      // eslint-disable-next-line no-alert
      const validation = window.confirm(
        'Are you sure you want to delete this post ?',
      );
      if (validation === true) {
        const { token } = this.$store.state.token;
        fetch(`http://localhost:3000/api/post/${post.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer:' ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(() => {
          return this.$router.push({
            name: 'Accueil',
          });
        });
      }
    },
    updateComment(comment) {
      this.$router.push({
        name: 'Comment Modification',
        params: { CommentId: comment.id },
      });
    },
    deleteComment(comment) {
      // eslint-disable-next-line no-alert
      const validation = window.confirm(
        'Are you sure you want to delete this comment ?',
      );
      if (validation === true) {
        const { token } = this.$store.state.token;
        fetch(`http://localhost:3000/api/comment/${comment.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer:' ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(() => this.fetchPostData());
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
    toggleReaction(type) {
      const existingReaction =
        this.hasLiked ?? this.hasDisliked ?? this.hasLoved;
      if (!existingReaction) {
        return this.addReaction(type);
      }
      if (+existingReaction.type === type) {
        return this.deleteReaction(existingReaction.id);
      }
      return this.updateReaction(existingReaction.id, type);
    },
    addReaction(type) {
      const { token } = this.$store.state.token;
      fetch(`http://localhost:3000/api/reaction/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer: ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          PostId: +this.$route.params.PostId,
          type,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          this.fetchPostData();
          return this.$vToastify.success('Successfully Created the Reaction');
        })
        .catch((error) => {
          return this.$vToastify.error(`An error occurred: ${error}`);
        });
    },
    deleteReaction(reactionId) {
      const { token } = this.$store.state.token;
      if (!typeof reactionId === 'number' || reactionId < 0) return;
      fetch(`http://localhost:3000/api/reaction/${reactionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer: ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          this.fetchPostData();
          this.$vToastify.success('Successfully Deleted the Reaction');
        })
        .catch((error) => {
          return this.$vToastify.error(`An error occurred: ${error}`);
        });
    },
    updateReaction(reactionId, type) {
      const { token } = this.$store.state.token;
      if (!typeof reactionId === 'number' || reactionId < 0) return;
      fetch(`http://localhost:3000/api/reaction/${reactionId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer: ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          PostId: +this.$route.params.PostId,
          type,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          this.fetchPostData();
          return this.$vToastify.success('Successfully Modified the Reaction');
        })
        .catch((error) => {
          return this.$vToastify.error(`An error occurred: ${error}`);
        });
    },
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
        this.UserId = data.user.id;
      })
      .catch((error) => {
        return this.$vToastify.error(`An error occurred: ${error}`);
      });
  },
  mounted() {
    EventBus.$on('deleteActionPressed', this.deleteResource);
    this.fetchPostData();
  },
  computed: {
    likes() {
      return this.post.Reactions.filter((reaction) => reaction.type === '1');
    },
    dislikes() {
      return this.post.Reactions.filter((reaction) => reaction.type === '2');
    },
    loves() {
      return this.post.Reactions.filter((reaction) => reaction.type === '3');
    },
    hasLiked() {
      return this.likes.find(
        (reaction) => reaction.UserId === this.$store.state.connectedUser.id,
      );
    },
    hasDisliked() {
      return this.dislikes.find(
        (reaction) => reaction.UserId === this.$store.state.connectedUser.id,
      );
    },
    hasLoved() {
      return this.loves.find(
        (reaction) => reaction.UserId === this.$store.state.connectedUser.id,
      );
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
  height: 100vh;
  display: inline-flex;
  z-index: 99999;
  width: 100%;
}

.icons {
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  transition: color 450ms ease-in-out;
  height: 70%;
}

.icons img {
  margin: 2vh;
  width: 85px;
  height: 85px;
  object-fit: cover;
}

.icons i {
  font-size: 32px;
  padding: 1vh;
}

.icons a {
  transition: color 450ms ease-in-out;
  color: var(--app-text-primary-color);

  &:hover {
    opacity: 0.8;
  }
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

.post-title {
  display: flex;
  align-items: center;
  padding-bottom: 2vh;
}

.align {
  display: inline-flex;
  flex-direction: column;
  padding-left: 2vh;
}

.align p {
  font-size: large;
}

.logout {
  height: 5vh;
  padding: 1.5vh;
  position: absolute;
  bottom: 0;
  background: var(--app-background-color);
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
  color: var(--app-text-primary-color);
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

.page {
  background: var(--app-background-color);
  height: 100%;
  border-top-left-radius: 30px;
  display: flex;
}

.post {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: stretch;
  height: 100%;
  flex-grow: 0;
  color: var(--app-text-primary-color);
  padding: 10vh 5vh;
  position: relative;
  flex-direction: column;
  overflow-x: scroll;
}

.post img {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
}

.post p {
  font-size: large;
}

.post-image img {
  max-width: 500px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  margin: 0;
}

.post-video video {
  max-width: 500px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  margin: 0;
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 10vh;
  top: 10vh;
  color: var(--app-text-primary-color);
}

.comments {
  padding: 2vh;
  overflow-y: scroll;
  height: 100%;
  padding-bottom: 10vh;
  overflow-x: hidden;
  border-left: solid 2vh var(--app-sidebar-color);
  flex-grow: 1;
}

.comment-container h1 {
  color: var(--app-text-primary-color);
  padding: 2vh;
}

.comment {
  color: var(--app-text-primary-color);
  padding: 2vh;
  border: 1px solid var(--app-border-color);
  margin: 2vh;
  border-radius: 30px;
  list-style-type: none;
  position: relative;
}

.comment img {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
}

.update {
  padding: 1vh;
}

.comment-title {
  display: inline-flex;
  align-items: center;
  padding-bottom: 4vh;
  width: 100%;
}

.comment-title p {
  padding-left: 2vh;
  font-size: large;
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: 5vh;
  top: 5vh;
  color: var(--app-text-primary-color);
}

.reactions {
  height: 100%;
  padding: 2vh 0;
}

.reactions-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 25%;
}

.likes-off i,
.dislikes-off i,
.loves-off i {
  padding: 1vh;
  font-size: large;
}

.likes-on i {
  padding: 1vh;
  font-size: large;
  color: green;
}

.dislikes-on i {
  padding: 1vh;
  font-size: large;
  color: red;
}

.loves-on i {
  padding: 1vh;
  font-size: large;
  color: red;
}

.no-comment {
  color: var(--app-text-primary-color);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-left: 2vh solid var(--app-sidebar-color);
  flex-grow: 1;
}

@media (max-width: 1000px) {
  .sidebar {
    display: initial;
  }

  .box-posts {
    position: initial;
  }

  .icons {
    height: initial;
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
    top: 3vh;
    right: 2vh;
    padding-right: 0;
  }

  .page {
    display: block;
    border-top-left-radius: 0;
  }

  .post {
    width: 100%;
  }

  .comments {
    border-left: 0;
  }

  .logout {
    height: 8vh;
    padding: 0.5vh;
    width: 100%;
    text-align: center;
    bottom: -4vh;
    right: -2vh;
  }

  .no-comment {
    border-left: 0;
    min-height: 30vh;
    text-align: center;
    height: 100%;
    align-items: initial;
    padding-top: 2vh;
  }
}
@media (max-width: 400px) {
  .post {
    padding: 2vh;
    padding-bottom: 4vh;
  }

  .post-title {
    flex-direction: column;
  }

  .comment-title {
    flex-direction: column;
  }

  .comment-title p {
    text-align: center;
  }

  .comment-content p {
    padding-bottom: 5vh;
  }

  .reactions-container {
    width: 100%;
  }

  .post-actions {
    right: 0;
    left: 0;
    bottom: 1vh;
    top: initial;
    justify-content: center;
  }

  .comment-actions {
    right: 0;
    left: 0;
    bottom: 1vh;
    top: initial;
    justify-content: center;
  }
}
</style>
