import 'pinia';

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DefineStoreOptions<S, G, A> {
    /**
     * Options de persistance pour pinia-plugin-persistedstate
     * - `boolean` : activer/désactiver la persistance globale
     * - `object` : config détaillée, avec les clés :
     *   - enabled (optionnel) : activer ou non la persistance
     *   - strategies (optionnel) : liste des stratégies (localStorage/sessionStorage etc.)
     *   - paths (optionnel) : liste des propriétés à persister dans le store
     */
    persist?:
      | boolean
      | {
          enabled?: boolean;
          strategies?: Array<{
            key?: string;
            storage?: Storage;
            paths?: string[];
          }>;
          paths?: string[];
        };
  }
}
