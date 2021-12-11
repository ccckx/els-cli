#!/usr/bin/env node

const run = require('./index.js')
const argvs = process.argv
const server = require('../utils/server')
server.select({add: argvs[2] === 'dev-add'}, ({pro, isSsr}) => {
  run[argvs[2]]({pro, isSsr})
})


