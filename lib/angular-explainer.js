class explainer {
  constructor(){}
  add(name, handler){
    this.handlers = this.handlers || {};
    this.handlers[name] = handler;
  }
  get(name, data) {
    return typeof this.handlers === "object"
    && typeof this.handlers[name] === "function"
    && this.handlers[name](data);
  }
  each(callback){
    for(var i in this.handlers){
      typeof callback === "function" && callback(this.handlers[i], i);
    }
  }
  keys(){
    let keys = []
    this.each( ( elem, key ) => {
      keys.push(key)
    })
    return keys;
  }
}
const newExplainer = new explainer(),
  removespace = str => {
    let match = /^\s*([^\s].*[^\s])\s*$/.exec(str);
    return match ? match[1] : str;
  },
  toArray = str => {
    return str.split(",").map(removespace)
  };
newExplainer.add("controller", module => {
  let { template, script, config, name } = module,
   { router, params, injector } = config,
    args = [...toArray(injector),script];
  return angularModule => {
    angularModule.controller(name, args);
    return {
      type : "router",
      router : `/${name}${params || ""}`,
      ctrlname : name,
      template : template.template
    };
  }
});
newExplainer.add("service", module => {
  let { script, config, name } = module,
    { injector, type } = config,
    params = [...toArray(injector),script];
  return angularModule => {
    angularModule[type || "factory"](name, params);
  }
});
newExplainer.add("directive", module => {
  let { script, config, template, name } = module,
    { injector } = config,
    fn = function(){
      let args = [].slice.apply(arguments),
        obj = script.apply(this, args);
      obj.template = template || obj.template;
      obj.restrict = obj.restrict || "E";
      obj.replace = typeof obj.replace == "undefined" ? true : obj.replace;
      return obj;
    },
    params = [...toArray(injector),fn];
  return angularModule => {
    angularModule.directive(name, params)
  }
});
module.exports = newExplainer;