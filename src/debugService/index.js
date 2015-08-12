let debugData;

class DebugService {

    setDefaults(newDebugData) {
        debugData = newDebugData;
        console.log(newDebugData);
    }

    set(key, value) {
        debugData[key] = value;
    }

    get(key) {
        return debugData[key];

    }
};

export { DebugService }