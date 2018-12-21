const { extend } = require("ps-ultility")
const { html2json, json2html } = require("proudsmart-template"),
  select = function(source, type){
    const json = html2json( source ),
      fd = json.children.map( d => {
        let obj = extend({}, d.attributes);
        obj.type = d.nodeName.toLowerCase();
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