const build = require('../lib/build')

const run = ({pro, isSsr}) => {
  if (isSsr) {
    build.ssr({pro, isSsr})
  } else {
    build.spa({pro, isSsr})
  }
}

module.exports = run
