const webDev = require('../lib/webDev')

const run = ({pro, isSsr}) => {
  if (isSsr) {
    webDev.ssr({pro, isSsr, add:true})
  } else {
    webDev.spa({pro, isSsr, add:false})
  }
}

module.exports = run