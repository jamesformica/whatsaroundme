'use strict';

angular.module('fuckimbored')

	.factory('categoriesModel', ['$http', '$q', function ($http, $q) {
		var categories;
		var selectedRange;

		var getCategoriesPromise = function() {
			var deferred = $q.defer();
			if(!categories) {
				$http.get('scripts/js/categories.json').then(function(result){
			        categories = getOrderedCategories(result.data);  
			        deferred.resolve(categories);
	    		});  
			} else {
				deferred.resolve(categories);
			}
			return deferred.promise;
		};

		var getCategoriesArray = function() {
			return categories;
		};

		return {
			getCategoriesPromise : getCategoriesPromise,
			getCategoriesArray : getCategoriesArray
		};    	
	}])

	.factory("GeolocationPlacesSearchService", ['$q', '$http', '$window', function ($q, $http, $window) {
			
			var getPosition = function () {
		        var deferred = $q.defer();
		        if (!$window.navigator) {
	                deferred.reject(new Array("Ohh No :(", "You dont have the ability to give me your latitude and longitude. I can't help you.."));
		        } else {
		            $window.navigator.geolocation.getCurrentPosition(function (position) {
	                    deferred.resolve(position);
		            }, function (error) {
	                    deferred.reject(new Array("Well shit..", "You don't seem to be connected to the internet, wanna check that out?"));
		            });
		        }
		        return deferred.promise;
    		}

			var searchForPlaces = function(map, lat, lng, types) {
				var service = new google.maps.places.PlacesService(map);
				var deferred = $q.defer();				
				var request = {
					key: "AIzaSyCcrrSNT3ZsyiijGV0AoQpInylHYl5uJ2Y",
			        location: new google.maps.LatLng(lat, lng),
			        radius: 1500,
			        rankby: google.maps.places.RankBy.DISTANCE,
			        types: types,
			        sensor: true
			    };
			    service.nearbySearch(request, function (results, status) {
			    	if (status === "OVER_QUERY_LIMIT") {
			    		deferred.reject(new Array("Oh no :(", "You've reached your limit"));
                    } else if (status === "ZERO_RESULTS") {
                    	deferred.reject(new Array("Oh snap!", "We can't find anything around you.. Sorry bout that. Try picking something else :)"));
                    } else if (status !== "OK") {
                    	deferred.reject(new Array("Ahh shit!", "Something went wrong. Please try again and this time have your fingers crossed"));
                    } else {
                    	deferred.resolve(results);
                	}
			    });
			    return deferred.promise;
			};

			return {
				getPosition : getPosition,
				searchForPlaces : searchForPlaces
			};
	}])

	;
