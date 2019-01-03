const { selectBlock } = require('./select.js');
class template{
  constructor(){
    this.templates = {};
  }
  add(name, template){
    this.templates = selectBlock(template, "template");
  }
  get(name){
    return this.templates[name];
  }
  remove(name){
    delete this.templates[name];
  }
}

module.exports = new template