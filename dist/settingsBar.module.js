/* global define */
(function () {
	'use strict';

    angular
        .module('angular-settings')
        .config(function(settingsProvider) {
            settingsProvider.setDefaults('settingsbar:actions', {
                foo: function() {
                    alert('bar');
                }
            });
            debugger;
        });

}());
