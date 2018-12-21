const MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  webpack = require("webpack"),
  pathLib = require("path"),
  { explainers } = require("./lib/angular-explainer.js"),
  { angularLoaderPlugin } = require("./lib/index"),
  webpackConfig = {
    entry : {
      app : pathLib.resolve(__dirname, "./main.js")
    },
    mode : "development",
    devtool : "#source-map",
    output : {
      path : pathLib.resolve(__dirname, "./build"),
      filename : "[name].js"
    },
    module : {
      rules : [{
        test : /\.js$/,
        use:{
          loader:'babel-loader'
        },
        exclude:/node_modules/
      },{
        test : /\.angular/,
        use : [{
          loader : pathLib.resolve(__dirname, "./lib/index.js")
        }]
      },{
        test : /\.css$/,
        use : [{
          loader : MiniCssExtractPlugin.loader
        },"css-loader"]
      },{
        test : /\.less$/,
        use : [{
          loader : MiniCssExtractPlugin.loader
        },"css-loader","less-loader"]
      }]
    },
    plugins : [new angularLoaderPlugin(), new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })]
  },
  compiler = webpack(webpackConfig, (err, state) => {
    if(err === null){
      if(state.hasErrors()){
        console.error("code Error");
      } else {
        console.log("success");
      }
    } else {
      console.error(err.message);
    }
  });