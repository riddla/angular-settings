(function (define) {
	'use strict';

	define(function (require) {

		require('common/common.module');

		var angular = require('angular');

		//debugDirective.$inject = ['$compile'];

		function debugDirective($compile, config, $rootScope) {

			var isActive = config.environment && config.environment.debug;

			return {
				restrict: 'E',
				scope   : true,
				template: '<div ng-transclude></div>',
				transclude: true,
				//replace : true,
				compile : function compile(iAttrs) {
					if (isActive) {
						return link;
					}
				}
			};

			function link(scope, element, iAttrs) {
				if (iAttrs.value) {
					element.html('<pre>' + iAttrs.value + ' = <span ng-bind="' + iAttrs.value + ' | json"></span></pre>');
					$compile(element.contents())(scope);
				}
				element.show();
			}
		}
		debugDirective.$inject = ["$compile", "config", "$rootScope"];

		angular
			.module('app.common')
			.directive('debug', debugDirective);
	});

}(define));
