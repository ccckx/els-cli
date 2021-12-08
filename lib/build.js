const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const ora = require('ora')
const spinnerServer = ora('building for client...')
const utils = require('../bin/utils')

const ssr = async ({pro, isSsr}) => {
  const rootPth = process.env.INIT_CWD
  const clientConfigPath = path.join(__dirname, `../config/client.config.js`)
  const serverConfigPath = path.join(__dirname, `../config/server.config.js`)
  const rootConfigPath = path.join(rootPth, `vue.config.js`)
  const proClientConfigPath = path.join(rootPth, `web/${pro}/client.config.js`)
  const hasConfig = fs.existsSync(proClientConfigPath)
  utils.moveFile(rootConfigPath, clientConfigPath, {pro, hasConfig})
  utils.setEntryFile({pro})
  spinnerServer.start()
  const clientWorkerProcess = exec(`vue-cli-service build`, {encoding: 'utf8'}, (err, std, stderr) => {
    console.log(err)
    console.log(std)
    console.log(stderr)
  })
  clientWorkerProcess.stdout.on('data', (data) => {
    console.log(data)
    if (data.indexOf('npm ERR!') >=0) {
      process.exit()
    }
    if (data.indexOf('DONE  Build complete.') >= 0) {
      const proServerConfigPath = path.join(rootPth, `web/${pro}/server.config.js`)
      const hasConfig = fs.existsSync(proServerConfigPath)
      utils.moveFile(rootConfigPath, serverConfigPath, {pro, hasConfig})
      const serverWorkerProcess = exec(`npm run build:server`, {encoding: 'utf8'}, (err, std, stderr) => {
        console.log(err)
        console.log(std)
        console.log(stderr)
      })
      serverWorkerProcess.stdout.on('data', (data) => {
        console.log(data)
        if (data.indexOf('DONE  Build complete.') >= 0) {
          process.exit()
        }
      })
    }
  })
}

const spa = async ({pro, isSsr}) => {
  const rootPth = process.env.INIT_CWD
  const clientConfigPath = path.join(__dirname, `../config/vue.config.js`)
  const rootConfigPath = path.join(rootPth, `vue.config.js`)
  const proClientConfigPath = path.join(rootPth, `web/${pro}/vue.config.js`)
  const hasConfig = fs.existsSync(proClientConfigPath)
  utils.moveFile(rootConfigPath, clientConfigPath, {pro, hasConfig})
  utils.setEntryFile({pro})
  spinnerServer.start()
  const clientWorkerProcess = exec(`vue-cli-service build`, {encoding: 'utf8'}, (err, std, stderr) => {
    console.log(err)
    console.log(std)
    console.log(stderr)
  })
  clientWorkerProcess.stdout.on('data', (data) => {
    console.log(data)
    if (data.indexOf('npm ERR!') >=0) {
      process.exit()
    }
    if (data.indexOf('DONE  Build complete.') >= 0) {[
      process.exit()
    ]}
  })
}

module.exports = {
  ssr,
  spa
}