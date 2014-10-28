var carApp = angular.module('carApp', ['CarModel', 'ngTouch', 'mainApp', 'steroidsBridge', 'ionic', 'ngRoute', 'ngCordova']);


carApp.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/:carId', {
      controller: 'ShowCtrl'
    })

})


// Index: http://localhost/views/car/index.html
carApp.controller('IndexCtrl', ['UIInitializer', '$scope', 'CarRestangular', 'ViewManager', function (UIInitializer, $scope, CarRestangular, ViewManager) {

  console.log(steroids.view)

  // Helper function for opening new webviews
  $scope.open = function(id) {
    ViewManager.goToLoadedView("views/car/show.html/", "showCar");
    window.postMessage({carId: id});
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
carApp.controller('ShowCtrl', ['$scope', '$filter', 'CarRestangular', 'ViewManager', '$route', '$routeParams', '$location', '$cordovaDialogs', function ($scope, $filter, CarRestangular, ViewManager, $route, $routeParams, $location, $cordovaDialogs) {
  

  // empty the car ojbect
  $scope.car = {}

  // A new car has been requested
  this.messageReceived = function(event) {

    // Fetch all objects from the local JSON (see app/models/car.js)
    CarRestangular.all('car').getList().then( function(cars) {
      // Then select the one based on the view's id query parameter
      $scope.car = $filter('filter')(cars, {id: event.data.carId})[0];

      // set navigation bar title
      steroids.view.navigationBar.show($scope.car.name);
    });

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
  }


}]);




