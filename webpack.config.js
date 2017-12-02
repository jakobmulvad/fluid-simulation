const webpack = require('webpack')

module.exports = {
	context: __dirname,
	entry: './src/index.ts',
	output: {
		filename: 'bundle.js',
		path: __dirname + '/static',
	},
	module: {
		rules: [{
			test: /\.ts$/,
			exclude: /node_modules/,
			loader: 'ts-loader'
		}]
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	//plugins: [new webpack.optimize.UglifyJsPlugin()],
}