import { renderAll } from "-!./lib/files-extractor.js!./lib/angular-loader.js";
let module = angular.module("app", ['ngRoute']);
renderAll(module);
window.angular.bootstrap(document.body, [module.name]);