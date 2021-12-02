import { createSSRApp } from 'vue'
import { createWebHistory, createMemoryHistory } from 'vue-router'
import createRouter from '../../../web/<-- pro !->/router'
import createStore from '../../../web/<-- pro !->/store'
import App from '../../../web/<-- pro !->/App.vue'
import { setState } from './utils'

export default (env) => {
  const pro = '<-- pro !->' === 'index' ? '' : '/<-- pro !->/'
  const app = createSSRApp(App)
  const router = createRouter(env === 'sever' ? createMemoryHistory(pro) : createWebHistory(pro))
  const store = createStore()
  app.use(router)
  app.use(store)
  return {
    app,
    router,
    store,
    setState
  }
}