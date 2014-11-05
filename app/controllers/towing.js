var towingApp = angular.module('towingApp', ['TowingModel', 'ngTouch']);


// Index: http://localhost/views/towing/index.html

towingApp.controller('IndexCtrl', function ($scope, TowingRestangular) {

  // Helper function for opening new webviews
  $scope.open = function(id) {
    webView = new steroids.views.WebView("/views/towing/show.html?id="+id);
    steroids.layers.push(webView);
  };

  // Fetch all objects from the local JSON (see app/models/towing.js)
  TowingRestangular.all('towing').getList().then( function(towings) {
    $scope.towings = towings;
  });

  // Native navigation
  steroids.view.navigationBar.show("Towing index");
  steroids.view.setBackgroundColor("#FFFFFF");

});


// Show: http://localhost/views/towing/show.html?id=<id>

towingApp.controller('ShowCtrl', function ($scope, $filter, TowingRestangular) {

  // Fetch all objects from the local JSON (see app/models/towing.js)
  TowingRestangular.all('towing').getList().then( function(towings) {
    // Then select the one based on the view's id query parameter
    $scope.towing = $filter('filter')(towings, {id: steroids.view.params['id']})[0];
  });

  // Native navigation
  steroids.view.navigationBar.show("Towing: " + steroids.view.params.id );
  steroids.view.setBackgroundColor("#FFFFFF");

});
