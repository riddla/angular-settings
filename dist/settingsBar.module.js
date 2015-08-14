/* global define */
(function () {
	'use strict';

    angular
        .module('angular-settings', [])
        .config(function(settingsProvider) {
            settingsProvider.set('settingsbar:actions', {
                foo: function() {
                    alert('bar');
                }
            });
        });

}());
