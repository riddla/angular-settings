/* global define */
(function (define) {
	'use strict';

	define(function (require) {

		var angular = require('angular');
		require('ngDialog');

		return angular.module('debugBar', ['ngDialog']);
	});

}(define));
