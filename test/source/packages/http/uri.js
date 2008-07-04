/**
 * @constructor
 * @class URI
 */
Ojay.URI = new JS.Class({
    extend: {
        /**
         * @param {String} string
         * @returns {String}
         */
        sanitize: function(string) {
            return String(string).trim().replace('&amp;', '&').replace('&#38;', '&');
        },
        
        /**
         * @param {String} string
         * @returns {URI}
         */
        parse: function(string) {
            if (string instanceof this) return string;
            var uri = new this;
            
            string = this.sanitize(string)
                .replace(/^(\w+)(:\/+)/,    function(match, capture, keep) { uri.protocol = capture; return keep; })
                .replace(/^:\/+([^\:\/]+)/, function(match, capture) { uri.domain = capture;    return ''; })
                .replace(/^:(\d+)/,         function(match, capture) { uri.port = capture;      return ''; })
                .replace(/^[^\?\#]+/,       function(match, capture) { uri.path = match;        return ''; })
                .replace(/#(.*)$/,          function(match, capture) { uri.hash = capture;      return ''; });
            
            if (!uri.port) uri.port = (uri.domain == this.local.domain)
                    ? this.local.port
                    : this.DEFAULT_PORTS[uri.protocol];
            
            if (uri.path.charAt(0) != '/' && uri.domain == this.local.domain)
                uri.path = this.local.directory + uri.path;
            
            if (/^\?/.test(string)) string.slice(1).split('&').forEach(function(pair) {
                var bits = pair.split('=');
                uri.setParam(bits[0], bits[1]);
            });
            return uri;
        },
        
        /**
         * @param {String} url
         * @param {Object} params
         * @returns {URI}
         */
        build: function(url, params) {
            var uri = this.parse(url), params = params || {}, value;
            for (var key in params) {
                value = (typeof params[key] == 'function') ? params[key]() : params[key];
                uri.setParam(key, value);
            }
            return uri;
        },
        
        /**
         * @param {String|URI} a
         * @param {String|URI} b
         * @returns {Boolean}
         */
        compare: function(a,b) {
            return this.parse(a).equals(b);
        },
        
        DEFAULT_PORTS: {
            http:       '80',
            https:      '443'
        }
    },
    
    /**
     */
    initialize: function() {
        this.protocol = this.klass.local.protocol;
        this.domain   = this.klass.local.domain;
        this.path     = '';
        this.keys     = [];
        this.params   = {};
        this.toString = this._toString;
    },
    
    /**
     * @returns {String}
     */
    _toString: function() {
        var string = this._getPathWithHost(), params = [];
        var queryString = this.getQueryString();
        if (queryString.length) string += '?' + queryString;
        if (this.hash) string += '#' + this.hash;
        return string;
    },
    
    _getPathWithHost: function() {
        return this._getProtocolString() + (this.domain||'') + this._getPortString() + (this.path||'');
    },
    
    /**
     * @returns {String}
     */
    getQueryString: function() {
        return this.keys.sort().map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(this.params[key]);
        }, this).join('&');
    },
    
    /**
     * @returns {String}
     */
    _getProtocolString: function() {
        return this.protocol ? this.protocol + '://' : '';
    },
    
    /**
     * @returns {String}
     */
    _getPortString: function() {
        if (!this.port || this.port == this.klass.DEFAULT_PORTS[this.protocol]) return '';
        return ':' + this.port;
    },
    
    /**
     * @param {String|URI} uri
     * @returns {Boolean}
     */
    equals: function(uri) {
        uri = this.klass.parse(uri);
        if (this.domain != uri.domain || this.protocol != uri.protocol || this.port != uri.port ||
                this.path != uri.path || this.hash != uri.hash) return false;
        if (!this.paramsEqual(uri)) return false;
        return true;
    },
    
    /**
     * @param {String} key
     * @param {String} value
     */
    setParam: function(key, value) {
        var bits = [key, value].map(decodeURIComponent).map('trim');
        if (this.keys.indexOf(bits[0]) == -1) this.keys.push(bits[0]);
        this.params[bits[0]] = bits[1];
    },
    
    /**
     * @param {String|URI} uri
     * @returns {Boolean}
     */
    paramsEqual: function(uri) {
        uri = this.klass.parse(uri);
        for (var key in this.params) { if (this.params[key] != uri.params[key]) return false; }
        for (key in uri.params) { if (this.params[key] != uri.params[key]) return false; }
        return true;
    },
    
    /**
     * @returns {Boolean}
     */
    isLocal: function() {
        return  this.protocol == this.klass.local.protocol &&
                this.domain == this.klass.local.domain &&
                this.port == this.klass.local.port;
    }
});

Ojay.URI.extend({
    local: {
        protocol:   window.location.protocol.replace(/\W/g, ''),
        domain:     window.location.hostname,
        directory:  window.location.pathname.replace(/[^\/]*$/, '')
    }
});

Ojay.URI.local.port = window.location.port || Ojay.URI.DEFAULT_PORTS[Ojay.URI.local.protocol || 'http'];

JS.extend(String.prototype, {
    parseURI:   Ojay.URI.method('parse').methodize(),
    equalsURI:  Ojay.URI.method('compare').methodize()
});
