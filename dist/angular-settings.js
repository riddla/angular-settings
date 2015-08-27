"format amd";
(function(global) {

  var defined = {};

  // indexOf polyfill for IE8
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var getOwnPropertyDescriptor = true;
  try {
    Object.getOwnPropertyDescriptor({ a: 0 }, 'a');
  }
  catch(e) {
    getOwnPropertyDescriptor = false;
  }

  var defineProperty;
  (function () {
    try {
      if (!!Object.defineProperty({}, 'a', {}))
        defineProperty = Object.defineProperty;
    }
    catch (e) {
      defineProperty = function(obj, prop, opt) {
        try {
          obj[prop] = opt.value || opt.get.call(obj);
        }
        catch(e) {}
      }
    }
  })();

  function register(name, deps, declare) {
    if (arguments.length === 4)
      return registerDynamic.apply(this, arguments);
    doRegister(name, {
      declarative: true,
      deps: deps,
      declare: declare
    });
  }

  function registerDynamic(name, deps, executingRequire, execute) {
    doRegister(name, {
      declarative: false,
      deps: deps,
      executingRequire: executingRequire,
      execute: execute
    });
  }

  function doRegister(name, entry) {
    entry.name = name;

    // we never overwrite an existing define
    if (!(name in defined))
      defined[name] = entry;

    // we have to normalize dependencies
    // (assume dependencies are normalized for now)
    // entry.normalizedDeps = entry.deps.map(normalize);
    entry.normalizedDeps = entry.deps;
  }


  function buildGroups(entry, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, groups);
    }
  }

  function link(name) {
    var startEntry = defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry);
        else
          linkDynamicModule(entry);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(global, function(name, value) {
      module.locked = true;
      exports[name] = value;

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          for (var j = 0; j < importerModule.dependencies.length; ++j) {
            if (importerModule.dependencies[j] === module) {
              importerModule.setters[j](exports);
            }
          }
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      else if (depEntry && !depEntry.declarative) {
        depExports = depEntry.esModule;
      }
      // in the module registry
      else if (!depEntry) {
        depExports = load(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else
        module.dependencies.push(null);

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name) {
    var exports;
    var entry = defined[name];

    if (!entry) {
      exports = load(name);
      if (!exports)
        throw new Error("Unable to load dependency " + name + ".");
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, []);

      else if (!entry.evaluated)
        linkDynamicModule(entry);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry) {
    if (entry.module)
      return;

    var exports = {};

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i]);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;

    // create the esModule object, which allows ES6 named imports of dynamics
    exports = module.exports;
 
    if (exports && exports.__esModule) {
      entry.esModule = exports;
    }
    else {
      entry.esModule = {};
      
      // don't trigger getters/setters in environments that support them
      if (typeof exports == 'object' || typeof exports == 'function') {
        if (getOwnPropertyDescriptor) {
          var d;
          for (var p in exports)
            if (d = Object.getOwnPropertyDescriptor(exports, p))
              defineProperty(entry.esModule, p, d);
        }
        else {
          var hasOwnProperty = exports && exports.hasOwnProperty;
          for (var p in exports) {
            if (!hasOwnProperty || exports.hasOwnProperty(p))
              entry.esModule[p] = exports[p];
          }
         }
       }
      entry.esModule['default'] = exports;
      defineProperty(entry.esModule, '__useDefault', {
        value: true
      });
    }
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen) {
    var entry = defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!defined[depName])
          load(depName);
        else
          ensureEvaluated(depName, seen);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(global);
  }

  // magical execution function
  var modules = {};
  function load(name) {
    if (modules[name])
      return modules[name];

    var entry = defined[name];

    // first we check if this module has already been defined in the registry
    if (!entry)
      throw "Module " + name + " not present.";

    // recursively ensure that the module and all its 
    // dependencies are linked (with dependency group handling)
    link(name);

    // now handle dependency execution in correct order
    ensureEvaluated(name, []);

    // remove from the registry
    defined[name] = undefined;

    // exported modules get __esModule defined for interop
    if (entry.declarative)
      defineProperty(entry.module.exports, '__esModule', { value: true });

    // return the defined module object
    return modules[name] = entry.declarative ? entry.module.exports : entry.esModule;
  };

  return function(mains, depNames, declare) {
    return function(formatDetect) {
      formatDetect(function(deps) {
        var System = {
          _nodeRequire: typeof require != 'undefined' && require.resolve && typeof process != 'undefined' && require,
          register: register,
          registerDynamic: registerDynamic,
          get: load, 
          set: function(name, module) {
            modules[name] = module; 
          },
          newModule: function(module) {
            return module;
          },
          'import': function() {
            throw new TypeError('Dynamic System.import calls are not supported for SFX bundles. Rather use a named bundle.');
          }
        };
        System.set('@empty', {});

        // register external dependencies
        for (var i = 0; i < depNames.length; i++) (function(depName, dep) {
          if (dep && dep.__esModule)
            System.register(depName, [], function(_export) {
              return {
                setters: [],
                execute: function() {
                  for (var p in dep)
                    if (p != '__esModule' && !(typeof p == 'object' && p + '' == 'Module'))
                      _export(p, dep[p]);
                }
              };
            });
          else
            System.registerDynamic(depName, [], false, function() {
              return dep;
            });
        })(depNames[i], arguments[i]);

        // register modules in this bundle
        declare(System);

        // load mains
        var firstLoad = load(mains[0]);
        if (mains.length > 1)
          for (var i = 1; i < mains.length; i++)
            load(mains[i]);

        return firstLoad;
      });
    };
  };

})(typeof self != 'undefined' ? self : global)
/* (['mainModule'], ['external-dep'], function(System) {
  System.register(...);
})
(function(factory) {
  if (typeof define && define.amd)
    define(['external-dep'], factory);
  // etc UMD / module pattern
})*/

(['0'], [], function(System) {

System.registerDynamic("2", ["5"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var _Object$defineProperty = require("5")["default"];
  exports["default"] = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        _Object$defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("3", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports["default"] = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  exports.__esModule = true;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("5", ["6"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("6"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("4", ["7"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": require("7"),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("6", ["8"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("8");
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("7", ["9", "8"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  require("9");
  module.exports = require("8").core.Object.assign;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("8", ["a"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  'use strict';
  var global = typeof self != 'undefined' ? self : Function('return this')(),
      core = {},
      defineProperty = Object.defineProperty,
      hasOwnProperty = {}.hasOwnProperty,
      ceil = Math.ceil,
      floor = Math.floor,
      max = Math.max,
      min = Math.min;
  var DESC = !!function() {
    try {
      return defineProperty({}, 'a', {get: function() {
          return 2;
        }}).a == 2;
    } catch (e) {}
  }();
  var hide = createDefiner(1);
  function toInteger(it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  }
  function desc(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  }
  function simpleSet(object, key, value) {
    object[key] = value;
    return object;
  }
  function createDefiner(bitmap) {
    return DESC ? function(object, key, value) {
      return $.setDesc(object, key, desc(bitmap, value));
    } : simpleSet;
  }
  function isObject(it) {
    return it !== null && (typeof it == 'object' || typeof it == 'function');
  }
  function isFunction(it) {
    return typeof it == 'function';
  }
  function assertDefined(it) {
    if (it == undefined)
      throw TypeError("Can't call method on  " + it);
    return it;
  }
  var $ = module.exports = require("a")({
    g: global,
    core: core,
    html: global.document && document.documentElement,
    isObject: isObject,
    isFunction: isFunction,
    that: function() {
      return this;
    },
    toInteger: toInteger,
    toLength: function(it) {
      return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
    },
    toIndex: function(index, length) {
      index = toInteger(index);
      return index < 0 ? max(index + length, 0) : min(index, length);
    },
    has: function(it, key) {
      return hasOwnProperty.call(it, key);
    },
    create: Object.create,
    getProto: Object.getPrototypeOf,
    DESC: DESC,
    desc: desc,
    getDesc: Object.getOwnPropertyDescriptor,
    setDesc: defineProperty,
    setDescs: Object.defineProperties,
    getKeys: Object.keys,
    getNames: Object.getOwnPropertyNames,
    getSymbols: Object.getOwnPropertySymbols,
    assertDefined: assertDefined,
    ES5Object: Object,
    toObject: function(it) {
      return $.ES5Object(assertDefined(it));
    },
    hide: hide,
    def: createDefiner(0),
    set: global.Symbol ? simpleSet : hide,
    each: [].forEach
  });
  if (typeof __e != 'undefined')
    __e = core;
  if (typeof __g != 'undefined')
    __g = global;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("9", ["b", "c"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $def = require("b");
  $def($def.S, 'Object', {assign: require("c")});
  global.define = __define;
  return module.exports;
});

System.registerDynamic("a", [], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function($) {
    $.FW = false;
    $.path = $.core;
    return $;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("c", ["8", "d"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("8"),
      enumKeys = require("d");
  module.exports = Object.assign || function assign(target, source) {
    var T = Object($.assertDefined(target)),
        l = arguments.length,
        i = 1;
    while (l > i) {
      var S = $.ES5Object(arguments[i++]),
          keys = enumKeys(S),
          length = keys.length,
          j = 0,
          key;
      while (length > j)
        T[key = keys[j++]] = S[key];
    }
    return T;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("b", ["8"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("8"),
      global = $.g,
      core = $.core,
      isFunction = $.isFunction;
  function ctx(fn, that) {
    return function() {
      return fn.apply(that, arguments);
    };
  }
  $def.F = 1;
  $def.G = 2;
  $def.S = 4;
  $def.P = 8;
  $def.B = 16;
  $def.W = 32;
  function $def(type, name, source) {
    var key,
        own,
        out,
        exp,
        isGlobal = type & $def.G,
        isProto = type & $def.P,
        target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {}).prototype,
        exports = isGlobal ? core : core[name] || (core[name] = {});
    if (isGlobal)
      source = name;
    for (key in source) {
      own = !(type & $def.F) && target && key in target;
      if (own && key in exports)
        continue;
      out = own ? target[key] : source[key];
      if (isGlobal && !isFunction(target[key]))
        exp = source[key];
      else if (type & $def.B && own)
        exp = ctx(out, global);
      else if (type & $def.W && target[key] == out)
        !function(C) {
          exp = function(param) {
            return this instanceof C ? new C(param) : C(param);
          };
          exp.prototype = C.prototype;
        }(out);
      else
        exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
      exports[key] = exp;
      if (isProto)
        (exports.prototype || (exports.prototype = {}))[key] = out;
    }
  }
  module.exports = $def;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("d", ["8"], true, function(require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = require("8");
  module.exports = function(it) {
    var keys = $.getKeys(it),
        getDesc = $.getDesc,
        getSymbols = $.getSymbols;
    if (getSymbols)
      $.each.call(getSymbols(it), function(key) {
        if (getDesc(it, key).enumerable)
          keys.push(key);
      });
    return keys;
  };
  global.define = __define;
  return module.exports;
});

System.register('0', ['1', '2', '3'], function (_export) {
	var SettingsService, _createClass, _classCallCheck, settingsProvider;

	return {
		setters: [function (_3) {
			SettingsService = _3.SettingsService;
		}, function (_) {
			_createClass = _['default'];
		}, function (_2) {
			_classCallCheck = _2['default'];
		}],
		execute: function () {
			'use strict';

			settingsProvider = (function () {
				function settingsProvider() {
					_classCallCheck(this, settingsProvider);

					this.instance = new SettingsService();
				}

				_createClass(settingsProvider, [{
					key: 'setDefaults',
					value: function setDefaults(newDebugData) {
						this.instance.setDefaults(newDebugData);
					}
				}, {
					key: '$get',
					value: function $get() {
						return this.instance;
					}
				}]);

				return settingsProvider;
			})();

			angular.module('angular-settings', []).provider('settings', settingsProvider);

			_export('settingsProvider', settingsProvider);

			//
			//angular.module('Application', ['angular-settings'])
			//    .config((settingsProvider) => {
			//
			//        settingsProvider.setDefaults({
			//            API_KEY: 'eakwekajkejawkjekawj'
			//        });
			//
			//    })
			//    .run((debugService) => {
			//        console.log(debugService.get('API_KEY'));
			//        debugService.set('API_KEY', 'newKey');
			//        console.log(debugService.get('API_KEY'));
			//    });
			//
			//angular.element(document).ready(function () {
			//    angular.bootstrap(document, ['Application']);
			//});
		}
	};
});
System.register('1', ['2', '3', '4'], function (_export) {
	var _createClass, _classCallCheck, _Object$assign, LOCAL_STORAGE_KEY, SettingsService;

	return {
		setters: [function (_) {
			_createClass = _['default'];
		}, function (_2) {
			_classCallCheck = _2['default'];
		}, function (_3) {
			_Object$assign = _3['default'];
		}],
		execute: function () {
			'use strict';

			LOCAL_STORAGE_KEY = 'AngularSettingService';

			SettingsService = (function () {
				function SettingsService(storage) {
					_classCallCheck(this, SettingsService);

					this.currentSettings = {};
					this.defaultSettings = {};
					this.storage = storage || window.localStorage;

					this._mergeLocallyStoredSettings();
				}

				_createClass(SettingsService, [{
					key: '_mergeLocallyStoredSettings',
					value: function _mergeLocallyStoredSettings() {
						this.currentSettings = _Object$assign(this.currentSettings, JSON.parse(this.storage.getItem(LOCAL_STORAGE_KEY)));
					}
				}, {
					key: 'clear',
					value: function clear() {
						this.currentSettings = {};
						this.storage.removeItem(LOCAL_STORAGE_KEY);
					}
				}, {
					key: 'setDefaults',
					value: function setDefaults(defaultSettings) {
						this.currentSettings = _Object$assign(this.currentSettings, defaultSettings);
						this.defaultSettings = _Object$assign(this.defaultSettings, defaultSettings);
						this._mergeLocallyStoredSettings();
					}
				}, {
					key: '_set',
					value: function _set(key, value) {
						if (!value) {
							value = {};
						}

						this.currentSettings[key] = value;

						debugger;

						this.storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.currentSettings));
					}
				}, {
					key: 'set',
					value: function set(key, value, namespace) {
						if (key.includes(':') || namespace) {

							var namespaceParsed = '';
							var tempKey = '';

							if (namespace) {
								namespaceParsed = namespace;
								tempKey = key;
							} else {
								var keys = key.split(':');
								namespaceParsed = keys[0];
								tempKey = keys[1];
							}

							var newNamespace = {};
							newNamespace[tempKey] = value;

							var oldNamespace = this._get(namespaceParsed) || {};

							var mergedNamespace = _Object$assign(oldNamespace, newNamespace);

							this._set(namespaceParsed, mergedNamespace);
						} else {
							this._set(key, value);
						}
					}
				}, {
					key: '_get',
					value: function _get(key) {
						return this.currentSettings[key];
					}
				}, {
					key: 'get',
					value: function get(key) {
						if (key.includes(':')) {
							var keys = key.split(':');
							var namespace = keys[0];
							var tempKey = keys[1];

							if (!this.currentSettings[namespace]) {
								return undefined;
							}

							return this.currentSettings[namespace][tempKey];
						} else {
							return this._get(key);
						}
					}
				}, {
					key: 'enabled',
					value: function enabled(key) {
						return this.currentSettings[key] === true;
					}
				}, {
					key: 'disabled',
					value: function disabled(key) {
						return !this.enabled(key);
					}
				}, {
					key: 'current',
					get: function get() {
						return this.currentSettings;
					},
					set: function set(settingDefaults) {
						this.currentSettings = settingDefaults;
					}
				}, {
					key: 'default',
					get: function get() {
						return this.defaultSettings;
					}
				}]);

				return SettingsService;
			})();

			_export('SettingsService', SettingsService);
		}
	};
});
})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define([], factory);
  else
    factory();
});
//# sourceMappingURL=angular-settings.js.map