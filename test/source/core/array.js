/**
 * <p>This object contains definitions for <tt>Array</tt> instance methods defined
 * by Mozilla in JavaScript versions 1.6 and 1.8. They are applied to the <tt>Array</tt>
 * prototype as required to bring all browsers up to scratch.</p>
 *
 * <p>Definitions are taken from <a
 * href="http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array#Methods">Mozilla's
 * implementations</a> (made available under the MIT license).</p>
 */
Ojay.ARRAY_METHODS = {
    
    /**
     * <p>Returns the first index at which a given element can be found in the array, or
     * <tt>-1</tt> if it is not present.</p>
     */
    indexOf: function(elt /*, from*/) {
        var len = this.length;
        
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) from += len;
        
        for (; from < len; from++) {
            if (from in this && this[from] === elt)
                return from;
        }
        return -1;
    },
    
    /**
     * <p>Returns the last index at which a given element can be found in the array, or
     * <tt>-1</tt> if it is not present. The array is searched backwards,
     * starting at <tt>fromIndex</tt>.</p>
     */
    lastIndexOf: function(elt /*, from*/) {
        var len = this.length;
        
        var from = Number(arguments[1]);
        if (isNaN(from)) {
            from = len - 1;
        }
        else {
          from = (from < 0) ? Math.ceil(from) : Math.floor(from);
          if (from < 0)
                from += len;
          else if (from >= len)
                from = len - 1;
        }
        
        for (; from > -1; from--) {
            if (from in this && this[from] === elt)
                return from;
        }
        return -1;
    },
    
    /**
     * <p><tt>filter</tt> calls a provided callback function once for each element in an
     * array, and constructs a new array of all the values for which <tt>callback</tt>
     * returns a <tt>true</tt> value. <tt>callback</tt> is invoked only for indexes of
     * the array which have assigned values; it is not invoked for indexes which have been
     * deleted or which have never been assigned values. Array elements which do not pass
     * the callback test are simply skipped, and are not included in the new array.</p>
     *
     * <p><tt>callback</tt> is invoked with three arguments: the value of the element, the
     * index of the element, and the <tt>Array</tt> object being traversed.</p>
     *
     * <p>If a <tt>thisObject</tt> parameter is provided to <tt>filter</tt>, it will be
     * used as the <tt>this</tt> for each invocation of the callback. If it is not provided,
     * or is <tt>null</tt>, the global object associated with callback is used instead.</p>
     *
     * <p><tt>filter</tt> does not mutate the array on which it is called.</p>
     *
     * <p>The range of elements processed by filter is set before the first invocation of
     * <tt>callback</tt>. Elements which are appended to the array after the call to
     * <tt>filter</tt> begins will not be visited by <tt>callback</tt>. If existing elements
     * of the array are changed, or deleted, their value as passed to <tt>callback</tt> will
     * be the value at the time <tt>filter</tt> visits them; elements that are deleted are
     * not visited.</p>
     */
    filter: function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        
        var res = new Array();
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                var val = this[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, this))
                    res.push(val);
            }
        }
        
        return res;
    },
    
    /**
     * <p><tt>forEach</tt> executes the provided function (<tt>callback</tt>) once for each
     * element present in the array. <tt>callback</tt> is invoked only for indexes of the
     * array which have assigned values; it is not invoked for indexes which have been
     * deleted or which have never been assigned values.</p>
     *
     * <p><tt>callback</tt> is invoked with three arguments: the value of the element, the
     * index of the element, and the <tt>Array</tt> object being traversed.</p>
     *
     * <p>If a <tt>thisObject</tt> parameter is provided to <tt>forEach</tt>, it will be used
     * as the <tt>this</tt> for each invocation of the callback. If it is not provided, or is
     * <tt>null</tt>, the global object associated with <tt>callback</tt> is used instead.</p>
     *
     * <p><tt>forEach</tt> does not mutate the array on which it is called.</p>
     *
     * <p>The range of elements processed by <tt>forEach</tt> is set before the first
     * invocation of <tt>callback</tt>. Elements which are appended to the array after the call
     * to <tt>forEach</tt> begins will not be visited by <tt>callback</tt>. If existing elements
     * of the array are changed, or deleted, their value as passed to <tt>callback</tt> will be
     * the value at the time <tt>forEach</tt> visits them; elements that are deleted are not
     * visited.</p>
     */
    forEach: function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                fun.call(thisp, this[i], i, this);
        }
    },
    
    /**
     * <p><tt>every</tt> executes the provided callback function once for each element
     * present in the array until it finds one where <tt>callback</tt> returns a
     * <tt>false</tt> value. If such an element is found, the <tt>every</tt> method
     * immediately returns <tt>false</tt>. Otherwise, if <tt>callback</tt> returned a
     * <tt>true</tt> value for all elements, <tt>every</tt> will return <tt>true</tt>.
     * <tt>callback</tt> is invoked only for indexes of the array which have assigned
     * values; it is not invoked for indexes which have been deleted or which have never
     * been assigned values.</p>
     *
     * <p><tt>callback</tt> is invoked with three arguments: the value of the element,
     * the index of the element, and the <tt>Array</tt> object being traversed.</p>
     *
     * <p>If a <tt>thisObject</tt> parameter is provided to <tt>every</tt>, it will be
     * used as the <tt>this</tt> for each invocation of the callback. If it is not
     * provided, or is <tt>null</tt>, the global object associated with <tt>callback</tt>
     * is used instead.</p>
     *
     * <p><tt>every</tt> does not mutate the array on which it is called.</p>
     *
     * <p>The range of elements processed by <tt>every</tt> is set before the first
     * invocation of <tt>callback</tt>. Elements which are appended to the array after
     * the call to <tt>every</tt> begins will not be visited by <tt>callback</tt>. If
     * existing elements of the array are changed, their value as passed to <tt>callback</tt>
     * will be the value at the time <tt>every</tt> visits them; elements that are deleted
     * are not visited. <tt>every</tt> acts like the "for all" quantifier in mathematics.
     * In particular, for an empty array, it returns <tt>true</tt>. (It is vacuously true
     * that all elements of the empty set satisfy any given condition.)</p>
     */
    every: function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this && !fun.call(thisp, this[i], i, this))
                return false;
        }
        
        return true;
    },
    
    /**
     * <p><tt>map</tt> calls a provided callback function once for each element in an array,
     * in order, and constructs a new array from the results. <tt>callback</tt> is invoked
     * only for indexes of the array which have assigned values; it is not invoked for
     * indexes which have been deleted or which have never been assigned values.</p>
     *
     * <p><tt>callback</tt> is invoked with three arguments: the value of the element, the
     * index of the element, and the <tt>Array</tt> object being traversed.</p>
     *
     * <p>If a <tt>thisObject</tt> parameter is provided to <tt>map</tt>, it will be used as
     * the <tt>this</tt> for each invocation of the callback. If it is not provided, or is
     * <tt>null</tt>, the global object associated with <tt>callback</tt> is used instead.</p>
     *
     * <p><tt>map</tt> does not mutate the array on which it is called.</p>
     *
     * <p>The range of elements processed by <tt>map</tt> is set before the first invocation
     * of <tt>callback</tt>. Elements which are appended to the array after the call to
     * <tt>map</tt> begins will not be visited by <tt>callback</tt>. If existing elements of
     * the array are changed, or deleted, their value as passed to <tt>callback</tt> will be
     * the value at the time <tt>map</tt> visits them; elements that are deleted are not
     * visited.</p>
     */
    map: function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        
        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                res[i] = fun.call(thisp, this[i], i, this);
        }
        
        return res;
    },
    
    /**
     * <p><tt>some</tt> executes the callback function once for each element present in the
     * array until it finds one where <tt>callback</tt> returns a <tt>true</tt> value. If such
     * an element is found, <tt>some</tt> immediately returns <tt>true</tt>. Otherwise,
     * <tt>some</tt> returns <tt>false</tt>. <tt>callback</tt> is invoked only for indexes of
     * the array which have assigned values; it is not invoked for indexes which have been
     * deleted or which have never been assigned values.</p>
     *
     * <p><tt>callback</tt> is invoked with three arguments: the value of the element, the
     * index of the element, and the <tt>Array</tt> object being traversed.</p>
     *
     * <p>If a <tt>thisObject</tt> parameter is provided to <tt>some</tt>, it will be used as
     * the <tt>this</tt> for each invocation of the callback. If it is not provided, or is
     * <tt>null</tt>, the global object associated with <tt>callback</tt> is used instead.</p>
     *
     * <p><tt>some</tt> does not mutate the array on which it is called.</p>
     *
     * <p>The range of elements processed by <tt>some</tt> is set before the first invocation
     * of <tt>callback</tt>. Elements that are appended to the array after the call to
     * <tt>some</tt> begins will not be visited by <tt>callback</tt>. If an existing, unvisited
     * element of the array is changed by <tt>callback</tt>, its value passed to the visiting
     * callback will be the value at the time that <tt>some</tt> visits that element's index;
     * elements that are deleted are not visited.</p>
     */
    some: function(fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this && fun.call(thisp, this[i], i, this))
                return true;
        }
        
        return false;
    },
    
    /**
     * <p>Apply a function simultaneously against two values of the array (from
     * left-to-right) as to reduce it to a single value.</p>
     *
     * <p><tt>reduce</tt> executes the callback function once for each element present in the
     * array, excluding holes in the array, receiving four arguments: the initial value (or
     * value from the previous callback call), the value of the current element, the current
     * index, and the array over which iteration is occurring.</p>
     */
    reduce: function(fun /*, initial*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        
        // no value to return if no initial value and an empty array
        if (len == 0 && arguments.length == 1)
            throw new TypeError();
        
        var i = 0;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        }
        else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }
                
                // if array contains no values, no initial value to return
                if (++i >= len)
                    throw new TypeError();
            } while (true);
        }
        
        for (; i < len; i++) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }
        
        return rv;
    },
    
    /**
     * <p>Apply a function simultaneously against two values of the array (from
     * right-to-left) as to reduce it to a single value.</p>
     *
     * <p><tt>reduceRight</tt> executes the callback function once for each element present in
     * the array, excluding holes in the array, receiving four arguments: the initial value (or
     * value from the previous callback call), the value of the current element, the current
     * index, and the array over which iteration is occurring.</p>
     */
    reduceRight: function(fun /*, initial*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        
        // no value to return if no initial value, empty array
        if (len == 0 && arguments.length == 1)
            throw new TypeError();
        
        var i = len - 1;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        }
        else {
            do {
                if (i in this) {
                    rv = this[i--];
                    break;
                }
                
                // if array contains no values, no initial value to return
                if (--i < 0)
                    throw new TypeError();
            } while (true);
        }
        
        for (; i >= 0; i--) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }
        
        return rv;
    },
    
    /**
     * <p>Returns a new array containing all the elements of the original array but with
     * any duplicate entries removed.</p>
     * @returns {Array}
     */
    unique: function() {
        var results = [], i, n, arg;
        for (i = 0, n = this.length; i < n; i++) {
            arg = this[i];
            if (results.indexOf(arg) == -1)
                results.push(arg);
        }
        return results;
    },
    
    /**
     * <p>A shorthand for <tt>array.filter(func).length</tt>.</p>
     */
    count: function(fun, thisp) {
        return this.filter(fun, thisp).length;
    }
};

JS.extend(Array.prototype, Ojay.ARRAY_METHODS);
