(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.appjsangular||(g.appjsangular={})).js=f()}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){(function(ng_app){ng_app.controller("ViewCtrl",["$scope","State",function($scope,State){var self=this;self.state=State.state;self.substates=State.substates;$scope.$on("onstatechange",function(){self.state=State.state});$scope.$on("onsubstatechange",function(){self.substates=State.substates})}]);ng_app.controller("LoadingCtrl",["$scope","State",function($scope,State){var self=this;self.state=State.state;self.substates=State.substates;$scope.$on("onstatechange",function(){self.state=State.state});$scope.$on("onsubstatechange",function(){self.substates=State.substates})}]);ng_app.controller("TitleCtrl",["$scope","State",function($scope,State){var self=this;self.state=State.state;self.substates=State.substates;$scope.$on("onstatechange",function(){self.state=State.state})}]);ng_app.controller("SearchbarCtrl",["$scope","State","Keyboard","Search","Navigate","$location",function($scope,State,Keyboard,Search,Navigate,$location){var self=this;self.query="";self.state=State.state;self.substates=State.substates;self.sources={deviantart:true,e926:true,imgur:true};$scope.$on("onstatechange",function(){self.state=State.state});$scope.$on("onsubstatechange",function(){self.substates=State.substates});$(document).ready(function(){var query=$location.search();if(query.q){Search.resetSources(self.sources);State.changeSubstate("LOAD",true);Search.get(query.q,query.page||undefined,query.limit||undefined)}});$scope.$on("onkeyup",function(){ng_app.searchbar_search.focus();Search.query=self.query;if(!State.substates["SEARCH"]){$scope.$apply();State.changeSubstate("SEARCH",true);ng_app.searchbar_search.focus()}});$scope.$on("onkeybackspace",function(){if(self.query==="")State.changeSubstates("SEARCH",false);Search.query=self.query;$scope.$apply()});$scope.$on("onkeyenter",function(){if(State.substates["SEARCH"]&&State.state!=="LOAD"){State.changeSubstate("LOAD",true);$location.search("q",self.query);Navigate.initialize();Search.clearResponse();Search.resetSources(self.sources);Search.get(self.query)}});$scope.$on("onkeyesc",function(){if(State.substates["SEARCH"]){Search.clear();self.query="";State.changeSubstate("SEARCH",false)}});$scope.$on("onsearchreturned",function(){if(Search.response[Search.response.length-1].data.length===0){self.query="No search results..."}else{State.changeSubstate("SEARCH",false);$location.search("page",Navigate.current_page);self.query=""}})}]);ng_app.controller("ListingCtrl",["$scope","State","Search","Navigate",function($scope,State,Search,Navigate){var self=this;self.listing=[];self.index=0;self.state=State.state;self.substates=State.substates;self.last_page=false;self.scrollbar={onScroll:function(y,x){}};$scope.$on("onstatechange",function(){self.state=State.state});$scope.$on("onsubstatechange",function(){self.substates=State.substates});$scope.$on("onkeyesc",function(){if(State.substates["LIST"]&&State.substates["FULL"]){State.changeSubstate("LIST",false)}});$scope.$on("onnavigate",function(){self.current=Navigate.index;if(State.substates["FULL"]){State.changeSubstate("LIST",false)}});$scope.$on("onnavigatepage",function(){if(State.state!=="LOAD"){self.can_page=false;State.changeSubstate("LOAD",true);Search.get(Search.last_query,Navigate.current_page,Navigate.limit)}});$scope.$on("onnavigatepop",function(){Navigate.to(0);Navigate.first_page=true;State.changeState("ACTIVE");State.changeSubstate("LIST",true)});$scope.$on("onsearchreturned",function(){State.changeSubstate("LOAD",false);Search.clear();if(Search.response[Search.response.length-1].data.length===0){Search.clearResponse();console.log("End of results");Navigate.last_page=true;self.last_page=true}else{State.changeSubstate("SEARCH",false);Navigate.can_page=true;self.can_page=true;self.last_page=false;Navigate.append(Search.response[0]);Search.clearResponse();self.listing=Navigate.getDisplay(Navigate.listing_buffer)}})}]);ng_app.controller("OverlayCtrl",["$scope","State","Navigate",function($scope,State,Navigate){var self=this;self.state=State.state;self.substates=State.substates;$scope.$on("onstatechange",function(){self.state=State.state});$scope.$on("onsubstatechange",function(){self.substates=State.substates});$scope.$on("onsearchreturned",function(){State.changeSubstate("OVERLAY",true)})}]);ng_app.controller("InfoCtrl",["$scope","Navigate",function($scope,Navigate){var self=this;self.current={};self.date=0;$scope.$on("onnavigate",function(){self.current=Navigate.findByIndex(Navigate.index);if(self.current){var date=new Date(self.current.date*1e3);self.date=date.toDateString();$scope.$apply()}})}]);ng_app.controller("ImageCtrl",["$scope","State","Navigate","Keyboard",function($scope,State,Navigate,Keyboard){var self=this;self.current={};self.state=State.state;self.substates=State.substates;self.scrollbar={onScroll:function(y,x){}};$scope.$on("onstatechange",function(){self.state=State.state});$scope.$on("onsubstatechange",function(){self.substates=State.substates});$scope.$on("onkeyarrow",function(){switch(Keyboard.ord){case"LEFT":Navigate.prev();break;case"RIGHT":Navigate.next();break}});$scope.$on("onnavigate",function(){ng_app.image_front.attr("src","");ng_app.image_back.css("background-image","url('')");self.current=Navigate.findByIndex(Navigate.index);if(self.current){var image=self.current.preview||self.current.content||self.current.thumbs;if(self.current.zoom){image=self.current.content;ng_app.image_front.attr("src",image)}else{ng_app.image_front.attr("src",image);ng_app.image_back.css("background-image","url('"+image+"')")}}else{console.log("Could not find image",Navigate.index)}})}])})(ng_hound)},{}],2:[function(require,module,exports){(function(ng_app){ng_app.directive("href",function(Keyboard,Search){return{compile:function(element){element.attr("target","_blank")}}});ng_app.directive("search",["State",function(State){return{restrict:"A",link:function(scope,element,attrs){element.bind("click",function(ev){if(ev.target!==this){return}else{State.changeSubstate("SEARCH",false)}})}}}]);ng_app.directive("onkey",function(Keyboard,Search){return{link:function(scope,element,attrs){element.bind("keyup",function(ev){var key=ev.which||ev.keyCode;if(key===27||key===13||key>=37&&key<=40)Keyboard.getKey(key)});element.bind("keypress",function(ev){var key=ev.which||ev.keyCode;if(key===32||key>=48&&key<=122)Keyboard.getKey(key)})}}});ng_app.directive("tile",["State","Navigate",function(State,Navigate){return{restrict:"A",link:function(scope,element,attrs){element.bind("click",function(){Navigate.to(attrs.index)})}}}]);ng_app.directive("navclick",["State","Search","Navigate",function(State,Search,Navigate){return{restrict:"A",link:function(scope,element,attrs){var func=null;switch(attrs.navclick){case"overlay":func=function(){State.toggleSubstate("OVERLAY")};break;case"search":func=function(){State.changeSubstate("LOAD",true);Search.get()};break;case"search_overlay":func=function(){State.toggleSubstate("SEARCH")};break;case"about":func=function(){ng_app.modal_about.modal({keyboard:true})};break;case"list":func=function(){State.toggleSubstate("LIST")};break;case"full":func=function(){State.toggleSubstate("FULL");if(State.substates["LIST"])State.changeSubstate("LIST",false)};break;case"next":func=function(){Navigate.next()};break;case"prev":func=function(){Navigate.prev()};break;case"page_next":func=function(){Navigate.nextPage()};break;case"page_prev":func=function(){Navigate.prevPage()};break;case"info":func=function(){ng_app.modal_info.modal({keyboard:true})};break;default:func=function(){};break}element.bind("click",func)}}}])})(ng_hound)},{}],3:[function(require,module,exports){(function(ng_app,viewport){ng_app.service("State",["$rootScope",function($rootScope){var self=this;self.state="DEFAULT";self.substates={FULL:false,SEARCH:false,LIST:false,LOAD:false,OVERLAY:false};self.changeState=function(state){switch(state){case"DEFAULT":case"ACTIVE":self.state=state;$rootScope.$broadcast("onstatechange");break}};self.changeSubstate=function(substate,value){switch(substate){case"FULL":case"SEARCH":case"LOAD":case"OVERLAY":case"LIST":self.substates[substate]=!!value;$rootScope.$apply();$rootScope.$broadcast("onsubstatechange");break}};self.toggleSubstate=function(substate){switch(substate){case"FULL":case"SEARCH":case"LOAD":case"OVERLAY":case"LIST":self.substates[substate]=!self.substates[substate];$rootScope.$apply();$rootScope.$broadcast("onsubstatechange");break}};self.view_state="";self.view_last_state="";self.viewport=viewport;self.view_interval=200;self.view_can_change=true;$(document).ready(function(){self.view_state=viewport.current();self.view_last_state=self.view_state;$rootScope.$broadcast("onviewportchange");if(self.view_state==="xs"){self.changeSubstate("FULL",true)}if(self.view_state==="sm"||self.view_state==="md"||self.view_state==="lg"){self.changeSubstate("FULL",false)}$(window).resize(function(){if(self.view_can_change){self.view_can_change=false;self.view_state=viewport.current();if(self.view_state!==self.view_last_state){self.view_last_state=self.view_state;if(self.view_state==="xs"){self.changeSubstate("FULL",true)}if(self.view_state==="sm"||self.view_state==="md"||self.view_state==="lg"){self.changeSubstate("FULL",false)}}setTimeout(function(){self.view_can_change=true},self.view_interval)}})})}]);ng_app.service("Keyboard",["$rootScope",function($rootScope){var self=this;self.key="";self.ord=null;self.getKey=function(key_code){self.key=key_code;if(key_code===32||key_code>=48&&key_code<=122){self.ord=String.fromCharCode(key_code)}else if(key_code===37){self.ord="LEFT"}else if(key_code===38){self.ord="UP"}else if(key_code===39){self.ord="RIGHT"}else if(key_code===40){self.ord="DOWN"}else if(key_code===13){self.ord="ENTER"}else if(key_code===27){self.ord="ESCAPE"}else{self.ord=null}self.broadcast()};self.broadcast=function(){switch(self.ord){case"LEFT":case"UP":case"RIGHT":case"DOWN":$rootScope.$broadcast("onkeyarrow");break;case"ESCAPE":$rootScope.$broadcast("onkeyesc");break;case"ENTER":$rootScope.$broadcast("onkeyenter");break;case"BACKSPACE":$rootScope.$broadcast("onkeybackspace");break;case null:break;default:$rootScope.$broadcast("onkeyup");break}}}]);ng_app.service("Search",["$rootScope","$http",function($rootScope,$http){var self=this;self.query="";self.response=[];self.sources={};self.limit=24;self.clear=function(){self.query=""};self.clearResponse=function(){if(self.response.length>1){self.response=self.response.slice(1)}else{self.response.length=0}};self.resetSources=function(sources){self.sources=$.extend({},sources)};self.get=function(query,page,limit){var new_page=page||0;self.limit=limit||self.limit;self.last_query=query||self.last_query||self.query;$http({method:"GET",url:"https://arthound-server.herokuapp.com/get/request",params:{tags:encodeURIComponent(self.last_query),page:new_page,limit:self.limit,sources:self.sources}}).then(function success(res){console.log("Server query:",'"'+self.last_query+'"',"Page",new_page,"Response",res);var new_data=[];for(var i=0;i<res.data.length;i++){if(res.data[i].stop===true){self.sources[res.data[i].name]=false}new_data.push.apply(new_data,res.data[i].results)}new_data.sort(function(a,b){return b.date-a.date});self.response.push({page:new_page,data:new_data})},function error(res){self.response.push({page:null,data:[]});console.error("Search responses",self.response)}).finally(function returned(){$rootScope.$broadcast("onsearchreturned")});return}}]);ng_app.service("Navigate",["$rootScope",function($rootScope){var self=this;self.initialize=function(limit){self.current_limit=limit||3;self.current_index=0;self.current_page=0;self.last_index=0;self.display_low=0-self.current_limit;self.display_high=0+self.current_limit;self.can_page=false;self.first_page=false;self.last_page=false;self.listing_buffer=[];self.page_sizes=[]};self.initialize();self.append=function(response){if(response===null||response===undefined){console.error("Response is null or undefined")}if(self.listing_buffer[response.page]!==undefined){return false}var start_index=0;if(self.listing_buffer.length>0){var last_buffer=self.listing_buffer[self.listing_buffer.length-1].data;start_index=last_buffer[last_buffer.length-1].index+1}{var i=0;while(i<response.data.length){var aspect=response.data[i].width/(response.data[i].height||1);if(aspect<.5)response.data[i].zoom=true;else response.data[i].zoom=false;response.data[i].index=start_index+i;i++}self.last_index=start_index+i}self.listing_buffer.push(response);self.page_sizes.push(response.data.length+(self.page_sizes[self.page_sizes.length-1]||0));if(self.listing_buffer.length===1){self.broadcast("onnavigatepop")}};self.checkDisplay=function(n){if(n<self.display_high&&n>self.display_low){return true}else{return false}};self.next=function(){if(self.index+1<self.last_index){self.index+=1;self.broadcast("onnavigate");return true}else if(self.index+1===self.last_index){self.nextPage()}else{return false}};self.prev=function(){if(self.index-1>=0){self.index-=1;self.broadcast("onnavigate");return true}else{return false}};self.to=function(n){if(n>=0&&n<self.page_sizes[self.page_sizes.length-1]){self.index=+n;self.broadcast("onnavigate");return true}else{return false}};self.prevPage=function(){if(!self.first_page&&self.can_page){self.can_page=false;if(self.last_page)self.last_page=false;self._calcPage(--self.current_page);self.broadcast("onnavigatepage")}};self.nextPage=function(){if(!self.last_page&&self.can_page){self.can_page=false;if(self.first_page)self.first_page=false;self._calcPage(++self.current_page);self.broadcast("onnavigatepage")}};self.getDisplay=function(buffer){var retval=[];var low=self.display_low;var high=self.display_high;if(self.display_low<0)low=0;retval=buffer.slice(low,high);return retval};self.getLastIndex=function(){};self.getPageByIndex=function(n){if(index<self.page_sizes[0]){return 0}else{for(var i=1;i<self.page_sizes.length;i++){if(self.page_sizes[i]>index){return i}}return null}};self.findByIndex=function(index){if(index>self.page_sizes[0]){for(var i=1;i<self.page_sizes.length;i++){if(self.page_sizes[i]>index){var sub_index=index-self.page_sizes[i-1];return self.listing_buffer[i].data[sub_index]}}}else{return self.listing_buffer[0].data[index]}};self._calcPage=function(page){self.display_low=page-self.current_limit;if(self.display_low<=0)self.display_low=0;self.display_high=page+self.current_limit};self.broadcast=function(ev){$rootScope.$broadcast(ev)}}])})(ng_hound,ResponsiveBootstrapToolkit)},{}]},{},[3,1,2])(3)});