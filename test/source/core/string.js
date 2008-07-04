/**
 * String extensions: Copyright (c) 2005-2008 Sam Stephenson / the Prototype team,
 * released under an MIT-style license.
 */

String.SCRIPT_FRAGMENT = '<script[^>]*>([\\S\\s]*?)<\/script>';

JS.extend(String.prototype, /** @scope String.prototype */{
    
    /**
     * <p>Returns an array containing the content of any <tt>&lt;script&gt;</tt> tags present
     * in the string.</p>
     * @returns {Array}
     */
    extractScripts: function() {
        var matchAll = new RegExp(String.SCRIPT_FRAGMENT, 'img');
        var matchOne = new RegExp(String.SCRIPT_FRAGMENT, 'im');
        return (this.match(matchAll) || []).map(function(scriptTag) {
            return (scriptTag.match(matchOne) || ['', ''])[1];
        });
    },
    
    /**
     * <p>Extracts the content of any <tt>&lt;script&gt;</tt> tags present in the string and
     * <tt>eval</tt>s them. Returns an array containing the return value of each evaluated
     * script.</p>
     */
    evalScripts: function() {
        return this.extractScripts().map(function(script) { return eval(script); });
    },
    
    /**
     * <p>Returns the result of parsing the string as JSON. Requires the YUI JSON utility.</p>
     * @returns {Object|Array}
     */
    parseJSON: function() {
        return YAHOO.lang.JSON.parse(this.valueOf());
    },
    
    /**
     * <p>Returns a copy of the string with all &lt;script&gt; tags removed.</p>
     * @returns {String}
     */
    stripScripts: function() {
        return this.replace(new RegExp(String.SCRIPT_FRAGMENT, 'img'), '');
    },
    
    /**
     * <p>Returns a copy of the string with all HTML tags removed.</p>
     * @returns {String}
     */
    stripTags: function() {
        return this.replace(/<\/?[^>]+>/gi, '').trim();
    },
    
    /**
     * <p>Returns a copy of the string with all leading and trailing whitespace removed.</p>
     * @returns {String}
     */
    trim: YAHOO.lang.trim.methodize()
});
