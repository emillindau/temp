angular.module('SearchCtrl', []).controller('SearchController', function($scope, $http, socket) {
    //var imageSearch;

    $scope.formData = {};
    $scope.formEmailData = {};

    socket.on('results', function(data) {
        $scope.results = data;
    });

    // Also all applications
    /*$http.get('/api/applications')
        .success(function(data) {
            $scope.applications = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });*/

    $scope.search = function() {
        $http.post('/api/search', $scope.formData)
        .success(function(data) {
            $scope.formData = {};
            $scope.results = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: '+ data);
        });
    };

    $scope.searchInBackground = function() {
        console.log('Emitting: ' + $scope.formData);
        socket.emit('query', $scope.formData, function(data, err) {
            console.log(data);
            console.log(err);
        });
    };

    $scope.fetchImage = function(obj) {
        search(obj._id, obj._source.Namn, obj._source.Namn2);
    }

    $scope.addBeverage = function(obj) {
        $http.post('/api/beverages', obj)
        .success(function(data) {
            // $scope.formData = {};
            // $scope.applications = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }

    $scope.deleteApplication = function(id) {
      $http.delete('/api/applications/' + id)
        .success(function(data) {
            $scope.applications = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    };

    $scope.addEmail = function(name) {
        ///applications/register/:application_name'
        var email;
        for(var i = 0; i < $scope.applications.length; i++) {
            console.log($scope.applications[i]);
            if($scope.applications[i].name === name) {
                email = $scope.applications[i].email;
            }
        }
        var data = {};
        data.email = email;
        $http.post('/api/applications/register/'+name, data)
        .success(function(data) {
            $scope.formEmailData = {};
            $scope.applications = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    };

    var searchComplete = function(id, imageSearch) {
        // Check that we got results
        if (imageSearch.results && imageSearch.results.length > 0) {

            // Grab our content div, clear it.
            var contentDiv = document.getElementById(id);
            if(contentDiv) {
                contentDiv.innerHTML = '';

                // Loop through our results, printing them to the page.
                var results = imageSearch.results;
                // Grab only first
                var result = results[0];
                var imgContainer = document.createElement('div');

                // We use titleNoFormatting so that no HTML tags are left in the
                var newImg = document.createElement('img');
                newImg.className = 'img-rounded';

                // There is also a result.url property which has the escaped version
                newImg.src=result.tbUrl;//"/image-search/v1/result.tbUrl;"
                imgContainer.appendChild(newImg);

                // Put our title + image in the content
                contentDiv.appendChild(imgContainer);

                // Now add links to additional pages of search results.
                // addPaginationLinks(imageSearch);*/
            }
        }
    }

    function search(id, name, name2) {
        if(!id)
            return;
        if(!name)
            return;

        var query = '';
        if(name) {
            query += name;
            if(name2) {
                query += ' '+name2;
            }
        }
        //console.log('Query: ' + query);
        // Create an Image Search instance.
        var imageSearch = new google.search.ImageSearch();

        // Set searchComplete as the callback function when a search is
        // complete.  The imageSearch object will have results in it.
        imageSearch.setSearchCompleteCallback(this, searchComplete, [id, imageSearch]);

        // Find me a beautiful car.
        imageSearch.execute(query);

        // Include the required Google branding
        // google.search.Search.getBranding('branding');
    }
});