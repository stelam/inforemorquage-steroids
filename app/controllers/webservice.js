
angular.module('webserviceApp', ['ngTouch'])

  .factory("requestFactory", function($http, $q, $timeout){
    var factory = [];

    factory.getXml = function(url){
      var deferred = $q.defer();

      // On doit passer par un proxy CORS
      // parce que Steroids effectue ses requêtes http à partir
      // de localhost et non du protocole file://. Conséquemment,
      // CORS est très strict.
      var corsProxyUrl = "www.corsproxy.com/";

      $timeout(function(){
        deferred.resolve(
          $http.get(url.replace("//", "//" + corsProxyUrl))
        );
      }, 3500);


      return deferred.promise;
    }

    factory.getJsonFromXml = function(url){
      var deferred = $q.defer();

      factory.getXml(url).then(function(xmlObject){
        var x2js = new X2JS();
        deferred.resolve(x2js.xml_str2json(xmlObject.data));
      })

      return deferred.promise;
    }


    return factory;
  })

  .service("inforemorquageWebService", function(requestFactory, $q){

    this.getTowingJsonByRegistration = function(registration){

      var deferred = $q.defer();
      url = "http://servicesenligne.ville.montreal.qc.ca/sel/info/remorquage/ServletRechercheXML?param1=" + registration

      requestFactory.getJsonFromXml(url).then(function(towingJson){
        deferred.resolve(towingJson)
      })

      return deferred.promise;

    }
  })
