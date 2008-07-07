/**
 * <p>The <tt>FormData</tt> class provides read-only access to data objects for the
 * purposes of validation. Validation routines cannot modify form data through this
 * class. To use it, pass an object to the constructor. The resulting instance will
 * provide a <tt>get()</tt> method to retrieve fields from the object but will not
 * let you write to these fields.</p>
 * @contructor
 * @class FormData
 * @private
 */
var FormData = new JS.Class(/** @scope FormData.prototype */{
    /**
     * @param {Object} data
     */
    initialize: function(data) {
        this.get = function(field) {
            return data[field] === undefined ? null : data[field];
        };
    }
});
