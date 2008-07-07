/**
 * <p>The <tt>FormErrors</tt> class provides append-only access to error lists for the
 * purposes of validation. Validation routines cannot modify existing errors or remove
 * them from the list, so existing validation rules cannot be bypassed.</p>
 * @contructor
 * @class FormErrors
 * @private
 */
var FormErrors = new JS.Class(/** @scope FormErrors.prototype */{
    initialize: function(form) {
        var errors = {}, base = [];
        
        /**
         * <p>Creates storage space to put errors for the named field</p>
         * @param {String} field
         * @returns {FormErrors}
         */
        this.register = function(field) {
            errors[field] = errors[field] || [];
            return this;
        };
        
        /**
         * <p>Adds an error to the given <tt>field</tt> with message <tt>message</tt>.</p>
         * @param {String} field
         * @param {String} message
         * @returns {FormErrors}
         */
        this.add = function(field, message) {
            this.register(field);
            if (errors[field].indexOf(message) == -1) errors[field].push(message);
            return this;
        };
        
        /**
         * <p>Adds an error to the form as a whole rather than to an individual field.</p>
         * @param {String} message
         * @returns {FormErrors}
         */
        this.addToBase = function(message) {
            base.push(message);
            return this;
        };
        
        /**
         * <p>Returns the number of errors.</p>
         * @returns {Number}
         */
        this._count = function() {
            var n = base.length;
            for (var field in errors) n += errors[field].length;
            return n;
        };
        
        /**
         * <p>Returns an array of objects representing the errors in the form.<p>
         * @returns {Array}
         */
        this._messages = function() {
            var name, messages = base.map(function(message) {
                return {field: null, message: message};
            });
            for (var field in errors) {
                name = form._getName(field);
                errors[field].forEach(function(message) {
                    messages.push({field: field, message: name + ' ' + message});
                });
            }
            return messages;
        };
        
        /**
         * <p>Returns a list of field names that currently are invalid.</p>
         * @returns {Array}
         */
        this._fields = function() {
            var fields = [];
            for (var field in errors) fields.push(field);
            return fields;
        };
    }
});
