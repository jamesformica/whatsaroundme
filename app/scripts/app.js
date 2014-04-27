


'use strict';

angular.module('fuckimbored', [
  'ngAnimate', 
  'ngRoute', 
  'ngTouch',  
  'fuckimbored.directives'
  ])

  .constant('version', 'v0.1.0')

  .config(function($locationProvider, $routeProvider, $httpProvider) {

    $locationProvider.html5Mode(false);

    $routeProvider
      .when('/', {
        templateUrl: 'views/categories.html',
        controller: 'categoryCtrl',
        resolve: {
          ranges: ['$http', function($http) {
            return $http.get('scripts/js/ranges.json').then(function(response){
              return response.data;
            })
          }]
        },         
      })      
      .when('/results', {
        templateUrl: 'views/results.html',
        controller: 'resultsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

  });
