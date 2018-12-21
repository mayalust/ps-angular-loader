const { parse } = require("querystring");
module.exports = function(source){
  let query = parse(this.resourceQuery.slice(1)),
    _blank = "[\\n\\s]*",
    chars = "[^{}]+",
    unblankChar = "[^{}\\s\\n]",
    regex = `(${_blank})(${chars}${unblankChar})${_blank}({${chars}};?)`,
    id = query.id,
    scoped = query.scoped === "true",
    attr = `data-a-${id}`,
    result = scoped
      ? source.replace(new RegExp(regex, "g"), `$2[${attr}]$3`)
      : source;
  return result;
}
