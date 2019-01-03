const { parse } = require("querystring");
const { } = require("ps-ultility");
const { html2json, json2html } = require("proudsmart-template");
const template = require("../template.js");
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
      if( condition(dt) ){ return item; }
      dt.childNodes ? [].push.apply(queue, dt.childNodes.map( d => {
        return {
          parent : dt,
          data : d
        }
      })) : null;
    }
  }
  function applyTemplate(source){
    let json = html2json(source), queue = [{parent : null, data : json}], item, temp;
    while(item = queue.shift()){
      let dt = item.data, parent = item.parent;
      temp = template.get( dt.nodeName.toUpperCase() );
      if( typeof temp !== "undefined") {
        let slot = findChild(temp, n => n.nodeName.toUpperCase() === "SLOT" ),
          inx = parent.childNodes.findIndex( d => d === dt),
          inx1 = parent.children.findIndex( d => d === dt);
        if( typeof slot !== "undefined" ) {
          let slopParent = slot.parent,
            slotItem = slot.data,
            slotInx = slopParent.childNodes.findIndex( d => d === slotItem),
            slotInx1 = slopParent.children.findIndex( d => d === slotItem);
          [].splice.apply(slopParent.childNodes, [slotInx, 1, ...dt.childNodes]);
          [].splice.apply(slopParent.children, [slotInx1, 1, ...dt.children]);
        }
        [].splice.apply(parent.childNodes, [inx, 1, ...temp.childNodes]);
        [].splice.apply(parent.children, [inx, 1, ...temp.children]);
        [].push.apply(queue, temp.childNodes.map( d => {
          return {
            parent : dt,
            data : d
          }
        }))
      }
      dt.childNodes ? [].push.apply(queue, dt.childNodes.map( d => {
        return {
          parent : dt,
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
      dt.childNodes ? [].push.apply(queue, dt.childNodes.map( d => {
        return {
          parent : dt,
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