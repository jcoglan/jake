JS.extend(Ojay, /** @scope Ojay */ {
    /**
     * <p>Returns <tt>true</tt> iff the given value is truthy and is not just whitespace.</p>
     * @param {String} value
     * @returns {Boolean}
     */
    isBlank: function(value) {
        return value ? false : (String(value).trim() == '');
    },
    
    /**
     * <p>Returns <tt>true</tt> iff the given <tt>value</tt> is a number.</p>
     * @param {String} value
     * @returns {Boolean}
     */
    isNumeric: function(value) {
        return this.NUMBER_FORMAT.test(String(value));
    },
    
    /**
     * <p>Returns <tt>true</tt> iff the given <tt>value</tt> is an email address.</p>
     * @param {String} value
     * @returns {Boolean}
     */
    isEmailAddress: function(value) {
        return this.EMAIL_FORMAT.test(String(value));
    },
    
    /**
     * <p>JSON number definition from http://json.org</p>
     */
    NUMBER_FORMAT: /^\-?(0|[1-9]\d*)(\.\d+)?(e[\+\-]?\d+)?$/i,
    
    /**
     * <p>Format for valid email addresses from http://www.regular-expressions.info/email.html</p>
     */
    EMAIL_FORMAT: /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b$/i
});

Ojay.Forms = function(description) {
    description.call(DSL);
};

// Stores all instances of styled form controls.
var styledInputs = [];

JS.extend(Ojay.Forms, /** @scope Ojay.Forms */{
    /**
     * <p>Returns an Ojay collection wrapping the label for the given input.</p>
     * @param {String|HTMLElement|DomCollection} input
     * @returns {DomCollection}
     */
    getLabel: function(input) {
        input = Ojay(input);
        if (!input.node) return Ojay();
        var label = input.ancestors('label');
        if (label.node) return label.at(0);
        var id = input.node.id;
        label = [].filter.call(document.getElementsByTagName('label'), function(label) { return id && label.htmlFor == id; });
        return Ojay(label.slice(0,1));
    },
    
    /**
     * <p>Returns the serialization of the given <tt>form</tt> as a string.</p>
     * @param {String|HTMLElement|DomCollection} form
     * @returns {String}
     */
    getQueryString: function(form) {
        var data = YAHOO.util.Connect.setForm(Ojay(form).node);
        YAHOO.util.Connect.resetFormState();
        return data;
    },
    
    /**
     * <p>Returns the serialization of the given <tt>form</tt> as an object.</p>
     * @param {String|HTMLElement|DomCollection} form
     * @returns {Object}
     */
    getData: function(form) {
        return this.getQueryString(form).split('&').reduce(function(memo, pair) {
            var data = pair.split('=').map(decodeURIComponent).map('trim');
            if (memo[data[0]] === undefined) memo[data[0]] = data[1];
            return memo;
        }, {});
    },
    
    /**
     * @param {String|HTMLElement|DomCollection}
     * @param {String|Boolean} value
     */
    setValue: function(element, value) {
        var selected, options, element = Ojay(element);
        switch (true) {
            
            case element.every({matches: '[type=radio]'}) :
                selected = element.map('node').filter({value: value})[0];
                if (!selected) return;
                element.setAttributes({checked: false});
                selected.checked = true;
                break;
            
            case element.matches('[type=checkbox]') :
                element.node.checked = !!(value === true || value == element.node.value);
                break;
            
            case element.matches('select') :
                options = Array.from(element.node.options);
                selected = options.filter({value: value})[0];
                if (!selected) return;
                options.forEach(function(option) { option.selected = false });
                selected.selected = true;
                break;
            
            case element.matches('input') :
            case element.matches('[type=hidden]') :
            case element.matches('textarea') :
                element.node.value = String(value);
                break;
        }
    }.curry(),
    
    /**
     * <p>Goes through all sets of form rules and makes sure each one is associated with
     * an existing form in the document. Useful for replacing a form dynamically and then
     * reattaching all the rules. Returns the number of reattached forms.</p>
     * @returns {Number}
     */
    reattach: function() {
        var n = 0;
        for (var id in forms) {
            if (forms[id]._attach()) ++n;
        }
        return n;
    },
    
    /**
     * <p>Makes sure all styled form inputs are displaying the right values from the
     * underlying form inputs.</p>
     */
    update: function() {
        styledInputs.forEach(function(input) {
            if (input.isA(Ojay.Forms.Select)) input._updateDisplayFromSelect();
            else input.setChecked();
        });
    }
});
