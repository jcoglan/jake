/**
 * @overview
 * <p>Ojay adds all the single-number functions in <tt>Math</tt> as methods to <tt>Number</tt>.
 * The following methods can all be called on numbers:</p>
 *
 * <pre><code>abs, acos, asin, atan, ceil, cos, exp, floor, log, pow, round, sin, sqrt, tan</code></pre>
 */
'abs acos asin atan ceil cos exp floor log pow round sin sqrt tan'.split(/\s+/).
        forEach(function(method) {
            Number.prototype[method] = Math[method].methodize();
        });

/**
 * <p>Calls the given <tt>block</tt> in the scope of <tt>context</tt> a given number of
 * times. The block receives the iteration index each time it is called.</p>
 * @param {Function} block
 * @param {Object} context
 */
Number.prototype.times = function(block, context) {
    if (this < 0) return;
    for (var i = 0; i < this; i++) block.call(context || null, i);
};

/**
 * <p>Returns <tt>true</tt> iff the number is between <tt>a</tt> and <tt>b</tt> inclusive.
 * To test the range without including the end points, pass <tt>false</tt> as the third
 * argument.</p>
 * @param {Number} a
 * @param {Number} b
 * @param {Boolean} inclusive
 * @returns {Boolean}
 */
Number.prototype.between = function(a, b, inclusive) {
    if (this > a && this < b) return true;
    return (this == a || this == b) ? (inclusive !== false) : false;
};
