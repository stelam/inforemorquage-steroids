var carApp = angular.module('carApp', ['CarModelApp', 'LocalStorageModule', 'ngTouch', 'mainApp', 'steroidsBridge', 'ionic', 'ngRoute', 'ngCordova']);


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
    console.log($scope.cars)
  });
  //$scope.cars = CarModel.getAll();



  this.messageReceived = function(event) {
    if (event.data.action == "refreshCars"){
      $scope.cars = CarModel.getAll();
      CarModel.requestTowingStatuses($scope.cars).then(function(cars){
        
      });

      $scope.$apply();
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

    // Preload configuration view
    webView = new steroids.views.WebView({
      location: "http://localhost/views/configuration/index.html/",
      id: "configuration"
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
  

  // empty the car ojbect
  // $scope.car = {imageURL : "/images/sample.jpg"};

  // A new car has been requested
  this.messageReceived = function(event) {
    if (event.data.recipient == "ShowCtrl"){
      $scope.car = CarModel.getById(event.data.carId);

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
    CarModel.save($scope.car, $scope.onCarSaveSuccess);
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


  $scope.onCarSaveSuccess = function(){
    Helpers.cordovaCallbackFix("Sauvegarde");
    steroids.layers.pop(); 
    window.postMessage({
      action: "refreshCars"
    });
    $cordovaToast.showShortTop('Véhicule enregistré');
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

