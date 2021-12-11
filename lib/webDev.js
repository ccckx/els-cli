const server = require('../utils/server')

const ssr = ({pro, isSsr, add}) => {
  server.setEntryFile({pro, isSsr, add})
  server.start('vue-cli-service serve', () => {
    let start = false
    server.serverCompiler({pro}, () => {
      if (!start) {
        start = true
        !add && server.serve()
      }
    })
  })
}

const spa = ({pro, isSsr, add}) => {
  server.setEntryFile({pro, isSsr, add})
  server.start('vue-cli-service serve', () => {
    !add && server.serve()
  })
}

module.exports = {
  ssr,
  spa
}
