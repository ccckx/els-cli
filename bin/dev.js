const path = require('path')
const webDev = require('../lib/webDev')
const utils = require('./utils')
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const run = ({rootPth}) => {
  const proPath = path.join(rootPth, 'web')

  let selectProStr, proList, pro
  const proInfo = utils.getProList({proPath, rl, name: '启动'})
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
          if (index === '2') {
            webDev.webSpaDev({pro, isSsr: false})
          } else {
            webDev.webSsrDev({pro, isSsr: true})
          }
        })
      }
    })
  }
}

module.exports = run