/* Used to check if at least one category has been selected */
function checkAtLeastOneSelected(categories) {	
	var atLeastOneSelected = false;
	for (var index in categories) {
		if (categories[index].selected) {
			atLeastOneSelected = true;
		}
	}
	return atLeastOneSelected;
}


function showError(errorTitle, errorMessage) {
	var err = $("#error");
	err.addClass("errorContainerShown");

	var title = err.find("p#errorTitle")[0];
	title.innerText = errorTitle;
	title.textContent  = errorTitle;

	var message = err.find("p#errorMessage")[0];
	message.innerText = errorMessage;
	message.textContent  = errorMessage;
}

function hideError() {
	var err = $("#error");
	err.removeClass("errorContainerShown");

	var title = err.find("p#errorTitle")[0];
	title.innerText = "";
	title.textContent  = "";

	var message = err.find("p#errorMessage")[0];
	message.innerText = "";
	message.textContent  = "";
}

/* Used to populate the inital categories page */
function getOrderedCategories(originalArray) {

	var returnArray = new Array();
	returnArray.push(originalArray.splice(getIndexOfCategoryByDisplayOrder(originalArray, 1), 1)[0]);
	returnArray.push(originalArray.splice(getIndexOfCategoryByDisplayOrder(originalArray, 2), 1)[0]);
	returnArray.push(originalArray.splice(getIndexOfCategoryByDisplayOrder(originalArray, 3), 1)[0]);
	returnArray.push(originalArray.splice(getIndexOfCategoryByDisplayOrder(originalArray, 4), 1)[0]);

    for (var i = originalArray.length; i-- > 0;) {
    	var randIndex = Math.floor((Math.random() * originalArray.length));
    	var splicedObject = originalArray.splice(randIndex, 1)[0];
		returnArray.push(splicedObject);
    }
    return returnArray;
}


/* Used to find certain categories and return their index in the JSON array */
function getIndexOfCategoryByDisplayOrder(array, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].position === value) {
			return i;
		}
	}
	return -1;
}


/* Recursive function to combine an array with child arrays into one array */
function combineChildArrays(array) {
	var combinedArray = new Array();
	for(var i = 0; i < array.length; i++){
		if(array[i] instanceof Array) {
			combinedArray.push.apply(combinedArray, combineChildArrays(array[i]).slice());
		} else {
			combinedArray.push(array[i]);
		}
	}
	return combinedArray;
}


/* Used to build the types array to send to google */
function getGoogleNames(array){
	var typesArray = new Array();
	for (var i = 0; i < array.length; i++) {
		if(array[i].selected && !array[i].results && array[i].googleName instanceof Array) {
			for(var j = 0; j < array[i].googleName.length; j++) {
				typesArray.push(array[i].googleName[j]);
			}
		}	
	}
	return typesArray;
}


/* Used to populate categories with the returned results from Google */
function addResultToCateogry(array, result){
	for (var i = 0; i < result.types.length; i++) {
		for (var j = 0; j < array.length; j++) {
			if(array[j].googleName instanceof Array) {
				for (var k = 0; k < array[j].googleName.length; k++) {
					if (result.types[i] === array[j].googleName[k] && notAlreadyInCategory(array[j], result)) {
						if (!array[j].results) {
							array[j].results = new Array();
						}
						array[j].results.push(result);
					}
				}
			} 
		}
	}
}


/* Used to check if a result is already in the category */
function notAlreadyInCategory(category, result) {
	if (!category.results) { return true; }
	for (var i = 0; i < category.results.length; i++) {
		if(category.results[i].name === result.name){
			return false;
		}
	}
	return true;
}


/* Used to expand the first category with results */
function findDefaultCategory(array) {
	for (var i = 0; i < array.length; i++) {
		if(array[i].selected && array[i].results) {
			array[i].default = true;
			return;
		}
	}
}


function processSearchResults(combinedCategories, results, position) {
	setMyLatLng(getMap(), position);
	for (var i = 0; i < results.length; i++) {
    	results[i].distance = getDistanceFromGeolocationAndGoogleMapsPlace(position, results[i]);
        addResultToCateogry(combinedCategories, results[i]);                   
  	}
  	sortCategories(combinedCategories);
  	findDefaultCategory(combinedCategories);
  	return combinedCategories;

}

function sortCategories(combinedCategories) {
	for (var i = 0; i < combinedCategories.length; i++) {
		if (combinedCategories[i].selected && combinedCategories[i].results) {
			combinedCategories[i].results.sort(sortByDistance);
		}
	}
}

function sortByDistance(a, b){
  return ((a.distance < b.distance) ? -1 : ((a.distance > b.distance) ? 1 : 0));
}


function getDistanceFromGeolocationAndGoogleMapsPlace(position, place) {
	var distance = getDistanceBetweenLatLngs(position.coords.latitude, position.coords.longitude, place.geometry.location.k, place.geometry.location.A);
	return distance;
}


/* Used to calculate the distance in metres between to lat long points */
function getDistanceBetweenLatLngs(lat1, lon1, lat2, lon2) {
  	var earthRadiusKms = 6373;

  	var radLat1 = degreesToRadian(lat1);
  	var radLon1 = degreesToRadian(lon1);
  	var radLat2 = degreesToRadian(lat2);
  	var radLon2 = degreesToRadian(lon2);

  	diffLat = radLat2 - radLat1;
  	diffLon = radLon2 - radLon1;

  	var a = Math.pow(Math.sin(diffLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(diffLon / 2), 2);
  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  	distKms = c * earthRadiusKms;

  	distMs = (Math.round(distKms * 100) / 100) * 1000;
  	return distMs;
}


/* Used to convert a coordinate from degress to radian */
function degreesToRadian(degrees) {
	return degrees * Math.PI / 180;
}


/* Used to close decide which category to expand / close */
function closeAllResultListsExceptClicked(index) {
	var idMatch = "resultList" + index;
	$(".categoryResultsList").filter(function() {
		return $(this).attr("id") !== idMatch;
	}).removeClass('categoryResultsListShown');

	toggleClickedResultList(index);
	scrollWindow(0, 0);
}


function toggleClickedResultList(index) {
	$('#resultList'+index).toggleClass('categoryResultsListShown');
}



/* ### Google Maps Stuff ### */

var map;
var me_icon;
var place_icon;
var my_marker = new google.maps.Marker();
var place_marker = new google.maps.Marker();
var myLatLng;

function getMap() { return map; }

function initialiseMap(){
	var latlng = new google.maps.LatLng(-37.8136111, 144.96305559999996);
	      var myOptions = {
	              zoom: 13,
	              center: latlng,
	              mapTypeId: google.maps.MapTypeId.ROADMAP,
	              draggable: true,
	              scrollwheel: false,
	              disableDefaultUI: true
	          };
	map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);

	me_icon = {
		url: '../../images/me.png',
		size: new google.maps.Size(32, 32),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(16, 31)
	};

	place_icon = {
		url: '../../images/flag.png',
		size: new google.maps.Size(24, 32),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(12, 32)
	};

	var controls = document.getElementById('mapControls');
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(controls);

}





function setMyLatLng(map, position) {
	myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	my_marker = setMarkerOnMap(map, myLatLng, "YOU!", true);
}

function setCurrentAndPlaceMarkers(map, place) {
	google.maps.event.trigger(map, 'resize');
	removeAllMarkers();
	place_marker = setMarkerOnMap(map, new google.maps.LatLng(place.geometry.location.k, place.geometry.location.A), place.name, false);
	setMapBounds(map);
}

function removeAllMarkers() {
	place_marker.setMap(null);
}

function setMarkerOnMap(map, latlng, title, me) {
	var infowindow = new google.maps.InfoWindow({
		content: title
	});
	var marker = new google.maps.Marker({
   		position: latlng,
      	map: map,
      	title: title,
      	icon: me ? me_icon : place_icon 
  	});
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map, marker);
	});
	return marker;
}

function setMapBounds(map) {
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(my_marker.position);
	bounds.extend(place_marker.position);
	map.fitBounds(bounds);
}


var scrollYPos = 0;
function saveScrollPositionAndScrollToTop() {
	scrollYPos = window.pageYOffset;
	window.scrollTo(0, 0);
}

function toggleMapVisibility(top){
	$("#map-container").slideToggle(0);
	scrollWindow(0, top ? 0 : scrollYPos);
}

function scrollWindow(xPos, yPos) {
	window.scrollTo(xPos, yPos);
}


