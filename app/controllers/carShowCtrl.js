/**
* @class angular_module.carApp.ShowCtrl
* @classdesc Contrôleur pour la vue de détails d'une voiture
*/
carApp.controller('ShowCtrl', [
  'UIInitializer', 
  '$scope', 
  'CarModel', 
  '$filter', 
  'ViewManager', 
  '$location', 
  '$cordovaDialogs', 
  '$cordovaToast', 
  'CameraManager', 
  'Helpers', 
  function (UIInitializer, $scope, CarModel, $filter, ViewManager, $location, $cordovaDialogs, $cordovaToast, CameraManager, Helpers) {

    /**
    * @description Event listener de l'événement 'willchange' sur steroids.layers.
    *   Using steroids.layers.on to communicate between views
    *   because postMessage() is currently bugged :
    *   https://github.com/AppGyver/steroids/issues/619
    */
    steroids.layers.on('willchange', function(event) {
      /* Si on sort de la vue de détails d'une voiture */
      if (event.target.webview.location != "http://localhost/views/car/show.html"){
        /* On réinitialise le modèle*/
        $scope.car = CarModel.emptyCar();
        $scope.$apply();

      /* Sinon, si la vue qui vient de s'afficher correspond à la vue de détails d'une voiture*/
      } else {

        /* Chargement de la voiture demandée */
        $scope.car = CarModel.getRequestedCar();
        $scope.cars = CarModel.getAll();

        /* Vérification de son état */
        $scope.car.towed = CarModel.isTowed($scope.car);
        $scope.towing = $scope.car.towings[$scope.car.towings.length - 1];

        /* Configuration des éléments UI natifs */
        UIInitializer.initNavigationBar($scope.car.name);
        UIInitializer.initNavigationMenuButton();

        /* Garder en mémoire la dernière voiture demandée */
        CarModel.setRequestedCar($scope.car);

        /* Réinitialisation du formulaire */
        $scope.form.$setPristine();

        $scope.$apply();


        /* On s'assure que l'état du véhicule est toujours actuel */
        CarModel.updateCarTowingStatus($scope.cars, $scope.car).then(function(cars){
          CarModel.setRequestedCar($scope.car);
          $scope.car.towed = CarModel.isTowed($scope.car);
          $scope.towing = CarModel.getLatestTowing($scope.car);
        })
      }
    });
    


    /**
    * @name $scope.requestDelete
    * @function
    * @memberOf angular_module.carApp.ShowCtrl
    * @description Demande de suppression d'un véhicule
    */
    $scope.requestDelete = function(){

      /*Les dialogues confirm sont présentement problématiques
        http://stackoverflow.com/questions/22410659/cordova-on-android-navigator-notification-confirm-callbacks-stuck-in-queue
        (les callbacks sont appelés de façon inconstante)*/
      $cordovaDialogs.confirm('Êtes-vous certain(e) de vouloir supprimer ce véhicule?', 'Suppression', ['Nah','Oui'])
        .then(function(buttonIndex) {
          if (buttonIndex == 2) /* l'index 2 correspond à 'Oui' */
            $scope.delete();
        });
    }


    /**
    * @name $scope.delete
    * @function
    * @memberOf angular_module.carApp.ShowCtrl
    * @description Suppression du véhicule présentement dans le $scope ($scope.car)
    */  
    $scope.delete = function(){
      CarModel.removeById($scope.car.id);

      /* J'aurais pu utilisé une promise au lieu d'un callback. Je ne connaisais pas encore les promise à ce moment.*/
      $scope.onDeleteSuccess(); 
      $cordovaToast.showShortTop('Véhicule supprimé');
    }


    /**
    * @name $scope.requestSave
    * @function
    * @memberOf angular_module.carApp.ShowCtrl
    * @description Demande de sauvegarde pour le véhicule présentement dans le $scope ($scope.car)
    */  
    $scope.requestSave = function(){
      CarModel.save($scope.car).then(function(car){
        steroids.layers.pop(); 
        $cordovaToast.showShortTop('Véhicule enregistré');

        /* Après la sauvegarde, on rafraîchit la voiture sauvegardée dans l'index*/
        window.postMessage({
          action: "refreshCarById",
          carId : car.id
        });
      });
    }


    /**
    * @name $scope.showTowing
    * @function
    * @memberOf angular_module.carApp.ShowCtrl
    * @description Fait apparaître la vue de détails d'un remorquage de la voiture en cours
    */  
    $scope.showTowing = function(){
      ViewManager.goToLoadedView("towing/show");
    }


    /**
    * @name $scope.requestCamera
    * @function
    * @memberOf angular_module.carApp.ShowCtrl
    * @description Demande d'utilisation de la caméra
    */  
    $scope.requestCamera = function(){
      CameraManager.takePicture($scope.imageReceived);
      return false;
    }

    /**
    * @name $scope.requestFileBrowser
    * @function
    * @memberOf angular_module.carApp.ShowCtrl
    * @description Demande de parcour de fichiers
    */  
    $scope.requestFileBrowser = function(){
      CameraManager.browsePicture($scope.imageReceived); 
    }

    /**
    * @name $scope.imageReceived
    * @function
    * @memberOf angular_module.carApp.ShowCtrl
    * @description Callback appelé lorsqu'une image est sélectionnée par l'utilisateur
    * @param {string} imageURL - l'url où se trouve l'image reçue
    */  
    $scope.imageReceived = function(imageURL){
      $scope.car.imageURL = imageURL;
      $scope.$apply();
    }


    /**
    * @name $scope.onDeleteSuccess
    * @function
    * @memberOf angular_module.carApp.ShowCtrl
    * @description Callback appelé lorsqu'un véhicule est supprimé
    */  
    $scope.onDeleteSuccess = function(){
      steroids.layers.pop(); 
      window.postMessage({
        action: "refreshCars"
      });
      $cordovaToast.showShortTop('Véhicule supprimé');
    }

  }
]);
