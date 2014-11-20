var carApp = angular.module('carApp', ['CarModelApp', 'LocalStorageModule', 'ngTouch', 'mainApp', 'steroidsBridge', 'ngCordova', 'ngAnimate', 'messageApp', 'duScroll']);


carApp.controller('IndexCtrl', ['UIInitializer', '$scope', 'CarModel', 'ViewManager', 'drawerOpenPageService', 'ConnectionManager', 'MessageSender', '$timeout', '$document', '$cordovaToast', function (UIInitializer, $scope, CarModel, ViewManager, drawerOpenPageService, ConnectionManager, MessageSender, $timeout, $document, $cordovaToast) {


  // Helper function for opening new webviews
  $scope.open = function(carId) {

    CarModel.setRequestedCar(CarModel.getById(carId))
    


    ViewManager.goToLoadedView("car/show");

  };


  $scope.goAddNew = function(){
    ViewManager.goToLoadedView("car/new");
  }


  // Load some cars
  //$scope.cars = CarModel.initData();
  $scope.cars = CarModel.getAll();

  //CarModel.requestTowingStatuses($scope.cars).then(function(cars){
    //console.log($scope.cars)
  //});



  this.messageReceived = function(event) {
    if (event.data.action == "refreshCarsAndStatuses"){
      if (event.data.initialRefresh != true)
        $scope.cars = CarModel.getAll();

      CarModel.requestTowingStatuses($scope.cars).then(function(cars){
        //$scope.$apply();  

      }, function(error){
        $cordovaToast.showShortCenter('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
        console.log($scope.cars);
        // $scope.$apply();
      });
      
    }

    if (event.data.action == "refreshCars"){
      CarModel.syncCarsWithLocalStorage($scope.cars).then(function(cars){
        //$scope.$apply();
      });
    }


    if (event.data.action == "applyScope"){
      $scope.$apply();
    }


    if (event.data.action == "refreshCarById"){

      var car = CarModel.getById(event.data.carId);
      

      
      CarModel.syncCarsWithLocalStorage($scope.cars).then(function(cars){
        CarModel.updateCarTowingStatus($scope.cars, car).then(function(cars){
          scrollToUpdatedCar();

        }, function(error){
          scrollToUpdatedCar();
          
        })
      })

      // Scroll to newly refreshed car
      function scrollToUpdatedCar(){
        var carElement = angular.element(document.getElementById("car-" + car.id));
        $document.scrollToElementAnimated(carElement, 30, 1500);
      }

    }
  }
  window.addEventListener("message", this.messageReceived);


  $scope.connectionManager = ConnectionManager;
  //$scope.connectionManager.addEventListeners();
  $scope.$on("online", function(event, isOnline){
    // ConnectionManager.removeEventListeners();
    if (isOnline == true){

      MessageSender.sendSavedMessages();

      window.postMessage({
        action: "refreshCarsAndStatuses",
        initialRefresh: true
      });


    } else {
      $cordovaToast.showLongCenter('Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.');
      CarModel.setStatusLoaded($scope.cars, true)
      CarModel.setTowedStatus($scope.cars, null);
      $scope.$apply();
    }
  })


  // Preload linked pages
  //ViewManager.preloadViews(['car/show', 'car/new', 'configuration/index']);
  
  steroids.on('ready', function() {
    // Native navigation
    UIInitializer.initNavigationBar('Vos voitures');
    UIInitializer.initNavigationMenuButton();
    UIInitializer.initDrawers();
  });

}]);




// Show: http://localhost/views/car/show.html?id=<id>
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

