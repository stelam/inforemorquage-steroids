// The contents of individual model .js files will be concatenated into dist/models.js

(function() {

// Protects views where AngularJS is not loaded from errors
if ( typeof angular == 'undefined' ) {
	return;
};


/**
* @class angular_module.TowingModelApp
* @memberOf angular_module
* 
* Module contenant le modèle pour un remorquage
*/
var module = angular.module('TowingModelApp', ['restangular', 'LocalStorageModule', 'webserviceApp']);


/**
* @class angular_module.TowingModelApp.TowingModel
* @classdesc Service pour le modèle des remorquages
*/
module.factory('TowingModel', function(localStorageService, inforemorquageWebService, $q, $http){
  var factory = [];


 /**
  * @name requestStatus
  * @function
  * @class angular_module.TowingModelApp.TowingModel
  * @description Fait un appel au webservice en lui envoyant le numéro de plaque à chercher
  * @param {String} registration - Numéro de plaque à utiliser comme index
  * @returns {String|Object} - La réponse en json, ou un objet d'erreur
  */
	factory.requestStatus = function(registration){
    var deferred = $q.defer();

    inforemorquageWebService.getTowingJsonByRegistration(registration).then(function(towingJson){
      deferred.resolve(towingJson);
    }, function(error){
      deferred.reject(error);
    })

		return deferred.promise;
	}


 /**
  * @name exists
  * @function
  * @class angular_module.TowingModelApp.TowingModel
  * @description Vérifie si un remorquage existe déjà dans un ensemble de remorquages
  * @param {Object} towing - L'objet remorquage à vérifier
  * @param {Array} towings - Tableau qui contient l'ensemble de remorquages à travers lesquels il faut chercher
  * @returns {Boolean} - false : le remorquage n'existe pas, true : le remorquage existe
  */
  factory.exists = function(towing, towings){
    var exists = false;
    towings.some(function(t){
      if (JSON.stringify(towing) === JSON.stringify(t) || towing == null)
        exists = true;
    })
    return exists;
  }

 /**
  * @name getLatest
  * @function
  * @class angular_module.TowingModelApp.TowingModel
  * @description Obtient le dernier remorquage actif (statut 0) d'un ensemble de remorquages. 
  *     Prend pour acquis que les remorquages ont été ajoutés de façon chronologique
  * @param {Array} towings - Tableau qui contient l'ensemble de remorquages
  * @returns {Object|Boolean} - L'objet remorquage, ou false si aucun remorquage actif a été trouvé
  */
  factory.getLatest = function(towings){
    var latest = false;
    towings.some(function(t){
      if (t.remorquage.statutReponse == 0)
        latest = t;
    })

    return latest;
  }

 /**
  * @name getDateObject
  * @function
  * @class angular_module.TowingModelApp.TowingModel
  * @description Convertie la dates (formattée en json) d'un objet remorquage, en objet Date générique de javascript
  * @param {Object} towing - L'objet remorquage
  * @returns {Date} - L'objet Date généré à partir de la date de remorquage
  */
  factory.getDateObject = function(towing){
    var jsonDate = towing.remorquage.dateRemorquage.date;
    return new Date(jsonDate.annee + "-" + jsonDate.mois + "-" + jsonDate.jour);
  }



 /**
  * @name isInElligiblePeriod
  * @function
  * @class angular_module.TowingModelApp.TowingModel
  * @description Vérifie si un remorquage s'est effectué à une date pertinente. Par exemple, il n'est pas pertinent
  *   d'afficher un remorquage qui s'est effectué il y a 3 ans. C'est que, dès qu'une voiture se fait remorqué, le service web
  *   de la Ville affiche un statut remorqué (0) pour le restant de l'éternité.
  * @param {Object} towing - L'objet remorquage à valider
  * @returns {Boolean} - false : le memorquage n'est pas elligible, true : le remorquage est elligible
  */
  factory.isInElligiblePeriod = function(towing){
    if (towing.remorquage.statutReponse == 1)
      return false;

    var maxPastDate = new Date();

    /* la durée elligible a été hardcodée pour l'instant, car elle n'a pas encore été officiellement déterminée */
    maxPastDate = addMonths(maxPastDate, -9);
    function addMonths(date, months) {
        date.setMonth(date.getMonth() + months);
        return date;
    }

    return factory.getDateObject(towing) > maxPastDate;
  }

  return factory;

})

})();
