var towingApp = angular.module('towingApp', ['ngTouch', 'ionic', 'TowingModelApp', 'mainApp', 'steroidsBridge', 'CarModelApp']);


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


towingApp.controller('ShowCtrl', ['$scope', '$filter', 'CarModel', 'TowingModel', 'UIInitializer', 'Helpers', function ($scope, $filter, CarModel, TowingModel, UIInitializer, Helpers) {

  // A new towing has been requested
  this.messageReceived = function(event) {
    if (event.data.recipient == "TowingShowCtrl"){
      $scope.car = event.data.car;
      $scope.towing = $scope.car.towings[$scope.car.towings.length - 1];

      // set navigation bar
      UIInitializer.initNavigationBar("Remorquage");
      UIInitializer.initNavigationMenuButton();

      $scope.$apply();

    } 
  }
  window.addEventListener("message", this.messageReceived);


  $scope.openDirections = function(){
    var address = $scope.towing.remorquage.lieuRemorquage.rueRemorq.noCivique + " " + $scope.towing.remorquage.lieuRemorquage.rueRemorq.nom.type + " " + $scope.towing.remorquage.lieuRemorquage.rueRemorq.nom.nom + ", Montréal"
    if(device.platform == "Android"){
      launchnavigator.navigateByPlaceName(address);
    }else if(device.platform == "iOS"){
      window.location = "maps:q="+address; //might need to encode URL ?
    }else{
      console.error("Unknown platform");
    }
  };



  $scope.goContactMethods = function(){
    ViewManager.goToLoadedView("http://localhost/views/message/methods.html/", "contactMethods");
    window.postMessage({
      recipient: "MessageMethodsCtrl",
      car : $scope.car
    });
  }

}]);
