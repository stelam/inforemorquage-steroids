var configurationApp = angular.module('configurationApp', ['ConfigurationModel', 'mainApp', 'steroidsBridge', 'ngTouch', 'mainApp', 'ngRoute', 'ngCordova', 'CarModelApp']);


// Index: http://localhost/views/configuration/index.html

configurationApp.controller('IndexCtrl', ['$scope', 'ConfigurationRestangular', 'UIInitializer', 'CarModel', '$cordovaToast', 'ViewManager', function ($scope, ConfigurationRestangular, UIInitializer, CarModel, $cordovaToast, ViewManager) {

  $scope.generateCars = {amount : 5}

  // Helper function for opening new webviews
  $scope.open = function(id) {
    webView = new steroids.views.WebView("/views/configuration/show.html?id="+id);
    steroids.layers.push(webView);
  };

  // Fetch all objects from the local JSON (see app/models/configuration.js)
  ConfigurationRestangular.all('configuration').getList().then( function(configurations) {
    $scope.configurations = configurations;
  });

  // Native navigation
  this.messageReceived = function(event) {
    if (event.data.action == "openFromDrawer" && event.data.viewId == "configuration"){
      // Native navigation
      UIInitializer.initNavigationBar('Configuration');
      UIInitializer.initNavigationMenuButton();
    }
  }
  window.addEventListener("message", this.messageReceived);


  $scope.generateCars = function(){
    CarModel.generateCars($scope.generateCars.amount);
    $cordovaToast.showShortTop('Véhicules créés.');
    window.postMessage({
      action: "refreshCarsAndStatuses"
    });

    steroids.layers.popAll();
  }



  $scope.wipeCars = function(){
    CarModel.empty().then(function(){
      CarModel.unsetRequestedCar();
      $cordovaToast.showShortTop('Tous les véhicules ont été supprimés.');
      window.postMessage({
        action: "refreshCarsAndStatuses"
      });
      window.postMessage({
        action: "applyScope"
      });
      steroids.layers.popAll();
    })

  }


}]);


// Show: http://localhost/views/configuration/show.html?id=<id>

configurationApp.controller('ShowCtrl', function ($scope, $filter, ConfigurationRestangular) {

  // Fetch all objects from the local JSON (see app/models/configuration.js)
  ConfigurationRestangular.all('configuration').getList().then( function(configurations) {
    // Then select the one based on the view's id query parameter
    $scope.configuration = $filter('filter')(configurations, {id: steroids.view.params['id']})[0];
  });

});
