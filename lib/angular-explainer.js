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
  return function( angularModule ){
    return angularModule._invokeQueue.some( item => {
      return item[1] === service
        && item[2][0] === name
    })
  }
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
    let _name = camelhill(name);
    if( !hasRegistered("controller", _name)(angularModule)){
      typeof angularModule.controller === "function"
        ? angularModule.controller( _name , args)
        : angularModule.register( _name, args);
      return {
        type : "router",
        router : `/${name}${params || ""}`,
        ctrlname : _name,
        template : template.template
      };
    } else {
      return {
        template : template.template
      }
      console.warn(`controller, named ${_name} is already exist, so will not be registered`)
    }
  }
});
newExplainer.add("service", module => {
  let { script, config, name } = module,
    { injector, type } = config,
    params = [...toArray(injector),script];
  return angularModule => {
    let _name = camelhill(name);
    if( !hasRegistered(type || "factory", _name)(angularModule)){
      angularModule[type || "factory"](_name, params);
    } else {
      console.warn(`${type || "factory"}, named ${_name} is already exist, so will not be registered`)
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
    let _name = camelhill(name);
    if( !hasRegistered( "directive", _name)(angularModule)){
      typeof angularModule.directive === "function"
        ? angularModule.directive(_name, params)
        : angularModule.register(_name, params);
    } else {
      console.warn(`directive, named ${_name} is already exist, so will not be registered`)
    }
  }
});
module.exports = newExplainer;