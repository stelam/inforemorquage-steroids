// The contents of individual model .js files will be concatenated into dist/models.js

(function() {

// Protects views where AngularJS is not loaded from errors
if ( typeof angular == 'undefined' ) {
	return;
};

/**
* @class angular_module.MenuDrawerModel
* @memberOf angular_module
* 
* Module contenant le modèle pour les éléments du menu latéral
*/
var module = angular.module('MenuDrawerModel', ['restangular']);


/**
* @class angular_module.CarModelApp.MenuDrawerModel
* @classdesc Service RESTAngular pour les éléments du menu latéral
* 	(généré par Steroids)
*/
module.factory('MenuDrawerRestangular', function(Restangular) {

  return Restangular.withConfig(function(RestangularConfigurer) {

    RestangularConfigurer.setBaseUrl('http://localhost/data');
    RestangularConfigurer.setRequestSuffix('.json');
    RestangularConfigurer.setRestangularFields({
      id: "menuDrawer_id"
    });

  });

});





})();
