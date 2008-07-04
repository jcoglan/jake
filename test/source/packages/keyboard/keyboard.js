/**
 * <p>The <tt>Keyboard</tt> package is used to set up event listeners that respond to keyboard
 * events. It acts as a wrapper around <tt>YAHOO.util.KeyListener</tt> and provides easier syntax
 * and more control of sets of keyboard rules. To set up a keyboard listener, call:</p>
 *
 * <pre><code>    Ojay.Keyboard.listen(document, 'SHIFT B', function() { ... });</code></pre>
 *
 * <p>This returns a <tt>Rule</tt> instance that lets you disable/enable the listener. See the
 * <tt>Rule</tt> class for more details.</p>
 */
var Keyboard = Ojay.Keyboard = new JS.Singleton({
    
    /**
     * <p>Returns a new <tt>Rule</tt> instance for the given node and key combination.</p>
     * @param {HTMLElement|String} node
     * @param {String} keys
     * @param {Function} callback
     * @param {Object} scope
     * @returns {Rule}
     */
    listen: function(node, keys, callback, scope) {
        var rule = new Rule(node, keys, callback, scope);
        rule.enable();
        return rule;
    },
    
    /**
     * <p>Returns <tt>true</tt> iff the given key combination is currently pressed.</p>
     * @param {String} keys
     * @returns {Boolean}
     */
    isPressed: function(keys) {
        return codesFromKeys(keys).every(Monitor.method('_isPressed'));
    }
});
