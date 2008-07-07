/**
 * @overview
 *
 * <p><tt>Ojay.Forms</tt> provides a DSL-style API for writing specs for validating form input,
 * handling errors when they occur, and allowing forms to be submitted using Ajax. Its most basic
 * building block is the <tt>requires</tt> statement, which expresses the fact that a given field
 * must contain some data in order to be valid. You write all your form specs within a block like
 * the following:</p>
 *
 * <pre><code>    Ojay.Forms(function() { with(this) {
 *         
 *         // The form with id 'foo' requires field named 'bar'
 *         form('foo').requires('bar');
 *     }});</code></pre>
 *
 * <p>Note that, although all these examples have their own <tt>Ojay.Forms()</tt> block, you could
 * put them all in one block together.</p>
 *
 * <p>You can also use the word <tt>expects</tt> in place of <tt>requires</tt> -- the two perform
 * exactly the same function. As well as simply requiring a field, you can say what form the input
 * should take using a variety of pre-built validator functions. Here's an example:</p>
 *
 * <pre><code>    Ojay.Forms(function() { with(this) {
 *         
 *         form('theForm')
 *             .requires('username').toHaveLength({minimum: 6})
 *             .requires('email').toMatch(EMAIL_FORMAT)
 *             .expects('tickets').toBeNumeric();
 *     }});</code></pre>
 *
 * <p>The full list of validator methods can be found in the <tt>RequirementDSL</tt> class. All
 * requirments take as their last argument an optional string specifying the text that should
 * be displayed in the error message if the field is invalid. Additionally, the <tt>requires</tt>
 * and <tt>expects</tt> methods take an optional argument to specify how the name of the field
 * should be presented. If no custom name is given for the field, a name is inferred from the field's
 * label or its <tt>name</tt> attribute.</p>
 *
 * <pre><code>    Ojay.Forms(function() { with(this) {
 *         
 *         // Gives message "User email is not valid"
 *         form('signup').requires('userEmail').toMatch(EMAIL_FORMAT);
 *         
 *         // Gives message "Your email address is not valid"
 *         form('signup').requires('userEmail', 'Your email address').toMatch(EMAIL_FORMAT);
 *         
 *         // Gives message "User email is not a valid email address"
 *         form('signup').requires('userEmail').toMatch(EMAIL_FORMAT, 'is not a valid email address');
 *     }});</code></pre>
 *
 * <p>You can add your own custom validation routines using the <tt>validates</tt> method. In
 * your validation callback, you have access to the form's data and its error list. You can
 * read from the data and add errors as follows:</p>
 *
 * <pre><code>    Ojay.Forms(function() { with(this) {
 *         
 *         form('purchase').validates(function(data, errors) {
 *             
 *             // Check a field and add error to that field
 *             if (data.get('ccNumber').length != 16)
 *                 errors.add('ccNumber', 'is not a valid credit card number');
 *             
 *             // Check two fields and add error to the form
 *             // rather than to a specific field
 *             if (data.get('start') > data.get('end'))
 *                 errors.addToBase('Start date must be before end date');
 *         });
 *     }});</code></pre>
 *
 * <p>Once you've set up all your rules you'll want to do something with the errors. This
 * is where the helper function <tt>when</tt> comes in. <tt>when</tt> is used to set up
 * responses to events, and can handle validation events. In the example below, the callback
 * is passed an array of errors, each of which has a <tt>field</tt> property that says which
 * input name it belongs to (null if it was added using <tt>addToBase</tt>) and a
 * <tt>message</tt> field that contains the full text of the error message.</p>
 *
 * <pre><code>    Ojay.Forms(function() { with(this) {
 *         
 *         when('purchase').isValidated(function(errors) {
 *             errors.forEach(function(error) {
 *                 Ojay('#someElement').insert(error.message, 'top');
 *             });
 *         });
 *         
 *         // Ojay provides a pre-build error handler that lists the
 *         // errors in the element you specify:
 *         when('purchase').isValidated(displayErrorsIn('#error-list'));
 *     }});</code></pre>
 *
 * <p>Finally, the DSL allows you specify that a form submits using Ajax. To use this
 * feature, you just need to tell Ojay what to do with the server response. For example:</p>
 *
 * <pre><code>    Ojay.Forms(function() { with(this) {
 *         
 *         form('login').submitsUsingAjax();
 *         
 *         when('login').responseArrives(function(response) {
 *             Ojay('#response').setContent(response.responseText);
 *         });
 *         
 *         // Or use Ojay's pre-built display method:
 *         when('login').responseArrives(displayResponseIn('#response'));
 *     }});</code></pre>
 */

// Store to hold sets of form rules, entry per page form.
var forms = {};

/**
 * <p>Returns the <tt>FormDescription</tt> for the given <tt>id</tt>. A new description is
 * created if one does not already exist for the <tt>id</tt>.</p>
 * @param {String} id
 * @returns {FormDescription}
 * @private
 */
var getForm = function(id) {
    return forms[id] || (forms[id] = new FormDescription(id));
};

/**
 * <p>This is the main DSL object for <tt>Ojay.Forms</tt>. It contains methods that should
 * act as top-level functions in the DSL. Do not put a method in here unless it needs to be
 * a top-level function.</p>
 * @private
 */
var DSL = {
    /**
     * <p>Returns a DSL object for describing the form with the given <tt>id</tt>.</p>
     * @param {String} id
     * @returns {FormDSL}
     */
    form: function(id) {
        return getForm(id)._dsl || null;
    },
    
    /**
     * <p>Returns a DSL object for handling events related to the form with the
     * given <tt>id</tt>.</p>
     * @param {String} id
     * @returns {WhenDSL}
     */
    when: function(id) {
        return getForm(id)._when || null;
    },
    
    /**
     * <p>Returns a DSL object for applying pre-processing filters before events take place.</p>
     * @param {String} id
     * @returns {BeforeDSL}
     */
    before: function(id) {
        return getForm(id)._before || null;
    },
    
    /**
     * <p>Returns a helper function for use with <tt>when().isValidated()</tt>. The returned
     * function will display the forms elements as a bulleted list inside the element you
     * supply, in a <tt>div</tt> with the class name <tt>error-explanation</tt>.</p>
     * @param {String|HTMLElement|DomCollection} element
     * @returns {Function}
     */
    displayErrorsIn: function(element) {
        return function(errors) {
            element = element.setContent ? element : Ojay(element);
            var n = errors.length;
            if (n == 0) return element.setContent('');
            var were = (n == 1) ? 'was' : 'were', s = (n == 1) ? '' : 's';
            element.setContent(Ojay.HTML.div({className: 'error-explanation'}, function(HTML) {
                HTML.p('There ' + were + ' ' + n + ' error' + s + ' with the form:');
                HTML.ul(function(HTML) {
                    errors.map('message').forEach(HTML.method('li'));
                });
            }));
        };
    },
    
    /**
     * <p>Returns a helper function for use with <tt>when().responseArrives()</tt>. The returned
     * function will take the HTTP response body and display it in the specified element.</p>
     * @param {String|HTMLElement|DomCollection} element
     * @returns {Function}
     */
    displayResponseIn: function(element) {
        return function(response) {
            response.insertInto(element);
        };
    },
    
    EMAIL_FORMAT: Ojay.EMAIL_FORMAT
};

/**
 * <p>The <tt>FormDSL</tt> class creates DSL objects used to describe forms. Every
 * <tt>FormDescription</tt> instance has one of these objects that provides DSL-level
 * access to the description.</p>
 * @constructor
 * @class FormDSL
 * @private
 */
var FormDSL = new JS.Class(/** @scope FormDSL.prototype */{
    /**
     * @param {FormDescription} form
     */
    initialize: function(form) {
        this._form = form;
    },
    
    /**
     * <p>Returns a <tt>RequirementDSL</tt> object used to specify the requirement.</p>
     * @param {String} name
     * @param {String} displayed
     * @returns {RequirementDSL}
     */
    requires: function(name, displayed) {
        var requirement = this._form._getRequirement(name);
        if (displayed) this._form._displayNames[name] = displayed;
        return requirement._dsl;
    },
    
    /**
     * <p>Adds a validator function to the form that allows the user to inspect the data
     * and add new errors.</p>
     * @param {Function} block
     * @returns {FormDSL}
     */
    validates: function(block) {
        this._form._validators.push(block);
        return this;
    },
    
    /**
     * <p>Causes form submissions to be sent using Ajax rather than page-reloading requests.</p>
     * @param {Object} options
     * @returns {FormDSL}
     */
    submitsUsingAjax: function(options) {
        this._form._ajax = true;
        return this;
    },
    
    /**
     * <p>Causes the form to indicate which field in currently focused by applying a class
     * name to the focused input element.</p>
     * @returns {FormDSL}
     */
    highlightsActiveField: function() {
        this._form._highlightActiveField();
        return this;
    }
});

FormDSL.include({expects: FormDSL.prototype.requires});

var FormDSLMethods = ['requires', 'expects', 'validates', 'submitsUsingAjax', 'highlightsActiveField'];

/**
 * <p>The <tt>RequirementDSL</tt> class creates DSL objects used to describe form requirements.
 * All <tt>FormRequirement</tt> objects have one of these objects associated with them.</p>
 * @constructor
 * @class RequirementDSL
 * @private
 */
var RequirementDSL = new JS.Class(/** @scope RequirementDSL.prototype */{
    /**
     * @param {FormRequirement} requirement
     */
    initialize: function(requirement) {
        this._requirement = requirement;
    },
    
    /**
     * <p>Specifies that the given checkbox field must be checked.</p>
     * @param {String} message
     * @returns {RequirementDSL}
     */
    toBeChecked: function(message) {
        var requirement = this._requirement;
        this._requirement._add(function(value) {
            var element = requirement._elements.node;
            return (value == element.value && element.checked) || [message || 'must be checked'];
        });
        return this;
    },
    
    /**
     * <p>Specifies that the required field must be a number in order to be considered valid.</p>
     * @param {String} message
     * @returns {RequirementDSL}
     */
    toBeNumeric: function(message) {
        this._requirement._add(function(value) {
            return Ojay.isNumeric(value) || [message || 'must be a number'];
        });
        return this;
    },
    
    /**
     * <p>Specifies that the required field must have one of the values in the given list in
     * order to be considered valid.</p>
     * @param {Array} list
     * @param {String} message
     * @returns {RequirementDSL}
     */
    toBeOneOf: function(list, message) {
        this._requirement._add(function(value) {
            return list.indexOf(value) != -1 || [message || 'is not valid'];
        });
        return this;
    },
    
    /**
     * <p>Specifies that the required field must have none of the values in the given list in
     * order to be considered valid.</p>
     * @param {Array} list
     * @param {String} message
     * @returns {RequirementDSL}
     */
    toBeNoneOf: function(list, message) {
        this._requirement._add(function(value) {
            return list.indexOf(value) == -1 || [message || 'is not valid'];
        });
        return this;
    },
    
    /**
     * <p>Specifies that the required field must not be blank in order to be considered valid.
     * Calling this method is only necessary if you want a custom message for the rule, otherwise
     * a simple <tt>requires()</tt> will do.</p>
     * @param {String} message
     * @returns {RequirementDSL}
     */
    toBePresent: function(message) {
        this._requirement._add(function(value) {
            return !Ojay.isBlank(value) || [message || 'must not be blank'];
        });
        return this;
    },
    
    /**
     * <p>Specifies that the required field must confirm the value in another field.</p>
     * @param {String} field
     * @param {String} message
     * @returns {RequirementDSL}
     */
    toConfirm: function(field, message) {
        this._requirement._add(function(value, data) {
            return value == data.get(field) || [message || 'must be confirmed', field];
        });
        return this;
    },
    
    /**
     * <p>Specifies that the required field must have a certain length in order to be considered
     * valid. Valid inputs are a number (to specify an exact length), or an object with
     * <tt>minimum</tt> and <tt>maximum</tt> fields.</p>
     * @param {Number|Object} options
     * @param {String} message
     * @returns {RequirementDSL}
     */
    toHaveLength: function(options, message) {
        var min = options.minimum, max = options.maximum;
        this._requirement._add(function(value) {
            return  (typeof options == 'number' && value.length != options &&
                        [message || 'must contain exactly ' + options + ' characters']) ||
                    (min !== undefined && value.length < min &&
                        [message || 'must contain at least ' + min + ' characters']) ||
                    (max !== undefined && value.length > max &&
                        [message || 'must contain no more than ' + max + ' characters']) ||
                    true;
        });
        return this;
    },
    
    /**
     * <p>Specifies that the required field must have a certain value in order to be considered
     * valid. Input should be an object with <tt>minimum</tt> and <tt>maximum</tt> fields.</p>
     * @param {Object} options
     * @param {String} message
     * @returns {RequirementDSL}
     */
    toHaveValue: function(options, message) {
        var min = options.minimum, max = options.maximum;
        this._requirement._add(function(value) {
            if (!Ojay.isNumeric(value)) return [message || 'must be a number'];
            value = Number(value);
            return  (min !== undefined && value < min &&
                        [message || 'must be at least ' + min]) ||
                    (max !== undefined && value > max &&
                        [message || 'must not be greater than ' + max]) ||
                    true;
        });
        return this;
    },
    
    /**
     * <p>Specifies that the required field must match a given regex in order to be considered
     * valid.</p>
     * @param {Regexp} format
     * @param {String} message
     * @returns {RequirementDSL}
     */
    toMatch: function(format, message) {
        this._requirement._add(function(value) {
            return format.test(value) || [message || 'is not valid'];
        });
        return this;
    }
});

RequirementDSL.include(FormDSLMethods.reduce(function(memo, method) {
    memo[method] = function() {
        var base = this._requirement._form._dsl;
        return base[method].apply(base, arguments);
    };
    return memo;
}, {}));

/**
 * <p>The <tt>WhenDSL</tt> class creates DSL objects used to describe form requirements. All
 * <tt>FormDescription</tt> objects have one of these objects associated with them. The WhenDSL
 * is used specifically to describe events linked to forms.</p>
 * @constructor
 * @class WhenDSL
 * @private
 */
var WhenDSL = new JS.Class(/** @scope WhenDSL.prototype */{
    /**
     * @param {FormDescription} form
     */
    initialize: function(form) {
        this._form = form;
    },
    
    /**
     * <p>Allows a hook to be registered to say what should be done with the list of error
     * messages when a particular form is validated.</p>
     * @param {Function} block
     * @param {Object} context
     */
    isValidated: function(block, context) {
        this._form.subscribe(function(form) {
            block.call(context || null, form._errors._messages());
        });
    },
    
    /**
     * <p>Registers a function to handle the HTTP response when an Ajax form submission completes.</p>
     * @param {Function} block
     * @param {Object} context
     */
    responseArrives: function(block, context) {
        block = Function.from(block);
        if (context) block = block.bind(context);
        this._form._ajaxResponders.push(block);
    }
});

/**
 * <p>The <tt>BeforeDSL</tt> class creates DSL objects used to describe pre-processing actions. All
 * <tt>FormDescription</tt> objects have one of these objects associated with them.</p>
 * @constructor
 * @class BeforeDSL
 * @private
 */
var BeforeDSL = new JS.Class({
    /**
     * @param {FormDescription} form
     */
    initialize: function(form) {
        this._form = form;
    },
    
    /**
     * @param {Function} block
     */
    isValidated: function(block) {
        this._form._dataFilters.push(block);
    }
});
