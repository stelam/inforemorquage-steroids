// The contents of individual model .js files will be concatenated into dist/models.js

(function() {

// Protects views where AngularJS is not loaded from errors
if ( typeof angular == 'undefined' ) {
	return;
};


var module = angular.module('TowingModelApp', ['restangular', 'LocalStorageModule', 'webserviceApp']);

module.factory('TowingRestangular', function(Restangular) {

  return Restangular.withConfig(function(RestangularConfigurer) {

    RestangularConfigurer.setBaseUrl('http://localhost/data');
    RestangularConfigurer.setRequestSuffix('.json');
    RestangularConfigurer.setRestangularFields({
      id: "towing_id"
    });

  });

});

module.factory('TowingModel', function(localStorageService, inforemorquageWebService, $q){
  var factory = [];


	factory.requestStatus = function(registration){
    var deferred = $q.defer();

    inforemorquageWebService.getTowingJsonByRegistration(registration).then(function(towingJson){
      deferred.resolve(towingJson);
    })

		return deferred.promise;
	}


  factory.exists = function(towing, towings){
    var exists = false;
    towings.some(function(t){
      if (JSON.stringify(towing) === JSON.stringify(t))
        exists = true;
    })
    return exists;
  }

  factory.getLatest = function(towings){
    var latest = false;
    towings.some(function(t){
      if (t.remorquage.statutReponse == 0)
        latest = t;
    })

    return latest;
  }

  return factory;

})

})();
