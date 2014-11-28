/**
* @class angular_module.carApp
* @memberOf angular_module    
*/
var carApp = angular.module('carApp', [
  'CarModelApp', 
  'LocalStorageModule', 
  'ngTouch', 
  'mainApp', 
  'steroidsBridge', 
  'ngCordova', 
  'ngAnimate', 
  'messageApp', 
  'duScroll']
);


/**
* @class angular_module.carApp.IndexCtrl
* @classdesc Contrôleur pour la liste de voitures 
*/
carApp.controller('IndexCtrl', [
  'UIInitializer', 
  '$scope', 
  'CarModel', 
  'ViewManager', 
  'drawerOpenPageService', 
  'ConnectionManager', 
  'MessageSender', 
  '$timeout', 
  '$document', 
  '$cordovaToast', 
  function (UIInitializer, $scope, CarModel, ViewManager, drawerOpenPageService, ConnectionManager, MessageSender, $timeout, $document, $cordovaToast) {
    $scope.cars = CarModel.getAll();

   /**
    * @name $scope.open
    * @function
    * @memberOf angular_module.carApp.IndexCtrl
    * @description Ouvre une webView pour une voiture donnée
    * @param {int} carId
    */
    $scope.open = function(carId) {
      CarModel.setRequestedCar(CarModel.getById(carId))
      ViewManager.goToLoadedView("car/show");
    };


   /**
    * @name $scope.goAddNew
    * @function
    * @memberOf angular_module.carApp.IndexCtrl
    * @description Ouvre la webview qui permet de créer une nouvelle voiture
    */
    $scope.goAddNew = function(){
      ViewManager.goToLoadedView("car/new");
    }

   /**
    * @name this.messageReceived
    * @function
    * @memberOf angular_module.carApp.IndexCtrl
    * @description Méthode appelée en callback lorsqu'un window.postMessage est reçu
    * @param {Object} event
    */
    this.messageReceived = function(event) {

      /* Demande pour rafraîchir les véhicules et leur statut */
      if (event.data.action == "refreshCarsAndStatuses"){

        /* S'il ne s'agit pas de la première mise à jour, on refresh tous les véhicules  */
        if (event.data.initialRefresh != true) {
          $scope.cars = CarModel.getAll();
        }

        /* Réactualisation des statuts */
        CarModel.requestTowingStatuses($scope.cars).then(function(cars){/*Success*/}, function(error){
          $cordovaToast.showShortCenter('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
        });
      }


      /* Demande pour rafraîchir les véhicules sans rafraîchir leur statut */
      if (event.data.action == "refreshCars"){
        CarModel.syncCarsWithLocalStorage($scope.cars).then(function(cars){/*Success*/});
      }


      /* Mise à jour manuelle du $scope d'Angular */
      if (event.data.action == "applyScope"){
        $scope.$apply();
      }

      /* Demande pour rafraîchir une voiture en particulier */
      if (event.data.action == "refreshCarById"){

        var car = CarModel.getById(event.data.carId);
        
        /* Mise à jour du statut */        
        CarModel.syncCarsWithLocalStorage($scope.cars).then(function(cars){
          CarModel.updateCarTowingStatus($scope.cars, car).then(function(cars){
            scrollToUpdatedCar();
          }, function(error){
            scrollToUpdatedCar();
          })
        })

        function scrollToUpdatedCar(){
          var carElement = angular.element(document.getElementById("car-" + car.id));
          $document.scrollToElementAnimated(carElement, 30, 1500);
        }
      }
    }

    
   /**
    * @description Event listener de l'événement 'online' sur $rootScope. Voir {@link angular_module.steroidsBridge.ConnectionManager}
    */
    $scope.$on("online", function(event, isOnline){
      /* Si l'application vient de retrouver une connection internet
         on effectue une demande de rafraîchissement des véhicules */
      if (isOnline == true){
        MessageSender.sendSavedMessages();
        window.postMessage({
          action: "refreshCarsAndStatuses",
          initialRefresh: true
        });

      /* Sinon, si l'application vient perdre la connection, on avise l'utilisateur */
      } else {
        $cordovaToast.showLongCenter('Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.');
        CarModel.setStatusLoaded($scope.cars, true)
        CarModel.setTowedStatus($scope.cars, null);
        $scope.$apply();
      }
    })


    /* Lorsque la platforme Steroids est chargée, on fait des appels à son API pour initialiser certains éléments UI natifs */
    steroids.on('ready', function() {
      UIInitializer.initNavigationBar('Vos voitures');
      UIInitializer.initNavigationMenuButton();
      UIInitializer.initDrawers();
    });

    /* Écoute des messages (window.postMessage) */
    window.addEventListener("message", this.messageReceived);
  }

]);



