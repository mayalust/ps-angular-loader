const { parse } = require('querystring'),
  { random } = require('ps-ultility'),
  { each } = require('ps-ultility'),
  { genRequest } = require('./ultils.js'),
  { select, selectBlock } = require('./select.js'),
  loaderUtils = require('loader-utils'),
  getExt = path => {
    let match = /\.(\w+)$/.exec(path);
    return match ? match[1] : null;
  };
module.exports = function(source){
  let output, _id = random(12), styleBlock, scoped, angularType = getExt(this.resource);
  const resourceQuery = this.resourceQuery.slice(1) || {},
    { id, type, lang } = parse(resourceQuery),
    camelHill = str => {
      return str.replace(/-\w/g, s => {
        s = s.substring(1);
        return s.toUpperCase();
      });
    },
    getName = path => {
      let match = /(?:\/|\\)?([\w-()\[\]%$@_]+)\.\w+$/.exec(path);
      return match ? camelHill(match[1]) : null
    },
    getLang = d => {
      const Dics =  {
        "script" : "js",
        "style" : "css"
      }
      return Dics[d] ? Dics[d] : d;
    },
    getRequest = d => {
      const { type, lang } = d;
      return genRequest.call(this, this.resource, {
        angular : angularType,
        id : _id,
        type : type,
        lang : lang || getLang( type ),
        scoped : scoped
      }, false)
    },
    selectData = select(source);
  if(type) {
    let blockInfo = selectBlock(source, type)
    return type !== "config" ? blockInfo.innerHTML : `export default ${JSON.stringify(blockInfo.attributes)}`;
  } else {
    styleBlock = selectData.find( d => d.type == "style");
    scoped = styleBlock ? typeof styleBlock.scoped !== "undefined" : false;
    output = selectData.map( d => `import ${ d.type } from ${ getRequest(d) }`);
    output.push(`let path = "${this.resource}", type = "${angularType}", name = "${getName(this.resource)}"`);
    output.push(`export default { script : script, template : template, style : style, path : path, type : type, config : config, name : name }`);
    return output.join(";\n");
  }
};
module.exports.angularLoaderPlugin = require("./plugin");
module.exports.explainers = require("./angular-explainer.js");