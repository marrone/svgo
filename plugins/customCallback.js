exports.type = 'perItemReverse';

exports.active = false;

exports.params = {
    callback: function(){ return true; }
};

/**
 * Custom handler for each item
 *
 * @param {Object} item current iteration item
 * @param {Object} params plugin params
 * @return {Boolean} if false, item will be filtered out
 *
 * @author Mike M
 */
exports.fn = function(item, params) {

    return params.callback(item);

};
