!function(e){function r(u){if(t[u])return t[u].exports;var i=t[u]={exports:{},id:u,loaded:!1};return e[u].call(i.exports,i,i.exports,r),i.loaded=!0,i.exports}var t={};return r.m=e,r.c=t,r.p="dist/",r(0)}([function(e,r){"use strict";function t(e){return e&&e.__esModule?e:{"default":e}}var u=require("director"),i=require("./components/app"),n=t(i),o=require("./routes"),d=t(o),s=require("regularjs"),a=t(s),l=require("../dist/pure"),c=t(l);require("./site.css"),a["default"].use(c["default"]),window.Pure=c["default"],(new n["default"]).$inject(document.getElementById("app"));var p=(0,u.Router)(d["default"]);p.init()}]);