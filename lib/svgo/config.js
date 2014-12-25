'use strict';

var FS = require('fs');
var path = require('path');
var yaml = require('js-yaml');

var EXTEND = require('whet.extend');

/**
 * Read and/or extend/replace default config file,
 * prepare and optimize plugins array.
 *
 * @param {Object} [config] input config
 * @return {Object} output config
 */
module.exports = function(config) {

    var defaults;

    if (config && config.full) {

        defaults = config;

        if (defaults.plugins) {
            defaults.plugins = preparePluginsArray(defaults.plugins);
            defaults.plugins = optimizePluginsArray(defaults.plugins);
        }

        defaults.multipass = config.multipass;

    } else {

        defaults = EXTEND({}, yaml.safeLoad(FS.readFileSync(__dirname + '/../../.svgo.yml', 'utf8')));

        if (config) {
            defaults = extendConfig(defaults, config);
            defaults.multipass = config.multipass;
        }

        defaults.plugins = preparePluginsArray(defaults.plugins);

        defaults.plugins = optimizePluginsArray(defaults.plugins);

    }

    return defaults;

};

/**
 * Require() all plugins in array.
 *
 * @param {Array} plugins input plugins array
 * @return {Array} input plugins array of arrays
 */
function preparePluginsArray(plugins) {

    var plugin,
        key;

    var defaultPluginPath = "../../plugins/";
    function requirePlugin(item, name) {
        var plugPath = defaultPluginPath;
        if(item && name && (typeof item[name] === 'object') && item[name].pluginPath) {
            plugPath = item[name].pluginPath;
        }
        else if(item && (typeof item === 'object') && item.pluginPath) {
            plugPath = item.pluginPath;
        }
        else if(!name) {
            name = item;
        }
        return EXTEND({}, require(path.join(plugPath, name)));
    }

    return plugins.map(function(item) {

        // {}
        if (typeof item === 'object') {

            key = item.name || Object.keys(item)[0];

            plugin = requirePlugin(item, key);

            // name: {}
            if (typeof item[key] === 'object') {
                plugin.params = EXTEND({}, plugin.params || {}, item[key]);
                plugin.active = true;

            // name: false
            } else if (item[key] === false) {
               plugin.active = false;

            // name: true
            } else if (item[key] === true) {
               plugin.active = true;
            }

            plugin.name = key;

        // name
        } else {

            plugin = requirePlugin(item);
            plugin.name = item;

        }

        return plugin;

    });

}

/**
 * Extend plugins with the custom config object.
 *
 * @param {Array} plugins input plugins
 * @param {Object} config config
 * @return {Array} output plugins
 */
function extendConfig(defaults, config) {

    var key;

    function extendPlugin(plugin, item, key) {
        // name: {}
        if (typeof item[key] === 'object') {
            plugin.params = EXTEND({}, plugin.params || {}, item[key]);
            if(plugin.params.pluginPath) {
                plugin.pluginPath = plugin.params.pluginPath;
                delete plugin.params.pluginPath;
            }
            plugin.active = true;

        // name: false
        } else if (item[key] === false) {
           plugin.active = false;

        // name: true
        } else if (item[key] === true) {
           plugin.active = true;
        }

        if(!plugin.name) {
            plugin.name = key;
        }
    }

    // plugins
    if (config.plugins) {

        config.plugins.forEach(function(item) {

            // {}
            if (typeof item === 'object') {

                key = item.name || Object.keys(item)[0];

                var foundDefault = false;
                defaults.plugins.forEach(function(plugin) {
                    if (plugin.name === key) {
                        foundDefault = true;
                        extendPlugin(plugin, item, key);
                    }
                });
                if(!foundDefault) {
                    var plugin = {};
                    defaults.plugins.push(plugin);
                    extendPlugin(plugin, item, key);
                }

            }

        });

    }

    // svg2js
    if (config.svg2js) {
        defaults.svg2js = config.svg2js;
    }

    // js2svg
    if (config.js2svg) {
        defaults.js2svg = config.js2svg;
    }

    return defaults;

}

/**
 * Try to group sequential elements of plugins array.
 *
 * @param {Object} plugins input plugins
 * @return {Array} output plugins
 */
function optimizePluginsArray(plugins) {

    var prev;

    plugins = plugins.map(function(item) {
        return [item];
    });

    plugins = plugins.filter(function(item) {

        if (prev && item[0].type === prev[0].type) {
            prev.push(item[0]);
            return false;
        }

        prev = item;

        return true;

    });

    return plugins;

}
