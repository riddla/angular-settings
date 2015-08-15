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

            //vm._ = _;
            vm.settings = settings.current;

            vm.toggle = function (key) {
                settings.toggle(key);
                $window.location.reload();
            };

            vm.showDialog = function () {
                ngDialog.open({
                    template: 'app/debugBar/debugBarModal.html',
                    className: 'ngdialog-theme-plain',
                    scope: settings
                });
            };

            vm.actions = settings.get('settingsbar:actions');

            vm.callAction = function (key) {
                return vm.actions[key].apply();
            };
        }

    }

    angular.module('angular-settings').directive('settings', settingsBarDirective);

}(angular));
