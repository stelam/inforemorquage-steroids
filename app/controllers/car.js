var carApp = angular.module('carApp', ['CarModelApp', 'LocalStorageModule', 'ngTouch', 'mainApp', 'steroidsBridge', 'ionic', 'ngRoute', 'ngCordova']);


carApp.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/:carId', {
      controller: 'ShowCtrl'
    })

})



// Index: http://localhost/views/car/index.html
carApp.controller('IndexCtrl', ['UIInitializer', '$scope', 'CarModel', 'CarRestangular', 'ViewManager', 'drawerOpenPageService', function (UIInitializer, $scope, CarModel, CarRestangular, ViewManager, drawerOpenPageService) {


  // Helper function for opening new webviews
  $scope.open = function(carId) {
    ViewManager.goToLoadedView("http://localhost/views/car/show.html/", "showCar");
    window.postMessage({
      recipient: "ShowCtrl",
      carId: carId
    });
  };



  // Load some cars
  $scope.cars = CarModel.initData();



  this.messageReceived = function(event) {
    if (event.data.action == "refreshCars"){
      $scope.cars = CarModel.getAll();
      console.log($scope.cars);
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
carApp.controller('ShowCtrl', ['UIInitializer', '$scope', 'CarModel', '$filter', 'CarRestangular', 'ViewManager', '$route', '$routeParams', '$location', '$cordovaDialogs', '$cordovaToast', 'CameraManager', function (UIInitializer, $scope, CarModel, $filter, CarRestangular, ViewManager, $route, $routeParams, $location, $cordovaDialogs, $cordovaToast, CameraManager) {
  

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
    CarModel.save($scope.car, $scope.onCarSaveSuccess, $scope.onCarSaveFail);
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


  $scope.onCarSaveSuccess = function(){
    $cordovaToast.showShortTop('Véhicule enregistré').then(function(success) {
      // success
      window.postMessage({
        action: "refreshCars"
      });

    }, function (error) {
      // error
    });
  }

  $scope.onCarSaveFail = function(error){
    $cordovaToast.showShortTop('Erreur d\'enregistrement').then(function(success) {
      // success
    }, function (error) {
      // error
    });
  }


  


}]);




carApp.controller('NewCtrl', ['UIInitializer', '$scope', 'CarModel', '$filter', 'CarRestangular', 'ViewManager', '$cordovaDialogs', function (UIInitializer, $scope, CarModel, $filter, CarRestangular, ViewManager, $cordovaDialogs) {
  // empty the car ojbect
  $scope.car = CarModel.defaultCar();

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

