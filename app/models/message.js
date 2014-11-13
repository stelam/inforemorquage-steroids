// The contents of individual model .js files will be concatenated into dist/models.js

(function() {

	// Protects views where AngularJS is not loaded from errors
	if ( typeof angular == 'undefined' ) {
		return;
	};


	var module = angular.module('MessageModelApp', ['restangular', 'LocalStorageModule']);

	module.factory('MessageRestangular', function(Restangular) {

	  return Restangular.withConfig(function(RestangularConfigurer) {

	    RestangularConfigurer.setBaseUrl('http://localhost/data');
	    RestangularConfigurer.setRequestSuffix('.json');
	    RestangularConfigurer.setRestangularFields({
	      id: "message_id"
	    });

	  });

	});



	module.factory('MessageModel', ['localStorageService', '$q', function(localStorageService, $q){
		var factory = [];

		factory.getAll = function(){
			factory.empty();
			var messages = localStorageService.get("messages");
			if (!messages || messages == {}) {messages = []}
			return messages;
		}


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

		factory.empty = function(){
			localStorageService.set("messages", []);
		}

		return factory;

	}])


})();
