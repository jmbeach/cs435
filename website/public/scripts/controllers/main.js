//#region DEFINITION
var master = angular.module('master', ['ui.bootstrap', 'ngRoute', 'ngAnimate', 'ui.router', 'vcRecaptcha']);
//#endregion

// #region ROUTING
master.config(['$urlMatcherFactoryProvider', '$routeProvider', '$locationProvider', '$stateProvider',
  function ($urlMatcherFactory, $routeProvider, $locationProvider, $stateProvider) {
      $urlMatcherFactory.caseInsensitive(true);
      $urlMatcherFactory.strictMode(false);
      $locationProvider.html5Mode({
          enabled: true
      });
      $stateProvider
          // #region DEFAULT
        .state(
          "Default", {
              url: "/",
              views: {
                  "master": {
                      templateUrl: 'views/main.html',
                      controller: 'main',
                      controllerAs: 'main'
                  }

              }
          })
        .state(
          "Project1", {
            url: "/project1",
            views: {
              "master": {
                templateUrl: 'views/project1.html',
                controller: 'main',
                controllerAs: 'main'
              }
            }
          }
        )
        .state(
          "Project2", {
            url: "/project2",
            views: {
              "master": {
                templateUrl: 'views/project2.html',
                controller: "main",
                controllerAs: "main"
              }
            }
          }
        )
          // #endregion
          // #region OTHER_STATE
        //.state(
        //  "template", {
        //      url: "/template",
        //      views: {
        //          "master": {
        //              templateUrl: 'views/template.html',
        //              controller: 'template',
        //              controllerAs: 'template'
        //          }
        //      }
        //  }
        //)
        //.state(
        //  "template.specific", {
        //      url: "/:name",
        //      views: {
        //          "doc@docs": {
        //              templateUrl: 'views/subviews/sub_template.html',
        //              controller: 'template',
        //              controllerAs: 'template'
        //          }
        //      }
        //  }
      //#endregion
      ;
  }
]);
// #endregion

// #CONFIG_MAIN_CONTROLLER
master.controller('body', ['$route', '$routeParams', '$location',
  function ($route, $routeParams, $location) {
      this.$route = $route;
      this.$location = $location;
      this.$routeParams = $routeParams;
  }
]);
function Main() { }
master.controller('main', Main);
// #endregion

//#region MORE_CONTROLLERS
master.controller('nav', Navbar);
//#endregion
