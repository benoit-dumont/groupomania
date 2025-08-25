import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
    rights?: {
      owner: boolean
      rank: number
      apiPath: string
      ownerKey: string
    }
  }
}
