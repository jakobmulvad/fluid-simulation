const path = require('path')
const webpack = require('webpack')

module.exports = {
	context: __dirname,
	entry: './src/index.ts',
	output: {
		filename: 'bundle.js',
		path: __dirname + '/static',
	},
	module: {
		rules: [
		{
			test: /\.rs$/,
			exclude: /node_modules/,
			use: [
				{ loader: 'rust-wasm-loader', options: { path: './' } },
			]
		},
		{
			test: /\.ts(x?)$/,
			exclude: /node_modules/,
			use: [
				{ loader: 'ts-loader' },
			]
		}],
	},
	resolve: {
		extensions: ['.ts', '.js', '.rs'],
	},
	externals: {
		'fs': true,
		'path': true,
	},
	//plugins: [new webpack.optimize.UglifyJsPlugin()],
}