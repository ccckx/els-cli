#!/usr/bin/env node

const run = require('./index.js')
const argvs = process.argv
const server = require('../utils/server')
server.select({}, ({pro, isSsr}) => {
  run[argvs[2]]({pro, isSsr})
})


