// The contents of individual model .js files will be concatenated into dist/models.js

(function() {

	// Protects views where AngularJS is not loaded from errors
	if ( typeof angular == 'undefined' ) {
		return;
	};


	/**
	* @class angular_module.MessageModelApp
	* @memberOf angular_module
	* 
	* Module contenant le modèle pour les éléments du menu latéral
	*/
	var module = angular.module('MessageModelApp', ['restangular', 'LocalStorageModule']);



	/**
	* @class angular_module.MessageModelApp.MessageModel
	* @classdesc Service pour le modèle des messages
	*/
	module.factory('MessageModel', ['localStorageService', '$q', function(localStorageService, $q){
		var factory = [];


		factory.getAll = function(){
			var messages = localStorageService.get("messages");
			if (!messages || messages == {}) {messages = []}
			return messages;
		}

	   /**
	    * @name add
	    * @function
	    * @memberOf angular_module.CarModelApp.MessageModel
	    * @description Ajoute un message à la liste de messages (à être envoyés en-ligne)
	    * @param {Object} message - Message à ajouter
	    */
		factory.add = function(message){
			var deferred = $q.defer();
			var messages = factory.getAll()
			var messageId = messages.length + 1;
			message.id = messageId;

			
			messages.push(message);
			localStorageService.set("messages", messages);
			deferred.resolve(true);
	              
			return deferred.promise;
		}


		factory.removeById = function(id){
			messages = factory.getAll();
			var index = 0;
			messages.some(function(m, i) {
				index = i;
				if (m.id == id){
					messages.splice(index,1);
					return true;
				}
			});

			localStorageService.set("messages", message);
			return index;
		}

	   /**
	    * @name empty
	    * @function
	    * @memberOf angular_module.CarModelApp.MessageModel
	    * @description Efface tous les messages du localStorage
	    */
		factory.empty = function(){
			localStorageService.set("messages", []);
		}

		return factory;

	}])


})();
