/**
* @class angular_module.carApp.NewCtrl
* @classdesc Contrôleur pour la vue de détails d'une voiture
*/
carApp.controller('NewCtrl', ['
  UIInitializer', 
  '$scope', 
  'CarModel', 
  '$filter', 
  'ViewManager', 
  '$cordovaDialogs', 
  'Helpers', 
  '$cordovaToast', 
  'CameraManager', 
  function (UIInitializer, $scope, CarModel, $filter, ViewManager, $cordovaDialogs, Helpers, $cordovaToast, CameraManager) {
    
    /* Réinitialiser le modèle voiture */
    $scope.car = CarModel.defaultCar();

   /**
    * @name this.messageReceived
    * @function
    * @memberOf angular_module.carApp.IndexCtrl
    * @description Méthode appelée en callback lorsqu'un window.postMessage est reçu
    * @param {Object} event
    */
    this.messageReceived = function(event) {
      
      /* Si la vue est appelée à partir du menu latéral, on doit faire afficher ces éléments UI natifs manuellement */
      if (event.data.action == "openFromDrawer" && event.data.viewId == "newCar"){
        UIInitializer.initNavigationBar('Nouveau véhicule');
        UIInitializer.initNavigationMenuButton();
      }
    }

    /* Écoute des messages (window.postMessage) */
    window.addEventListener("message", this.messageReceived);


    /**
    * @name $scope.requestCreate
    * @function
    * @memberOf angular_module.carApp.NewCtrl
    * @description Demande de crer un nouveau véhicule
    */  
    $scope.requestCreate = function(){
      CarModel.create($scope.car, $scope.onCarCreateSuccess);
    };

    /**
    * @name $scope.requestCamera
    * @function
    * @memberOf angular_module.carApp.NewCtrl
    * @description Demande de démarrer la caméra de l'appareil
    */  
    $scope.requestCamera = function(){
      CameraManager.takePicture($scope.imageReceived);
      return false;
    }

    /**
    * @name $scope.requestFileBrowser
    * @function
    * @memberOf angular_module.carApp.NewCtrl
    * @description Demande de démarrer l'explorateur de fichiers de l'appareil
    */  
    $scope.requestFileBrowser = function(){
      CameraManager.browsePicture($scope.imageReceived); 
    }


    /**
    * @name $scope.imageReceived
    * @function
    * @memberOf angular_module.carApp.NewCtrl
    * @description Callback appelé lorsque l'utilisateur à sélectionné une image
    * @param {string} imageURL - emplacement de l'image sélectionnée
    */  
    $scope.imageReceived = function(imageURL){
      $scope.car.imageURL = imageURL;
      $scope.$apply();
    }


    /**
    * @name $scope.onCarCreateSuccess
    * @function
    * @memberOf angular_module.carApp.NewCtrl
    * @description Callback appelé lorsque la voiture a été créé avec succès
    * @param {Object} car - Objet représentant le véhicule créé
    */  
    $scope.onCarCreateSuccess = function(car){
      /* Une fois le véhicule créé, on réinialise le modèle véhicule pour la création éventuelle d'une autre voiture */
      $scope.car = CarModel.defaultCar();

      /* Retour à l'index des véhicules */
      steroids.layers.pop(); 

      /* Rafraîchissement du véhicule nouvellement créé */
      window.postMessage({
        action: "refreshCarById",
        carId : car.id
      });

      $cordovaToast.showShortTop('Véhicule créé');

      /* Réinitialisation du formulaire */
      $scope.form.$setPristine();
    };


    /**
    * @name $scope.cancel
    * @function
    * @memberOf angular_module.carApp.NewCtrl
    * @description L'utilisateur a annulé la création d'un véhicule
    */  
    $scope.cancel = function(id) {
      steroids.layers.pop(); 
    };


  }
]);
