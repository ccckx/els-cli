const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const MemoryFS = require('memory-fs');
const mfs = new MemoryFS();
const exec = require('child_process').exec
const ora = require('ora')
const spinnerServer = ora('building for server...')
const utils = require('../bin/utils')
let start = false

const ssr = async ({pro, isSsr}) => {
  const rootPth = process.env.INIT_CWD
  const baseOutPath = path.join(rootPth, '/app/vue/server/')
  const clientConfigPath = path.join(__dirname, `../config/client.config.js`)
  const serverConfigPath = path.join(__dirname, `../config/server.config.js`)
  const rootConfigPath = path.join(rootPth, `vue.config.js`)
  const proClientConfigPath = path.join(rootPth, `web/${pro}/client.config.js`)
  const hasConfig = fs.existsSync(proClientConfigPath)
  let clientPort = '8080'

  if (hasConfig) {
    clientPort = await utils.getPort({configPath: proClientConfigPath})
  } else {
    clientPort = await utils.getPort({clientPort})
  }
  utils.moveFile(rootConfigPath, clientConfigPath, {port: clientPort, pro, hasConfig})
  utils.setPortConfig({pro, port:clientPort, isSsr})
  utils.setEntryFile({pro, clientPort})

  const clientWorkerProcess = exec(`vue-cli-service serve`, {encoding: 'utf8'}, (err, std, stderr) => {
    console.log(err)
    console.log(std)
    console.log(stderr)
  })
  clientWorkerProcess.stdout.on('data', async (data) => {
    if (data.indexOf('端口号不同') >= 0) {
      console.log('端口号不同,请重新运行')
      process.exit()
    }
    if (data.indexOf('npm ERR!') >=0) {
      process.exit()
    }
    console.log(data)
    if (data.indexOf('INFO  Starting development server') >= 0) {
      spinnerServer.start()
    }
    if (data.indexOf('To create a production build, run npm run build.') >= 0) {
      const proServerConfigPath = path.join(rootPth, `web/${pro}/server.config.js`)
      const hasConfig = fs.existsSync(proServerConfigPath)
      utils.moveFile(rootConfigPath, serverConfigPath, {pro, hasConfig})
      const webpackConfig = require('@vue/cli-service/webpack.config');
      const serverCompiler = webpack(webpackConfig);
      serverCompiler.outputFileSystem = mfs;
      serverCompiler.watch({}, (err, stats) => {
        if (err) {
          throw err;
        }
        stats = stats.toJson();
        stats.errors.forEach(error => console.error(error));
        stats.warnings.forEach(warn => console.warn(warn));
        spinnerServer.stop()
        const bundlePath = path.join(
          webpackConfig.output.path,
          'ssr-manifest.json',
        )
        bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
        Object.values(bundle).map(item => {
          const reg = new RegExp(`^${pro}`)
          const itemPath = item.replace(reg, '')
          const fileContent = mfs.readFileSync(path.join(webpackConfig.output.path, itemPath), 'binary')
          const outPath = path.join(`${baseOutPath}/${pro}/${itemPath}`)
          utils.createFile(outPath)
          fs.writeFileSync(outPath, fileContent, 'binary')
        })
        fs.writeFileSync(
          path.join(baseOutPath, pro, 'ssr-manifest.json'),
          JSON.stringify(bundle)
        )
        console.log('Startup complete')
        if (!start) {
          start = true
          const eggWorkerProcess = exec(`egg-bin dev`, {encoding: 'utf8'}, (err, std, stderr) => {
            console.log(err)
            console.log(std)
            console.log(stderr)
          })
          eggWorkerProcess.stdout.on('data', async (data) => {
            console.log(data)
          })
        }
      });
    }
  })
}

const spa = async ({pro, isSsr}) => {
  const rootPth = process.env.INIT_CWD
  const vueConfigPath = path.join(__dirname, `../config/vue.config.js`)
  const rootConfigPath = path.join(rootPth, `vue.config.js`)
  const proVueConfigPath = path.join(rootPth, `web/${pro}/vue.config.js`)
  const hasConfig = fs.existsSync(proVueConfigPath)
  let clientPort = '8090'
  if (hasConfig) {
    clientPort = await utils.getPort({configPath: proVueConfigPath})
  } else {
    clientPort = await utils.getPort({clientPort})
  }
  utils.moveFile(rootConfigPath, vueConfigPath, {port: clientPort, pro, hasConfig})
  utils.setPortConfig({pro, port: clientPort, isSsr})
  const clientWorkerProcess = exec(`vue-cli-service serve`, {encoding: 'utf8'}, (err, std, stderr) => {
    console.log(err)
    console.log(std)
    console.log(stderr)
  })
  clientWorkerProcess.stdout.on('data', async (data) => {
    console.log(data)
    if (data.indexOf('To create a production build, run npm run build.') >= 0) {
      const eggWorkerProcess = exec(`egg-bin dev`, {encoding: 'utf8'}, (err, std, stderr) => {
        console.log(err)
        console.log(std)
        console.log(stderr)
      })
      eggWorkerProcess.stdout.on('data', async (data) => {
        console.log(data)
      })
    }
  })
}

module.exports = {
  ssr,
  spa
}
