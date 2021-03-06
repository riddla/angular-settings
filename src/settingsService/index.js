'use strict';

const LOCAL_STORAGE_KEY = 'AngularSettingService';

class SettingsService {

	constructor(storage) {
		this.currentSettings = {};
		this.defaultSettings = {};
		this.storage = storage || window.localStorage;

		this._mergeLocallyStoredSettings();
	}

	_mergeLocallyStoredSettings() {
		this.currentSettings = Object.assign(this.currentSettings, JSON.parse(this.storage.getItem(LOCAL_STORAGE_KEY)));
	}

	clear() {
		this.currentSettings = {};
		this.storage.removeItem(LOCAL_STORAGE_KEY);
	}

	setDefaults(defaultSettings) {
		this.currentSettings = Object.assign(this.currentSettings, defaultSettings);
		this.defaultSettings = Object.assign(this.defaultSettings, defaultSettings);
		this._mergeLocallyStoredSettings();
	}

	_set(key, value) {
		if (!value) {
			value = {};
		}

		this.currentSettings[key] = value;

		debugger;

		this.storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.currentSettings));
	}

	set(key, value, namespace) {
		if (key.includes(':') || namespace) {

			let namespaceParsed = '';
			let tempKey = '';

			if (namespace) {
				namespaceParsed = namespace;
				tempKey = key;
			}
			else {
				let keys = key.split(':');
				namespaceParsed = keys[0];
				tempKey = keys[1];
			}

			let newNamespace = {
			};
			newNamespace[tempKey] = value;

			let oldNamespace = this._get(namespaceParsed) || {};

			let mergedNamespace = Object.assign(oldNamespace, newNamespace);

			this._set(namespaceParsed, mergedNamespace);
		}
		else {
			this._set(key, value);
		}
	}

	_get(key) {
		return this.currentSettings[key];
	}

	get(key) {
		if (key.includes(':')) {
			let keys = key.split(':');
			let namespace = keys[0];
			let tempKey = keys[1];

			if (!this.currentSettings[namespace]) {
				return undefined;
			}

			return this.currentSettings[namespace][tempKey];
		}
		else {
			return this._get(key);
		}
	}

	enabled(key) {
		return this.currentSettings[key] === true;
	}

	disabled(key) {
		return !this.enabled(key);
	}

	get current() {
		return this.currentSettings;
	}

	set current(settingDefaults) {
		this.currentSettings = settingDefaults;
	}

	get default() {
		return this.defaultSettings;
	}
}

export { SettingsService };
