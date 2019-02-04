const { genRequest } = require('../ultils.js'),
  pathLib = require("path"),
  { parse } = require("querystring");
let __filepath = /(.*(?:\\|\/))[^\\\/]+$/.exec(__filename)[1];
module.exports = d => d;
module.exports.pitch = function(remainRequest){
  let query = parse(this.resourceQuery.slice(1)),
    { angular } = query,
    output = [`import obj from ${genRequest.call(this,remainRequest.split("!"))}`];
  if( angular ) {
    return undefined;
  } else {
    output.push(`import angularExplainer from ${genRequest.call(this, [pathLib.resolve(__filepath, '../angular-explainer.js')], null, false)}`);
    output.push(`export default angularExplainer.get(obj.type, obj)`);
    return output.join(";\n");
  }
}