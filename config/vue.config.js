const fs = require('fs')
const path = require('path')
const merge = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production'
const port = '<-- port !->'
const pro = '<-- pro !->'
let config = {}
if ('<-- hasConfig !->' === 'true') {
  const configPath = path.join(path.resolve('./'), `/web/${pro}/vue.config.js`)
  config = require(configPath)
}
const proPublicPath = pro === 'index' ? `./${pro}` : `../${pro}`
const baseConfig = {
  publicPath: isProduction ? proPublicPath : `http://localhost:${port}`,
  outputDir: `./app/web/client/${pro}`,
  devServer: {
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    port: 8090,
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
    // 我们需要禁用 cache loader，否则客户端构建版本会从服务端构建版本使用缓存过的组件
    webpackConfig.module.rule('vue').uses.delete('cache-loader')
    webpackConfig.module.rule('js').uses.delete('cache-loader')
    webpackConfig.module.rule('ts').uses.delete('cache-loader')
    webpackConfig.module.rule('tsx').uses.delete('cache-loader')

    webpackConfig.plugins.delete('prefetch')
    webpackConfig.plugins.delete('progress')
    webpackConfig.plugins.delete('friendly-errors')

    // 将入口指向应用的客户端入口文件
    webpackConfig
      .entry('app')
      .clear()
      .add(`./web/${pro}/main.js`)
    
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