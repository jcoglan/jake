/**
 * @overview
 * <p><tt>Ojay.HTTP</tt> wraps the <tt>YAHOO.util.Connect</tt> module to provide a more succinct
 * API for making Ajax requests. It's called <tt>HTTP</tt> to emphasise what's actually going on
 * in an Ajax call: we're just making an HTTP request. <tt>Ojay.HTTP</tt> makes you use HTTP verbs
 * as methods, to make it clear what's going on to anyone reading the code. A quick example:</p>
 *
 * <pre><code>    Ojay.HTTP.GET('/index.html', {ajaxLayout: true}, {
 *         onSuccess: function(response) {
 *             alert(response.responseText);
 *         }
 *     });</code></pre>
 *
 * <p>This illustrates the basic pattern of making an HTTP request. Start with the verb (<tt>GET</tt>,
 * <tt>POST</tt>, <tt>PUT</tt>, <tt>DELETE</tt> or <tt>HEAD</tt>), then pass in the URL and the
 * parameters you want to send to the server. These parameters will be turned into a query string
 * or a POST message, depending on the verb used. The URL may contain a query string, but its
 * parameters will be overridden by the parameters object:</p>
 *
 * <pre><code>    // Request is: GET /index.html?id=900&ajaxLayout=true
 *     Ojay.HTTP.GET('/index.html?id=45&ajaxLayout=true', {id: 900})</code></pre>
 *
 * <p>You can define callbacks called <tt>onSuccess</tt> (fired on any reponse with a 2xx status
 * code), <tt>onFailure</tt> (fired on any 3xx, 4xx or 5xx response) or status-code-specific
 * callbacks, like <tt>on404</tt>:</p>
 *
 * <pre><code>    Ojay.HTTP.POST('/posts/create', {title: '...'}, {
 *         onSuccess: function(response) {
 *             alert('Post created!');
 *         },
 *         on403: function(response) {
 *             alert('Permission denied!);
 *         }
 *     });</code></pre>
 *
 * <p>The <tt>response</tt> object passed to your callbacks will be an instance of <tt>HTTP.Response</tt>,
 * which wraps the response object returned by YUI. It has convenience methods for manipulating
 * the response and inserting it into the document. Its methods are listed below. You can use the
 * <tt>response</tt> methods to chain after HTTP calls for more sentence-like code:</p>
 *
 * <pre><code>    Ojay.HTTP.GET('/index.html').insertInto('#container').evalScriptTags();</pre></code>
 *
 * <p>It's best to use this chaining for really simple stuff -- just remember the chain is called
 * asynchronously after the HTTP request completes, so any code following a chain like this should
 * not assume that the content has been inserted into the document or that the scripts have been
 * run.</p>
 *
 * <pre><ocde>    Ojay.HTTP.GET('/index.html').insertInto('#container');  // asynchronous insertion
 *     var text = Ojay('#container').node.innerHTML;
 *             // text does NOT contain the HTTP response yet!</code></pre>
 *
 * <p>For anything beyond really simple stuff, it's best to use explicit callback functions.</p>
 *
 * <p><tt>HTTP.Response</tt> methods are available in chains following calls to <tt>on()</tt>,
 * <tt>animate()</tt> and <tt>wait()</tt> on <tt>DomCollection</tt> objects. e.g.:</p>
 *
 * <pre><code>    Ojay('input[type=submit]').on('click')
 *             ._(Ojay.HTTP.POST, '/posts/update/34', ...)
 *             .insertInto('#message');</pre></code>
 *
 * <p>You can even pass functions into the parameters object, and <tt>HTTP</tt> will execute them
 * at the time the request is made:</p>
 *
 * <pre><code>    Ojay('#link').on('click')
 *             ._(Ojay.HTTP.POST, '/images/save_width', {width: Ojay('#foo').method('getWidth')});</code></pre>
 *
 * <p><tt>Ojay('#foo').method('getWidth')</tt> is a function bound to <tt>Ojay('#foo')</tt>; when
 * the POST request is made, it will be executed and the return value will be sent to the server
 * in the <tt>width</tt> parameter.</p>
 */
Ojay.HTTP = new JS.Singleton(/** @scope Ojay.HTTP */{
    include: Ojay.Observable,
    
    /**
     * <p>Object containing named references to XmlHttpRequest ready states.</p>
     */
    READY_STATE: {
        UNINITIALIZED:  0,
        LOADING:        1,
        LOADED:         2,
        INTERACTIVE:    3,
        COMPLETE:       4
    },
    
    /**
     * <p>List of verbs supported by <tt>Ojay.HTTP</tt>.</p>
     */
    VERBS: 'GET POST PUT DELETE HEAD'.split(/\s+/)
});

Ojay.HTTP.VERBS.forEach(function(verb) {
    Ojay.HTTP[verb] = function(url, parameters, callbacks) {
        var request = new Ojay.HTTP.Request(verb, url, parameters, callbacks);
        request._begin();
        return request.chain;
    };
});

/**
 * <p>The <tt>HTTP.Request</tt> class is used to instantiate Ajax calls to the server. This
 * is for internal consumption -- use <tt>HTTP.GET</tt> et al to make requests.</p>
 * @constructor
 * @class HTTP.Request
 */
Ojay.HTTP.Request = new JS.Class(/** @scope Ojay.HTTP.Request.prototype */{
    
    /**
     * @param {String} verb         One of 'GET', 'POST', 'PUT', 'DELETE', or 'HEAD'
     * @param {String} url          The URL to request
     * @param {Object} parameters   Key-value pairs to be used as a query string or POST message
     * @param {Object} callbacks    Object containing callback functions
     */
    initialize: function(verb, url, parameters, callbacks) {
        this.verb           = verb.toUpperCase();
        if (Ojay.HTTP.VERBS.indexOf(this.verb) == -1) return;
        this._url           = url;
        this._parameters    = parameters || {};
        this._callbacks     = callbacks || {};
        this.chain          = new JS.MethodChain();
    },
    
    /**
     * <p>Returns the URI of the request.
     */
    getURI: function() {
        if (this.uri) return this.uri;
        return this.uri = Ojay.URI.build(this._url, this._parameters);
    },
    
    /**
     * <p>Makes the HTTP request and sets up all the callbacks.</p>
     */
    _begin: function() {
        var uri         = this.getURI();
        var url         = (this.verb == 'POST') ? uri._getPathWithHost() : uri.toString();
        var postData    = (this.verb == 'POST') ? uri.getQueryString() : undefined;
        Ojay.HTTP.notifyObservers('request', {receiver: this});
        
        YAHOO.util.Connect.asyncRequest(this.verb, url, {
            scope: this,
            
            // Will fire onSuccess, on2xx, and the chain
            success: function(transport) {
                var response = new Ojay.HTTP.Response(this, transport);
                var success  = this._callbacks.onSuccess;
                var onStatus = this._callbacks['on' + response.status];
                var complete = this._callbacks.onComplete;
                success  && Function.from(success)(response);
                onStatus && Function.from(onStatus)(response);
                complete && Function.from(complete)(response);
                this.chain.fire(response);
                Ojay.HTTP.notifyObservers('success', {receiver: response});
                Ojay.HTTP.notifyObservers(response.status, {receiver: response});
                Ojay.HTTP.notifyObservers('complete', {receiver: response});
            },
            
            // Will fire onFailure, on3xx, on4xx, on5xx
            failure: function(transport) {
                var response = new Ojay.HTTP.Response(this, transport);
                var failure  = this._callbacks.onFailure;
                var onStatus = this._callbacks['on' + response.status];
                var complete = this._callbacks.onComplete;
                failure  && Function.from(failure)(response);
                onStatus && Function.from(onStatus)(response);
                complete && Function.from(complete)(response);
                Ojay.HTTP.notifyObservers('failure', {receiver: response});
                Ojay.HTTP.notifyObservers(response.status, {receiver: response});
                Ojay.HTTP.notifyObservers('complete', {receiver: response});
            }
            
        }, postData);
    }
});

/**
 * <p>The <tt>HTTP.Response</tt> class is used to wrap XmlHttpRequest transport objects in Ajax
 * callback functions. The argument passed into your Ajax callbacks, and used as the base of chains
 * after <tt>GET</tt>/<tt>POST</tt>/etc calls, will be an object of this class. It contains fields
 * copied straight from the transport object, including <tt>status</tt>, <tt>statusText</tt>,
 * <tt>responseText</tt>, and <tt>responseXML</tt>.</p>
 * class.
 * @constructor
 * @class HTTP.Response
 */
Ojay.HTTP.Response = new JS.Class(/** @scope Ojay.HTTP.Response.prototype */{
    
    /**
     * @param {HTTP.Request} request an HTTP.Request object
     * @param {Object} transport An XmlHttpRequest transport object
     */
    initialize: function(request, transport) {
        'status statusText responseText responseXML readyState'.split(/\s+/).forEach(function(key) {
            this[key] = transport[key];
        }, this);
        this.request = request;
        this.transport = transport;
    },
    
    /**
     * <p>Inserts the response's body text into the given <tt>elements</tt> at the given
     * <tt>position</tt> (default is <tt>'replace'</tt>). See <tt>DomCollection#insert.</tt>.
     * If no position is specified, will accept any object with a <tt>setContent()</tt> method.</p>
     * @param {String|HTMLElement|DomCollection} elements
     * @param {String} position
     * @returns {HTTP.Response}
     */
    insertInto: function(elements, position) {
        elements = elements.setContent ? elements : Ojay(elements);
        var content = (this.responseText || '').stripScripts();
        if (!position) elements.setContent(content);
        else elements.insert(content, position);
        return this;
    },
    
    /**
     * @returns {HTTP.Response}
     */
    evalScripts: function() {
        if (this.responseText) this.responseText.evalScripts();
        return this;
    },
    
    /**
     * <p>Returns the result of parsing the response body as JSON.</p>
     * @returns {Object|Array}
     */
    parseJSON: function() {
        return (this.responseText || '').parseJSON();
    },
    
    /**
     * @returns {HTTP.Response}
     */
    evalScriptTags: function() {
        return this.evalScripts();
    }.traced('evalScriptTags() is deprecated. Use evalScripts() instead.', 'warn')
});
