/*
* Difficile d'implémenter l'état actif des items du menu
* parce que la gestion des événements UI n'est pas encore
* disponible pour Android sous Appgyver :
* https://github.com/AppGyver/steroids/issues/182
*
*/


var menuDrawerApp = angular.module('menuDrawerApp', ['MenuDrawerModel', 'ngTouch', 'mainApp', 'steroidsBridge']);



// main scope controller
menuDrawerApp.controller('menuDrawerCtrl', ['UIInitializer', '$scope', 'MenuDrawerRestangular', 'ViewManager', function (UIInitializer, $scope, MenuDrawerRestangular, ViewManager) {


}]);



// Index: http://localhost/views/menuDrawer/index.html
menuDrawerApp.controller('IndexCtrl', ['UIInitializer', '$scope', 'MenuDrawerRestangular', 'ViewManager', function (UIInitializer, $scope, MenuDrawerRestangular, ViewManager) {

  // Helper function for opening new webviews
  $scope.open = function(viewLocation, viewId) {

    steroids.drawers.hide({
      
    }, {
      onSuccess: function(){
        if (viewId == "dashboard"){
          window.postMessage({
            action: "popAll",
            viewLocation: viewLocation,
            viewId: viewId
          });
        }
        else {
          window.postMessage({
            action: "openFromDrawer",
            viewLocation: viewLocation,
            viewId: viewId
          });
        }
      }
    });
  };

  // Fetch all objects from the local JSON (see app/models/menuDrawer.js)
  MenuDrawerRestangular.all('menuDrawer').getList().then( function(menuDrawers) {
    $scope.menuDrawers = menuDrawers;
  });

  // Native navigation
  UIInitializer.initNavigationBar('Menu');


}]);


// Show: http://localhost/views/menuDrawer/show.html?id=<id>

menuDrawerApp.controller('ShowCtrl', function ($scope, $filter, MenuDrawerRestangular) {

  // Fetch all objects from the local JSON (see app/models/menuDrawer.js)
  MenuDrawerRestangular.all('menuDrawer').getList().then( function(menuDrawers) {
    // Then select the one based on the view's id query parameter
    $scope.menuDrawer = $filter('filter')(menuDrawers, {id: steroids.view.params['id']})[0];
  });

  // Native navigation
  steroids.view.navigationBar.show("MenuDrawer: " + steroids.view.params.id );
  steroids.view.setBackgroundColor("#FFFFFF");

});


