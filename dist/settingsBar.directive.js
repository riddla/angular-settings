/*eslint-disable new-cap*/
(function (angular) {
	'use strict';

	function settingsBarDirective() {

		return {
			restrict    : 'E',
			templateUrl : 'bower_components/angular-settings/settingsBar.html',
			scope       : {},
			controller  : settingsBarDirectiveController,
			controllerAs: 'vm'
		}

		function settingsBarDirectiveController(settings, $window) {
			var vm = this;

			// TODO: include/use lodash` version
			vm.isBoolean = function (value) {
				return value === true || value === false;
			};

			vm.settings = settings.current;
			vm.settingsDefault = settings.default;

			vm.toggle = function (group, key, value) {
				settings.set(key, value, group);
				callbacks.toggleSettingsCallback();
			};

			vm.changeValue = function (oldValue, group, key) {
				var newValue = settings.current[group][key];
				settings.set(key, newValue, group);
				//callbacks.toggleSettingsCallback();
			};

			vm.actions = {
				clearSettings: function () {
					settings.clear();
					$window.location.reload();
				}
			};

			vm.callAction = function (key) {
				return vm.actions[key].apply();
			};

			var callbacks = {
				toggleSettingsCallback: function () {
					if (settings.get('settingsbar:reloadAfterSettingsChange')) {
						$window.location.reload();
					}
				}
			};
		}

	}

	angular.module('angular-settings').directive('settings', settingsBarDirective);

}(angular));
