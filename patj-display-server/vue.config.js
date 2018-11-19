// vue.config.js

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://control-server:3030',
        changeOrigin: true
      }
    }
  }
}
