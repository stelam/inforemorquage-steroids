angular.module('steroidsBridge', [])
  .factory('UIInitializer', function() {


    var initNavigationBar = function (title) {
      steroids.view.navigationBar.show(title);
      steroids.view.setBackgroundColor("#FFFFFF");
    };

    var initNavigationMenuButton = function() {
      var menuButton = new steroids.buttons.NavigationBarButton();
      menuButton.imagePath = "/vendor/ionic/icons/png/512/navicon-round.png";
      menuButton.imageAsOriginal = "false";
      menuButton.onTap = function() { 
          steroids.drawers.show( {
            edge: steroids.screen.edges.RIGHT
          })
      }

      steroids.view.navigationBar.update({
          overrideBackButton: false,
          buttons: {
            right: [menuButton]
          }
      });

    };


    return {
      initNavigationBar: initNavigationBar,
      initNavigationMenuButton: initNavigationMenuButton
    };

  }).factory('ViewManager', function(){

    var goToLoadedView = function (viewLocation, viewId){
      console.log(viewLocation + " - " + viewId)
      webView = new steroids.views.WebView({
        location: viewLocation,
        id: viewId
      });  
      steroids.layers.push({view:webView},{onSuccess:function(){}, onFailure:function(error){console.log(error)}});
    };

    var goHome = function (){
      this.goToLoadedView("/views/car/index.html", "dashboard");
    }


    return {
      goToLoadedView: goToLoadedView,
      goHome: goHome
    }

  })