angular.module('steroidsBridge', ['ngCordova', 'LocalStorageModule'])
  .factory('UIInitializer', function() {

    var initNavigationBar = function (title) {
      steroids.view.navigationBar.show(title);
      steroids.view.setBackgroundColor("#FFFFFF");
    };

    var initNavigationMenuButton = function() {
      var menuButton = new steroids.buttons.NavigationBarButton();
      menuButton.imagePath = "icons/navicon-round.png";
      menuButton.imageAsOriginal = "false";
      menuButton.onTap = function() { 
          steroids.drawers.show( {
            edge: steroids.screen.edges.RIGHT
          })
      }



      steroids.view.navigationBar.update({
          overrideBackButton: false,
          buttons: {
            right: [menuButton],
            overrideBackButton: false
          }
      });

    }


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
      }, {
        onSuccess: function() {
          //steroids.logger.log("Drawer successfully updated!");
        },
        onFailure: function() {
          //steroids.logger.log("Could not update drawer.");
        }
      });

    }

    return {
      initNavigationBar: initNavigationBar,
      initNavigationMenuButton: initNavigationMenuButton,
      initDrawers : initDrawers
    };

  }).factory('ViewManager', function(localStorageService){
    var transitionComplete = true;
    localStorageService.set("lastLoadedViewLocation", "none");

    // Sauvegarder la dernière vue demandée pour ne pas faire apparaître des
    // vues en double
    steroids.layers.on('willchange', function(event) {
      localStorageService.set("lastLoadedViewLocation", event.target.webview.location);
    });


    var goToLoadedView = function (viewId){

      viewLocation = "http://localhost/views/" + viewId + ".html";

      if (localStorageService.get("lastLoadedViewLocation").replace(/\/$/, "") != viewLocation.replace(/\/$/, "")){

        webView = new steroids.views.WebView({
          location: viewLocation,
          id: viewId
        });  

        // Ne pas charger une vue avant que la transition soit terminée
        if (transitionComplete){
          transitionComplete = false;
          steroids.layers.push({view:webView},{onSuccess:function(){transitionComplete = true;}, onFailure:function(error){console.log(error)}}); 
        }
      }

    };



    var preloadViews = function(views) {
      views.some(function(v, i) {
        preloadView(v);
      });
    };

    var preloadView = function(viewId){
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

  }).factory('CameraManager', ['$cordovaCamera', 'Helpers', '$timeout', function($cordovaCamera, Helpers, $timeout){


    var takePicture = function(callback){
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


    var browsePicture = function(callback){
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


    var saveImage = function(options, callback){
      Helpers.cordovaCallbackFix("Photo");

      navigator.camera.getPicture(gotPicture, fileError, options);
      //Helpers.cordovaCallbackFix("saveImage")
      function gotPicture(imageURI){
        // Move the file
        //Helpers.cordovaCallbackFix("beforeTimeout")
        $timeout(function(){
          //Helpers.cordovaCallbackFix("aftertimeout")
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
            //Helpers.cordovaCallbackFix("request")
            window.resolveLocalFileSystemURL(imageURI, function(file) {
              var d = new Date();
              var n = d.getTime();
              var e = ".jpg";
              var fileName = n + e;

              var targetDirURI = "file://" + steroids.app.absoluteUserFilesPath;

              fileSys.root.getDirectory(steroids.app.absoluteUserFilesPath, {create: true}, function(dir) {
                //Helpers.cordovaCallbackFix("createDirectory")
                window.resolveLocalFileSystemURL(targetDirURI, function(directory) {
                  //Helpers.cordovaCallbackFix("resolveDir")
                  file.moveTo(directory, fileName, function(movedFile){
                    //Helpers.cordovaCallbackFix("moveFile")
                    callback("/" + movedFile.name);
                  }, fileError);
                }, fileError);
              })
            });
          });
        }, 350);
      }

      function fileError(error){
        console.log(error);
      }

    }




    return {
      takePicture : takePicture,
      browsePicture : browsePicture
    }


  }]).factory('Helpers', function($cordovaToast){

    var cordovaCallbackFix = function(msg){
      $cordovaToast.showShortTop(msg).then(function(success) {
        // success
      }, function (error) {
        // error
      });
    }

    return {
      cordovaCallbackFix : cordovaCallbackFix
    }


  }).factory("ConnectionManager", function(localStorageService, $rootScope, $timeout){

    localStorageService.set("online", "");
    var connectionManager = [];
    var offlineFnCallBuffer = false;
    var onlineFnCallBuffer = false;



    connectionManager.onOffline = function() {
      if (localStorageService.get("online") != false && !offlineFnCallBuffer) { 
        offlineFnCallBuffer = true;
        localStorageService.set("online", false);
        $rootScope.$broadcast('online', false);

        $timeout(function(){
          offlineFnCallBuffer = false;
        }, 500)

      }
    }

    connectionManager.onOnline = function(){
      if (localStorageService.get("online") != true && !onlineFnCallBuffer) {
        onlineFnCallBuffer = true;
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
