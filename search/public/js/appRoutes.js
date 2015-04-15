angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/search.html',
        controller: 'SearchController'
    })
    .when('/beverages', {
        templateUrl: 'views/beverages.html',
        controller: 'BeveragesController'
    });
    $locationProvider.html5Mode(true);
}]);