module.exports = function(source){
  let request = ["./lib/pitch.js","./test.controller"].join("!");
  return `export * from "${ request }"`;
}
module.exports.angularLoaderPlugin = require("./plugin");