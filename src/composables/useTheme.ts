import { ref, computed, watch } from 'vue';
import LogoBlack from '../assets/logo_black.png';
import LogoWhite from '../assets/logo_white.png';

const darkMode = ref(localStorage.getItem('theme') === 'dark');
const logoSrc = computed(() => (darkMode.value ? LogoWhite : LogoBlack));

watch(
  darkMode,
  (value) => {
    const theme = value ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('theme', theme);
  },
  { immediate: true },
);

function toggleTheme() {
  darkMode.value = !darkMode.value;
}

export function useTheme() {
  return { darkMode, logoSrc, toggleTheme };
}
