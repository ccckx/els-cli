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
      rl.close()
      if (!pro) {
        console.log('找不到该项目')
      } else {
        webDev({pro})
      }
    })
  }
}

module.exports = run