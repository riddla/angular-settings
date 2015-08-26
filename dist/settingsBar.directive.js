/*eslint-disable new-cap*/
(function (angular) {
    'use strict';

    function settingsBarDirective() {

        return {
            restrict: 'E',
            templateUrl: 'bower_components/angular-settings/settingsBar.html',
            scope: {},
            controller: settingsBarDirectiveController,
            controllerAs: 'vm'
        }

        function settingsBarDirectiveController(settings, $window, $rootScope, $state) {
            var vm = this;

			// TODO: include/use lodash` version
			vm.isBoolean = function(value) {
				return value === true || value === false;
			};

            vm.settings = settings.current;

            vm.toggle = function (group, key, value) {
                settings.set(key, value, group);
				callbacks.toggleSettingsCallback();
            };

            vm.showDialog = function () {
                ngDialog.open({
                    template: 'app/debugBar/debugBarModal.html',
                    className: 'ngdialog-theme-plain',
                    scope: settings
                });
            };

			var callbacks = {
				toggleSettingsCallback: function() {
					$window.location.reload();
				}
			};

            vm.actions = {
				clearSettings: function() {
					settings.clear();
				}
			};

            vm.callAction = function (key) {
                return vm.actions[key].apply();
            };
        }

    }

    angular.module('angular-settings').directive('settings', settingsBarDirective);

}(angular));
