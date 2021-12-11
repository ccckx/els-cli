const fs = require('fs')
const path = require('path')
const merge = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production'
const port = '<-- port !->'
const pro = '<-- pro !->'
let config = {}
if ('<-- hasConfig !->' === 'true') {
  const configPath = path.join(path.resolve('./'), `/web/${pro}/client.config.js`)
  config = require(configPath)
}
const proPublicPath = pro === 'index' ? `./${pro}` : `../${pro}`
const baseConfig = {
  publicPath: isProduction ? proPublicPath : `http://localhost:${port}`,
  outputDir: `./app/web/client/${pro}`,
  devServer: {
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    onListening: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      const outPathArr = devServer.compiler.outputPath.split('\\')
      const pro = outPathArr.pop()
      const config = fs.readFileSync(path.join(path.resolve('./'), '.els/config.json'))
      const configPort = JSON.parse(config.toString())[pro].port
      const port = devServer.listeningApp.address().port
      if (configPort != port) {
        console.log('端口号不同')
      }
    },
  },
  chainWebpack: webpackConfig => {
    webpackConfig.module.rule('vue').uses.delete('cache-loader')
    webpackConfig.module.rule('js').uses.delete('cache-loader')
    webpackConfig.module.rule('ts').uses.delete('cache-loader')
    webpackConfig.module.rule('tsx').uses.delete('cache-loader')

    webpackConfig.plugins.delete('prefetch')
    webpackConfig.plugins.delete('progress')
    webpackConfig.plugins.delete('friendly-errors')

    webpackConfig
      .entry('app')
      .clear()
      .add(`./.els/pro/${pro}/entry-client.js`)
    
    webpackConfig
      .plugin('html')
      .tap(args  => {
        args[0].template = `./web/${pro}/public/index.html`
        return args
      })
  },
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([{
        from: __dirname + `/web/${pro}/public`,
        to: __dirname + `../app/web/client/${pro}/public`,
        ignore: ['.*']
      }])
    ]
  }
}
module.exports = merge(baseConfig, config)