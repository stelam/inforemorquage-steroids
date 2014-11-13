
angular.module('mainApp', ['ngTouch', 'steroidsBridge'])
  .controller('MainAppController', function($scope) {

  })


  .service("drawerOpenPageService", function(ViewManager){
    this.messageReceived = function(event) {

      if (event.data.action == "openFromDrawer"){
        //steroids.layers.popAll();
        ViewManager.goToLoadedView(event.data.viewId);
      }
      else if (event.data.action == "popAll"){
        steroids.layers.popAll();
      }
    }

    window.addEventListener("message", this.messageReceived);
  })
