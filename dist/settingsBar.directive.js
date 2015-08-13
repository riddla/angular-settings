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

            vm.actions = {
                previewEventMode: function () {
                },
                previewErrorMode: function () {
                    $state.go('error', {errorId: 666});
                },
                restartApp: function () {
                    $window.location = '/';
                },
                logAllRoutes: function () {
                    //console.table($state.get());
                },
                showRoomIds: function () {
                    $rootScope.$broadcast('showRoomIds');
                }
            };

            vm.callAction = function (key) {
                return vm.actions[key].apply();
            };
        }

    }

    angular.module('angular-settings').directive('settings', settingsBarDirective);

}(angular));
