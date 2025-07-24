<template>
  <div class="packages-main" v-if="$store.state.connectedUser.rank === 1">
    <h1>
      {{
        stack === 'back'
          ? $t('DASHBOARDHOME.DEPENDENCIESAPITITLE')
          : $t('DASHBOARDHOME.DEPENDENCIESFRONTTITLE')
      }}
    </h1>
    <p>{{ $t('DASHBOARDHOME.DEPENDENCIESDESC') }}</p>
    <div class="packages" v-if="packagesToUpdate === null">
      <div class="loading-dots">
        <p>{{ $t('DASHBOARDHOME.LOADING') }}</p>
        <div class="loading-dots--dot"></div>
        <div class="loading-dots--dot"></div>
        <div class="loading-dots--dot"></div>
      </div>
    </div>
    <div class="packages" v-else>
      <div class="packages-container" v-if="packagesToUpdate.length !== 0">
        <ul>
          <li
            v-for="packageToUpdate in packagesToUpdate"
            :key="packageToUpdate[0]"
          >
            <a :href="`https://www.npmjs.com/package/${packageToUpdate[0]}`">{{
              packageToUpdate[0]
            }}</a>
            :
            <a
              class="version"
              :href="`https://www.npmjs.com/package/${
                packageToUpdate[0]
              }/v/${packageToUpdate[1].replace(/[\^~]/g, '')}`"
              >{{ packageToUpdate[1].replace(/[\^~]/g, '') }}</a
            >
            ->
            <a
              class="version"
              :class="getUpdateType(packageToUpdate[1], packageToUpdate[2])"
              :href="`https://www.npmjs.com/package/${
                packageToUpdate[0]
              }/v/${packageToUpdate[2].replace(/[\^~]/g, '')}`"
              >{{ packageToUpdate[2].replace(/[\^~]/g, '') }}</a
            >
          </li>
        </ul>
      </div>
      <p v-else>
        {{ $t('DASHBOARDHOME.DEPENDENCIESUPTODATE') }}
        <i class="fas fa-check-circle"></i>
      </p>
    </div>
  </div>
</template>

<script>
import frontPackageJSON from '../../package.json';

const frontPackages = {
  dependencies: frontPackageJSON.dependencies,
  devDependencies: frontPackageJSON.devDependencies,
};

export default {
  name: 'AvailableUpdate',
  props: {
    stack: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dependencies: {},
      devDependencies: {},
      packagesToUpdate: null,
    };
  },
  async created() {
    if (this.stack === 'back') {
      await this.getDependencies();
      await this.getDevDependencies();
    } else {
      this.dependencies = frontPackages.dependencies;
      this.devDependencies = frontPackages.devDependencies;
    }
    this.checkDependenciesUpdate();
  },
  methods: {
    async getDependencies() {
      const { token } = this.$store.state.token;
      try {
        const response = await fetch(
          'http://localhost:3000/api/config/dependencies',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer' ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await response.json();
        this.dependencies = data;
      } catch (error) {
        this.error = error;
      }
    },
    async getDevDependencies() {
      const { token } = this.$store.state.token;
      try {
        const response = await fetch(
          'http://localhost:3000/api/config/devdependencies',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer' ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await response.json();
        this.devDependencies = data;
      } catch (error) {
        this.error = error;
      }
    },
    checkDependenciesUpdate() {
      const { token } = this.$store.state.token;
      fetch('http://localhost:3000/api/config/checkUpdatesDependencies', {
        method: 'POST',
        headers: {
          Authorization: `Bearer' ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dependencies: this.dependencies,
          devDependencies: this.devDependencies,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          this.packagesToUpdate = data;
        })
        .catch((error) => {
          this.error = error;
        });
    },
    getUpdateType(currentVersion, updateVersion) {
      const currentVersionIterable = currentVersion.split('.');
      const updateVersionIterable = updateVersion.split('.');

      if (currentVersionIterable[0] !== updateVersionIterable[0]) {
        return {
          majorupdate: true,
        };
      }
      if (currentVersionIterable[1] !== updateVersionIterable[1]) {
        return {
          minorupdate: true,
        };
      }
      if (currentVersionIterable[2] !== updateVersionIterable[2]) {
        return {
          patchupdate: true,
        };
      }
      return {};
    },
  },
};
</script>

<style scoped lang="scss">
.packages-main {
  padding-top: 2vh;
  background-color: var(--app-input-background-color);
  color: var(--app-text-primary-color);
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  margin: 2vh;
}

.packages-main p {
  padding: 0;
  font-weight: 200;
  font-size: x-large;
}

@keyframes dot-keyframes {
  0% {
    opacity: 0.4;
    transform: scale(1, 1);
  }

  50% {
    opacity: 1;
    transform: scale(1.2, 1.2);
  }

  100% {
    opacity: 0.4;
    transform: scale(1, 1);
  }
}

.loading-dots {
  text-align: center;
  width: 100%;

  &--dot {
    animation: dot-keyframes 1.5s infinite ease-in-out;
    background-color: var(--app-text-primary-color);
    border-radius: 10px;
    display: inline-block;
    margin: 0.5vh;
    height: 8px;
    width: 8px;

    &:nth-child(2) {
      animation-delay: 0.5s;
    }

    &:nth-child(3) {
      animation-delay: 1s;
    }
  }
}

.packages-container li {
  text-align: left;
  list-style-type: circle;
}

.packages-container a {
  color: var(--app-text-primary-color);
}

.version {
  text-decoration: none;
}

.majorupdate,
.minorupdate,
.patchupdate {
  font-weight: bold;
}

.majorupdate {
  color: var(--app-major-update-color) !important;
}

.minorupdate {
  color: var(--app-minor-update-color) !important;
}

.patchupdate {
  color: var(--app-patch-update-color) !important;
}

@media (max-width: 700px) {
  .packages-main {
    margin: 2vh;
  }

  .packages-container {
    margin: 2vh;
    padding: 0 2vh;
  }

  ul {
    padding: 0;
  }

  .packages-container ul {
    margin: 2vh;
  }
}
</style>
