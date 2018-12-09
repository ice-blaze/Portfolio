const path = require("path");

module.exports = {
	entry: {
		bundle: "./imports.js",
	},
	output: {
		filename: "[name].js",
		path: path.join(__dirname, "public"),
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					{loader: "style-loader"},
					{loader: "css-loader"},
					{loader: "sass-loader"},
				],
			},
		],
	},
};

