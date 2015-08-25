import angular from '../node_modules/angular/index';
import { mocks } from "../node_modules/angular-mocks/angular-mocks";
import { SettingsProvider } from "src/index";

let SettingsProviderInstance;

describe('SettingsProvider', () => {

    beforeEach(()=> {

		module('angular-settings')

		module(function(settingsProvider) {
			SettingsProviderInstance = settingsProvider;
		});

		inject();
    });

    it('registers itself', () => {
        expect(SettingsProviderInstance).toBeDefined();
    });

    it('can set defaults', () => {
        expect(SettingsProviderInstance.setDefaults).toBeDefined();
    });

});
