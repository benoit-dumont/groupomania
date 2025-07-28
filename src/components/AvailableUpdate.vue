<template>
  <div v-if="userStore.connectedUser!.rank === 1" class="packages-main">
    <h1>
      {{
        stack === 'back'
          ? $t('DASHBOARDHOME.DEPENDENCIESAPITITLE')
          : $t('DASHBOARDHOME.DEPENDENCIESFRONTTITLE')
      }}
    </h1>
    <p>{{ $t('DASHBOARDHOME.DEPENDENCIESDESC') }}</p>
    <div v-if="packagesToUpdate === null" class="packages">
      <div class="loading-dots">
        <p>{{ $t('DASHBOARDHOME.LOADING') }}</p>
        <div class="loading-dots--dot"></div>
        <div class="loading-dots--dot"></div>
        <div class="loading-dots--dot"></div>
      </div>
    </div>
    <div v-else class="packages">
      <div
        v-if="Array.isArray(packagesToUpdate) && packagesToUpdate.length !== 0"
        class="packages-container"
      >
        <ul>
          <li v-for="packageToUpdate in packagesToUpdate" :key="packageToUpdate[0]">
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

<script setup lang="ts">
import { ref } from 'vue';

import { useUserStore } from '@/stores';
import { useToast } from '@/composables';

const userStore = useUserStore();
const toast = useToast();

import frontPackageJSON from '../../package.json';

const frontPackages = {
  dependencies: frontPackageJSON.dependencies,
  devDependencies: frontPackageJSON.devDependencies,
};

const props = defineProps<{
  stack: string;
}>();

const dependencies = ref({});
const devDependencies = ref({});
const packagesToUpdate = ref<[string, string, string][] | null>(null);

if (props.stack === 'back') {
  await getDependencies();
  await getDevDependencies();
} else {
  dependencies.value = frontPackages.dependencies;
  devDependencies.value = frontPackages.devDependencies;
}
checkDependenciesUpdate();

async function getDependencies() {
  const token = userStore.token;
  try {
    const response = await fetch('http://localhost:3000/api/config/dependencies', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    dependencies.value = data;
  } catch (error) {
    return toast.error(`Erreur': ${error}`);
  }
}
async function getDevDependencies() {
  const token = userStore.token;
  try {
    const response = await fetch('http://localhost:3000/api/config/devdependencies', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    devDependencies.value = data;
  } catch (error) {
    return toast.error(`Erreur': ${error}`);
  }
}

function checkDependenciesUpdate() {
  const token = userStore.token;
  fetch('http://localhost:3000/api/config/checkUpdatesDependencies', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dependencies: dependencies.value,
      devDependencies: devDependencies.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      packagesToUpdate.value = data;
    })
    .catch((error) => {
      return toast.error(`Erreur': ${error}`);
    });
}

function getUpdateType(currentVersion: string, updateVersion: string) {
  const clean = (v: string) => v.replace(/^[\^~]/, ''); // supprime ^ ou ~ s'ils sont au début
  const [cMaj, cMin, cPatch] = clean(currentVersion).split('.').map(Number);
  const [uMaj, uMin, uPatch] = clean(updateVersion).split('.').map(Number);

  if (uMaj > cMaj) {
    return { majorupdate: true };
  }
  if (uMin > cMin) {
    return { minorupdate: true };
  }
  if (uPatch > cPatch) {
    return { patchupdate: true };
  }
  return {};
}
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
