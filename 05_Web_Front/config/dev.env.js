'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_HOST: '"http://www.tom.binary-option.prod/webapi/"',
  WS_HOST: '"ws://ws.zoom.binary-option.prod"'
})
