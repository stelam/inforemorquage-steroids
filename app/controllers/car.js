var carApp = angular.module('carApp', ['CarModel', 'ngTouch', 'mainApp', 'steroidsBridge', 'ionic', 'ngRoute', 'ngCordova']);

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


// main scope controller
carApp.controller('carCtrl', ['UIInitializer', '$scope', '$filter', 'CarRestangular', 'ViewManager', '$cordovaDialogs', function (UIInitializer, $scope, $filter, CarRestangular, ViewManager, $cordovaDialogs) {


}]);



// Index: http://localhost/views/car/index.html
carApp.controller('IndexCtrl', ['UIInitializer', '$scope', 'CarRestangular', 'ViewManager', 'drawerOpenPageService', function (UIInitializer, $scope, CarRestangular, ViewManager, drawerOpenPageService) {



  // Helper function for opening new webviews
  $scope.open = function(carId) {
    ViewManager.goToLoadedView("views/car/show.html/", "showCar");
    window.postMessage({
      recipient: "ShowCtrl",
      carId: carId
    });
  };

  // Fetch all objects from the local JSON (see app/models/car.js)
  CarRestangular.all('car').getList().then( function(cars) {
    $scope.cars = cars;

    // Preload show car view
    webView = new steroids.views.WebView({
      location: "views/car/show.html/",
      id: "showCar"
    });  
    webView.preload();

    // Preload new car view
    webView = new steroids.views.WebView({
      location: "views/car/new.html/",
      id: "newCar"
    });  
    webView.preload();

  });


  // Native navigation
  UIInitializer.initNavigationBar('Vos voitures');
  UIInitializer.initNavigationMenuButton();
}]);




// Show: http://localhost/views/car/show.html?id=<id>
carApp.controller('ShowCtrl', ['UIInitializer', '$scope', '$filter', 'CarRestangular', 'ViewManager', '$route', '$routeParams', '$location', '$cordovaDialogs', '$cordovaToast', 'CameraManager', function (UIInitializer, $scope, $filter, CarRestangular, ViewManager, $route, $routeParams, $location, $cordovaDialogs, $cordovaToast, CameraManager) {
  

  // empty the car ojbect
  $scope.car = {imageURL : "/images/sample.jpg"};

  // A new car has been requested
  this.messageReceived = function(event) {
    if (event.data.recipient == "ShowCtrl"){
      // Fetch all objects from the local JSON (see app/models/car.js)
      CarRestangular.all('car').getList().then( function(cars) {
        // Then select the one based on the view's id query parameter
        $scope.car = $filter('filter')(cars, {id: event.data.carId})[0];

        // set navigation bar title
        UIInitializer.initNavigationBar($scope.car.name);
        UIInitializer.initNavigationMenuButton();
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

