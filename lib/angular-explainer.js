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
};
const newExplainer = new explainer(),
  invokeQueue = {},
  removespace = str => {
    let match = /^\s*([^\s].*[^\s])\s*$/.exec(str);
    return match ? match[1] : str;
  },
  toArray = str => {
    return typeof str === "string"
      ? str.split(",").map(removespace) : [];
  };
function each(arr,callback){
  if(arr){
    for(var i = 0; i < arr.length; i++){
      callback( arr[i], i, arr);
    }
  };
}
function hasRegistered( service, name ){
  return ( invokeQueue[service] || [] ).some( n => {
    return name == n;
  })
}
function camelhill( str ){
  let rs = "",
    arr = [].slice.call(str),
    char;
  while( char = arr.shift()){
    if( char === "-"){
      char = arr.shift();
      char = typeof char === "undefined" ? "" : char.toUpperCase();
    }
    rs += char;
  }
  return rs;
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
    let name = camelhill(name);
    if( hasRegistered("controller", name)){
      invokeQueue["controller"] = invokeQueue["controller"] || [];
      invokeQueue["controller"].push( name );
      typeof angularModule.controller === "function"
        ? angularModule.controller( name , args)
        : angularModule.register( name, args);
      return {
        type : "router",
        router : `/${name}${params || ""}`,
        ctrlname : name,
        template : template.template
      };
    } else {
      console.error(`controller, named ${name} is already exist, so will not be registered`)
    }
  }
});
newExplainer.add("service", module => {
  let { script, config, name } = module,
    { injector, type } = config,
    params = [...toArray(injector),script];
  return angularModule => {
    let name = camelhill(name);
    if( hasRegistered(type || "factory", name)){
      invokeQueue[type || "factory"] = invokeQueue[type || "factory"] || [];
      invokeQueue[type || "factory"].push( name );
      angularModule[type || "factory"](name, params);
    } else {
      console.error(`${type || "factory"}, named ${name} is already exist, so will not be registered`)
    }
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
            arr.forEach( d => { elem[0].removeAttribute(d); });
            obj.before && obj.before.call( this, scope, elem, attr );
          },
          post : obj.link
        }
      }
      return obj;
    },
    params = [...toArray(injector),fn];
  return angularModule => {
    let name = camelhill(name);
    if( hasRegistered( "directive", name)){
      invokeQueue["directive"] = invokeQueue["directive"] || [];
      invokeQueue["directive"].push( name );
      typeof angularModule.directive === "function"
        ? angularModule.directive(name, params)
        : angularModule.register(name, params);
    } else {
      console.error(`directive, named ${name} is already exist, so will not be registered`)
    }
  }
});
module.exports = newExplainer;