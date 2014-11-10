# For an explanation of the steroids.config properties, see the guide at
# http://guides.appgyver.com/steroids/guides/project_configuration/config-application-coffee/

steroids.config.name = "blank"

# ## Start Location
steroids.config.location = "http://localhost/index.html"

# ## Tab Bar
# steroids.config.tabBar.enabled = true
# steroids.config.tabBar.tabs = [
#   {
#     id: "index"
#     title: "Index"
#     icon: "icons/pill@2x.png"
#     location: "http://localhost/index.html"
#   },
#   {
#     id: "internet"
#     title: "Internet"
#     icon: "icons/telescope@2x.png"
#     location: "http://www.google.com"
#   }
# ]

# ## Preloads
# steroids.config.preloads = [
#   {
#     id: "google"
#     location: "http://www.google.com"
#   }
# ]

# ## Drawers
# steroids.config.drawers =
#   left:
#     id: "leftDrawer"
#     location: "http://localhost/leftDrawer.html"
#     showOnAppLoad: true
#     widthOfDrawerInPixels: 200
#   right:
#     id: "rightDrawer"
#     location: "http://localhost/rightDrawer.html"
#     showOnAppLoad: false
#     widthOfDrawerInPixels: 200
#   options:
#     centerViewInteractionMode: "Full"
#     closeGestures: ["PanNavBar", "PanCenterView", "TapCenterView"]
#     openGestures: ["PanNavBar", "PanCenterView"]
#     showShadow: true
#     stretchDrawer: true
#     widthOfLayerInPixels: 0

# ## Initial View
# steroids.config.initialView =
#   id: "initialView"
#   location: "http://localhost/initialView.html"

# ## Android Loading Screen
steroids.config.loadingScreen.tintColor = "#262626"

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
