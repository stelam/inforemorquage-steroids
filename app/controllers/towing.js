/**
* @class angular_module.towingApp
* @memberOf angular_module    
*/
var towingApp = angular.module('towingApp', ['ngTouch', 'TowingModelApp', 'steroidsBridge', 'CarModelApp']);



/**
* @class angular_module.towingApp.IndexCtrl
* @classdesc Contrôleur pour les détails d'un remorquage
*/
towingApp.controller('ShowCtrl', [
  '$scope', 
  '$filter', 
  'CarModel', 
  'TowingModel', 
  'UIInitializer', 
  'ViewManager', 
  function ($scope, $filter, CarModel, TowingModel, UIInitializer, ViewManager) {


    /**
    * @description Event listener de l'événement 'willchange' sur steroids.layers.
    *   Using steroids.layers.on to communicate between views
    *   because postMessage() is currently bugged :
    *   https://github.com/AppGyver/steroids/issues/619
    */
    steroids.layers.on('willchange', function(event) {
      if (event.target.webview.location == "http://localhost/views/towing/show.html"){

        $scope.car = CarModel.getRequestedCar();
        $scope.towing = TowingModel.getLatest($scope.car.towings);

        // set navigation bar
        UIInitializer.initNavigationBar("Remorquage");
        UIInitializer.initNavigationMenuButton();

        $scope.$apply();
      }
    });
    


   /**
    * @name $scope.openDirections
    * @function
    * @memberOf angular_module.towingApp
    * @description Lance l'application de map native de l'appareil avec l'adresse où se trouve actuellement la voiture remorquée
    */
    $scope.openDirections = function(){
      /* String de l'adresse */
      var address = $scope.towing.remorquage.lieuRemorquage.rueRemorq.noCivique + " " + $scope.towing.remorquage.lieuRemorquage.rueRemorq.nom.type + " " + $scope.towing.remorquage.lieuRemorquage.rueRemorq.nom.nom + ", Montréal"

      if(device.platform == "Android"){
        launchnavigator.navigateByPlaceName(address);
      }else if(device.platform == "iOS"){
        window.location = "maps:q="+address; //might need to encode URL ?
      }else{
        console.error("Unknown platform");
      }
    };


   /**
    * @name $scope.goContactMethods
    * @function
    * @memberOf angular_module.towingApp
    * @description Ouvre la vue qui contient les moyens de contact
    */
    $scope.goContactMethods = function(){
      ViewManager.goToLoadedView("message/methods");
      window.postMessage({
        recipient: "MessageMethodsCtrl",
        car : $scope.car
      });
    }
  }
]);



