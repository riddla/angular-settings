import { SettingsService } from "src/settingsService/index";

describe('SettingsService', () => {
    let settingsService;
    let demoNamespaceKey = 'DEMONAMESPACE:DEMOKEY';
    let demoNamespaceKey2 = 'DEMONAMESPACE:DEMOKEY2';
    let demoKey = 'DEMOKEY';
    let demoKey2 = 'DEMOKEY2';
    let demoValue = 'DEMOVALUE';

	let demoSavedSettings = {
		DEMO_SAVED_KEY: 'DEMO_SAVED_VALUE'
	};
	let demoSavedSettingsAsString = '{"DEMO_SAVED_KEY":"DEMO_SAVED_VALUE"}';

	let mockStorage = {
		setItem: function() {},
		removeItem: function() {},
		key: function() {},
		getItem: function() {},
		removeItem: function() {},
		length: 0
	};

	let defaults = {};
	defaults[demoKey] = demoValue;


	beforeEach(()=> {
		spyOn(mockStorage, 'getItem').and.returnValue(demoSavedSettingsAsString);
        settingsService = new SettingsService(mockStorage);
    });

    describe('#clear', () => {
        it('should prune settings', () => {
            settingsService.current[demoKey] = demoValue;

            settingsService.clear();
            expect(settingsService.current).toEqual({});
        });
    });

    describe('#setDefaults', () => {

		beforeEach(()=> {
			mockStorage.getItem.and.returnValue('{}');
			settingsService = new SettingsService(mockStorage);
		});

        it('should set default settings', () => {
            settingsService.setDefaults(defaults);
            expect(settingsService.current).toEqual(defaults);
        });

        it('should merge defaults settings if invoked multiple times', () => {
            settingsService.setDefaults(defaults);
            settingsService.setDefaults({
                foo: 'bar'
            });
            expect(settingsService.current).toEqual({
                DEMOKEY: 'DEMOVALUE',
                foo: 'bar'
            });
        });
    });

    describe('#set', () => {
        let demoKey = 'DEMOKEY';
        let demoValue = 'DEMOVALUE';
        let demoGroup = 'DEMOGROUP';

        it('should set a setting', () => {
            settingsService.set(demoKey, demoValue);
            expect(settingsService.current[demoKey]).toBe(demoValue);
        });

        it('should set a namespaced setting', () => {
            settingsService.set(demoNamespaceKey, demoValue);
            expect(settingsService.current.DEMONAMESPACE.DEMOKEY).toBe(demoValue);
        });

		it('should not override previous namespaced setting', () => {
			settingsService.set(demoNamespaceKey, demoValue);
			settingsService.set(demoNamespaceKey2, demoValue);
			expect(settingsService.current.DEMONAMESPACE.DEMOKEY).toBe(demoValue);
			expect(settingsService.current.DEMONAMESPACE.DEMOKEY2).toBe(demoValue);
		});

		it('should set a setting with namespace provided as parameter', () => {
			settingsService.set(demoKey, demoValue, demoGroup);
			expect(settingsService.current[demoGroup][demoKey]).toBe(demoValue);
		});

		it('should not override previous namespaced setting when namespace provided as parameter', () => {
			settingsService.set(demoKey, demoValue, demoGroup);
			settingsService.set(demoKey2, demoValue, demoGroup);
			expect(settingsService.current[demoGroup][demoKey]).toBe(demoValue);
			expect(settingsService.current[demoGroup][demoKey2]).toBe(demoValue);
		});
    });

	describe('localstorage', () => {
		beforeEach(() => {
			spyOn(mockStorage, 'setItem');
			spyOn(JSON, 'stringify');
			spyOn(JSON, 'parse');
		});

		it('should save the current settings to localstorage', () => {
			settingsService.set(demoKey, demoValue);
			expect(mockStorage.setItem).toHaveBeenCalled();
		});

		it('should get saved settings after start', () => {
			expect(mockStorage.getItem).toHaveBeenCalled();
            expect(settingsService.current).toEqual(demoSavedSettings);
		});

		it('should get saved settings after default settings are set', () => {
			settingsService.setDefaults(defaults);
			expect(mockStorage.getItem.calls.count()).toBe(2);
		});

		it('should decode objects before saving', () => {
			settingsService.set(demoKey, demoValue);
			expect(JSON.stringify).toHaveBeenCalled();
		});

		it('should encode objects before getting', () => {
			settingsService._mergeLocallyStoredSettings();
			expect(JSON.parse).toHaveBeenCalled();
		});
	});

    describe('#get', () => {
        let demoKey = 'DEMOKEY';
        let demoValue = 'DEMOVALUE';

        beforeEach(()=> {
            settingsService.current[demoKey] = demoValue;
            settingsService.current.DEMONAMESPACE = {
                DEMOKEY: demoValue
            };
        });

        it('should get a setting', () => {
            expect(settingsService.get(demoKey)).toBe(demoValue);
        });

        it('should get a namespaced setting', () => {
            expect(settingsService.get(demoNamespaceKey)).toBe(demoValue);
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
            settingsService.current[demoKey] = demoValue;
            settingsService.current[demoKey2] = demoValue2;
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
            settingsService.current[demoKey] = demoValue;
            settingsService.current[demoKey2] = demoValue2;
        });

        it('should check if a boolean setting is not set', () => {
            expect(settingsService.disabled(demoKey)).toBe(false);
            expect(settingsService.disabled(demoKey2)).toBe(true);
        });
    });
});
