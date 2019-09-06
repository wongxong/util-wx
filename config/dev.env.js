'use strict';

var merge = require('webpack-merge');
var ProdEnv = require('./prod.env');

module.exports = merge(ProdEnv, {
	NODE_ENV: '"development"'
});