const RuleSet = require("webpack/lib/RuleSet"),
  { extend } = require("ps-ultility"),
  pathLib = require("path"),
  NS = "angular-loader",
  id = "ps-angular-loader",
  qs = require("querystring");
class angularLoaderPlugin{
  apply(compiler){
    compiler.hooks.beforeRun.tap(id, compilation => {
      let rawRules = compiler.options.module.rules,
        angularDics = ["controller", "service", "directive", "filter"],
        pitch, cloneRules,
        fakeAngular = "fake.angular",
        { rules } = new RuleSet(rawRules),
        angularLoader = rules.find(createMatch(fakeAngular));
      compiler.hooks.compilation.tap(id, compilation => {
        compilation.hooks.normalModuleLoader.tap(id, loaderContext => {
          loaderContext[NS] = true
        })
      })
      function remapAngularLoader(angularloader){
        let { resource } = angularloader;
        angularloader.resource = res => {
          return resource(res) || new RegExp(`(\\.${angularDics.join(")|(\\.")})^`).test(res);
        }
        angularloader.use.unshift({
          loader : pathLib.resolve(__dirname, "./loaders/angular-dispatcher.js")
        });
        return angularloader;
      };
      function createMatch(str, bool){
        return function(rule, i){
          console.log(typeof rule.resource);
          return bool === false
            ? !rule.resource(str)
            : rule.resource(str);
        }
      };
      function cloneRulesFn(rule){
        let { resource, resourceQuery } = rule, currentResource,
         ruleClone = extend({}, rule);
        extend( ruleClone , {
          resource : {
            test : resource => {
              currentResource = resource
              return true;
            }
          },
          resourceQuery : query => {
            let que = qs.parse(query.slice(1)),
              { lang, angular } = que;
            if(angular == null) {
              return false;
            }
            if( lang == null ){
              return false;
            }
            if( typeof resource == "function" && !resource(`${ currentResource }.${ lang }`)){
              return false;
            }
            if( typeof resourceQuery == "function" && !resourceQuery(query) ){
              return false;
            }
            return true;
          }
        });
        return ruleClone;
      };
      pitch = {
        resource : {
          test : resource => {
            return true;
          }
        },
        resourceQuery : query => {
          let que = qs.parse(query.slice(1));
          return que.angular != null;
        },
        use : [`./lib/loaders/pitch.js`]
      };
      remapAngularLoader(angularLoader);
      cloneRules = rules
        .filter(createMatch(fakeAngular, false))
        .map(cloneRulesFn)
      compiler.options.module.rules = [
        pitch,
        ...cloneRules,
        ...rules
      ];
      console.log(compiler.options.module.rules);
    })
  }
}
module.exports = angularLoaderPlugin;