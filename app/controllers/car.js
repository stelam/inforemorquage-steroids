var carApp = angular.module('carApp', ['CarModel', 'LocalStorageModule', 'ngTouch', 'mainApp', 'steroidsBridge', 'ionic', 'ngRoute', 'ngCordova']);

var eventHandler = steroids.layers.on('willchange', function(event) {
    alert("eventName: " + event.name + "\n"
        + " target.webview.location: " + event.target.webview.location + "\n"
        + " source.webview.location: " + event.source.webview.location)
})

carApp.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/:carId', {
      controller: 'ShowCtrl'
    })

})



// Index: http://localhost/views/car/index.html
carApp.controller('IndexCtrl', ['UIInitializer', '$scope', 'localStorageService', 'CarRestangular', 'ViewManager', 'drawerOpenPageService', function (UIInitializer, $scope, localStorageService, CarRestangular, ViewManager, drawerOpenPageService) {

  var initData = function() {
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
    console.log(data);
    return localStorageService.set("cars", data);
  }
  initData();


  // Helper function for opening new webviews
  $scope.open = function(carId) {
    ViewManager.goToLoadedView("views/car/show.html/", "showCar");
    window.postMessage({
      recipient: "ShowCtrl",
      carId: carId
    });
  };

  // Load cars
  $scope.cars = localStorageService.get("cars");


  // Native navigation
  UIInitializer.initNavigationBar('Vos voitures');
  UIInitializer.initNavigationMenuButton();
}]);




// Show: http://localhost/views/car/show.html?id=<id>
carApp.controller('ShowCtrl', ['UIInitializer', '$scope', 'localStorageService', '$filter', 'CarRestangular', 'ViewManager', '$route', '$routeParams', '$location', '$cordovaDialogs', '$cordovaToast', 'CameraManager', function (UIInitializer, $scope, localStorageService, $filter, CarRestangular, ViewManager, $route, $routeParams, $location, $cordovaDialogs, $cordovaToast, CameraManager) {
  

  // empty the car ojbect
  $scope.car = {imageURL : "/images/sample.jpg"};

  // A new car has been requested
  this.messageReceived = function(event) {
    if (event.data.recipient == "ShowCtrl"){
      // Fetch all objects from the local JSON (see app/models/car.js)
      cars = localStorageService.get("cars");

      cars.forEach(function(c) {
        if (c.id == event.data.carId){
          $scope.car = c;

          // set navigation bar
          UIInitializer.initNavigationBar($scope.car.name);
          UIInitializer.initNavigationMenuButton();

          $scope.$apply();
        }
      });

    } 
  }

  window.addEventListener("message", this.messageReceived);

  


  // L'utilisateur a demandé la suppression d'un véhicule
  $scope.requestDelete = function(){

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
    steroids.layers.pop();

   $cordovaToast.showShortTop('Véhicule supprimé').then(function(success) {
      // success
    }, function (error) {
      // error
    });
  }



  $scope.requestSave = function(){
   $cordovaToast.showShortTop('Véhicule enregistré').then(function(success) {
      // success
    }, function (error) {
      // error
    });
  }


  $scope.requestCamera = function(){
    CameraManager.takePicture($scope.imageReceived);
  }

  $scope.requestFileBrowser = function(){
    CameraManager.browsePicture($scope.imageReceived); 
  }

  $scope.imageReceived = function(imageURL){
    $scope.car.imageURL = imageURL;
    $scope.$apply();
  }


}]);




carApp.controller('NewCtrl', ['UIInitializer', '$scope', '$filter', 'CarRestangular', 'ViewManager', '$cordovaDialogs', function (UIInitializer, $scope, $filter, CarRestangular, ViewManager, $cordovaDialogs) {
  // empty the car ojbect
  $scope.car = {imageURL : "/images/sample.jpg"};

  this.messageReceived = function(event) {
    
    if (event.data.action == "openFromDrawer" && event.data.viewId == "newCar"){
      UIInitializer.initNavigationBar('Nouveau véhicule');
      UIInitializer.initNavigationMenuButton();
    }
  }
  window.addEventListener("message", this.messageReceived);


  $scope.open = function(id) {
    steroids.layers.pop(); 
  };

  // Native navigation
  
}]);

