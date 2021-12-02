import init from './main' 
export default async function (content) {
  const { app, router, store, setState } = init('sever')
  await router.push(content.url)
  await router.isReady()
  await setState(router.currentRoute.value.matched, store)
  
  return {
    app,
    router,
    store
  }
}