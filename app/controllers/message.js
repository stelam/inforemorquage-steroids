var messageApp = angular.module('messageApp', ['MessageModel', 'ngTouch']);


// Index: http://localhost/views/message/index.html

messageApp.controller('IndexCtrl', function ($scope, MessageRestangular) {

  // Helper function for opening new webviews
  $scope.open = function(id) {
    webView = new steroids.views.WebView("/views/message/show.html?id="+id);
    steroids.layers.push(webView);
  };

  // Fetch all objects from the local JSON (see app/models/message.js)
  MessageRestangular.all('message').getList().then( function(messages) {
    $scope.messages = messages;
  });

  // Native navigation
  steroids.view.navigationBar.show("Message index");
  steroids.view.setBackgroundColor("#FFFFFF");

});


// Show: http://localhost/views/message/show.html?id=<id>

messageApp.controller('ShowCtrl', function ($scope, $filter, MessageRestangular) {

  // Fetch all objects from the local JSON (see app/models/message.js)
  MessageRestangular.all('message').getList().then( function(messages) {
    // Then select the one based on the view's id query parameter
    $scope.message = $filter('filter')(messages, {id: steroids.view.params['id']})[0];
  });

  // Native navigation
  steroids.view.navigationBar.show("Message: " + steroids.view.params.id );
  steroids.view.setBackgroundColor("#FFFFFF");

});



messageApp.controller('MessageMethodsCtrl', ['$scope', '$filter', 'CarModel', 'TowingModel', 'UIInitializer', 'Helpers', function ($scope, $filter, CarModel, TowingModel, UIInitializer, Helpers) {

  // A new towing has been requested
  this.messageReceived = function(event) {
    if (event.data.recipient == "MessageMethodsCtrl"){
      $scope.car = event.data.car;
      $scope.towing = $scope.car.towings[$scope.car.towings.length - 1];

      // set navigation bar
      UIInitializer.initNavigationBar("Véhicule endommagé");
      UIInitializer.initNavigationMenuButton();

    } 
  }
  window.addEventListener("message", this.messageReceived);


}]);
