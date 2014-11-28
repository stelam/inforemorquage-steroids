/**
* @class angular_module.webserviceApp
* @memberOf angular_module    
*
* Module qui gère les appels au webservice
*/
angular.module('webserviceApp', ['ngTouch'])



  /**
  * @class angular_module.webserviceApp
  * @classdesc Service pour créer les requêtes
  */
  .factory("requestFactory", function($http, $q, $timeout){
    var factory = [];

   /**
    * @name getXml
    * @function
    * @memberOf angular_module.webserviceApp.requestFactory
    * @description Effectue ûne requête http au service web et la réponse
    * @param {string} url - Adresse où le service web est accessible
    */
    factory.getXml = function(url){
      var deferred = $q.defer();

      /* On doit passer par un proxy CORS
         parce que Steroids effectue ses requêtes http à partir
         de localhost et non du protocole file://. Conséquemment,
         CORS est très strict. */
      var corsProxyUrl = "www.corsproxy.com/";


      $timeout(function(){
        var xml;
        $http.get(url.replace("//", "//" + corsProxyUrl)).

        success(function(data, status, headers, config){
          deferred.resolve(data);
        }).

        error(function(data, status, headers, config) {
          /* On pourrait utiliser les interceptors d'Angular */
          deferred.reject(status);
        });

      }, 100);


      return deferred.promise;
    }



   /**
    * @name getJsonFromXml
    * @function
    * @memberOf angular_module.webserviceApp.requestFactory
    * @description Effectue l'appel à un webservice et retourne la réponse XML en format json
    * @param {string} url - Adresse où le service web est accessible
    */
    factory.getJsonFromXml = function(url){
      var deferred = $q.defer();

      factory.getXml(url).then(function(xmlObject){
        var x2js = new X2JS();
        deferred.resolve(x2js.xml_str2json(xmlObject));
      }, function(error){
        deferred.reject(error);
      })

      return deferred.promise;
    }


    return factory;
  })


  /**
  * @class angular_module.webserviceApp
  * @classdesc Service pour gérer les requêtes au webservice d'inforemorquage
  */
  .service("inforemorquageWebService", function(requestFactory, $q){

   /**
    * @name getTowingJsonByRegistration
    * @function
    * @memberOf angular_module.webserviceApp.inforemorquageWebService
    * @description Demande la requête au webservice d'inforemorquage
    * @param {string} registration - Plaque d'immatriculation à vérifier (caractères alpha numériques seulement)
    */
    this.getTowingJsonByRegistration = function(registration){

      var deferred = $q.defer();
      url = "http://servicesenligne.ville.montreal.qc.ca/sel/info/remorquage/ServletRechercheXML?param1=" + registration

      requestFactory.getJsonFromXml(url).then(function(towingJson){
        deferred.resolve(towingJson)
      }, function(error){
        deferred.reject(error);
      })

      return deferred.promise;

    }
  })
