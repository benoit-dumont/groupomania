import DefaultLayout from './DefaultLayout.vue';
import ConnectedLayout from './ConnectedLayout.vue';
import AdminLayout from './AdminLayout.vue';

export const layouts = {
  DefaultLayout,
  ConnectedLayout,
  AdminLayout,
} as const;

export type LayoutName = keyof typeof layouts;
