# For an explanation of the steroids.config properties, see the guide at
# http://guides.appgyver.com/steroids/guides/project_configuration/config-application-coffee/

steroids.config.name = "inforemorquage-steroids"

# ## Start Location
steroids.config.location = "http://localhost/views/car/index.html"

# ## Tab Bar
# steroids.config.tabBar.enabled = true
# steroids.config.tabBar.tabs = [
#   {
#     title: "Index"
#     icon: "icons/pill@2x.png"
#     location: "http://localhost/index.html"
#   },
#   {
#     title: "Internet"
#     icon: "icons/telescope@2x.png"
#     location: "http://www.google.com"
#   }
# ]

# ## Preloads
steroids.config.preloads = [
  {
    id: "car/show"
    location: "http://localhost/views/car/show.html"
  }
  {
    id: "car/new"
    location: "http://localhost/views/car/new.html"
  }
  {
    id: "towing/show"
    location: "http://localhost/views/towing/show.html"
  }
  {
    id: "configuration/index"
    location: "http://localhost/views/configuration/index.html"
  }
  {
    id: "message/methods"
    location: "http://localhost/views/message/methods.html"
  }
  {
    id: "message/new"
    location: "http://localhost/views/message/new.html"
  }

]




# ## Drawers
steroids.config.drawers =
  left:
    id: "leftDrawer"
    location: "http://localhost/leftDrawer.html"
    showOnAppLoad: false
    widthOfDrawerInPixels: 0
  right:
    id: "menuDrawer"
    location: "http://localhost/views/menuDrawer/index.html"
    showOnAppLoad: false
    widthOfDrawerInPixels: 200
  options:
    centerViewInteractionMode: "Full"
    closeGestures: ["PanNavBar", "PanCenterView", "TapCenterView"]
    openGestures: ["PanNavBar", "PanCenterView"]
    showShadow: true
    stretchDrawer: true
    widthOfLayerInPixels: 0

# ## Initial View
# steroids.config.initialView =
#   id: "initialView"
#   location: "http://localhost/initialView.html"

# ## Android Loading Screen
steroids.config.loadingScreen.tintColor = "#FF0000"

# ## iOS Status Bar
steroids.config.statusBar.enabled = true
steroids.config.statusBar.style = "default"

# ## File Watcher
# steroids.config.watch.exclude = ["www/my_excluded_file.js", "www/my_excluded_dir"]

# ## Pre- and Post-Make Hooks
# steroids.config.hooks.preMake.cmd = "echo"
# steroids.config.hooks.preMake.args = ["running yeoman"]
# steroids.config.hooks.postMake.cmd = "echo"
# steroids.config.hooks.postMake.args = ["cleaning up files"]

# ## Default Editor
# steroids.config.editor.cmd = "subl"
# steroids.config.editor.args = ["."]
