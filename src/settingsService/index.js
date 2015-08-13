'use strict';

class SettingsService {

    constructor() {
        this.currentSettings = {};
    }

    // see https://www.npmjs.com/package/underscore.deep#deepfromflat-obj
    deepFromFlat(flatObject) {
        var key, newKey, deepObject, part, parts, tempObject;

        deepObject = {};

        for (key in flatObject) {
            tempObject = deepObject;
            parts = key.split('.');
            newKey = parts.pop();
            while (parts.length) {
                part = parts.shift();
                tempObject = tempObject[part] = tempObject[part] || {};
            }
            tempObject[newKey] = flatObject[key];
        }

        return deepObject;
    }

    set(key, value) {

        let keys = [];

        if (key.includes(':')) {
            keys = key.split(':').join('.');
            var foo = {};
            foo[keys] = value;
            this.currentSettings = this.deepFromFlat(foo);
        }
        else {
            this.currentSettings[key] = value;
        }
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
}
;

export { SettingsService }