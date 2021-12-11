const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const MemoryFS = require('memory-fs');
const mfs = new MemoryFS();
const method = require('./method')
const ora = require('ora')
const spinnerServer = ora('building for server...')
const exec = require('child_process').exec
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const select = ({isProduction, add}, callback) => {
  const rootPth = process.env.INIT_CWD
  const settingPath = path.join(rootPth, '.els/proList.json')
  method.createFile(settingPath)
  let config = {}
  if (fs.existsSync(settingPath)) {
    config = require(settingPath)
  }
  const proPath = path.join(rootPth, 'web')
  let selectProStr, proList, pro
  const name = isProduction ? '启动' : '打包'
  const proInfo = method.getProList({proPath, rl, name})
  if (proInfo) {
    selectProStr = proInfo.selectProStr
    proList = proInfo.list
    rl.question(selectProStr, (index) => {
      pro = proList[index - 1]
      if (!pro) {
        console.log('找不到该项目')
        process.exit()
      } else {
        let activeConfig = {}
        if (add) {
          const configPath = path.join(rootPth, '.els/config.json')
          method.createFile(configPath)
          if (fs.existsSync(configPath)) {
            activeConfig = require(configPath)
          }
          if (activeConfig[pro]) {
            console.log('该项目已启动')
            process.exit()
          }
        }
        if (config[pro]) {
          rl.close()
          callback({pro, isSsr: config[pro].ssr})
        } else {
          rl.question('1.true\n2.false\n是否ssr项目:', (index) => {
            rl.close()
            callback({pro, isSsr: index === '2' ? false : true})
          })
        }
      }
    })
  }
}

const setEntryFile = async ({pro, isSsr, add}) => {
  const rootPth = process.env.INIT_CWD
  const rootConfigPath = path.join(rootPth, `vue.config.js`)
  let clientConfigPath, serverConfigPath, proClientConfigPath, hasConfig, vueConfigPath
  if (isSsr) {
    clientConfigPath = path.join(__dirname, `../config/client.config.js`)
    serverConfigPath = path.join(__dirname, `../config/server.config.js`)
    proClientConfigPath = path.join(rootPth, `web/${pro}/client.config.js`)
  } else {
    vueConfigPath = path.join(__dirname, `../config/vue.config.js`)
    proClientConfigPath = path.join(rootPth, `web/${pro}/vue.config.js`)
  }
  hasConfig = fs.existsSync(proClientConfigPath)
  let clientPort = '8080'
  if (hasConfig) {
    clientPort = await method.getPort({configPath: proClientConfigPath})
  } else {
    clientPort = await method.getPort({clientPort})
  }
  if (isSsr) {
    method.moveFile(rootConfigPath, clientConfigPath, {port: clientPort, pro, hasConfig})
  } else {
    method.moveFile(rootConfigPath, vueConfigPath, {port: clientPort, pro, hasConfig})
  }
  
  method.setPortConfig({pro, port:clientPort, isSsr, add})
  isSsr && method.setEntryFile({pro, clientPort})
}

const start = (cmd, callback) => {
  const workerProcess = exec(cmd, {encoding: 'utf8'}, (err, std, stderr) => {
    console.log(err)
    console.log(std)
    console.log(stderr)
  })
  workerProcess.stdout.on('data', async (data) => {
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
    if (data.indexOf('To create a production build, run npm run build.') >= 0 || data.indexOf('DONE  Build complete.') >= 0) {
      spinnerServer.stop()
      callback()
    }
  })
}

const serverCompiler = ({pro}, callback) => {
  spinnerServer.start()
  const rootPth = process.env.INIT_CWD
  const baseOutPath = path.join(rootPth, '/app/vue/server/')
  const rootConfigPath = path.join(rootPth, `vue.config.js`)
  const serverConfigPath = path.join(__dirname, `../config/server.config.js`)
  const proServerConfigPath = path.join(rootPth, `web/${pro}/server.config.js`)
  const hasConfig = fs.existsSync(proServerConfigPath)
  method.moveFile(rootConfigPath, serverConfigPath, {pro, hasConfig})
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
      method.createFile(outPath)
      fs.writeFileSync(outPath, fileContent, 'binary')
    })
    fs.writeFileSync(
      path.join(baseOutPath, pro, 'ssr-manifest.json'),
      JSON.stringify(bundle)
    )
    console.log('Startup complete')
    callback()
  });
}

const serve = () => {
  const eggWorkerProcess = exec(`egg-bin dev`, {encoding: 'utf8'}, (err, std, stderr) => {
    console.log(err)
    console.log(std)
    console.log(stderr)
  })
  eggWorkerProcess.stdout.on('data', async (data) => {
    console.log(data)
  })
}

module.exports = {
  select,
  setEntryFile,
  start,
  serverCompiler,
  serve
}