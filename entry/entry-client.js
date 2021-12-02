import init from './main' 
const { app, router, store, setState } = init()
router.isReady().then(async () => {
  router.beforeResolve(async (to, from, next) => {
    const prevMatched = from.matched
    let diffed = false;
    const activated = to.matched.filter((c, i) => {
      return diffed || (diffed = prevMatched[i] !== c);
    });
    await setState(activated, store)
    next()
  })
  if ((window).__INITIAL_STATE__) {
    store.replaceState((window).__INITIAL_STATE__);
  } else {
    await setState(router.currentRoute.value.matched, store)
  }

  app.mount('#app')
})
