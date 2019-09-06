'use strict';

var path = require('path');
var config = require('../config');

function resolve(dir) {
	return path.join(__dirname, '..', dir);
}

function assetsPath(_path) {
	var assetsSubDirectory = process.env.NODE_ENV === 'production'
		? config.build.assetsSubDirectory
		: config.dev.assetsSubDirectory;

	return path.posix.join(assetsSubDirectory, _path);
}

module.exports = {
	context: path.resolve(__dirname, '../'),
	entry: {
		index: './src/index.js'
	},
	output: {
		filename: 'js/[name].js',
		path: config.build.assetsRoot,
		publicPath: process.env.NODE_ENV === 'production'
			? config.build.assetsPublicPath
			: config.dev.assetsPublicPath
	},
	resolve: {
		extensions: ['.js', '.json', '.css', '.scss'],
		alias: {
			'src': resolve('src'),
			'components': resolve('src/components'),
			'common': resolve('src/common'),
			'utils': resolve('src/utils')
		}
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')],
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.(png|gif|jpg|jpeg|svg)$/i,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						name: assetsPath('images/[name].[hash:7].[ext]')
					}
				}
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						name: assetsPath('fonts/[name].[hash:7].[ext]')
					}
				}
			},
			{
				test: /\.(map3|mp4|webm|ogg|wav|flac|aac)$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						name: assetsPath('medias/[name].[hash:7].[ext]')
					}
				}
			}
		]
	}
};