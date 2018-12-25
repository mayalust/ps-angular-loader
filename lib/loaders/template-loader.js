const { parse } = require("querystring");
const { html2json, json2html } = require("proudsmart-template");
const { get } = require("../template.js");
module.exports = function(source) {
  let query = parse(this.resourceQuery),
    { id, scoped } = query,
    result = replaceAllReturn(
      scoped === "true"
      ? compileTemplate(source)
      : source );
  function compileTemplate(source){
    let json = html2json(source), queue = [json], item;
    while(item = queue.shift()){
      item.attributes = item.attributes || {};
      item.attributes[`data-a-${id}`] = null;
      item.childNodes ? [].push.apply(queue, item.childNodes) : null;
    }
    return json2html(json);
  }
  function replaceAllReturn(str){
    const dics = "nrtf\"\'";
    let regex = [];
    for(let i = 0; i < dics.length; i++){
      regex.push("\\" + dics.charAt(i));
    }
    return str.replace(new RegExp(`((?:${regex.join(")|(?:")}))`, 'g'), str => {
      console.log(str);
      var inx = regex.findIndex( d => new RegExp(`^${d}$`).test(str));
      return `\\${dics[inx]}`;
    });
  }
  return `module.exports = { scoped : ${scoped}, id : "${id}", template : "${ result }" };`;
}