// The contents of individual model .js files will be concatenated into dist/models.js

(function() {

// Protects views where AngularJS is not loaded from errors
if ( typeof angular == 'undefined' ) {
	return;
};

/**
* @class angular_module.ConfigurationModel
* @memberOf angular_module
* 
* Module contenant le modèle pour les configs
*/
var module = angular.module('ConfigurationModel', ['restangular']);


/**
* @class angular_module.CarModelApp.ConfigurationModel
* @classdesc Service RESTAngular pour les configs
* 	(généré par Steroids)
*/
module.factory('ConfigurationRestangular', function(Restangular) {

  return Restangular.withConfig(function(RestangularConfigurer) {

    RestangularConfigurer.setBaseUrl('http://localhost/data');
    RestangularConfigurer.setRequestSuffix('.json');
    RestangularConfigurer.setRestangularFields({
      id: "configuration_id"
    });

  });

});


})();
