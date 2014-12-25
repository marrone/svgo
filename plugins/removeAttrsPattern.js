exports.type = 'perItem';

exports.active = false;

exports.params = {
    nameAndValueMatch: false, // true if name and value patterns must match, otherwise it is an OR match
    namePattern: null, // regex pattern to match attribute names against
    valuePattern: null // regex pattern to match attribute values against
};

var convertToRE = removeLeadingZero = require('../lib/svgo/tools').toRegExp;

/**
 * Remove attributes that match a given pattern
 *
 * @param {Object} item current iteration item
 * @param {Object} params plugin params
 * @return {Boolean} if false, item will be filtered out
 *
 * @author Mike M
 */
exports.fn = function(item, params) {

    var namePattern = convertToRE(params.namePattern);
    var valuePattern = convertToRE(params.valuePattern);

    function matches(txt, pattern) {
        return pattern && pattern.test(txt);
    }

    if (item.isElem()) {
        item.eachAttr(function(attr) {
            if(params.nameAndValueMatch) {
                if(matches(attr.name, namePattern) && matches(attr.value, valuePattern)) {
                    item.removeAttr(attr.name);
                }
            }
            else if(matches(attr.name, namePattern)) {
                item.removeAttr(attr.name);
            }
            else if(matches(attr.value, valuePattern)) {
                item.removeAttr(attr.name);
            }
        });
    }

};
