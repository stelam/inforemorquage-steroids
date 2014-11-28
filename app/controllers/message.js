/**
* @class angular_module.messageApp
* @memberOf angular_module    
*/
var messageApp = angular.module('messageApp', [
  'ngTouch', 
  'TowingModelApp', 
  'mainApp', 
  'steroidsBridge', 
  'CarModelApp', 
  'ngCordova', 
  'MessageModelApp'
]);



/**
* @class angular_module.menuDrawerApp.MethodsCtrl
* @classdesc Contrôleur pour l'affichage des méthodes de communication pour les plaintes
*/
messageApp.controller('MethodsCtrl', [
  '$scope', 
  '$filter', 
  'CarModel', 
  'TowingModel', 
  'UIInitializer', 
  'Helpers', 
  'ViewManager', function ($scope, $filter, CarModel, TowingModel, UIInitializer, Helpers, ViewManager) {

    /**
    * @description Event listener de l'événement 'willchange' sur steroids.layers.
    *   Using steroids.layers.on to communicate between views
    *   because postMessage() is currently bugged :
    *   https://github.com/AppGyver/steroids/issues/619
    */
    steroids.layers.on('willchange', function(event) {
      if (event.target.webview.location == "http://localhost/views/message/methods.html"){
        /* Configuration des éléments UI natifs */
        UIInitializer.initNavigationBar("");
        UIInitializer.initNavigationMenuButton();
      }
    });
    

    /**
    * @name $scope.openMessageForm
    * @function
    * @memberOf angular_module.messageApp.MethodsCtrl
    * @description Affiche la webView pour composer un nouveau message
    */  
    $scope.openMessageForm = function(){
      ViewManager.goToLoadedView("message/new");
    }
  }

]);


/**
* @class angular_module.menuDrawerApp.NewCtrl
* @classdesc Contrôleur pour la création d'un nouveau message
*/
messageApp.controller('NewCtrl', [
  '$scope', 
  '$filter', 
  'CarModel', 
  'TowingModel', 
  'UIInitializer', 
  'Helpers', 
  'ViewManager', 
  'ConnectionManager', 
  'MessageSender', 
  '$cordovaToast',
  function ($scope, $filter, CarModel, TowingModel, UIInitializer, Helpers, ViewManager, ConnectionManager, MessageSender, $cordovaToast) {

    /* Pour DEV/TEST : Pré remplissage d'un message bidon */
    $scope.message = {
      body : "Exemple de message",
      authorEmail : "exemple@email.com"
    };

    /**
    * @description Event listener de l'événement 'willchange' sur steroids.layers.
    *   Using steroids.layers.on to communicate between views
    *   because postMessage() is currently bugged :
    *   https://github.com/AppGyver/steroids/issues/619
    */
    steroids.layers.on('willchange', function(event) {
      if (event.target.webview.location == "http://localhost/views/message/new.html"){
        /* Configuration des éléments UI natifs */
        UIInitializer.initNavigationBar("");
        UIInitializer.initNavigationMenuButton();
      }
    });

    /**
    * @name $scope.requestSend
    * @function
    * @memberOf angular_module.messageApp.NewCtrl
    * @description Demande d'envoi pour un nouveau message
    */  
    $scope.requestSend = function(){

      /* Réinitialisation du formulaire */
      $scope.form.$setPristine();
      
      /* Si l'application a accès à l'internet */
      if (ConnectionManager.isOnline()) {
        /* On envoie le message */
        MessageSender.send($scope.message).then(function(){
          $cordovaToast.showShortTop('Message envoyé. Nous vous répondrons dans les plus brefs délais.');
        });
        steroids.layers.popAll();  
      } else{
        /* Sinon, on enregistre le message pour l'envoyer plus tard */
        MessageSender.saveOffline($scope.message).then(function(){
          $cordovaToast.showLongTop('Aucune connexion internet active. Le message a été sauvegardée et sera envoyé ultérieurement.');
        })
        steroids.layers.popAll();  
      }
    }

    /**
    * @name $scope.cancel
    * @function
    * @memberOf angular_module.messageApp.NewCtrl
    * @description L'utilisateur a annulé la création d'un nouveau message
    */  
    $scope.cancel = function(){
      steroids.layers.pop();
    }

  }
]);



/**
* @class angular_module.menuDrawerApp.MessageSender
* @classdesc Service Angular pour gérer l'envoi de messages
*/
messageApp.factory("MessageSender", ['MessageModel', '$q', function(MessageModel, $q){
  var factory = [];

  /**
  * @name factory.send
  * @function
  * @memberOf angular_module.messageApp.MessageSender
  * @description Envoi fictif de message
  * @param {Object} message - Objet représentant le message à envoyer
  */  
  factory.send = function(message){
    var deferred = $q.defer();
    deferred.resolve(true);
    return deferred.promise;
  }


  /**
  * @name factory.saveOffline
  * @function
  * @memberOf angular_module.messageApp.MessageSender
  * @description Sauvegarde du message hors-ligne pour l'envoyer plus tard
  * @param {Object} message - Objet représentant le message à sauvegarder
  */  
  factory.saveOffline = function(message){
    MessageModel.add(message);
    var deferred = $q.defer();
    deferred.resolve(true);
    return deferred.promise;
  }

  /**
  * @name factory.sendSavedMessages
  * @function
  * @memberOf angular_module.messageApp.MessageSender
  * @description Envoi fictif des messages sauvegardés
  */ 
  factory.sendSavedMessages = function(){
    messages = MessageModel.getAll();
    var deferred = $q.defer();
    if (messages.length > 0){
      MessageModel.empty();
      deferred.resolve(true);
    } else {
      deferred.reject("no message");
    }

    return deferred.promise;
  }

  return factory;

}])
