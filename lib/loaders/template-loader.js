const { parse } = require("querystring");
const { } = require("ps-ultility");
const { html2json, json2html } = require("proudsmart-template");
const { get } = require("../template.js");
module.exports = function(source) {
  let query = parse(this.resourceQuery),
    { id, scoped } = query,
    result = replaceAllReturn(
      scoped === "true"
      ? compileTemplate(
         applyTemplate(source)
        )
      : source );
  function findChild(node, condition){
    let queue = [{parent : null, data : node}], item;
    while(item = queue.shift()){
      let dt = item.data, parent = item.parent;
      if( condition(dt) ){ return dt; }
      dt.childNodes ? [].push.apply(queue, item.childNodes.map( d => {
        return {
          parent : item,
          data : d
        }
      })) : null;
    }
  }
  function applyTemplate(source){
    let json = html2json(source), queue = [{parent : null, data : json}], item, temp;
    while(item = queue.shift()){
      let dt = item.data, parent = item.parent;
      temp = get( dt.nodeName.toUpperCase() );
      if( typeof temp !== "undefined") {
        let slot = findChild(temp, n => n.nodeName.toUpperCase() === "SLOT" ),
          inx = parent.childNodes.findIndex( d => d === item),
          inx1 = parent.children.findIndex( d => d === item);
        slot.childNodes = item.childNodes;
        slot.children = item.children;
        parent.childNodes.splice(inx, 1, temp);
        parent.children.splice(inx1, 1, temp);
        queue.push({
          parent : parent,
          data : temp
        })
      }
      dt.childNodes ? [].push.apply(queue, item.childNodes.map( d => {
        return {
          parent : item,
          data : d
        }
      })) : null;
    }
    return json2html(json);
  }
  function compileTemplate(source){
    let json = html2json(source), queue = [{parent : null, data : json}], item, temp;
    while(item = queue.shift()){
      let dt = item.data;
      dt.attributes = dt.attributes || {};
      dt.attributes[`data-a-${id}`] = null;
      dt.childNodes ? [].push.apply(queue, item.childNodes.map( d => {
        return {
          parent : item,
          data : d
        }
      })) : null;
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
      var inx = regex.findIndex( d => new RegExp(`^${d}$`).test(str));
      return `\\${dics[inx]}`;
    });
  }
  return `module.exports = { scoped : ${scoped}, id : "${id}", template : "${ result }" };`;
}