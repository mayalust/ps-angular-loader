const { extend } = require("ps-ultility")
const { html2json, json2html } = require("proudsmart-template"),
  select = function(source){
    const json = html2json( source ),
      fd = json.children.map( d => {
        let obj = extend({}, d.attributes),
          type = d.nodeName.toLowerCase();
        type === "style" ? obj.lang = obj.type : null;
        obj.type = type;
        return obj;
      });
    return fd;
  },
  selectBlock = function(source, type){
    const json = html2json( source ),
      fd = json.children.find( d => {
        return d.nodeName === type.toUpperCase();
      });
    return fd;
  };
module.exports = { select, selectBlock };