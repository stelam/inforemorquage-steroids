// The contents of individual model .js files will be concatenated into dist/models.js

(function() {

// Protects views where AngularJS is not loaded from errors
if ( typeof angular == 'undefined' ) {
	return;
};


var module = angular.module('CarModelApp', ['restangular', 'LocalStorageModule', 'TowingModelApp']);

module.factory('CarRestangular', function(Restangular) {

  return Restangular.withConfig(function(RestangularConfigurer) {

    RestangularConfigurer.setBaseUrl('http://localhost/data');
    RestangularConfigurer.setRequestSuffix('.json');
    RestangularConfigurer.setRestangularFields({
      id: "car_id"
    });

  });

});


module.factory('CarModel', ['localStorageService', 'TowingModel', '$q', function(localStorageService, TowingModel, $q){
	var initData = function(){
	    var data = [
	      {
	        "id": 1,
	        "name": "First car",
	        "registration": "ABC123",
	        "imageURL" : "/images/sample-02.jpg",
	        "towings" : [],
	        "statusLoaded" : false
	      },
	      {
	        "id": 2,
	        "name": "Second car",
	        "registration": "H1Z2Z1",
	        "imageURL" : "/images/sample-03.jpg",
	        "towings" : [],
	        "statusLoaded" : false
	      },
	      {
	        "id": 3,
	        "name": "third car",
	        "registration": "H1Z2Z1",
	        "imageURL" : "/images/sample-04.jpg",
	        "towings" : [],
	        "statusLoaded" : false
	      },
	      {
	        "id": 4,
	        "name": "fourth car",
	        "registration": "H1Z2Z1",
	        "imageURL" : "/images/sample-05.jpg",
	        "towings" : [],
	        "statusLoaded" : false
	      }
	    ];
	    localStorageService.set("cars", data);
	    return getAll();
	}

	var getAll = function(){
		return localStorageService.get("cars");
	}


	var requestTowingStatuses = function(cars){
		var deferred = $q.defer();
		var statusCount = 0;

		cars.forEach(function(car) {
			TowingModel.requestStatus(car.registration).then(function(towingJson){
				car.towings.push(towingJson);
				car.statusLoaded = true;
				statusCount++;

				// Si on a reçu tous les status
				if (statusCount == cars.length){
					saveAll(cars);
					deferred.resolve(cars);
				}
			})
		});



		return deferred.promise;
	}


	var empty = function(){
		return localStorageService.remove("cars");
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


	var removeById = function(id){
		cars = getAll();
		var index = 0;
		cars.some(function(c, i) {
			index = i;
			if (c.id == id){
				cars.splice(index,1);
				return true;
			}
		});

		empty();
		localStorageService.set("cars", cars);
		return index;
	}


	var defaultCar = function(){
		return {
	        "id": "",
	        "name": "",
	        "registration": "",
	        "imageURL" : "/images/default.png",
	        "towings" : []
	      }
	}


	var save = function(car, onSucessCallback){
		var index = removeById(car.id);
		var cars = getAll();
		cars.splice(index, 0, car);
		empty();
		localStorageService.set("cars", cars);

		onSucessCallback();
	}


	var saveAll = function(cars){
		localStorageService.set("cars", cars);
	}


	var create = function(car, onSucessCallback){
		var cars = getAll();

		// On set un nouveau ID qui correspond au ID du dernier véhicule + 1
		car.id = cars[cars.length - 1]['id'] + 1;

		cars.push(car);
		localStorageService.set("cars", cars);

		onSucessCallback();
	}


	return {
		initData : initData,
		empty : empty,
		getAll : getAll,
		getById : getById,
		defaultCar : defaultCar,
		save : save,
		removeById : removeById,
		create : create,
		requestTowingStatuses : requestTowingStatuses
	}
}])


})();
