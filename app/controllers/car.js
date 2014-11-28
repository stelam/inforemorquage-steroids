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




/**
* @class angular_module.carApp.IndexCtrl
* @classdesc Contrôleur pour la liste de voitures 
*/
carApp.controller('ShowCtrl', ['UIInitializer', '$scope', 'CarModel', '$filter', 'ViewManager', '$location', '$cordovaDialogs', '$cordovaToast', 'CameraManager', 'Helpers', function (UIInitializer, $scope, CarModel, $filter, ViewManager, $location, $cordovaDialogs, $cordovaToast, CameraManager, Helpers) {

  // Using steroids.layers.on to communicate between views
  // because postMessage() is currently bugged
  // https://github.com/AppGyver/steroids/issues/619
  steroids.layers.on('willchange', function(event) {
    if (event.target.webview.location != "http://localhost/views/car/show.html"){
      $scope.car = CarModel.emptyCar();
      $scope.$apply();
    } else {

      $scope.car = CarModel.getRequestedCar();
      $scope.cars = CarModel.getAll();


      
      $scope.car.towed = CarModel.isTowed($scope.car);
      
      $scope.towing = $scope.car.towings[$scope.car.towings.length - 1];

      // set navigation bar
      UIInitializer.initNavigationBar($scope.car.name);
      UIInitializer.initNavigationMenuButton();

      CarModel.setRequestedCar($scope.car);
      $scope.form.$setPristine();
      $scope.$apply();


      // update the car's towing status again
      CarModel.updateCarTowingStatus($scope.cars, $scope.car).then(function(cars){
        CarModel.setRequestedCar($scope.car);
        $scope.car.towed = CarModel.isTowed($scope.car);
        $scope.towing = CarModel.getLatestTowing($scope.car);
        // $scope.$apply();
      })
    }
  });
  


  // L'utilisateur a demandé la suppression d'un véhicule
  $scope.requestDelete = function(){
    Helpers.cordovaCallbackFix("Suppression");

    // Les dialogues confirm sont présentement problématiques
    // http://stackoverflow.com/questions/22410659/cordova-on-android-navigator-notification-confirm-callbacks-stuck-in-queue
    // (les callbacks sont appelés de façon inconstante)
    $cordovaDialogs.confirm('Êtes-vous certain(e) de vouloir supprimer ce véhicule?', 'Suppression', ['Nah','Oui'])
      .then(function(buttonIndex) {
        if (buttonIndex == 2)
          $scope.delete();
      });
  }

  // Suppression du véhicule (à implémenter)
  $scope.delete = function(){
    // ViewManager.goHome();
    CarModel.removeById($scope.car.id);
    $scope.onDeleteSuccess();
    $cordovaToast.showShortTop('Véhicule supprimé').then(function(success) {
      // success
    }, function (error) {
      // error
    });
  }



  $scope.requestSave = function(){
    Helpers.cordovaCallbackFix("Sauvegarde");

    CarModel.save($scope.car).then(function(car){
      steroids.layers.pop(); 
      $cordovaToast.showShortTop('Véhicule enregistré');
      window.postMessage({
        action: "refreshCarById",
        carId : car.id
      });
    });
  }

  $scope.showTowing = function(){
    ViewManager.goToLoadedView("towing/show");
    window.postMessage({
      recipient: "TowingShowCtrl",
      car: $scope.car
    });
  }


  $scope.requestCamera = function(){
    CameraManager.takePicture($scope.imageReceived);
    return false;
  }

  $scope.requestFileBrowser = function(){
    CameraManager.browsePicture($scope.imageReceived); 
  }

  $scope.imageReceived = function(imageURL){
    $scope.car.imageURL = imageURL;
    $scope.$apply();
  }


  $scope.onDeleteSuccess = function(){
    Helpers.cordovaCallbackFix("Suppression");
    steroids.layers.pop(); 
    window.postMessage({
      action: "refreshCars"
    });
    $cordovaToast.showShortTop('Véhicule supprimé').then(function(success) {
      // success

    }, function (error) {
      // error
    });
  }


  


}]);




carApp.controller('NewCtrl', ['UIInitializer', '$scope', 'CarModel', '$filter', 'ViewManager', '$cordovaDialogs', 'Helpers', '$cordovaToast', 'CameraManager', function (UIInitializer, $scope, CarModel, $filter, ViewManager, $cordovaDialogs, Helpers, $cordovaToast, CameraManager) {
  // empty the car ojbect
  $scope.car = CarModel.defaultCar();

  this.messageReceived = function(event) {
    
    if (event.data.action == "openFromDrawer" && event.data.viewId == "newCar"){
      // Native navigation
      UIInitializer.initNavigationBar('Nouveau véhicule');
      UIInitializer.initNavigationMenuButton();
    }
  }
  window.addEventListener("message", this.messageReceived);


  $scope.requestCreate = function(){
    CarModel.create($scope.car, $scope.onCarCreateSuccess);
  };

  $scope.requestCamera = function(){
    CameraManager.takePicture($scope.imageReceived);
    return false;
  }

  $scope.requestFileBrowser = function(){
    CameraManager.browsePicture($scope.imageReceived); 
  }

  $scope.imageReceived = function(imageURL){
    $scope.car.imageURL = imageURL;
    $scope.$apply();
  }


  $scope.onCarCreateSuccess = function(car){
    Helpers.cordovaCallbackFix("Création");
    $scope.car = CarModel.defaultCar();

    steroids.layers.pop(); 

    window.postMessage({
      action: "refreshCarById",
      carId : car.id
    });

    $cordovaToast.showShortTop('Véhicule créé');

    $scope.form.$setPristine();
  };


  $scope.cancel = function(id) {
    steroids.layers.pop(); 
  };

  
}]);

