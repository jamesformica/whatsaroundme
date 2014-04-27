'use strict';

angular.module('fuckimbored.directives', [])

	.directive('mapSizeDirective', function() {
    	return {
      		restrict: 'A',
      		link: function (scope, element, attrs) {
      			var windowH = $(window).height();
      			var navH = $("#navBarMock").height();
				element.css("height", windowH - navH - 20);
  			}
  		}
  	})	

 //  .directive('autoTextDirective', ['$timeout', function($timeout) {
 //    return {
 //      restrict: 'A',
 //      link: function (scope, element, attrs) {

 //  		var applyBigText = function() {
	// 		var elem = element[0];

	// 		var divWidth = elem.offsetWidth;

	// 		var textWidth = elem.children[0].offsetWidth;

	// 		var widthDiff = (divWidth * .95) / textWidth; 

			
	// 		var divFontSize = parseInt($("#"+elem.id).css("font-size").replace("px",""));

	// 		var newSize = divFontSize * widthDiff;

	// 		//angular.element(elem).css("font-size", newSize);

			
	// 			console.log(elem.innerText + ": " + divFontSize + ", " + newSize);
	// 			var a = 3;
 //  		};
 //  		$timeout(applyBigText, 0);

	// }
  		
 //  	}
 //  }])
  ;
