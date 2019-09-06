'use strict';

var webpack = require('webpack');
var path = require('path');
var baseConfig = require('./webpack.base.conf');
var merge = require('webpack-merge');
var config = require('../config');
var HOST = process.env.HOST;
var PORT = process.env.PORT;
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var {CleanWebpackPlugin} = require('clean-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var ProdEnv = require('../config/prod.env');


function assetsPath(_path) {
	var assetsSubDirectory = process.env.NODE_ENV === 'production'
		? config.build.assetsSubDirectory
		: config.dev.assetsSubDirectory;

	return path.posix.join(assetsSubDirectory, _path);
}

module.exports = merge(baseConfig, {
	mode: 'production',
	devtool: false,
	devtool: config.build.productionSourceMap ? config.build.devtool : false,
	entry: './src/output.js',
	output: {
    path: config.build.assetsRoot,
    // filename: assetsPath('[name].[chunkhash].js'),
		// chunkFilename: assetsPath('[id].[chunkhash].js'),
		filename: 'wx-util.min.js',
		library: 'wx',
		libraryExport: "default",
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		rules: [
			{
				test: /\.scss/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
					'sass-loader'
				]
			}
		]
	},
	optimization: {
		splitChunks: {
      chunks: 'all'
    },
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: true
			}),
			new OptimizeCssAssetsPlugin({})
		]
	},
	plugins: [
		new webpack.DefinePlugin({
      'process.env': ProdEnv
    }),
		new CleanWebpackPlugin(),
		// new HtmlWebpackPlugin({
		// 	title: 'wx-datepicker',
		// 	minify: true,
		// 	hash: true
		// }),
		new webpack.HashedModuleIdsPlugin(),
		new MiniCssExtractPlugin({
			// filename: assetsPath('[name].css')
			filename: 'wx-util.min.css'
		})
	]
});