/**
* @class angular_module.configurationApp
* @memberOf angular_module    
*/
var configurationApp = angular.module('configurationApp', [
  'ConfigurationModel', 
  'mainApp', 
  'steroidsBridge', 
  'ngTouch', 
  'mainApp', 
  'ngRoute', 
  'ngCordova', 
  'CarModelApp'
]);


/**
* @class angular_module.configurationApp.IndexCtrl
* @classdesc Contrôleur pour la liste des paramètres de config
*/
configurationApp.controller('IndexCtrl', [
  '$scope', 
  'ConfigurationRestangular', 
  'UIInitializer', 
  'CarModel', 
  '$cordovaToast', 
  'ViewManager', 
  function ($scope, ConfigurationRestangular, UIInitializer, CarModel, $cordovaToast, ViewManager) {

    /* Fetch all objects from the local JSON (see app/models/configuration.js) */
    ConfigurationRestangular.all('configuration').getList().then( function(configurations) {
      $scope.configurations = configurations;
    });

   /**
    * @name this.messageReceived
    * @function
    * @memberOf angular_module.carApp.IndexCtrl
    * @description Méthode appelée en callback lorsqu'un window.postMessage est reçu
    * @param {Object} event
    */
    this.messageReceived = function(event) {
      /* Si la vue est appelée à partir du menu latéral, on doit faire afficher ces éléments UI natifs manuellement */
      if (event.data.action == "openFromDrawer" && event.data.viewId == "configuration"){
        UIInitializer.initNavigationBar('Configuration');
        UIInitializer.initNavigationMenuButton();
      }
    }

    /* Écoute des messages (window.postMessage) */
    window.addEventListener("message", this.messageReceived);


    /**
    * @name $scope.generateCars
    * @function
    * @memberOf angular_module.configurationApp
    * @description Génère 5 voitures aléatoires
    */  
    $scope.generateCars = function(){
      CarModel.generateCars(5);
      $cordovaToast.showShortTop('Véhicules créés.');
      window.postMessage({
        action: "refreshCarsAndStatuses"
      });
      steroids.layers.popAll();
    }


    /**
    * @name $scope.wipeCars
    * @function
    * @memberOf angular_module.configurationApp
    * @description Efface tous les véhicules présentement en localStorage
    */  
    $scope.wipeCars = function(){
      CarModel.empty().then(function(){
        /* On efface aussi la dernière voiture demandée */
        CarModel.unsetRequestedCar();

        $cordovaToast.showShortTop('Tous les véhicules ont été supprimés.');

        /* Rafraîchissement de la liste de voitures */
        window.postMessage({
          action: "refreshCarsAndStatuses"
        });

        window.postMessage({
          action: "applyScope"
        });

        /* Retour à l'index */
        steroids.layers.popAll();
      })
    }

  }
]);
