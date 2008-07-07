/**
 * <p>The <tt>Sequence</tt> class allows iteration over an array using a timer to
 * skip from member to member. At each timeframe, the sequence object calls a user-
 * defined callback function, passing in the current member (the 'needle') and its
 * position in the list.</p>
 * @constructor
 * @class Ojay.Sequence
 */
Ojay.Sequence = new JS.Class(/** @scope Ojay.Sequence.prototype */{
    
    /**
     * @param {Array} list
     * @param {Function} callback
     * @param {Object} context
     */
    initialize: function(list, callback, context) {
        this._list = list;
        this._counter = 0;
        this._callback = Function.from(callback);
        this._context = context || null;
        this._interval = null;
        this._looping = false;
        this._pauseOnComplete = false;
    },
    
    _fireCallback: function() {
        this._callback.call(this._context, this._list[this._counter]);
    },
    
    /**
     * <p>Calls the callback function on the current needle and steps the counter forward by
     * one place. When looping, sets a timeout to call itself again after the specified time.</p>
     * @returns {Sequence}
     */
    stepForward: function() {
        if (this._looping === null) {
            this._looping = false;
            return this;
        }
        this._fireCallback();
        this._counter++;
        if (this._counter >= this._list.length) {
            this._counter = 0;
            if (this._pauseOnComplete)
                this._looping = this._pauseOnComplete = false;
        }
        if (this._looping) setTimeout(this.method('stepForward'), this._interval);
        return this;
    },
    
    /**
     * <p>Makes the sequence step forward indefinately at timed intervals.</p>
     * @param {Number} time
     * @returns {Sequence}
     */
    loop: function(time) {
        this._interval = 1000 * Number(time || 0) || this._interval;
        if (!this._interval || this._looping) return this;
        this._looping = true;
        return this.stepForward();
    },
    
    /**
     * <p>Stops the sequence looping. The needle will be placed after the last called-back needle.</p>
     * @returns {Sequence}
     */
    pause: function() {
        if (this._looping) this._looping = null;
        return this;
    },
    
    /**
     * <p>Causes the sequence to stop looping when it reaches the end of the list.</p>
     * @returns {Sequence}
     */
    finish: function() {
        if (this._looping) this._pauseOnComplete = true;
        return this;
    }
});

/**
 * <p>Returns a <tt>Sequence</tt> object that cycles over every member of the array over
 * the given <tt>time</tt> interval. Your <tt>callback</tt> function is called every <tt>time</tt>
 * seconds, being passed each member of the array in turn and its position in the list.</p>
 *
 * <pre><code>    // Cycle over a set of images
 *     var imgs = ['/imgs/one.png', 'imgs/two.png', 'imgs/three.png'];
 *     var element = Ojay('#something');
 *     
 *     var sequence = imgs.sequence(function(imgageSource, i) {
 *         element.setAttributes({src: imageSource});
 *     });
 *     
 *     // Start sequence looping with a time period
 *     sequence.loop(5);
 *     
 *     // Pause the sequence
 *     sequence.pause();
 *     
 *     // Start again where we left off
 *     sequence.loop();
 *     
 *     // Stop when it next gets to the end of the list
 *     sequence.finish();</code></pre>
 *
 * @param {Number} time
 * @param {Function} callback
 * @returns {Sequence}
 */
Array.prototype.sequence = function(callback) {
    return new Ojay.Sequence(this, callback);
};

Ojay.DomCollection.include(/** @scope Ojay.DomCollection.prototype */{
    /**
     * <p>Returns a <tt>Sequence</tt> operating on the members of the collection.
     * See <tt>Array#sequence</tt> for more information.</p>
     * @param {Number} time
     * @param {Function} callback
     * @returns {Sequence}
     */
    sequence: function(callback) {
        return [].map.call(this, function(el) { return Ojay(el); })
                .sequence(callback);
    }
});
