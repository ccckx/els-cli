const path = require('path')
const merge = require('webpack-merge')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const nodeExternals = require('webpack-node-externals')
const webpack = require('webpack')
const pro = '<-- pro !->'
let config = {}
if ('<-- hasConfig !->' === 'true') {
  const configPath = path.join(path.resolve('./'), `/web/${pro}/client.config.js`)
  config = require(configPath)
}
const publicPath = pro === 'index' ? './index' : `../${pro}`
const baseConfig = {
  publicPath,
  outputDir: `./app/web/server/${pro}`,
  chainWebpack: webpackConfig => {
    webpackConfig.module.rule('vue').uses.delete('cache-loader')
    webpackConfig.module.rule('js').uses.delete('cache-loader')
    webpackConfig.module.rule('ts').uses.delete('cache-loader')
    webpackConfig.module.rule('tsx').uses.delete('cache-loader')

    webpackConfig
      .entry('app')
      .clear()
      .add(`./.els/pro/${pro}/entry-server.js`)

    webpackConfig.target('node')
    webpackConfig.output.libraryTarget('commonjs2')

    webpackConfig
      .plugin('manifest')
      .use(new WebpackManifestPlugin({ fileName: 'ssr-manifest.json' }))
      
    webpackConfig.externals(nodeExternals({ allowlist: /\.(css|vue)$/ }))

    webpackConfig.optimization.splitChunks(false).minimize(false)

    webpackConfig.plugins.delete('preload')
    webpackConfig.plugins.delete('prefetch')
    webpackConfig.plugins.delete('progress')
    webpackConfig.plugins.delete('friendly-errors')

    webpackConfig.plugin('limit').use(
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
    )
  }
}

module.exports = merge(baseConfig, config)