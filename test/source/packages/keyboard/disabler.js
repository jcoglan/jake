/**
 * <p>The <tt>Disabler</tt> is in charge of deciding whether to prevent the default browser
 * behaviour for a given set of keys. Keyboard rules register with this object to cause
 * their behaviour to override the default behaviour. Some browsers do not allow certain
 * key comibnations to be overridden, so choose your key combinations carefully.</p>
 */
var Disabler = new JS.Singleton({
    _rules: [],
    
    /**
     * <p>Adds a <tt>Rule</tt> to the list.</p>
     * @param {Rule} rule
     */
    _register: function(rule) {
        this._rules.push(rule);
    },
    
    /**
     * <p>Removes a <tt>Rule</tt> from the list.</p>
     * @param {Rule} rule
     */
    _unregister: function(rule) {
        this._rules = this._rules.filter(function(x) { return x != rule; });
    },
    
    /**
     * <p>Given an event and the current key signature, decides whether to prevent the
     * default reaction to the event.</p>
     * @param {Event} evnt
     * @param {String} signature
     */
    _processEvent: function(evnt, signature) {
        if (this._recognizesSignature(signature))
            Event.preventDefault(evnt);
    },
    
    /**
     * <p>Returns <tt>true</tt> iff the current list of rules contains any rule whose
     * key combination matches the given signature.</p>
     * @param {String} signature
     * @returns {Boolean}
     */
    _recognizesSignature: function(signature) {
        for (var i = 0, n = this._rules.length; i < n; i++) {
            if (this._rules[i].getSignature() == signature)
                return true;
        }
        return false;
    }
});
