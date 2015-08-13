'use strict';

class SettingsService {

    constructor() {
        this.currentSettings = {};
    }

    set(key, value) {
        this.currentSettings[key] = value;
    }

    get(key) {
        return this.currentSettings[key];
    }

    enabled(key) {
        return this.currentSettings[key] === true;
    }

    disabled(key) {
        return !this.enabled(key);
    }

    get settings() {
        return this.currentSettings;
    }

    set settings(settingDefaults) {
        this.currentSettings = settingDefaults;
    }
};

export { SettingsService }