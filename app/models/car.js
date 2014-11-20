// The contents of individual model .js files will be concatenated into dist/models.js

(function() {

// Protects views where AngularJS is not loaded from errors
if ( typeof angular == 'undefined' ) {
	return;
};


var module = angular.module('CarModelApp', ['restangular', 'LocalStorageModule', 'TowingModelApp', 'steroidsBridge', 'ngCordova']);

module.factory('CarRestangular', function(Restangular) {

  return Restangular.withConfig(function(RestangularConfigurer) {

    RestangularConfigurer.setBaseUrl('http://localhost/data');
    RestangularConfigurer.setRequestSuffix('.json');
    RestangularConfigurer.setRestangularFields({
      id: "car_id"
    });

  });

});


module.factory('CarModel', ['localStorageService', 'TowingModel', '$q', 'ConnectionManager', '$cordovaToast', function(localStorageService, TowingModel, $q, ConnectionManager, $cordovaToast){
	var generateCars = function(){

		var startingId = parseInt(getResumingId());

		var names = [          
			"Suzuki Optimistic",
            "Chrysler Overwhelmed",
            "Mercury Undesirable",
            "Ferrari Economic",
            "Mitsubishi Snuggled",
            "GMC Unusual",
            "Suzuki Lackadaisical",
            "Nissan Absent-Minded",
            "GM Endearing",
            "Eagle Aberrant",
            "Hyundai Recondite"
        ];

        var regs = [
            "326GVC",
            "M25BFZ",
            "191SAQ",
            "151FXJ",
            "S63AVB",
            "P01BLJ",
            "H36CSA",
            "Z13EZG",
            "715ZAV",
            "068LWZ",
            "W50AXJ",
            "263VQJ",
            "303XXA",
            "KFX935"
        ];

        var data = [];
        var r1 = [];
        var r2 = [];
        var r3 = [];
        for (var i = 0; i < 5; i++) {

			function uniqueRandoms(max, indexArray){
				var r = Math.floor(Math.random() * max);
				var found = false;
				for(var j=0;j<indexArray.length;j++){
					if (indexArray[j] == r){
						found = true;
						break;
					}
				}
				if (found == true)
					return uniqueRandoms(max, indexArray);
				else {
					indexArray.push(r);
					return r;
				}
			}

            var randomIndex = uniqueRandoms(10, r1);
            var randomIndex2 = uniqueRandoms(10, r2);
            var randomIndex3 = uniqueRandoms(11, r3) + 1;
            var thisPhotoFileName = (randomIndex3 < 10) ? "sample-0" + randomIndex3 + ".jpg" : "sample-" + randomIndex3 + ".jpg";




            var car = {
            	id: startingId + i,
            	name: names[randomIndex2],
            	registration: regs[randomIndex],
            	imageURL: "/images/" + thisPhotoFileName,
            	towings: [{remorquage : {}}],
            	statusLoaded: false,
            	towed: false
            };
            data.push(car);
        }


	    data.some(function(car) {
	    	save(car);
	    })

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
			}, function(error){
				statusCount++;
				deferred.reject(error);
			})
		});

		return deferred.promise;
	}


	var requestTowingStatus = function(car){
		var deferred = $q.defer();
		car.statusLoaded = false;
		if (ConnectionManager.isOnline()){
			TowingModel.requestStatus(car.registration).then(function(towingJson){

				// Check if the towing had already been saved for this car
				// if not, save it
				if (!TowingModel.exists(towingJson, car.towings)){
					car.towings.push(towingJson);
				}

				car.towed = isTowed(car);


				// If the car still exists after its status has been fetched
				if (getById(car.id)){
					save(car).then(function(car){
						car.statusLoaded = true;
						deferred.resolve(car);	
					})
				}

			}, function(error){
		        //$cordovaToast.showShortCenter('Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.');
		        car.towed = null;
		        car.statusLoaded = true;
		        deferred.reject("Network error");
			})

			
		}else {
	        //$cordovaToast.showShortCenter('Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.');
	        car.towed = null;
	        car.statusLoaded = true;
	        deferred.reject("Network error");
		}

		return deferred.promise
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
		var carToRemoveIndex = -1;
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

		if (carToRemoveIndex >= 0){
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
		}, function(error){
			replaceExistingCar(cars, car).then(function(cars){
				deferred.reject(error);
			})
		})

		return deferred.promise;
	}


	var isTowed = function(car){
		if (car == null || typeof car == "undefined" || getLatestTowing(car) == false)
			return false;
		else if (!ConnectionManager.isOnline())
			return null;
		else
			return (getLatestTowing(car).remorquage.statutReponse == 0);
	}

	var getLatestTowing = function(car){
		var elligibleTowings = [];
		car.towings.forEach(function(t){
			if (t.remorquage.noPlaque == car.registration && TowingModel.isInElligiblePeriod(t)){
				elligibleTowings.push(t);
			}
		})


		var latest = TowingModel.getLatest(elligibleTowings);
		return latest;

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

	    car.registration = car.registration.toUpperCase();
	    car.registration = car.registration.replace(" ", "");

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
	    car.registration = car.registration.toUpperCase();
	    car.registration = car.registration.replace(" ", "");

		cars.push(car);
		localStorageService.set("cars", cars);

		onSucessCallback(car);
	}


	var setTowedStatus = function(cars, towedStatus){
		cars.some(function(c){
			c.towed = towedStatus;
		})
	}

	var setStatusLoaded = function(cars, status){
		cars.some(function(c){
			c.statusLoaded = status;
		})
	}



	return {
		generateCars : generateCars,
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
		getLatestTowing : getLatestTowing,
		setStatusLoaded : setStatusLoaded,
		setTowedStatus : setTowedStatus
	}
}])


})();
