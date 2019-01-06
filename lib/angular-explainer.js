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
    return typeof str === "object"
      ? str.split(",").map(removespace) : [];
  };
function each(arr,callback){
  if(arr){
    for(var i = 0; i < arr.length; i++){
      callback( arr[i], i, arr);
    }
  };
}
function map(arr,callback){
  let rs = [];
  if(arr){
    for(var i = 0; i < arr.length; i++){
      rs.push(callback( arr[i], i, arr));
    }
  };
  return rs;
}
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
      obj.template = ( template ? template.template : null ) || obj.template;
      obj.restrict = obj.restrict || "E";
      obj.replace = typeof obj.replace == "undefined" ? true : obj.replace;
      obj.compile = function(elem, attr){
        return {
          pre : function(scope, elem, attr){
            /** remove the rest data-a-id before use **/
            let arr = map(elem[0].attributes, attr => attr.name)
              .filter( d => /data-a-[\w\d]+/.test(d));
            arr.shift();
            arr.forEach( d => { elem[0].removeAttribute(d); })
          },
          post : obj.link
        }
      }
      return obj;
    },
    params = [...toArray(injector),fn];
  return angularModule => {
    angularModule.directive(name, params)
  }
});
module.exports = newExplainer;