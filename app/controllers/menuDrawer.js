/*
* Difficile d'implémenter l'état actif des items du menu
* parce que la gestion des événements UI n'est pas encore
* disponible pour Android sous Appgyver :
* https://github.com/AppGyver/steroids/issues/182
* (en date du 29 octobre 2014)
*/


/**
* @class angular_module.menuDrawerApp
* @memberOf angular_module    
*/
var menuDrawerApp = angular.module('menuDrawerApp', ['MenuDrawerModel', 'ngTouch', 'steroidsBridge']);



/**
* @class angular_module.menuDrawerApp.IndexCtrl
* @classdesc Contrôleur pour la liste des éléments du menu latéral
*/
menuDrawerApp.controller('IndexCtrl', [
  'UIInitializer', 
  '$scope', 
  'MenuDrawerRestangular', 
  'ViewManager', 
  function (UIInitializer, $scope, MenuDrawerRestangular, ViewManager) {

    // Helper function for opening new webviews
    /**
    * @name $scope.requestCreate
    * @function
    * @memberOf angular_module.carApp.NewCtrl
    * @description Ouvrir une nouvelle webView à partir du menu latéral 
    *   (on ne peut pas faire layers.push directement à partir d'un menu latéral dans steroids - 31 octobre 2014)
    */  
    $scope.open = function(viewLocation, viewId) {
      steroids.drawers.hide({}, {
        onSuccess: function(){

          /* Si la vue demandée est l'index des voitures, on demande la méthode popAll*/
          if (viewId == "car/index"){
            window.postMessage({
              action: "popAll",
              viewLocation: viewLocation,
              viewId: viewId
            });
          }

          /* S'il s'agit d'une vue autre*/
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

    /* Fetch all objects from the local JSON (see app/models/menuDrawer.js) */
    MenuDrawerRestangular.all('menuDrawer').getList().then( function(menuDrawers) {
      $scope.menuDrawers = menuDrawers;
    });

    /* Titre du menu latéral */
    UIInitializer.initNavigationBar('Menu');

  }
]);
