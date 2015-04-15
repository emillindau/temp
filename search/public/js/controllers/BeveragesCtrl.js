angular.module('BeveragesCtrl', []).controller('BeveragesController', function($scope, $http, socket) {
    // $scope.tagline = 'Nothing beats a pocket protector';
    /*
    var socket = io.connect();
    socket.on('errorModels', function(data) {
        console.log("We got a socket.io with");
        console.log(data);
        $scope.errors = data;
        $scope.tagline = 'Nae';
    });
    */

    /*socket.on('errorModels', function(data) {
        $scope.tagline = 'asd';
        $scope.errors = data;
    });*/

    // When landing, get all error-reports and show them
    $http.get('/api/beverages')
        .success(function(data) {
            $scope.beverages = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });


    $scope.deleteBeverage = function(id) {
        $http.delete('/api/beverages/' + id)
        .success(function(data) {
            $scope.beverages = data;
            console.log(data);
            console.log("SUCCESS!!!");
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    };
});