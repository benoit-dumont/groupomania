import { useUserStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import { useToast } from './useToast';

export function useConnectedUser() {
  const userStore = useUserStore();
  const { t } = useI18n();
  const toast = useToast();

  return async function getConnectedUser() {
    const token = userStore.token;
    try {
      const response = await fetch('http://localhost:3000/api/user/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then();

      const { user } = await response.json();
      userStore.saveConnectedUser(user);
    } catch {
      return toast.error(t('ERROR.GENERAL'));
    }
  };
}
