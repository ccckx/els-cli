const fs = require('fs')
const path = require('path')
const ora = require('ora')
const spinnerServer = ora('building for client...')
const method = require('../utils/method')
const server = require('../utils/server')

const ssr = async ({pro, isSsr}) => {
  server.setEntryFile({pro, isSsr})
  spinnerServer.start()
  server.start('vue-cli-service build', () => {
    const rootPth = process.env.INIT_CWD
    const rootConfigPath = path.join(rootPth, `vue.config.js`)
    const proServerConfigPath = path.join(rootPth, `web/${pro}/server.config.js`)
    const serverConfigPath = path.join(__dirname, `../config/server.config.js`)
    const hasConfig = fs.existsSync(proServerConfigPath)
    method.moveFile(rootConfigPath, serverConfigPath, {pro, hasConfig})
    server.start('vue-cli-service build', () => {
      spinnerServer.stop()
      process.exit()
    })
  })
}

const spa = async ({pro, isSsr}) => {
  server.setEntryFile({pro, isSsr})
  spinnerServer.start()
  server.start('vue-cli-service build', () => {
    spinnerServer.stop()
    process.exit()
  })
}

module.exports = {
  ssr,
  spa
}