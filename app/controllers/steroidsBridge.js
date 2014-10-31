angular.module('steroidsBridge', ['ngCordova'])
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

    };



    return {
      initNavigationBar: initNavigationBar,
      initNavigationMenuButton: initNavigationMenuButton
    };

  }).factory('ViewManager', function(){
    var transitionComplete = true;

    var goToLoadedView = function (viewLocation, viewId){
      webView = new steroids.views.WebView({
        location: viewLocation,
        id: viewId
      });  

      if (transitionComplete){
        transitionComplete = false;
        steroids.layers.push({view:webView},{onSuccess:function(){transitionComplete = true}, onFailure:function(error){console.log(error)}}); 
      }

    };

    var goHome = function (){
      this.goToLoadedView("/views/car/index.html", "dashboard");
    }


    return {
      goToLoadedView: goToLoadedView,
      goHome: goHome,
    }

  }).factory('CameraManager', function($cordovaCamera){


    var takePicture = function(callback){
      var options = { 
          quality : 50, 
          destinationType : Camera.DestinationType.FILE_URI, 
          sourceType : Camera.PictureSourceType.CAMERA, 
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          saveToPhotoAlbum: false
      };

      saveImage(options, callback);
    }


    var browsePicture = function(callback){
      var options = { 
          quality : 50, 
          destinationType : Camera.DestinationType.FILE_URI, 
          sourceType : Camera.PictureSourceType.PHOTOLIBRARY, 
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          saveToPhotoAlbum: false
      };

      saveImage(options, callback);
    }


    var saveImage = function(options, callback){
      $cordovaCamera.getPicture(options).then(function(imageURI) {
        // Move the file

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
          window.resolveLocalFileSystemURL(imageURI, function(file) {
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


        fileError = function(error){
          console.log(error);
        }

      }, function(err) {
        // An error occured. Show a message to the user
        return false;
      });
    }


    return {
      takePicture : takePicture,
      browsePicture : browsePicture
    }
  })

