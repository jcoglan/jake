/**
 * Functional extensions: Copyright (c) 2005-2008 Sam Stephenson / the Prototype team,
 * released under an MIT-style license.
 */
JS.extend(Function.prototype, /** @scope Function.prototype */{
    
    /**
     * <p>'Masks' the internals of a function by setting its toString and valueOf methods
     * to return the masking function instead of the receiver. This can be used to make sure,
     * for example, that functions like JS.Class's callSuper() that rely on stringifying
     * functions for intrspection still work as desired.</p>
     * @param {Function} wrapper
     * @returns {Function}
     */
    _mask: function(wrapper) {
        this.valueOf = function() { return wrapper; };
        this.toString = function() { return wrapper.toString(); };
        return this;
    },
    
    /**
     * <p>Returns a new function that does the same thing as the original function, but has
     * some of its arguments preset. A contrived example:</p>
     *
     * <pre><code>    var add = function(a, b) { return a + b; };
     *     add(3, 5)  // --> 8
     *     
     *     var add12 = add.partial(12);  // 'a' is preset to 12
     *     add12(7)  // --> 19</code></pre>
     *
     * <p>More information <a href="http://prototypejs.org/api/function/curry">in the
     * Prototype documentation</a>. (Prototype calls this method <tt>curry</tt>, though
     * that's not strictly what it does.)</p>
     *
     * @returns {Function}
     */
    partial: function() {
        if (!arguments.length) return this;
        var method = this, args = Array.from(arguments);
        return function() {
            return method.apply(this, args.concat(Array.from(arguments)));
        }._mask(this);
    },
    
    /**
     * <p>Returns a copy of the function that is self-currying, i.e. every time you call it, it
     * returns a curried version of itself until it's got all its required arguments.</p>
     *
     * <pre><code>    var adder = function(a,b,c) {
     *         return a + b + c;
     *     };
     *     
     *     var add = adder.curry();
     *     
     *     add(1)(2)(3)  // --> 6
     *     add(7,8)(23)  // --> 38</code></pre>
     *
     * @param {Number} n
     * @returns {Function}
     */
    curry: function(n) {
        var method = this, n = n || this.length;
        return function() {
            if (arguments.length >= n) return method.apply(this, arguments);
            return method.partial.apply(arguments.callee, arguments);
        }._mask(this);
    },
    
    /**
     * <p>Allows you to 'intercept' calls to existing functions and manipulate their input and
     * output, providing aspect-oriented programming functionality. More information and
     * examples <a href="http://prototypejs.org/api/function/wrap">in the Prototype docs</a>.</p>
     * @param {Function} wrapper
     * @returns {Function}
     */
    wrap: function(wrapper) {
        var method = this;
        return function() {
            return wrapper.apply(this, [method.bind(this)].concat(Array.from(arguments))); 
        }._mask(this);
    },
    
    /**
     * <p>Returns a version of the function that, rather taking some argument <tt>foo</tt> as
     * its first argument, can be applied as a method of <tt>foo</tt>.</p>
     *
     * <pre><code>    var hexToDec = function(string) {
     *         var number = ... // convert hex string to decimal
     *         return number;
     *     };
     *     
     *     hexToDec('ff')   // --> 255
     *     
     *     String.prototype.hexToDec = hexToDec.methodize();
     *     'ff'.hexToDec()  // --> 255</code></pre>
     *
     * @returns {Function}
     */
    methodize: function() {
        if (this._methodized) return this._methodized;
        var method = this;
        return this._methodized = function() {
            return method.apply(null, [this].concat(Array.from(arguments)));
        }._mask(this);
    },
    
    /**
     * <p>Effectively does the opposite of <tt>methodize</tt>: it converts a function from a
     * method that uses <tt>this</tt> to refer to its operand, into one that takes the operand
     * as its first argument. This is useful for building iterators, amongst other things.</p>
     *
     * <pre><code>    var upper = "".toUpperCase.functionize();
     *     var strings = ['foo', 'bar', 'baz', ... ];
     *     
     *     var caps = strings.map(upper);
     *     // --> ['FOO', 'BAR', 'BAZ', ... ]</code></pre>
     *
     * @returns {Function}
     */
    functionize: function() {
        if (this._functionized) return this._functionized;
        var method = this;
        return this._functionized = function() {
            var args = Array.from(arguments);
            return method.apply(args.shift(), args);
        }._mask(this);
    },
    
    /**
     * <p>Returns a function that returns the result of applying the function to its arguments,
     * but that logs its input and output to the Firebug console. Derived from a similar function
     * in Oliver Steele's Functional library.</p>
     *
     * Copyright: Copyright 2007 by Oliver Steele.  All rights reserved.
     * http://osteele.com/sources/javascript/functional/
     *
     * @param {String} name
     * @param {String} func
     * @returns {Function}
     */
    traced: function(name, func) {
        var method = this, name = name || this, func = func || 'info';
        return function() {
            window.console && console[func](name, ' called on ', this, ' with ', arguments);
            var result = method.apply(this, arguments);
            window.console && console[func](name, ' -> ', result);
            return result;
        }._mask(this);
    },
    
    /**
     * <p>Returns a copy of the function that will only run the specified number of times. Note
     * that if the function is an instance method, it will run the given number of times in total,
     * not per instance.</p>
     * @param {Number} times
     * @returns {Function}
     */
    runs: function(times) {
        var method = this, count = 0;
        return function() {
            return (count++ < times) ? method.apply(this, arguments) : undefined;
        }._mask(this);
    }
});
