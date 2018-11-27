module.exports = code => code;
module.exports.pitch = remainRequest => {
  console.log(remainRequest);
  let code = `export * from "!./lib/index.js!./test.controller"`
  return code;
}