import { SettingsService } from "src/settingsService/index";

describe('SettingsService', () => {
    let settingsService;
    let demoNamespacedKey = 'DEMONAMESPACE:DEMOKEY';

    beforeEach(()=> {
        settingsService = new SettingsService();
    });

    describe('#set', () => {
        let demoKey = 'DEMOKEY';
        let demoValue = 'DEMOVALUE';

        it('should set a setting', () => {
            settingsService.set(demoKey, demoValue);
            expect(settingsService.settings[demoKey]).toBe(demoValue);
        });

        it('should set a namespaced setting', () => {
            settingsService.set(demoNamespacedKey, demoValue);
            expect(settingsService.settings.DEMONAMESPACE.DEMOKEY).toBe(demoValue);
        });
    });

    describe('#get', () => {
        let demoKey = 'DEMOKEY';
        let demoValue = 'DEMOVALUE';

        beforeEach(()=> {
            settingsService.settings[demoKey] = demoValue;
            settingsService.settings.DEMONAMESPACE = {
                DEMOKEY: demoValue
            };
        });

        it('should get a setting', () => {
            expect(settingsService.get(demoKey)).toBe(demoValue);
        });

        it('should get a namespaced setting', () => {
            expect(settingsService.get(demoNamespacedKey)).toBe(demoValue);
        });

        it('should detect a non-existing namespace', () => {
            expect(settingsService.get('FOO:BAR')).toBe(undefined);
        });

        it('should detect a non-existing namespaced key', () => {
            expect(settingsService.get('DEMONAMESPACE:BAR')).toBe(undefined);
        });
    });

    describe('#enabled', () => {
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

    describe('#disabled', () => {
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