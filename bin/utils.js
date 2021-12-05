const fs = require('fs')
const path = require('path')
const portfinder = require('portfinder')
const rootPth = process.env.INIT_CWD

const createFile = (filePath) => {
  const pathArr = filePath.split('\\')
  let currentPath = ''
  pathArr.pop()
  pathArr.forEach((item, index) => {
    index === 0 ? currentPath += item : currentPath += '/' + item
    if (currentPath && !fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath)
    }
  })
}

const getPort = (configPath) => {
  const config = require(configPath)
  let port = config.devServer && config.devServer.port || 8080
  return new Promise((resolve, reject) => {
    portfinder.getPort({port,stopPort: 9999 }, (err, port) => {
      if (port){
        resolve(port);
      }else{
        reject(false)
      }
    })
  })
}

const moveFile = (newFile, oldFile, resetObj) => {
  let oldFileString = fs.readFileSync(oldFile).toString()
  if (resetObj) {
    Object.keys(resetObj).forEach(item => {
      const reg = new RegExp(`<-- ${item} !->`, 'g')
      oldFileString = oldFileString.replace(reg, resetObj[item])
    })
    fs.writeFileSync(newFile, oldFileString)
  } else {
    fs.writeFileSync(newFile, oldFileString)
  }
}

const setPortConfig = (environment, port, isSsr = true) => {
  const settingPath = path.join(rootPth, '.els/config.json')
  createFile(settingPath)
  let config = ''
  if (fs.existsSync(settingPath)) {
    const defConfig = require(settingPath)
    defConfig[environment] = {
      port,
      isSsr
    }
    config = JSON.stringify(defConfig)
  } else {
    config = `{"${environment}":{"port": ${port},"ssr": ${ssr}}}`
  }
  fs.writeFileSync(settingPath, config)
}

const getProList = ({proPath, rl, name}) => {
  const list = fs.readdirSync(proPath)
  if (list.length) {
    let option = list.map((item, index) => {
      return index + 1 + '.' + item
    }).join('\n')
    selectProStr = option + '\n选择启动的项目是：'
    return {
      list,
      selectProStr
    }
  } else {
    console.log(`没有可${name}的项目`)
    rl.close();
  }
}
 
const setEntryFile = (pro, port = '8080') => {
  const formEntryPath = path.join(__dirname, '../entry')
  const toEntryPath = path.join(rootPth, '.els/pro')
  fs.readdirSync(formEntryPath).forEach(item => {
    const outPath = `${toEntryPath}\\${pro}\\${item}`
    createFile(outPath)
    moveFile(outPath, `${formEntryPath}/${item}`, {port: port, pro})
  })
}

module.exports = {
  createFile,
  getPort,
  moveFile,
  setPortConfig,
  getProList,
  setEntryFile
}