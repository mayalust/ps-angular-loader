const { genRequest, mergeCode } = require('./ultils');
module.exports = d => d;
module.exports.pitch = function(remainRequest){
  let dispatcher = "./loaders/angular-dispatcher.js",
    dispatcherRequest = reqest => {
      let rs = genRequest([dispatcher].concat([reqest]), null, false);
      return rs;
    },
    callback = this.async(),
    output = [`import { render } from "-!${remainRequest}"`];
  output.push(`let handlers = []`);
  output.push(`handlers.push(require(${genRequest( ["../test-ctrl.controller"], null, false )}).default)`);
  setTimeout(function(){
    output.push(`let renderAll = render(handlers)`);
    output.push(`export { renderAll }`);
    callback(null, output.join(";\n"));
  }, 1000);
}