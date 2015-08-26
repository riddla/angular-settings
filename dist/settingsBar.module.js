/* global define */
(function () {
	'use strict';

	angular
		.module('angular-settings')
		.config(function (settingsProvider) {
			settingsProvider.setDefaults({
				settingsbar: {
					actions: {
						toggleSettingsCallback: function() {
							window.location.reload();
						}
					}
				}
			});
		});
}());
