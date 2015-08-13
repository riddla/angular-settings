import { SettingsService } from "src/settingsService/index";

describe('SettingsService', () => {
    let settingsService;

    beforeEach(()=> {
        settingsService = new SettingsService();
    });

    describe('SettingsService#set', () => {
        let demoKey = 'DEMOKEY';
        let demoValue = 'DEMOVALUE';

        it('should set a setting', () => {
            settingsService.set(demoKey, demoValue);
            expect(settingsService.settings[demoKey]).toBe(demoValue);
        });
    });

    describe('SettingsService#get', () => {
        let demoKey = 'DEMOKEY';
        let demoValue = 'DEMOVALUE';

        beforeEach(()=> {
            settingsService.settings[demoKey] = demoValue;
        });

        it('should get a setting', () => {
            expect(settingsService.get(demoKey)).toBe(demoValue);
        });
    });

    describe('SettingsService#enabled', () => {
        let demoKey = 'DEMOKEY';
        let demoValue = true;
        let demoKey2 = 'DEMOKEY2';
        let demoValue2 = false;

        beforeEach(()=> {
            settingsService.settings[demoKey] = demoValue;
            settingsService.settings[demoKey2] = demoValue2;
        });

        it('should check if a boolean setting is set', () => {
            expect(settingsService.enabled(demoKey)).toBe(true);
            expect(settingsService.enabled(demoKey2)).toBe(false);
        });
    });

    describe('SettingsService#disabled', () => {
        let demoKey = 'DEMOKEY';
        let demoValue = true;
        let demoKey2 = 'DEMOKEY2';
        let demoValue2 = false;

        beforeEach(()=> {
            settingsService.settings[demoKey] = demoValue;
            settingsService.settings[demoKey2] = demoValue2;
        });

        it('should check if a boolean setting is not set', () => {
            expect(settingsService.disabled(demoKey)).toBe(false);
            expect(settingsService.disabled(demoKey2)).toBe(true);
        });
    });
});