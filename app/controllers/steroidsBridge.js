/**
* @class angular_module.steroidsBridge
* @memberOf angular_module    
* 
* Ce module permet de faciliter les appels à l'API de Steroids.js
*/
angular.module('steroidsBridge', ['ngCordova', 'LocalStorageModule'])

  /**
  * @class angular_module.steroidsBridge.UIInitializer
  * @classdesc Service pour initialiser les éléments d'interface natifs
  */
  .factory('UIInitializer', function() {


   /**
    * @name initNavigationBar
    * @function
    * @memberOf angular_module.steroidsBridge.UIInitializer
    * @description Initialise la barre d'entête
    * @param {string} title - Titre à afficher dans la barre
    */
    var initNavigationBar = function (title) {
      steroids.view.navigationBar.show(title);
      steroids.view.setBackgroundColor("#FFFFFF");
    };


   /**
    * @name initNavigationMenuButton
    * @function
    * @memberOf angular_module.steroidsBridge.UIInitializer
    * @description Initialise le bouton qui fait apparaître le menu latéral
    */
    var initNavigationMenuButton = function() {
      var menuButton = new steroids.buttons.NavigationBarButton();
      menuButton.imagePath = "icons/navicon-round.png";
      menuButton.imageAsOriginal = "false";
      menuButton.onTap = function() { 
          steroids.drawers.show( {
            edge: steroids.screen.edges.RIGHT
          })
      }

      /* Activer le bouton en appelant la méthode update() de navigationBar */
      steroids.view.navigationBar.update({
          overrideBackButton: false,
          buttons: {
            right: [menuButton],
            overrideBackButton: false
          }
      });
    }


   /**
    * @name initDrawers
    * @function
    * @memberOf angular_module.steroidsBridge.UIInitializer
    * @description Initialise l'élément Drawer pour le menu latéral
    */
    var initDrawers = function(){
      steroids.drawers.update({
        options: {
          showShadow: true,
          stretchDrawer: true,
          centerViewInteractionMode: "Full",
          animation: steroids.drawers.defaultAnimations.PARALLAX,
          openGestures: ["PanNavBar", "PanBezelCenterView"],
          closeGestures: ["PanNavBar", "PanBezelCenterView", "TapCenterView"]
        }
      })
    }

    /* Retourne les méthode accessibles publiquement */
    return {
      initNavigationBar: initNavigationBar,
      initNavigationMenuButton: initNavigationMenuButton,
      initDrawers : initDrawers
    };

  })


  /**
  * @class angular_module.steroidsBridge.ViewManager
  * @classdesc Service pour gérer les webViews
  */
  .factory('ViewManager', function(localStorageService){
    var transitionComplete = true;

    /* Sauvegarder la dernière vue demandée pour ne pas faire apparaître des vues en double  */
    localStorageService.set("lastLoadedViewLocation", "none");
    steroids.layers.on('willchange', function(event) {
      localStorageService.set("lastLoadedViewLocation", event.target.webview.location);
    });



   /**
    * @name goToLoadedView
    * @function
    * @memberOf angular_module.steroidsBridge.ViewManager
    * @description affiche une webView préloadée
    * @param {string} viewId - L'identifiant de la webView à afficher
    */
    var goToLoadedView = function (viewId){

      viewLocation = "http://localhost/views/" + viewId + ".html";

      /* On s'assure que la webview demandée n'est pas celle qui est présentement affichée */
      if (localStorageService.get("lastLoadedViewLocation").replace(/\/$/, "") != viewLocation.replace(/\/$/, "")){

        webView = new steroids.views.WebView({
          location: viewLocation,
          id: viewId
        });  

        /* Ne pas charger une vue avant que la transition soit terminée */
        if (transitionComplete){
          transitionComplete = false;
          steroids.layers.push({view:webView},{onSuccess:function(){transitionComplete = true;}, onFailure:function(error){console.log(error)}}); 
        }
      }

    };


   /**
    * @name preloadViews
    * @function
    * @memberOf angular_module.steroidsBridge.ViewManager
    * @description pré-charge des webviews
    * @param {Array} views - Un tableau contenant des objets de type webView
    */
    var preloadViews = function(views) {
      views.some(function(v, i) {
        preloadView(v);
      });
    };


   /**
    * @name preloadView
    * @function
    * @memberOf angular_module.steroidsBridge.ViewManager
    * @description pré-charge une webview
    * @param {string} viewId - L'identifiant de la webView à preloader
    */
    var preloadView = function(viewId){
      /* l'emplacement du template de la vue est construit automatiquement à partir de l'ID */
      viewLocation = "http://localhost/views/" + viewId + ".html";
      webView = new steroids.views.WebView({
        location: viewLocation,
        id: viewId
      });  
      webView.preload();
    }


    return {
      goToLoadedView: goToLoadedView,
      preloadViews: preloadViews
    }

  })


  /**
  * @class angular_module.steroidsBridge.CameraManager
  * @classdesc Service pour gérer la caméra et la sélection d'images sur un appareil
  */
  .factory('CameraManager', ['$cordovaCamera', '$timeout', function($cordovaCamera, $timeout){


   /**
    * @name takePicture
    * @function
    * @memberOf angular_module.steroidsBridge.CameraManager
    * @description Lance la caméra
    * @param {function} callback - Le callback à appeler une fois que l'opération est terminée
    */
    var takePicture = function(callback){
      /* Options par défaut pour la caméra */
      var options = { 
          quality : 80, 
          destinationType : Camera.DestinationType.FILE_URI, 
          sourceType : Camera.PictureSourceType.CAMERA, 
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 600,
          targetHeight: 600,
          saveToPhotoAlbum: false
      };

      saveImage(options, callback);
    }

   /**
    * @name browsePicture
    * @function
    * @memberOf angular_module.steroidsBridge.CameraManager
    * @description Lance l'explorateur de fichiers pour sélectionner une photo
    * @param {function} callback - Le callback à appeler une fois que l'opération est terminée
    */
    var browsePicture = function(callback){
      /* Options par défaut pour l'image choisie */
      var options = { 
          quality : 80, 
          destinationType : Camera.DestinationType.FILE_URI, 
          sourceType : Camera.PictureSourceType.PHOTOLIBRARY, 
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 600,
          targetHeight: 600,
          saveToPhotoAlbum: false
      };

      saveImage(options, callback);
    }


   /**
    * @name saveImage
    * @function
    * @memberOf angular_module.steroidsBridge.CameraManager
    * @description Demande à l'utilisateur de choisir/prendre une photo et l'enregistre sur l'espace disque de l'appareil
    * @param {Object} options - Objet contenant les options pour la méthode getPicture()
    * @param {function} callback - Le callback à appeler une fois que l'opération est terminée
    */
    var saveImage = function(options, callback){

      navigator.camera.getPicture(gotPicture, fileError, options);

      function gotPicture(imageURI){
        /* Un petit délai est utilisé, car Cordova gère parfois mal les appels de camera  */
        $timeout(function(){
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
            window.resolveLocalFileSystemURL(imageURI, function(file) {
              /* La photo est nommée selon le temps actuel */
              var d = new Date();
              var n = d.getTime();
              var e = ".jpg";
              var fileName = n + e;

              var targetDirURI = "file://" + steroids.app.absoluteUserFilesPath;

              fileSys.root.getDirectory(steroids.app.absoluteUserFilesPath, {create: true}, function(dir) {
                window.resolveLocalFileSystemURL(targetDirURI, function(directory) {
                  file.moveTo(directory, fileName, function(movedFile){
                    callback("/" + movedFile.name);
                  }, fileError);
                }, fileError);
              })
            });
          });
        }, 350);
      }

      /* Méthode appelée si une erreur est survenue pendant gotPicture() */
      function fileError(error){
        console.log(error);
      }
    }

    return {
      takePicture : takePicture,
      browsePicture : browsePicture
    }


  }])




  /**
  * @class angular_module.steroidsBridge.ConnectionManager
  * @classdesc Service pour gérer les événements en-ligne, hors-ligne
  */
  .factory("ConnectionManager", function(localStorageService, $rootScope, $timeout){

    localStorageService.set("online", "");
    var connectionManager = [];

    /* Flags créés pour éviter les appels multiples lors des changements d'états */
    var offlineFnCallBuffer = false;
    var onlineFnCallBuffer = false;


   /**
    * @name onOffline
    * @function
    * @memberOf angular_module.steroidsBridge.ConnectionManager
    * @description Méthode appelée lorsque l'application redevient en ligne
    */
    connectionManager.onOffline = function() {
      if (localStorageService.get("online") != false && !offlineFnCallBuffer) { 
        offlineFnCallBuffer = true;
        localStorageService.set("online", false);

        /* On notifie les observateurs */
        $rootScope.$broadcast('online', false);

        $timeout(function(){
          offlineFnCallBuffer = false;
        }, 500)

      }
    }


   /**
    * @name onOnline
    * @function
    * @memberOf angular_module.steroidsBridge.ConnectionManager
    * @description Méthode appelée lorsque l'application devient hors-ligne
    */
    connectionManager.onOnline = function(){
      if (localStorageService.get("online") != true && !onlineFnCallBuffer) {
        onlineFnCallBuffer = true;

        /* On notifie les observateurs */
        $rootScope.$broadcast('online', true); 

        localStorageService.set("online", true);
        $timeout(function(){
          onlineFnCallBuffer = false;
        }, 500)

      }
    }


    connectionManager.isOnline = function(){
      return (localStorageService.get("online") == "true") ? true : false;
    }


    /* Gestionnaires d'événements -> ces événements sont lancés par Cordova */
    connectionManager.addEventListeners = function(){
      document.addEventListener("offline", connectionManager.onOffline, false);
      document.addEventListener("online", connectionManager.onOnline, false);
    }
    connectionManager.removeEventListeners = function(){
      document.removeEventListener("offline", connectionManager.onOffline, false);
      document.removeEventListener("online", connectionManager.onOnline, false); 
    }


    connectionManager.addEventListeners();

    return connectionManager;


  })


  /**
  * @class angular_module.steroidsBridge.drawerOpenPageService
  * @classdesc Service pour gérer l'affichage de webViews à partir du menu latéral (Drawer)
  */
  .service("drawerOpenPageService", function(ViewManager){
    this.messageReceived = function(event) {

      if (event.data.action == "openFromDrawer"){
        ViewManager.goToLoadedView(event.data.viewId);
      }
      else if (event.data.action == "popAll"){
        steroids.layers.popAll();
      }
    }

    window.addEventListener("message", this.messageReceived);
  })
