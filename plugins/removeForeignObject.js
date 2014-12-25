'use strict';

exports.type = 'perItem';

exports.active = false;

/**
 * Remove <foreignObject>.
 *
 * @param {Object} item current iteration item
 * @return {Boolean} if false, item will be filtered out
 *
 * @author Mike M
 */
exports.fn = function(item) {

    return !item.isElem('foreignobject');

};
