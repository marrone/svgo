'use strict';

var FS = require('fs'),
    PATH = require('path'),
    regFilename = /^(.*)\.(\d+)\.svg$/,
    SVGO = require(process.env.COVERAGE ?
                   '../../lib-cov/svgo':
                   '../../lib/svgo');

describe('plugins tests', function() {

    var testParams = JSON.parse(FS.readFileSync(PATH.resolve(__dirname, "_params.json"), "utf-8"));

    FS.readdirSync(__dirname).forEach(function(file) {

        var match = file.match(regFilename),
            index,
            name,
            svgo,
            plugins;

        if (match) {

            name = match[1];
            index = match[2];

            file = PATH.resolve(__dirname, file);

            plugins = {};
            plugins[name] = true;
            if(testParams[name + "." + index]) {
                plugins[name] = testParams[name + "." + index];
            }

            svgo = new SVGO({
                full: true,
                plugins: [ plugins ],
                js2svg: { pretty: true }
            });

            it(name + '.' + index, function(done) {

                FS.readFile(file, 'utf8', function(err, data) {

                    var splitted = data.split('@@@'),
                        orig = splitted[0],
                        should = splitted[1];

                    svgo.optimize(orig, function(result) {
                        result = '\n\n' + result.data;

                        result.should.be.equal(should);
                        done();
                    });

                });

            });

        }

    });

});
