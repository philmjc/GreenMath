'use strict';

angular.module('cap', ['ui.router', 'ngResource', 'd3Mod', 'ngDialog'])
  .run(function($templateCache, $http) {
    // Cache the views needed for recovery if connection is lost
    $http.get('views/help.html', { cache: $templateCache });
    $http.get('views/cor.html', { cache: $templateCache });
    $http.get('views/intro.html', { cache: $templateCache });
  })
  .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider

            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                    },
                    'content': {
                        templateUrl : 'views/home.html',
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }

            })
            // route for the courses page
            .state('app.courses', {
                url: 'courses',
                views: {
                    'content@': {
                        templateUrl : 'views/courses.html',
                    }
                }
            })
            // route for user's homepage.
            .state('app.user', {
              url: 'user',
              views: {
                'content@': {
                    templateUrl : 'views/user.html',
                    controller  : 'UserController'
                }
              }
            })
            // Main Challenge Module
            .state('app.cor', {
              url: 'cor/:id',
              views: {
                'content@': {
                  templateUrl : 'views/cor.html',
                  controller : 'CorController'
                }
              }
            } )
            // Login
            .state('app.login', {
              url: 'login',
              views: {
                'content@': {
                  templateUrl : 'views/login.html',
                  controller : 'AuthController'
                }
              }
            } )

            // Help
            .state('app.help', {
              url: 'help',
              views: {
                'content@': {
                  templateUrl : 'views/help.html',
                  controller : 'HelpController'
                }
              }
            } )

            // route for the aboutus page
            .state('app.about', {
                url:'about',
                views: {
                    'content@': {
                        templateUrl : 'views/about.html',
                      }
              }
            })
/*
            // route for the contactus page
            .state('app.contactus', {
                url:'contactus',
                views: {
                    'content@': {
                        templateUrl : 'views/contactus.html',
                        controller  : 'ContactController'
                    }
                }
            })
*/
;
        $urlRouterProvider.otherwise('/');
    })
;
