const loaderUtils = require('loader-utils'),
  { isArray } = require('ps-ultility'),
  genRequest = function(requests, query, inline){
    const before = inline === false ? [] : ["-"],
      obj2query = obj => {
        const toStr = o => {
          if( o === null ){
            return ""
          }
          if(typeof o === "object"){
            return `=${JSON.stringify(o)}`;
          }
          return `=${o}`;
        },query = [];
        for(let i in obj){
          if(typeof obj[i] !== "undefined") {
            query.push(`${i}${toStr(obj[i])}`);
          }
        }
        return query.length > 0 ? `?${query.join("&")}` : "";
      },
      reqs = `${ before.concat(requests).join("!") }${ obj2query( query )}`,
      result = loaderUtils.stringifyRequest(this, reqs)
    return result;
  },
  mergeCode = function(){
    let rs = [], item, arr = [].slice.call(arguments);
    while( item = arr.shift() ){
      isArray(item)
        ? [].unshift.apply(arr, item)
        : rs.push( item );
    }
    return rs.join("\r\n");
  };
module.exports = {
  genRequest : genRequest,
  mergeCode : mergeCode
}