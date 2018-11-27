const webpack = require("webpack"),
  pathLib = require("path"),
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
        test : /\.controller$/,
        use : [{
          loader : pathLib.resolve(__dirname, "./lib/index.js"),
          options : {
            type : "controller"
          }
        }]
      }]
    },
    plugins : [new angularLoaderPlugin()],
    resolve: {
      alias: {
        'vue': 'vue/dist/vue.js'
      }
    }
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