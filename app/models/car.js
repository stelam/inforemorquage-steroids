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

		var startingId = parseInt(getResumingId());

	    var data = [
	      {
	        "id": startingId,
	        "name": "Voiture - " + parseInt(startingId),
	        "registration": "ABC123",
	        "imageURL" : "/images/sample-02.jpg",
	        "towings" : [{remorquage : {}}],
	        "statusLoaded" : false,
	        "towed" : false
	      },
	      {
	        "id": parseInt(startingId + 1),
	        "name": "Voiture - " + parseInt(startingId + 1),
	        "registration": "H1Z2Z1",
	        "imageURL" : "/images/sample-03.jpg",
	        "towings" : [{remorquage : {}}],
	        "statusLoaded" : false,
	        "towed" : false
	      },
	      {
	        "id": parseInt(startingId + 2),
	        "name": "Voiture - " + parseInt(startingId + 2),
	        "registration": "H1Z2Z1",
	        "imageURL" : "/images/sample-04.jpg",
	        "towings" : [{remorquage : {}}],
	        "statusLoaded" : false,
	        "towed" : false
	      },
	      {
	        "id": parseInt(startingId + 3),
	        "name": "Voiture - " + parseInt(startingId + 3),
	        "registration": "H1Z2Z1",
	        "imageURL" : "/images/sample-05.jpg",
	        "towings" : [{remorquage : {}}],
	        "statusLoaded" : false,
	        "towed" : false
	      }
	    ];

	    data.some(function(car) {
	    	save(car);
	    })

	    // localStorageService.set("cars", data);
	    return getAll();
	}

	var getAll = function(){
		cars = localStorageService.get("cars");
		if (!cars) 
			cars = [];
		return cars;
	}

	var getResumingId = function(){
		cars = getAll();
		var highestId = 0;
		cars.forEach(function(car){
			if (car.id > highestId)
				highestId = car.id
		})

		return parseInt(highestId) + 1;
	}


	var requestTowingStatuses = function(cars){


		var deferred = $q.defer();
		var statusCount = 0;
		cars.forEach(function(car) {
			requestTowingStatus(car).then(function(car){
				statusCount++;

				// Si on a reçu tous les status
				if (statusCount == cars.length){
					// saveAll(cars);
					deferred.resolve(cars);
				}
			})
		});

		return deferred.promise;
	}


	var requestTowingStatus = function(car){
		var deferred = $q.defer();
		car.statusLoaded = false;


		TowingModel.requestStatus(car.registration).then(function(towingJson){

			// Check if the towing had already been saved for this car
			// if not, save it
			if (!TowingModel.exists(towingJson, car.towings)){
				car.towings.push(towingJson);
			}

			car.towed = (towingJson.remorquage.statutReponse == 0) ? true : false;


			// If the car still exists after its status has been fetched
			if (getById(car.id)){
				save(car).then(function(car){
					car.statusLoaded = true;
					deferred.resolve(car);	
				})
			}

		})


		return deferred.promise;
	}


	var getRequestedCar = function(){
		return localStorageService.get("requestedCar");
	}

	var setRequestedCar = function(car){
		localStorageService.set("requestedCar", car);
	}

	var unsetRequestedCar = function(){
		localStorageService.remove("requestedCar")
	}




	var empty = function(){
		var deferred = $q.defer();

		unsetRequestedCar();
		deferred.resolve(localStorageService.remove("cars"));

		return deferred.promise;
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



	var syncCarsWithLocalStorage = function(cars){
		var deferred = $q.defer();
		var carToRemoveIndex = false;
		var savedCars = getAll();

		cars.some(function(car, i){
			if (!getById(car.id)){
				carToRemoveIndex = i;
			}
		})

		savedCars.some(function(car, i){
			var isIn = false;
			cars.some(function(car2, j){
				if (car.id == car2.id){
					isIn = true;
					return true;
				}
			})

			if (!isIn){
				cars.push(car);
			}
		})

		if (carToRemoveIndex != false){
			cars.splice(carToRemoveIndex, 1);
		}

		deferred.resolve(cars);
		return deferred.promise;
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

		//empty();
		localStorageService.set("cars", cars);
		return index;
	}


	var replaceExistingCar = function(cars, car){
		var deferred = $q.defer();
		cars.some(function(c, i) {
			if (c.id == car.id){
				cars[i] = car;
			}
		})
		deferred.resolve(cars);
		return deferred.promise;
	}

	var updateCarTowingStatus = function(cars, car){
		var deferred = $q.defer();
		
		requestTowingStatus(car).then(function(car){
			car.statusLoaded = true;

			replaceExistingCar(cars, car).then(function(cars){
				deferred.resolve(cars);
			})
		})

		return deferred.promise;
	}


	var isTowed = function(car){
		if (car == null || typeof car == "undefined" || getLatestTowing(car) == false)
			return false;
		else
			return (getLatestTowing(car).remorquage.statutReponse == 0);
	}

	var getLatestTowing = function(car){
		var elligibleTowings = [];
		car.towings.forEach(function(t){
			if (t.remorquage.noPlaque == car.registration){
				elligibleTowings.push(t);
			}
		})
		return TowingModel.getLatest(elligibleTowings);
	}


	var defaultCar = function(){
		return {
	        "id": "",
	        "name": "",
	        "registration": "",
	        "imageURL" : "/images/default.png",
	        "towings" : [{remorquage : {}}]
	      }
	}

	var emptyCar = function(){
		return {
	        "id": "",
	        "name": "",
	        "registration": "",
	        "imageURL" : "/images/empty.jpg",
	        "towings" : [{remorquage : {}}]
		}
	}


	var save = function(car){
		var deferred = $q.defer();
		var index = removeById(car.id);
		var cars = getAll();

        unsetRequestedCar();
		car.statusLoaded = false;
		cars.splice(index, 0, car);
		localStorageService.set("cars", cars);
		deferred.resolve(car);		


              
		return deferred.promise;
	}


	var saveAll = function(cars){
		localStorageService.set("cars", cars);
	}


	var create = function(car, onSucessCallback){
		unsetRequestedCar();
		var cars = getAll();

		// On set un nouveau ID qui correspond au ID du dernier véhicule + 1
		car.id = getResumingId();

		cars.push(car);
		localStorageService.set("cars", cars);

		onSucessCallback(car);
	}


	return {
		initData : initData,
		empty : empty,
		getAll : getAll,
		getById : getById,
		defaultCar : defaultCar,
		emptyCar : emptyCar,
		save : save,
		removeById : removeById,
		create : create,
		requestTowingStatuses : requestTowingStatuses,
		replaceExistingCar : replaceExistingCar,
		updateCarTowingStatus : updateCarTowingStatus,
		isTowed : isTowed,
		getRequestedCar : getRequestedCar,
		setRequestedCar : setRequestedCar,
		syncCarsWithLocalStorage : syncCarsWithLocalStorage,
		unsetRequestedCar : unsetRequestedCar,
		getLatestTowing : getLatestTowing
	}
}])


})();
