/**
 * @overview
 * <p>The <tt>Animation</tt> class is used to set up all animations in Ojay. It is entirely
 * for internal consumption, and not to be accessed directly. Use the <tt>animate</tt> method
 * in <tt>DomCollection</tt> instead, and look to that for documentation.</p>
 * @constructor
 * @class Animation
 */
Ojay.Animation = new JS.Class(/** @scope Ojay.Animation.prototype */{
    
    /**
     * @param {DomCollection} elements
     * @param {Object|Function} parameters
     * @param {Number|Function} duration
     * @param {Object} options
     */
    initialize: function(elements, parameters, duration, options) {
        this._collection        = elements;
        this._parameters        = parameters || {};
        this._duration          = duration || 1.0;
        this._options           = options || {};
        this._easing            = YAHOO.util.Easing[this._options.easing || 'easeBoth'];
        var after = this._options.after, before = this._options.before;
        this._afterCallback     = after && Function.from(after);
        this._beforeCallback    = before && Function.from(before);
        this.chain              = new JS.MethodChain;
    },
    
    /**
     * @param {Object|Function} options
     * @param {DomCollection} element
     * @param {Number} i
     * @returns {Object}
     */
    _evaluateOptions: function(options, element, i) {
        if (typeof options == 'function') options = options(i, element);
        if (typeof options != 'object') return options;
        var results = {};
        for (var field in options) results[field] = arguments.callee(options[field], element, i);
        return results;
    }.curry(),
    
    /**
     * <p>Runs the animation.</p>
     */
    run: function() {
        var paramSets = this._collection.map(this._evaluateOptions(this._parameters));
        var durations = this._collection.map(this._evaluateOptions(this._duration));
        
        var maxDuration = durations.reduce(function(a,b) { return a > b ? a : b; }, -Infinity);
        var callbackAttached = false;
        
        var after = this._afterCallback, before = this._beforeCallback;
        
        this._collection.forEach(function(element, i) {
            var parameters = paramSets[i], duration = durations[i];
            var anim = new YAHOO.util.ColorAnim(element.node, parameters, duration, this._easing);
            anim.onComplete.subscribe(function() {
                if (YAHOO.env.ua.ie && (parameters.opacity || {}).to !== undefined)
                    element.setStyle({opacity: parameters.opacity.to});
                
                if (after) after(element, i);
                
                if (duration == maxDuration && !callbackAttached) {
                    callbackAttached = true;
                    this.chain.fire(this._collection);
                }
            }.bind(this));
            if (before) before(element, i);
            anim.animate();
        }, this);
    }
});
