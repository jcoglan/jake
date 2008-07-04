/**
 * <p>The <tt>Monitor</tt> is a private component used by the Keyboard package to track
 * the current combination of pressed keys. Event handlers notify this object with keys
 * to add and remove from the list. This object may be consulted to find out whether
 * a particular key code is pressed.</p>
 */
var Monitor = new JS.Singleton({
    _list: [],
    
    /**
     * <p>Adds a key code to the list.</p>
     * @param {Number} key
     */
    _addKey: function(key) {
        if (!this._isPressed(key)) this._list.push(key);
    },
    
    /**
     * <p>Removes a key code from the list.</p>
     * @param {Number} key
     */
    _removeKey: function(key) {
        this._list = this._list.filter(function(x) { return x != key; });
    },
    
    /**
     * <p>Returns <tt>true</tt> iff the given key code is currently pressed.</p>
     * @param {Number} key
     * @returns {Boolean}
     */
    _isPressed: function(key) {
        return this._list.indexOf(key) != -1;
    },
    
    /**
     * <p>Returns a string uniquely identifying the current set of pressed keys.</p>
     * @returns {String}
     */
    getSignature: function() {
        return signature(this._list);
    }
});
