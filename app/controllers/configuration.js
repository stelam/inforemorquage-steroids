var configurationApp = angular.module('configurationApp', ['ConfigurationModel', 'mainApp', 'steroidsBridge', 'ionic', 'ngTouch', 'mainApp', 'ngRoute', 'ngCordova']);


// Index: http://localhost/views/configuration/index.html

configurationApp.controller('IndexCtrl', ['$scope', 'ConfigurationRestangular', 'UIInitializer', function ($scope, ConfigurationRestangular, UIInitializer) {

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
  steroids.on('ready', function() {
    UIInitializer.initNavigationBar('Configuration');
    UIInitializer.initNavigationMenuButton();
  });


}]);


// Show: http://localhost/views/configuration/show.html?id=<id>

configurationApp.controller('ShowCtrl', function ($scope, $filter, ConfigurationRestangular) {

  // Fetch all objects from the local JSON (see app/models/configuration.js)
  ConfigurationRestangular.all('configuration').getList().then( function(configurations) {
    // Then select the one based on the view's id query parameter
    $scope.configuration = $filter('filter')(configurations, {id: steroids.view.params['id']})[0];
  });

});
