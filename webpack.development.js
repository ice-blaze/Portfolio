const path = require("path");

module.exports = {
	entry: {
		"bundle-scss": "./imports-scss.js",
		"bundle-js": "./imports-js.js",
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

