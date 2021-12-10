const webDev = require('../lib/webDev')

const run = ({pro, isSsr}) => {
  if (isSsr) {
    webDev.ssr({pro, isSsr})
  } else {
    webDev.spa({pro, isSsr})
  }
}

module.exports = run