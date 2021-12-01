const fs = require('fs')
const path = require('path')
const ora = require('ora')
const spinnerServer = ora('building for server...')
const webpack = require('webpack')
const MemoryFS = require('memory-fs');
const mfs = new MemoryFS();
const utils = require('./utils')
const exec = require('child_process').exec
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const baseOutPath = path.resolve(__dirname, '../app/vue/server/')

let selectProStr, proList, pro
const proInfo = utils.getProList({rl, name: '启动'})
if (proInfo) {
  selectProStr = proInfo.selectProStr
  proList = proInfo.list
  rl.question(selectProStr, (index) => {
    pro = proList[index - 1]
    if (!pro) {
      console.log('找不到该项目')
      rl.close()
    } else {
      start()
    }
  })
}

const start = async () => {
  rl.close()
  const clientConfigPath = `./config/client.config.js`
  const serverConfigPath = `./config/server.config.js`
  const proClientConfigPath = path.join(path.resolve(`./pro/${pro}/client.config.js`))
  const hasConfig = fs.existsSync(proClientConfigPath)
  let clientPort = '8090'
  if (hasConfig) {
    clientPort = await utils.getPort(proClientConfigPath)
  } else {
    clientPort = await utils.getPort(clientConfigPath)
  }
  utils.moveFile('./vue.config.js', clientConfigPath, {port: clientPort, pro, hasConfig})
  utils.setPortConfig(pro, clientPort)
  utils.setEntryFile(pro, clientPort)
  const clientWorkerProcess = exec(`npm run serve`, {encoding: 'utf8'}, (err, std, stderr) => {
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
      const hasConfig = fs.existsSync(path.join(path.resolve(`./pro/${pro}/server.config.js`)))
      utils.moveFile('./vue.config.js', serverConfigPath, {pro, hasConfig})
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