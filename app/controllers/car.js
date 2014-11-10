var carApp = angular.module('carApp', ['CarModelApp', 'LocalStorageModule', 'ngTouch', 'mainApp', 'steroidsBridge', 'ionic', 'ngRoute', 'ngCordova', 'ngAnimate']);


carApp.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/:carId', {
      controller: 'ShowCtrl'
    })

})



// Index: http://localhost/views/car/index.html
carApp.controller('IndexCtrl', ['UIInitializer', '$scope', 'CarModel', 'ViewManager', 'drawerOpenPageService', function (UIInitializer, $scope, CarModel, ViewManager, drawerOpenPageService) {


  // Helper function for opening new webviews
  $scope.open = function(carId) {
    ViewManager.goToLoadedView("http://localhost/views/car/show.html/", "showCar");
    window.postMessage({
      recipient: "ShowCtrl",
      carId: carId
    });
  };


  $scope.goAddNew = function(){
    ViewManager.goToLoadedView("http://localhost/views/car/new.html/", "newCar");
  }


  // Load some cars
  $scope.cars = CarModel.initData();
  CarModel.requestTowingStatuses($scope.cars).then(function(cars){
    console.log($scope.cars);
  });
  //$scope.cars = CarModel.getAll();



  this.messageReceived = function(event) {
    if (event.data.action == "refreshCars"){
      $scope.cars = CarModel.getAll();
      CarModel.requestTowingStatuses($scope.cars).then(function(cars){
        
      });
      $scope.$apply();
    }


    if (event.data.action == "refershCarById"){
      var car = CarModel.getById(event.data.carId);
      CarModel.replaceExistingCar($scope.cars, car).then(function(cars){
        CarModel.updateCarTowingStatus($scope.cars, car).then(function(cars){

        })
      });
    }
  }
  window.addEventListener("message", this.messageReceived);

  
  steroids.on('ready', function() {
    // Native navigation
    UIInitializer.initNavigationBar('Vos voitures');
    UIInitializer.initNavigationMenuButton();

    
    // Preload show car view
    webView = new steroids.views.WebView({
      location: "http://localhost/views/car/show.html/",
      id: "showCar"
    });  
    webView.preload();

    // Preload new car view
    webView = new steroids.views.WebView({
      location: "http://localhost/views/car/new.html/",
      id: "newCar"
    });  
    webView.preload();

    // Preload towing view
    webView = new steroids.views.WebView({
      location: "http://localhost/views/towing/show.html/",
      id: "showTowing"
    });  
    webView.preload();

    // Preload configuration view
    webView = new steroids.views.WebView({
      location: "http://localhost/views/configuration/index.html/",
      id: "configuration"
    });  
    webView.preload();

    // Preload newMessage view
    webView = new steroids.views.WebView({
      location: "http://localhost/views/message/new.html/",
      id: "newMessage"
    });  
    webView.preload();

    // Preload contactMethods view
    webView = new steroids.views.WebView({
      location: "http://localhost/views/message/methods.html/",
      id: "contactMethods"
    });  
    webView.preload();



    

    console.log(steroids.getApplicationState({},{
      onSuccess: function(){
        console.log("success");
      },
      onFailure : function(){
        console.log("fail");
      }
    }));

  });

}]);




// Show: http://localhost/views/car/show.html?id=<id>
carApp.controller('ShowCtrl', ['UIInitializer', '$scope', 'CarModel', '$filter', 'ViewManager', '$route', '$routeParams', '$location', '$cordovaDialogs', '$cordovaToast', 'CameraManager', 'Helpers', function (UIInitializer, $scope, CarModel, $filter, ViewManager, $route, $routeParams, $location, $cordovaDialogs, $cordovaToast, CameraManager, Helpers) {

  // A new car has been requested
  this.messageReceived = function(event) {
    if (event.data.recipient == "ShowCtrl"){
      $scope.car = CarModel.getById(event.data.carId);
      $scope.car.towed = CarModel.isTowed($scope.car);
      
      $scope.towing = $scope.car.towings[$scope.car.towings.length - 1];

      // set navigation bar
      UIInitializer.initNavigationBar($scope.car.name);
      UIInitializer.initNavigationMenuButton();

      $scope.$apply();

    } 
  }
  window.addEventListener("message", this.messageReceived);



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
        action: "refershCarById",
        carId : car.id
      });
    });
  }

  $scope.showTowing = function(){
    ViewManager.goToLoadedView("http://localhost/views/towing/show.html/", "showTowing");
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




carApp.controller('NewCtrl', ['UIInitializer', '$scope', 'CarModel', '$filter', 'ViewManager', '$cordovaDialogs', 'Helpers', '$cordovaToast', function (UIInitializer, $scope, CarModel, $filter, ViewManager, $cordovaDialogs, Helpers, $cordovaToast) {
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


  $scope.onCarCreateSuccess = function(){
    Helpers.cordovaCallbackFix("Création");
    $scope.car = CarModel.defaultCar();

    steroids.layers.pop(); 
    window.postMessage({
      action: "refreshCars"
    });
    $cordovaToast.showShortTop('Véhicule créé');

    $scope.form.$setPristine();
  };


  $scope.cancel = function(id) {
    steroids.layers.pop(); 
  };

  
}]);

