<template>
  <div class="test">
    <div class="content-login">
      <div class="content-login-container">
        <img :src="this.getImage()" alt="Logo Groupomania" />
        <h2>{{ $t('LOGIN.TITLE') }}</h2>
        <form @submit.prevent="submit">
          <label>{{ $t('LOGIN.USERNAMEEMAILLABEL') }} *</label>
          <input
            type="text"
            name="identifiant"
            :placeholder="$t('LOGIN.USERNAMEEMAILPLACEHOLDER')"
            v-model="identifiant"
          />
          <label>{{ $t('LOGIN.PASSWORDLABEL') }} *</label>
          <input
            type="password"
            name="password"
            :placeholder="$t('LOGIN.PASSWORDPLACEHOLDER')"
            v-model="password"
            pattern="^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$"
          />
          <input
            type="submit"
            name="submit"
            :value="$t('LOGIN.SUBMITBUTTON')"
            class="btn"
          />
        </form>
        <h3>
          {{ $t('LOGIN.DONTHAVEACCOUNT') }}
          <router-link :to="{ name: 'Signup' }">{{
            $t('LOGIN.SWITCHLOGINREGISTER')
          }}</router-link>
        </h3>
        <br />
        <h4>* = {{ $t('LOGIN.REQUIRED') }}</h4>
      </div>
    </div>
  </div>
</template>

<script>
import LogoBlack from '../assets/logo_full_black.png';
import LogoWhite from '../assets/logo_full_white.png';

export default {
  name: 'Login',
  metaInfo() {
    const title = this.$t('LOGIN.TITLE');
    return {
      title,
    };
  },
  data() {
    return {
      identifiant: '',
      password: '',
      user: {},
    };
  },
  methods: {
    submit() {
      if (this.identifiant.length === 0) {
        return this.$vToastify.error(this.$t('LOGIN.IDENTIFIANT.INPUT'));
      }
      if (this.password.length === 0) {
        return this.$vToastify.error(this.$t('PASSWORD.INPUT'));
      }
      const regexPassword =
        /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;

      if (!regexPassword.test(this.password)) {
        return this.$vToastify.error(this.$t('PASSWORD.FORMAT'));
      }
      if (this.identifiant.includes('@groupomania.fr')) {
        const regexEmail = /^([\w-]+(?:\.[\w-]+)*)@groupomania\.fr$/i;
        if (!regexEmail.test(this.identifiant)) {
          return this.$vToastify.error(this.$t('EMAIL.FORMAT'));
        }
        return fetch('http://localhost:3000/api/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.identifiant,
            password: this.password,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            this.user = data;
            const tokenData = {
              token: data.token,
              date: Date.now(),
            };
            this.$store.dispatch('saveToken', tokenData);
            setTimeout(() => this.$router.push({ name: 'Accueil' }), 4000);
            return this.$vToastify.success(this.$t('LOGIN.SUCCESS'));
          });
      }

      fetch('http://localhost:3000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.identifiant,
          password: this.password,
        }),
      })
        .then((response, error) => {
          if (response.ok) {
            return response.json();
          }
          throw error;
        })
        .then((data) => {
          this.user = data;
          const tokenData = {
            token: data.token,
            date: Date.now(),
          };
          this.$store.dispatch('saveToken', tokenData);
          setTimeout(() => this.$router.push({ name: 'Accueil' }), 4000);
          return this.$vToastify.success(this.$t('LOGIN.SUCCESS'));
        })
        .catch(() => {
          return this.$vToastify.error(this.$t('ERROR.GENERAL'));
        });
      return false;
    },
    getImage() {
      const theme = localStorage.getItem('theme');
      if (theme === 'light') {
        return LogoBlack;
      }
      return LogoWhite;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.test {
  background-color: var(--app-background-color);
}

.content-login {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-login img {
  max-width: 350px;
  width: 100%;
  height: 150px;
  object-fit: cover;
  padding: 2vh;
}

.content-login h2 {
  font-size: 36px;
  font-weight: 400;
  margin-bottom: 0 !important;
  color: var(--app-text-primary-color);
}

.content-login h3 {
  font-size: large;
  font-weight: 300;
  color: var(--app-text-primary-color);
  padding: 2vh;
  text-align: center;
}

form input a {
  color: black;
}

.content-login h3 a {
  color: var(--app-text-primary-color);
}

.content-login h4 {
  font-size: medium;
  font-weight: 300;
  color: var(--app-text-primary-color);
}

.content-login-container {
  display: inline-flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  height: 100%;
}

form {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  padding: 2vh;
  width: 100%;
}

form label {
  font-size: 18px;
  text-align: left;
  margin-bottom: 14px;
  color: var(--app-text-primary-color);
}

form input {
  width: 100%;
  max-width: 418px;
  height: 48px;
  font-family: Nunito, sans-serif;
  text-align: center;
  font-size: 18px;
  margin-bottom: 30px;
  border-radius: 12px;
  border: 1px #707070 solid;
  background-color: var(--app-input-background-color);
  color: var(--app-text-primary-color);
}

form input::placeholder {
  color: var(--app-input-placeholder-color);
}

.btn {
  width: 190px;
  height: 60px;
  background-color: var(--app-text-primary-color);
  border: transparent;
  border-radius: 12px;
  color: var(--app-background-color);
  margin: 0 auto;

  &:hover {
    background: var(--app-background-color);
    color: var(--app-text-primary-color);
    border: 1px solid var(--app-text-primary-color);
  }
}
</style>
