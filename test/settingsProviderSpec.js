import angular from 'angular';
import { mocks } from "../node_modules/angular-mocks/angular-mocks";
import { SettingsProvider } from "src/index";

let SettingsProviderInstance;

describe('SettingsProvider', () => {

    beforeEach(()=> {

        // see http://jsfiddle.net/eitanp461/qTvMz/

        angular.module('testApp', function () {
        })
            .config(function (settingsProvider) {
                SettingsProviderInstance = settingsProvider;
            });
        // Initialize angular-settings injector
        module('angular-settings', 'testApp');

        // Kickstart the injectors previously registered with calls to angular.mock.module
        inject(function () {
        });
    });

    it('registers itself', () => {
        expect(SettingsProviderInstance).toBeDefined();
    });

    it('can set defaults', () => {
        expect(SettingsProviderInstance.setDefaults).toBeDefined();
    });

});