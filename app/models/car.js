// The contents of individual model .js files will be concatenated into dist/models.js
(function() {

	// Protects views where AngularJS is not loaded from errors
	if ( typeof angular == 'undefined' ) {
		return;
	};


	/**
	* @class angular_module.CarModelApp
	* @memberOf angular_module
	* 
	* Module contenant le modèle pour les véhicules
	*/
	var module = angular.module('CarModelApp', [
		'restangular', 
		'LocalStorageModule', 
		'TowingModelApp', 
		'steroidsBridge', 
		'ngCordova'
	]);



	/**
	* @class angular_module.CarModelApp.CarModel
	* @classdesc Service pour le modèle des véhicules
	*/
	module.factory('CarModel', [
		'localStorageService', 
		'TowingModel', 
		'$q', 
		'ConnectionManager', 
		'$cordovaToast', 
		function(localStorageService, TowingModel, $q, ConnectionManager, $cordovaToast){


			var getAll = function(){
				cars = localStorageService.get("cars");
				if (!cars) 
					cars = [];
				return cars;
			}


		   /**
		    * @name getResumingId
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Parcoure tous les IDs et retourne le ID que devrait avoir la prochaine voiture créée
		    * @returns {int} Le ID que devrait avoir la prochaine voiture créée
		    */
			var getResumingId = function(){
				cars = getAll();
				var highestId = 0;
				cars.forEach(function(car){
					if (car.id > highestId)
						highestId = car.id
				})

				return parseInt(highestId) + 1;
			}


		   /**
		    * @name requestTowingStatuses
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Met à jour le statut de remorquage d'un ensemble de voitures
		    * @params {Array} - Tableau de voitures
		    * @returns {Array|Object} Retourne un tableau de voitures avec leur stat mis à jour, ou un objet d'erreur
		    */
			var requestTowingStatuses = function(cars){
				var deferred = $q.defer();
				var statusCount = 0;
				cars.forEach(function(car) {
					requestTowingStatus(car).then(function(car){
						statusCount++;

						/* Si on a reçu tous les status */
						if (statusCount == cars.length){
							deferred.resolve(cars);
						}

					}, function(error){
						statusCount++;
						deferred.reject(error);
					})
				});

				return deferred.promise;
			}

		   /**
		    * @name requestTowingStatuses
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Met à jour le statut de remorquage d'une voiture
		    * @params {Object} - Un voiture
		    * @returns {Object} Retourne une voiture avec son statut mis à jour, ou un objet d'erreur
		    */
			var requestTowingStatus = function(car){
				var deferred = $q.defer();
				car.statusLoaded = false;
				if (ConnectionManager.isOnline()){
					TowingModel.requestStatus(car.registration).then(function(towingJson){

						/* On regarde si l'objet de remorquage reçu existe déjà dans le localStorage, sinon, on le crée */
						if (!TowingModel.exists(towingJson, car.towings)){
							car.towings.push(towingJson);
						}
						car.towed = isTowed(car);

						/* S'assurer que la voiture existe toujours après que le statut ait été retournée par le service web */
						if (getById(car.id)){
							save(car).then(function(car){
								car.statusLoaded = true;
								deferred.resolve(car);	
							})
						}

					}, function(error){
				        car.towed = null;
				        car.statusLoaded = true;
				        deferred.reject(error);
					})

					
				}else /* Si l'application est hors-ligne */{
			        car.towed = null;
			        car.statusLoaded = true;
			        deferred.reject("Network error");
				}

				return deferred.promise
			}


			/* 
				À chaque fois qu'on accède aux détails d'une voiture, la voiture demandée
				est mise en mémoire. On fait ça pour contrer certains bugs de Steroids, notamment
				le bug qui empêche présentement de recevoir les window.postMessage de façon constante
				sur les vues préloadées
			 */
			var setRequestedCar = function(car){
				localStorageService.set("requestedCar", car);
			}

			var getRequestedCar = function(){
				return localStorageService.get("requestedCar");
			}

			var unsetRequestedCar = function(){
				localStorageService.remove("requestedCar")
			}



		   /**
		    * @name empty
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Efface tous les véhicules du localStorage
		    */
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
					if (c.id == id)
						car = c;
				});
				return car;
			}


		   /**
		    * @name syncCarsFromLocalStorage
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Synchronise les informations d'un ensemble de voiture à partir des informations présentement dans le localStorage. 
		    *				Si une voiture n'existe plus dans le localStorage, elle sera enlevée de l'ensemble de voitures reçu en paramètre.
		    *				Si une voiture existe en localStorage, mais n'existe pas dans l'ensemble de voitures reçu en param, elle y sera ajoutée
		    * @params {Array} - Un tableau contenant des voitures
		    * @returns {Array} - Un tableau contenant des voitures (synchronisées)
		    */
			var syncCarsFromLocalStorage = function(cars){
				var deferred = $q.defer();
				var carToRemoveIndex = -1;
				var savedCars = getAll();

				/* Si une voiture n'existe plus dans le localStorage, elle sera enlevée de l'ensemble de voitures reçu en paramètre. */
				cars.some(function(car, i){
					if (!getById(car.id)){
						carToRemoveIndex = i;
					}
				})

				/* Si une voiture existe en localStorage, mais n'existe pas dans l'ensemble de voitures reçu en param, elle y sera ajoutée */
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

				localStorageService.set("cars", cars);
				return index;
			}


		   /**
		    * @name replaceExistingCar
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Remplace une voiture par une autre (sur la base du ID), dans un ensemble de voitures donné.
		    * @param {Array} cars - Ensemble de voitures à analyser
		    * @param {Object} car - Voiture à utiliser en cas de remplacement
		    * @returns {Array} - L'ensemble de voiture avec la voiture remplacée (ou pas)
		    */
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


		   /**
		    * @name updateCarTowingStatus
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Met à jour le statut de remorquage d'une voiture qui fait partie d'un ensemble de voiture donné.
		    *				Cette méthode diffère de requestTowingStatuses() et de requestTowingStatus(), car elle ne met à jour
		    *				que le statut d'un seul véhicule dans un groupe de véhicules. Cela peut être utile dans le cas où on aimerait
		    *				refraîchir l'affichage de la voiture en question, sans devoir nécessairement rafraîchir l'affichage du groupe
		    *				au complet. (Ce qui appellera implicitement $scope.$apply dans Angular)
		    * @param {Array} cars - Ensemble de voitures à analyser
		    * @param {Object} car - Voiture à mettre à jour
		    * @returns {Array|Object} - L'ensemble de voiture contenant la voiture mise à jour, ou un objet d'erreur
		    */
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


		   /**
		    * @name isTowed
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Vérifie si une voiture est remorquée ou pas
		    * @param {Object} car - Voiture à vérifier
		    * @returns {boolean|null} - La voiture est remorquée ou pas, ou null si l'état est non disponible
		    */
			var isTowed = function(car){
				if (car == null || typeof car == "undefined" || getLatestTowing(car) == false)
					return false;
				else if (!ConnectionManager.isOnline())
					return null;
				else
					return (getLatestTowing(car).remorquage.statutReponse == 0);
			}


		   /**
		    * @name getLatestTowing
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Pour une voiture donnée, obtient l'objet de remorquage le plus récent
		    * @param {Object} car - Voiture à vérifier
		    * @returns {Object|false} - Retourne le dernier objet de remorquage, ou false si il n'y a pas de remorquage pour cete voiture
		    */
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


		   /**
		    * @name defaultCar
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Crée une voiture avec des valeurs par défaut
		    * @returns {Object} - Retourne une instance de voiture défaut
		    */
			var defaultCar = function(){
				return {
			        "id": "",
			        "name": "",
			        "registration": "",
			        "imageURL" : "/images/default.png",
			        "towings" : [{remorquage : {}}]
			      }
			}

		   /**
		    * @name emptyCar
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Crée une voiture avec des valeurs vides
		    * @returns {Object} - Retourne une instance de voiture avec valeurs vides
		    */
			var emptyCar = function(){
				return {
			        "id": "",
			        "name": "",
			        "registration": "",
			        "imageURL" : "/images/empty.jpg",
			        "towings" : [{remorquage : {}}]
				}
			}


		   /**
		    * @name save
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Sauvegarde une voiture qui existe déjà en localStorage (selon le ID)
		    * @param {Object} car - La voiture à sauvegarder
		    * @returns {Object} - Retourne une instance de la voiture sauvegardée
		    */
			var save = function(car){
				var deferred = $q.defer();
				var index = removeById(car.id);
				var cars = getAll();

			    car.registration = car.registration.toUpperCase();
			    car.registration = car.registration.replace(" ", "");

		        unsetRequestedCar();
				car.statusLoaded = false;
				cars.splice(index, 0, car); /* On ajoute la voiture au début de la liste */
				localStorageService.set("cars", cars);
				deferred.resolve(car);		

				return deferred.promise;
			}


		   /**
		    * @name saveAll
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Sauvegarde un tableau de voitures dans le localStorage
		    * @param {Array} cars - Le tableau qui contient les voitures à enregistrer
		    */
			var saveAll = function(cars){
				localStorageService.set("cars", cars);
			}


		   /**
		    * @name save
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Sauvegarde une nouvelle voiture en localStorage
		    * @param {Object} car - La voiture à sauvegarder
		    * @param {function} onSuccessCallback - La function a appeler en callback après la sauvegarde complétée
		    * @returns {Object} - Retourne une instance de la voiture sauvegardée
		    */
			var create = function(car, onSucessCallback){
				/* J'aurais pu utiliser des promise au lieu d'un callback ici, mais j'étais pas encore au courant ici */
				unsetRequestedCar();
				var cars = getAll();

				/* On set un nouveau ID qui correspond au ID du dernier véhicule + 1 */
				car.id = getResumingId();
			    car.registration = car.registration.toUpperCase();
			    car.registration = car.registration.replace(" ", "");

				cars.push(car);
				localStorageService.set("cars", cars);

				/* Appel du callback */
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



			/**
		    * @name generateCars
		    * @function
		    * @memberOf angular_module.CarModelApp.CarModel
		    * @description Génère 5 véhicules aléatoires
		    */
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

		        	/* Helper pour générer des nombres aléatoires uniques */
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


			/* Interface publique */
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
				syncCarsFromLocalStorage : syncCarsFromLocalStorage,
				unsetRequestedCar : unsetRequestedCar,
				getLatestTowing : getLatestTowing,
				setStatusLoaded : setStatusLoaded,
				setTowedStatus : setTowedStatus
			}
		}
	])


})();
