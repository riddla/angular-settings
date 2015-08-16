import { SettingsService } from './settingsService/index';

import angular from 'angular';

class settingsProvider {

	constructor() {
		this.instance = new SettingsService();
	}

	setDefaults(newDebugData) {
		this.instance.setDefaults(newDebugData);
	}

	$get() {
		return this.instance;
	}
}

angular.module('angular-settings', [])
	.provider('settings', settingsProvider);

export { settingsProvider };

//
//angular.module('Application', ['angular-settings'])
//    .config((settingsProvider) => {
//
//        settingsProvider.setDefaults({
//            API_KEY: 'eakwekajkejawkjekawj'
//        });
//
//    })
//    .run((debugService) => {
//        console.log(debugService.get('API_KEY'));
//        debugService.set('API_KEY', 'newKey');
//        console.log(debugService.get('API_KEY'));
//    });
//
//angular.element(document).ready(function () {
//    angular.bootstrap(document, ['Application']);
//});
