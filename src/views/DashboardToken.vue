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
            <router-link :to="{ name: 'Home Dashboard' }">
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
          <h2>{{ $t('DASHBOARDTOKEN.TITLE') }}</h2>
          <data-table :columns="columns" :data="tokenReturned" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '../EventBus';
import deleteActionAdmin from '../components/DeleteAction.vue';
import LogoBlack from '../assets/logo_full_black.png';
import LogoWhite from '../assets/logo_full_white.png';

export default {
  metaInfo() {
    const title = this.$t('DASHBOARDTOKEN.TITLE');
    return {
      title,
    };
  },
  data() {
    return {
      tokens: [],
      columns: [
        {
          key: 'id',
          title: 'Id',
          type: 'number',
        },
        {
          key: 'createdAt',
          title: this.$t('DATATABLE.CREATEDAT'),
          type: 'string',
        },
        {
          key: 'token',
          title: this.$t('DATATABLE.TOKEN'),
          component: {
            props: ['data'],
            render(createElement) {
              return createElement(
                'div',
                {
                  class: 'token-style',
                },
                this.data.token,
              );
            },
          },
        },
        {
          key: 'userAgent',
          title: 'User Agent',
          type: 'string',
        },
        {
          key: 'ipAddress',
          title: this.$t('DATATABLE.IPADDRESS'),
          type: 'string',
        },
        {
          title: this.$t('DATATABLE.REVOKE'),
          component: deleteActionAdmin,
          sortable: false,
          searchable: false,
        },
      ],

      menuDisplayed: false,
    };
  },
  methods: {
    getTokens() {
      const { token } = this.$store.state.token;
      fetch('http://localhost:3000/api/token/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer:' ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.tokens = data;
        })
        .catch(() => {
          return this.$vToastify.error(this.$t('ERROR.GENERAL'));
        });
    },
    revokeToken(tokenData) {
      // eslint-disable-next-line no-alert
      const validation = window.confirm(this.$t('CONFIRM.TOKEN'));
      if (validation === true) {
        const { token } = this.$store.state.token;
        fetch(`http://localhost:3000/api/token/${tokenData.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer:' ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(() => this.getTokens());
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
  mounted() {
    EventBus.$on('deleteActionPressed', this.revokeToken);
    this.getTokens();
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
  computed: {
    tokenReturned() {
      return this.tokens.map((token) => {
        const parsedCreatedAt = this.formatDate(token.createdAt);
        const tokenModified = {
          ...token,
          createdAt: parsedCreatedAt,
        };
        return tokenModified;
      });
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

.side {
  min-height: 100vh;
  flex-shrink: 2;
}

.side-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
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
  color: var(--app-action-icons-color);

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
}

.middle-container h2 {
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
}
@media (max-width: 700px) {
  .side {
    min-height: initial;
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
