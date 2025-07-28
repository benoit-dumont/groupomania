import { useUserStore } from '@/stores/';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';

const userStore = useUserStore();
const { t } = useI18n();

export function getConnectedUser() {
  const token = userStore.token;
  fetch('http://localhost:3000/api/user/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer: ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then(({ user }) => {
      userStore.saveConnectedUser(user);
    })
    .catch(() => {
      return toast.error(t('ERROR.GENERAL'));
    });
}
