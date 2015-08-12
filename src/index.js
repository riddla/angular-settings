import { DebugService } from "./debugService/index";

import angular from 'angular';

class debugServiceProvider {

    constructor() {
        this.instance = new DebugService();
    }

    setDefaults(newDebugData) {
        this.instance.setDefaults(newDebugData);
    }

    $get() {
        return this.instance;
    }
}

angular.module('angular-settings', [])
    .provider('debugService', debugServiceProvider);

export { debugServiceProvider }


angular.module('Application', ['angular-settings'])
    .config((debugServiceProvider) => {

        debugServiceProvider.setDefaults({
            API_KEY: 'eakwekajkejawkjekawj'
        });

    })
    .run((debugService) => {
        console.log(debugService.get('API_KEY'));
        debugService.set('API_KEY', 'newKey');
        console.log(debugService.get('API_KEY'));
    });

angular.element(document).ready(function () {
    angular.bootstrap(document, ['Application']);
});