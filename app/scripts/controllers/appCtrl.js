'use strict';

angular.module('fuckimbored')

.controller('categoryCtrl', ['$scope', '$location', '$http', 'ranges', 'categoriesModel', 
  function($scope, $location, $http, ranges, categoriesModel) {

    $scope.categoriesShown = false;
    $scope.maxCategories = 4;
    $scope.numSelectedCategories = 0;
    $scope.radiusRanges = ranges;
    categoriesModel.selectedRange = jQuery.grep(ranges, function(ranges) { return ranges.default === true; })[0]; 
    $scope.selectedRange = categoriesModel.selectedRange;

  // var num = Math.floor((Math.random() * instructions.length));
  // $scope.instruction = instructions[num].instruction;

  categoriesModel.getCategoriesPromise().then(function(result){
    $scope.categoriesArray = result;
  });

  $scope.selectCategory = function(category) {
    if(!category.selected) {
      if ($scope.numSelectedCategories < $scope.maxCategories) {
        category.selected = true;
        $scope.numSelectedCategories++;
      }
    } else {
      category.selected = false;
        $scope.numSelectedCategories--;
    }
    
  }

  $scope.continue = function(categories) {
    if(!checkAtLeastOneSelected(categories)) {
      showError('Nice one..', 'You might want to select something first... Just a thought')
    } else {
     $location.path("results");
    }
  };

  $scope.clearSelections = function() {
    var cats = categoriesModel.getCategoriesArray();
    for (var i = 0; i < cats.length; i++) {
      cats[i].selected = false;
    }
  };

}])

.controller('resultsCtrl', ['$scope', '$location', 'GeolocationPlacesSearchService', 'categoriesModel', function($scope, $location, GeolocationPlacesSearchService, categoriesModel) {

  $scope.showLoading = true;

  if (!categoriesModel.getCategoriesArray()) {
    $location.path("/");
  } else {   

    initialiseMap();
    var combinedCategories = combineChildArrays(categoriesModel.getCategoriesArray());
    var typesList = getGoogleNames(combinedCategories);

    $scope.results = combinedCategories;

    if (typesList.length > 0) {
      GeolocationPlacesSearchService.getPosition().then(function(position) {
        GeolocationPlacesSearchService.searchForPlaces(getMap(), position.coords.latitude, position.coords.longitude, typesList).then(function (results){
          $scope.showLoading = false;         
          $scope.results = processSearchResults(combinedCategories, results, position); 
        }, function (reasonArray) {
            showErrorAndReturn(reasonArray);
        });
      }, function (reasonArray){
            showErrorAndReturn(reasonArray);
      });
    } else {
      $scope.showLoading = false; 
    }
  }

  function showErrorAndReturn(reasonArray) {
    if(reasonArray.length == 2) {
      showError(reasonArray[0], reasonArray[1]);
      $location.path("/");
      $scope.showLoading = false;   
    }
  }

  $scope.openCategoryResults = function(index) {
      closeAllResultListsExceptClicked(index);
  }

  $scope.showOnMap = function(category) {
    saveScrollPositionAndScrollToTop();
    toggleMapVisibility(true);
    $scope.mapPlace = category;
    setCurrentAndPlaceMarkers(getMap(),category);    
  }

  $scope.hideMap = function() {
    toggleMapVisibility(false);
  }

  $scope.resetMapBounds = function() {
    setMapBounds(getMap());
  }

}]);
