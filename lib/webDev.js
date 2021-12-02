const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const ora = require('ora')
const spinnerServer = ora('building for server...')
const utils = require('../bin/utils')
const webDev = async ({pro}) => {
  const rootPth = process.env.INIT_CWD
  const clientConfigPath = path.join(__dirname, `../config/client.config.js`)
  const serverConfigPath = path.join(__dirname, `../config/server.config.js`)
  const rootConfigPath = path.join(rootPth, `vue.config.js`)
  const proClientConfigPath = path.join(rootPth, `web/${pro}/client.config.js`)
  const hasConfig = fs.existsSync(proClientConfigPath)
  let clientPort = '8090'

  if (hasConfig) {
    clientPort = await utils.getPort(proClientConfigPath)
  } else {
    clientPort = await utils.getPort(clientConfigPath)
  }
  utils.moveFile(rootConfigPath, clientConfigPath, {port: clientPort, pro, hasConfig})
  utils.setPortConfig(pro, clientPort)
  utils.setEntryFile(pro, clientPort)

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
    return
    if (data.indexOf('INFO  Starting development server') >= 0) {
      spinnerServer.start()
    }
    if (data.indexOf('To create a production build, run npm run build.') >= 0) {
      const proClientConfigPath = path.join(rootPth, `web/pro/${pro}/server.config.js`)
      const hasConfig = fs.existsSync(proClientConfigPath)
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
          const outPath = path.resolve(`${baseOutPath}/${pro}/${itemPath}`)
          utils.createFile(outPath)
          fs.writeFileSync(outPath, fileContent, 'binary')
        })
        fs.writeFileSync(
          path.resolve(baseOutPath, pro, 'ssr-manifest.json'),
          JSON.stringify(bundle)
        )
        console.log('Startup complete')
      });
    }
  })
}

module.exports = webDev
