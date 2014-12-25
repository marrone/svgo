'use strict';

exports.type = 'perItem';

exports.active = false;

/**
 * Remove <font-face>, <font>
 *
 * @param {Object} item current iteration item
 * @return {Boolean} if false, item will be filtered out
 *
 * @author Mike M
 */
exports.fn = function(item) {

    return !item.isElem() || !(/^font/.test(item.elem));

};
