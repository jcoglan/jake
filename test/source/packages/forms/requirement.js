var isPresent = function(value) {
    return !Ojay.isBlank(value) || ['must not be blank'];
};

/**
 * <p>The <tt>FormRequirement</tt> class encapsulates a set of tests against the value of a single
 * form field. The tests are defined externally and added using the <tt>_add()</tt> method. Each
 * test should be a function that takes a value and decides whether or not it is valid. The
 * <tt>FormRequirement</tt> instance can be used to run all the tests against a field.</p>
 * @constructor
 * @class FormRequirement
 * @private
 */
var FormRequirement = new JS.Class({
    /**
     * @param {FormDescription} form
     * @param {String} field
     */
    initialize: function(form, field) {
        this._form = form;
        this._field = field;
        this._tests = [];
        this._dsl = new RequirementDSL(this);
        this._attach();
    },
    
    /**
     */
    _attach: function() {
        this._elements = this._form._getInputs(this._field);
    },
    
    /**
     * @param {Function} block
     */
    _add: function(block) {
        this._tests.push(block);
    },
    
    /**
     * @param {String} value
     * @param {Object} data
     * @returns {Array|Boolean}
     */
    _test: function(value, data) {
        var errors = [], tests = this._tests.length ? this._tests : [isPresent], value = value || '';
        tests.forEach(function(block) {
            var result = block(value, data), message, field;
            if (result !== true) {
                message = result[0]; field = result[1] || this._field;
                this._form._errors.register(this._field);
                this._form._errors.add(field, message);
            }
        }, this);
        return errors.length ? errors : true;
    }
});
