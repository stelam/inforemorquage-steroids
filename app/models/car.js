// The contents of individual model .js files will be concatenated into dist/models.js

(function() {

// Protects views where AngularJS is not loaded from errors
if ( typeof angular == 'undefined' ) {
	return;
};


var module = angular.module('CarModelApp', ['restangular', 'LocalStorageModule']);

module.factory('CarRestangular', function(Restangular) {

  return Restangular.withConfig(function(RestangularConfigurer) {

    RestangularConfigurer.setBaseUrl('http://localhost/data');
    RestangularConfigurer.setRequestSuffix('.json');
    RestangularConfigurer.setRestangularFields({
      id: "car_id"
    });

  });

});


module.factory('CarModel', function(localStorageService){
	var initData = function(){
	    var data = [
	      {
	        "id": 1,
	        "name": "First car",
	        "registration": "H1Z2Z1",
	        "imageURL" : "/images/sample.jpg"
	      },
	      {
	        "id": 2,
	        "name": "Second car",
	        "registration": "H1Z2Z1",
	        "imageURL" : "/images/samasdple.jpg"
	      }
	    ];
	    localStorageService.set("cars", data);
	    return getAll();
	}

	var getAll = function(){
		return localStorageService.get("cars");
	}


	var empty = function(){
		return localStorageService.clearAll();
	}


	var getById = function(id){
		cars = getAll();
		var car = false;
		cars.forEach(function(c) {
			if (c.id == id){
				car = c;
			}
		});

		return car;

	}


	var defaultCar = function(){
		return {
	        "id": "",
	        "name": "",
	        "registration": "",
	        "imageURL" : "/images/sample.jpg"
	      }
	}


	return {
		initData : initData,
		empty : empty,
		getAll : getAll,
		getById : getById,
		defaultCar : defaultCar
	}
})


})();
