const exec = require('child_process').exec

const run = () => {
  const clientWorkerProcess = exec(`cd web && node start.js`, {encoding: 'utf8'}, (err, std, stderr) => {
    console.log(err)
    console.log(std)
    console.log(stderr)
  })

  clientWorkerProcess.stdout.on('data', (data) => {
    console.log(data)
  })
}

module.exports = run