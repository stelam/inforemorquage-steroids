var messageApp = angular.module('messageApp', ['ngTouch', 'TowingModelApp', 'mainApp', 'steroidsBridge', 'CarModelApp', 'ngCordova', 'MessageModelApp']);


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



messageApp.controller('MethodsCtrl', ['$scope', '$filter', 'CarModel', 'TowingModel', 'UIInitializer', 'Helpers', 'ViewManager', function ($scope, $filter, CarModel, TowingModel, UIInitializer, Helpers, ViewManager) {

  // Using steroids.layers.on to communicate between views
  // because postMessage() is currently bugged
  // https://github.com/AppGyver/steroids/issues/619
  steroids.layers.on('willchange', function(event) {
    if (event.target.webview.location == "http://localhost/views/message/methods.html"){

      // set navigation bar
      UIInitializer.initNavigationBar("");
      UIInitializer.initNavigationMenuButton();

    }
  });
  


  $scope.openMessageForm = function(){
    ViewManager.goToLoadedView("message/new");
  }

}]);


messageApp.controller('NewCtrl', ['$scope', '$filter', 'CarModel', 'TowingModel', 'UIInitializer', 'Helpers', 'ViewManager', 'ConnectionManager', 'MessageSender', function ($scope, $filter, CarModel, TowingModel, UIInitializer, Helpers, ViewManager, ConnectionManager, MessageSender) {
  $scope.message = {
    body : "Exemple de message",
    authorEmail : "exemple@email.com"
  };

  // Using steroids.layers.on to communicate between views
  // because postMessage() is currently bugged
  // https://github.com/AppGyver/steroids/issues/619
  steroids.layers.on('willchange', function(event) {
    if (event.target.webview.location == "http://localhost/views/message/new.html"){

      // set navigation bar
      UIInitializer.initNavigationBar("");
      UIInitializer.initNavigationMenuButton();

    }
  });

  $scope.requestSend = function(){
    $scope.form.$setPristine();
    
    if (ConnectionManager.isOnline()) {
      MessageSender.send($scope.message);
      steroids.layers.popAll();  
    } else{
      MessageSender.saveOffline($scope.message);
      steroids.layers.popAll();  
    }
  }

  $scope.cancel = function(){
    steroids.layers.pop();
  }

}]);




messageApp.factory("MessageSender", ['$cordovaToast', 'MessageModel', function($cordovaToast, MessageModel){
  var factory = [];

  factory.send = function(message){
    $cordovaToast.showShortTop('Message envoyé. Nous vous répondrons dans les plus brefs délais.');
  }

  factory.saveOffline = function(message){
    MessageModel.add(message);
    $cordovaToast.showShortTop('Aucune connexion internet active. Le message a été sauvegardée et sera envoyé ultérieurement.');
  }

  factory.sendSavedMessages = function(){
    messages = MessageModel.getAll();
    if (messages.length > 0){
      MessageModel.empty();
      $cordovaToast.showShortTop('Une plainte précédemment sauvegardée (hors ligne) a été envoyée.');
    }
  }



  return factory;

}])
