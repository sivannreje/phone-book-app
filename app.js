'use strict';

// Declare app level module which depends on views, and core components
angular.module('phoneBookApp', [
    'LocalStorageModule',
    'ngRoute',
    'ngAnimate',
    'phoneBookApp.contacts',
    'phoneBookApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/contacts'});
}]);
