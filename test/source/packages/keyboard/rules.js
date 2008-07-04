/**
 * <p> The <tt>Rule</tt> class encapsulates the binding of an action to a set of keys. It is
 * private, i.e. it is only accessible to the internals of the <tt>Keyboard</tt> module, but
 * instances of it may be returned by the <tt>Keyboard</tt> interface.</p>
 * @constructor
 * @private
 * @class Rule
 */
var Rule = new JS.Class({
    /**
     * @param {HTMLElement} node
     * @param {String|Array} keylist
     * @param {Function} callback
     * @param {Object} scope
     */
    initialize: function(node, keylist, callback, scope) {
        node = Ojay(node).node;
        if (scope) callback = callback.bind(scope);
        this._codes = codesFromKeys(keylist);
        this._listener = new KeyListener(node, hashFromCodes(this._codes), callback);
    },
    
    /**
     * <p>Makes the rule active.</p>
     * @returns {Rule}
     */
    enable: function() {
        this._active = true;
        this._listener.enable();
        this._prevents_default && Disabler._register(this);
        return this;
    },
    
    /**
     * <p>Makes the rule inactive.</p>
     * @returns {Rule}
     */
    disable: function() {
        this._active = false;
        this._listener.disable();
        this._prevents_default && Disabler._unregister(this);
        return this;
    },
    
    /**
     * <p>Causes the rule to prevent the browser's default behaviour.</p>
     * @returns {Rule}
     */
    preventDefault: function() {
        this._prevents_default = true;
        this._active && Disabler._register(this);
        return this;
    },
    
    /**
     * <p>Causes the rule to allow the browser's default behaviour.</p>
     * @returns {Rule}
     */
    allowDefault: function() {
        this._prevents_default = false;
        this._active && Disabler._unregister(this);
        return this;
    },
    
    /**
     * <p>Returns a string that represents the set of key codes the rule applies to.</p>
     * @returns {String}
     */
    getSignature: function() {
        var sig = signature(this._codes);
        this.getSignature = function() { return sig; };
        return sig;
    }
});

/**
 * <p>The <tt>RuleSet</tt> class is used to set up contexts in which key combinations are mapped
 * to actions. These contexts can be activated and deactivated easily to modify the behaviour of
 * the keyboard. This class is publicly accessible. An example:</p>
 *
 * <pre><code>    var rules = new Ojay.Keyboard.RuleSet({
 *         'UP':            function() { console.log('up'); },
 *         'CONTROL DOWN':  function() { console.log('down'); },
 *         'ALT SHIFT K':   function() { console.log('weird') }
 *     });</code></pre>
 *
 * @constructor
 * @public
 * @class RuleSet
 */
Keyboard.RuleSet = new JS.Class({
    /**
     * @param {Object} definitions
     */
    initialize: function(definitions) {
        this._rules = {};
        var keylist, rule;
        for (keylist in definitions) {
            rule = new Rule(document, keylist, definitions[keylist]);
            // Store rules by signature to prevent duplicate key combinations
            this._rules[rule.getSignature()] = rule;
        }
    },
    
    /**
     * <p>Calls the given function with each rule in the set in turn.</p>
     * @param {Function} block
     * @param {Object} context
     */
    forEach: function(block, context) {
        block = Function.from(block);
        for (var signature in this._rules)
            block.call(context || null, this._rules[signature]);
    },
    
    /**
     * <p>Enables the set of rules.</p>
     * @returns {Keyboard.RuleSet}
     */
    enable: function() {
        this.forEach('enable');
        return this;
    },
    
    /**
     * <p>Disables the set of rules.</p>
     * @returns {Keyboard.RuleSet}
     */
    disable: function() {
        this.forEach('disable');
        return this;
    },
    
    /**
     * @param {String} keys
     * @returns {Rule}
     */
    get: function(keys) {
        return this._rules[signature(codesFromKeys(keys))] || null;
    },
    
    /**
     * @param {RuleSet} ruleSet
     * @returns {RuleSet}
     */
    merge: function(ruleSet) {
        var rules = {},
            addRule = function(rule) { rules[rule.getSignature()] = rule; };
        
        [this, ruleSet].forEach({forEach: addRule});
        var set = new this.klass({});
        set._rules = rules;
        return set;
    }
});
