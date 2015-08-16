'use strict';

class SettingsService {

	constructor(storage) {
		this.currentSettings = {};
		this.storage = storage || window.localStorage;

		this.currentSettings = Object.assign(this.currentSettings, this.storage.getItem('AngularSettingService'));
	}

	clear() {
		this.currentSettings = {};
	}

	setDefaults(defaultSettings) {
		this.currentSettings = Object.assign(this.currentSettings, defaultSettings);
	}

	_set(key, value) {
		if (!value) {
			value = {};
		}

		this.currentSettings[key] = value;

		this.storage.setItem('AngularSettingService', this.currentSettings);
	}

	set(key, value) {
		if (key.includes(':')) {
			let keys = key.split(':');
			let namespace = keys[0];
			let tempKey = keys[1];

			this._set(namespace);
			this.currentSettings[namespace][tempKey] = value;
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
}

export { SettingsService };
