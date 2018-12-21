const { genRequest, mergeCode } = require('../ultils'),
  { parse } = require("querystring"),
  isNotPitch = loader => loader.path !== __filename,
  getPath = loader => loader.path,
  isCssLoader = loader => /(\/|\\|@)css\-loader/.test(loader.path);
module.exports = code => code;
module.exports.pitch = function(remainRequest) {
  let loaders = this.loaders;
  loaders = loaders.filter(isNotPitch);
  const { type, angular, lang, id, scoped } = parse(this.resourceQuery.slice(1)), rs = [], res = this.resource.split("?")[0];
  if(type === "template"){
    rs.push(`import obj from ${genRequest(["./lib/loaders/template-loader.js","./lib/index.js",res], {
      angular : angular,
      type : type,
      id : id,
      scoped : scoped
    })}`);
    rs.push(`export default obj`);
    return rs.join("\n");
  }
  if(type === "style"){
    let styleIndex = loaders.findIndex(isCssLoader) + 1,
      beforeStyle = loaders.slice(0, styleIndex),
      postStyle = "./lib/loaders/style-loader.js",
      afterStyle = loaders.slice(styleIndex);
    beforeStyle = beforeStyle ? beforeStyle.map(getPath) : [];
    afterStyle = afterStyle ? afterStyle.map(getPath) : [];
    rs.push(`import obj from ${genRequest([...beforeStyle, postStyle, 
      ...afterStyle, res], {
      id : id,
      angular : angular,
      type : type,
      scoped : scoped
    })}`);
    rs.push(`export default obj`);
    return rs.join("\n");
  }
  if(type === "script"){
    rs.push(`import obj from ${genRequest([...loaders.map(getPath),res], {
      angular : angular,
      type : type
    })}`);
    rs.push(`export default obj`);
    return rs.join("\n");
  }
  if(type === "config"){
    rs.push(`import obj from ${genRequest([...loaders.map(getPath),res], {
      angular : angular,
      type : type
    })}`);
    rs.push(`export default obj`);
  }
};