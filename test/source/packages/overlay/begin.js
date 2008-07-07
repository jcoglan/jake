(function(Ojay) {
/**
 * <p>Returns a function that performs the given method while an overlay is hidden. Use
 * this to generate methods that require the overlay to be visible that can be run while
 * keeping an overlay hidden. The generated method will briefly show the overlay in order
 * to perform the method before hiding it again, and you should not see the overlay appear
 * in most situations.</p>
 * @private
 * @param {String} method
 * @returns {Function}
 */
var whileHidden = function(method) {
    return function() {
        var container = this._elements._container;
        container.setStyle({visibility: 'hidden'});
        this.show('none', {silent: true})[method]().hide('none', {silent: true});
        container.setStyle({visibility: ''});
        return this;
    };
};

