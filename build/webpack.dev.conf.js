'use strict';

var webpack = require('webpack');
var path = require('path');
var baseConfig = require('./webpack.base.conf');
var merge = require('webpack-merge');
var config = require('../config');
var HOST = process.env.HOST;
var PORT = process.env.PORT;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
var portfinder = require('portfinder');
var packageConfig = require('../package.json');

function createNotifierCallback() {
	var notifier = require('node-notifier');

	return function(severity, errors) {
		if(severity !== 'error') return;

		var error = errors[0];
		var filename = error.file && error.file.split('!').pop();

		notifier.notify({
			title: packageConfig.name,
			messages: severity + ': ' + error.name,
			subtitle: filename || ''
		});
	}
}

var devWebpackConfig = merge(baseConfig, {
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader',
					'sass-loader',
				]
			}
		]
	},
	devtool: config.dev.devtool,
	devServer: {
		clientLogLevel: 'warning',
		historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
		hot: true,
		compress: true,
		contentBase: path.join(__dirname, '../dist'),
		host: HOST || config.dev.host,
		port: PORT || config.dev.port,
		open: config.dev.autoOpenBrowser,
		overlay: config.dev.errorOverlay
			? { warnings: false, errors: true }
			: false,
		publicPath: config.dev.assetsPublicPath,
		proxy: config.dev.proxyTable,
		quiet: true,
		watchOptions: {
			poll: config.dev.poll
		}
	},
	plugins: [
		new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    })
	]
});

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})