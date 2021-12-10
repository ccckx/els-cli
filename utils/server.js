const path = require('path')
const method = require('./method')
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const select = ({isProduction}, callback) => {
  const rootPth = process.env.INIT_CWD
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
      } else {
        rl.question('1.true\n2.false\n是否ssr项目:', (index) => {
          rl.close()
          callback({pro, isSsr: index === '2' ? false : true})
        })
      }
    })
  }
}

const setEntryFile = ({isSsr}) => {
  const rootPth = process.env.INIT_CWD
  const baseOutPath = path.join(rootPth, '/app/vue/server/')
  const rootConfigPath = path.join(rootPth, `vue.config.js`)
  let clientConfigPath, serverConfigPath, proClientConfigPath, hasConfig
  if (isSsr) {
    clientConfigPath = path.join(__dirname, `../config/client.config.js`)
    serverConfigPath = path.join(__dirname, `../config/server.config.js`)
    proClientConfigPath = path.join(rootPth, `web/${pro}/client.config.js`)
  }
  const hasConfig = fs.existsSync(proClientConfigPath)
  let clientPort = '8080'
  if (hasConfig) {
    clientPort = await method.getPort({configPath: proClientConfigPath})
  } else {
    clientPort = await method.getPort({clientPort})
  }
  method.moveFile(rootConfigPath, clientConfigPath, {port: clientPort, pro, hasConfig})
  method.setPortConfig({pro, port:clientPort, isSsr})
  method.setEntryFile({pro, clientPort})
}

module.exports = {
  select,
  setEntryFile
}