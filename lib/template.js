class template{
  constructor(){
    this.templates = {};
  }
  add(name, template){
    this.templates = template;
  }
  get(name){
    return this.templates[name];
  }
  remove(name){
    delete this.templates[name];
  }
}

module.exports = new template