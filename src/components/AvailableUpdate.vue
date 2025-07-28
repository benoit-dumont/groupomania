<template>
  <div v-if="store.state.connectedUser.rank === 1" class="packages-main">
    <h1>
      {{
        stack === 'back'
          ? t('DASHBOARDHOME.DEPENDENCIESAPITITLE')
          : t('DASHBOARDHOME.DEPENDENCIESFRONTTITLE')
      }}
    </h1>
    <p>{{ t('DASHBOARDHOME.DEPENDENCIESDESC') }}</p>

    <div v-if="packagesToUpdate === null" class="packages">
      <div class="loading-dots">
        <p>{{ t('DASHBOARDHOME.LOADING') }}</p>
        <div class="loading-dots--dot"></div>
        <div class="loading-dots--dot"></div>
        <div class="loading-dots--dot"></div>
      </div>
    </div>

    <div v-else class="packages">
      <div v-if="packagesToUpdate.length !== 0" class="packages-container">
        <ul>
          <li v-for="packageToUpdate in packagesToUpdate" :key="packageToUpdate[0]">
            <a :href="`https://www.npmjs.com/package/${packageToUpdate[0]}`">
              {{ packageToUpdate[0] }}
            </a>:
            <a
              class="version"
              :href="`https://www.npmjs.com/package/${packageToUpdate[0]}/v/${stripCaret(packageToUpdate[1])}`"
            >
              {{ stripCaret(packageToUpdate[1]) }}
            </a>
            ->
            <a
              class="version"
              :class="getUpdateType(packageToUpdate[1], packageToUpdate[2])"
              :href="`https://www.npmjs.com/package/${packageToUpdate[0]}/v/${stripCaret(packageToUpdate[2])}`"
            >
              {{ stripCaret(packageToUpdate[2]) }}
            </a>
          </li>
        </ul>
      </div>
      <p v-else>
        {{ t('DASHBOARDHOME.DEPENDENCIESUPTODATE') }}
        <i class="fas fa-check-circle"></i>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex'; // ou pinia selon ton setup
import { useI18n } from 'vue-i18n';
import frontPackageJSON from '../../package.json';

const props = defineProps({
  stack: {
    type: String,
    required: true,
  },
});

const store = useStore();
const { t } = useI18n();

const dependencies = ref({});
const devDependencies = ref({});
const packagesToUpdate = ref(null);
const error = ref(null);

const frontPackages = {
  dependencies: frontPackageJSON.dependencies,
  devDependencies: frontPackageJSON.devDependencies,
};

function stripCaret(version) {
  return version.replace(/[\^~]/g, '');
}

function getUpdateType(currentVersion, updateVersion) {
  const current = currentVersion.split('.');
  const update = updateVersion.split('.');

  if (current[0] !== update[0]) return 'majorupdate';
  if (current[1] !== update[1]) return 'minorupdate';
  if (current[2] !== update[2]) return 'patchupdate';
  return '';
}

async function getDependencies() {
  try {
    const token = store.state.token.token; // attention à la structure exacte du token
    const response = await fetch('http://localhost:3000/api/config/dependencies', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    dependencies.value = data;
  } catch (e) {
    error.value = e;
  }
}

async function getDevDependencies() {
  try {
    const token = store.state.token.token;
    const response = await fetch('http://localhost:3000/api/config/devdependencies', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    devDependencies.value = data;
  } catch (e) {
    error.value = e;
  }
}

async function checkDependenciesUpdate() {
  try {
    const token = store.state.token.token;
    const response = await fetch('http://localhost:3000/api/config/checkUpdatesDependencies', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dependencies: dependencies.value,
        devDependencies: devDependencies.value,
      }),
    });
    const data = await response.json();
    packagesToUpdate.value = data;
  } catch (e) {
    error.value = e;
  }
}

onMounted(async () => {
  if (props.stack === 'back') {
    await getDependencies();
    await getDevDependencies();
  } else {
    dependencies.value = frontPackages.dependencies;
    devDependencies.value = frontPackages.devDependencies;
  }
  await checkDependenciesUpdate();
});
</script>
