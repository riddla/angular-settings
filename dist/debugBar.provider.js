/* eslint-disable no-console */
/* global define */
(function (define) {
	'use strict';

	define(function (require) {

		var debugBar = require('debugBar/debugBar.module');

		function DebugBarProvider() {

			var debugData = {};

			function setDebugData(newDebugData) {
				settings = newDebugData;
			}

			function Service() {
				return {
					setDebugData: setDebugData,
					settings   : settings
				};
			}

			this.$get = function DebugBarFactory() {
				return new Service();
			};
		}

		debugBar.provider('debugBar', DebugBarProvider);
	});

}(define));
