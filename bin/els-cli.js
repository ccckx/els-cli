#!/usr/bin/env node

const run = require('./index.js')
const argvs = process.argv

run[argvs[2]]({ rootPth: process.env.INIT_CWD })
