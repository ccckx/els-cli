const setState = async (matched, store) => {
  const promiseAll = []
  matched.flatMap(record =>{
    Object.values(record.components).map(async component => {
      if (component.asyncData) {
        promiseAll.push(component.asyncData())
      }
    })
  })
  const state = await Promise.all(promiseAll.map(promise => {
    return promise.catch(e => e)
  }))
  store.commit('initSsrState', state)
}

export {
  setState
}