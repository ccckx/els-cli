const path = require('path')
const utils = require('../utils/method')
const build = require('../lib/build')
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const run = ({rootPth}) => {
  const proPath = path.join(rootPth, 'web')

  let selectProStr, proList, pro
  const proInfo = utils.getProList({proPath, rl, name: '打包'})

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
            build.spa({pro, isSsr: false})
          } else {
            build.ssr({pro, isSsr: true})
          }
        })
      }
    })
  }
}

module.exports = run
