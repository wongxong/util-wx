'use strict';

var path = require('path');

module.exports = {
	dev: {
		assetsSubDirectory: '',
		assetsPublicPath: '/',
		// 配置代理
		// proxyTable: {},
		
		host: '127.0.0.1',
		port: 9000,
		autoOpenBrowser: false,
		errorOverlay: true,
		notifyOnErrors: true,
		poll: false,
		devtool: 'cheap-module-eval-source-map',
		cacheBusting: true,
		cssSourceMap: true
	},
	build: {
		assetsRoot: path.resolve(__dirname, '../dist'),
		assetsSubDirectory: '',
		assetsPublicPath: '/',
		productionSourceMap: true,
		devtool: '#source-map',
		productionGzip: false,
		productionGzipExtensions: ['js', 'css'],
		bundleAnalyzerReport: process.env.npm_config_report
	}
};