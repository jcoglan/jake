/**
 * <p>The <tt>Overlay</tt> class is used to encapsulate the process of positioning a
 * container element on top of the rest of the document and allowing it to be positioned
 * and sized to order. The class provides a number of transition effects for showing and
 * hiding overlay elements, which you can use if you include <tt>YAHOO.util.Anim</tt> in
 * your pages.</p>
 *
 * <p>This class is unlikely to be directly useful to you in building pages, but it provides
 * a base class that other overlay types inherit from. It provides all the positioning,
 * sizing, layering, showing and hiding functionality useful for implementing any kind of
 * overlay behaviour. The set of classes implemented by Ojay is:</p>
 *
 * <pre>
 *                          ===============
 *                          ||  Overlay  ||
 *                          ===============
 *                                 |
 *                    --------------------------
 *                    |                        |
 *          ======================      ================
 *          ||  ContentOverlay  ||      ||  PageMask  ||
 *          ======================      ================
 *                    |
 *             ===============
 *             ||  Tooltip  ||
 *             ===============
 * </pre>
 *
 * <p>To create an overlay, simply call its contructor with a set of initialization options.
 * These options include (all sizing and position is in pixels):</p>
 *
 * <ul>
 *      <li><tt>left</tt>: the initial left position</li>
 *      <li><tt>top</tt>: the initial top position</li>
 *      <li><tt>width</tt>: the initial element width</li>
 *      <li><tt>height</tt>: the initial element height</li>
 *      <li><tt>layer</tt>: the initial layer (z-index)</li>
 *      <li><tt>opacity</tt>: the initial opacity (between 0 and 1 inclusive)</li>
 *      <li><tt>className</tt>: space-separated list of classes to give to the overlay element</li>
 * </ul>
 *
 * <p>All these options are optional - you can omit any of them and default values will be
 * applied. An example creation might look like:</p>
 *
 * <pre><code>    var overlay = new Ojay.Overlay({
 *         width:  600,
 *         height: 300,
 *         className: 'my-overlay panel'
 *     });</code></pre>
 *
 * <p>Which would insert the following elements at the top of the <tt>body</tt> element:</p>
 *
 * <pre><code>    &ltdiv class="overlay-container my-overlay panel"&gt;&lt/div&gt;</code></pre>
 *
 * <p>This new <tt>div</tt> will be absolutely positioned and sized according to the setup
 * options you specified. You can get a reference to it by calling <tt>overlay.getContainer()</tt>:</p>
 *
 * <pre><code>    overlay.getContainer().on('click', function() { ... });</code></pre>
 *
 * <p>See the method definitions in the class below for further API documentation.</p>
 *
 * @constructor
 * @class Overlay
 */
Ojay.Overlay = new JS.Class(/** @scope Ojay.Overlay.prototype */{
    include: [JS.State, Ojay.Observable],
    
    extend: /** @scope Ojay.Overlay */{
        BASE_LAYER:         1000,
        MINIMUM_OFFSET:     20,
        DEFAULT_SIZE:       {width: 400, height: 300},
        DEFAULT_POSITION:   {left: 50, top: 50},
        DEFAULT_OPACITY:    1,
        CONTAINER_CLASS:    'overlay-container',
        TRANSITION_TIME:    0.4,
        EASING:             'easeOutStrong',
        
        /**
         * <p>The <tt>Overlay.Transitions</tt> object stores transition effects used to hide and
         * show overlay instances. This allows new effects to be added without needing to modify
         * <tt>Overlay</tt> source code. To register new transitions, you need to implement a
         * <tt>show()</tt> and a <tt>hide()</tt> method, each of which must accept an <tt>Overlay</tt>
         * object and a <tt>MethodChain</tt> to allow code to be asynchronously chained after
         * the effect has run. You must decide when to fire the chain, and your methods must
         * return either the chain or the overlay. You will usually return the chain if your
         * transition involves animation. The basic pattern is thus:</p>
         *
         * <pre><code>    Ojay.Overlay.Transitions.add('myeffect', {
         *         show: function(overlay, chain) {
         *             // ...
         *             return chain;
         *         },
         *         hide: function(overlay, chain) {
         *             // ...
         *             return chain;
         *         }
         *     });</code></pre>
         *
         * <p>You will then be able to use this effect to show and hide overlays:</p>
         *
         * <pre><code>    overlay.show('myeffect');</code></pre>
         *
         * <p>See the transitions that ship with Ojay for some example implementations.</p>
         *
         * @class Overlay.Transitions
         */
        Transitions: new JS.Singleton(/** @scope Ojay.Overlay.Transitions */{
            _store: {},
            
            /**
             * <p>The interface used to test registered transitions.</p>
             */
            INTERFACE: new JS.Interface(['hide', 'show']),
            
            /**
             * <p>A stub transition returned if none can be found for a given name.</p>
             */
            _stub: {
                hide: function(overlay) { return overlay; },
                show: function(overlay) { return overlay; }
            },
            
            /**
             * <p>Adds a new transition object to the set of registered transitions.</p>
             * @param {String} name
             * @param {Object} transitions Must implement Ojay.Overlay.Transitions.INTERFACE
             * @returns {Transitions}
             */
            add: function(name, transitions) {
                JS.Interface.ensure(transitions, this.INTERFACE);
                this._store[name] = transitions;
                return this;
            },
            
            /**
             * <p>Returns the transition object with the given name.</p>
             * @param {String} name
             * @returns {Object} Implements Ojay.Overlay.Transitions.INTERFACE
             */
            get: function(name) {
                return this._store[name] || this._stub;
            }
        }),
        
        /**
         * <p>Returns the layer (z-index) of the given object. Can accept <tt>Overlay</tt>
         * objects and <tt>HTMLElement</tt>/<tt>DomCollection</tt> objects, and anything
         * with a <tt>getLayer()</tt> method.</p>
         * @param {Object} object
         * @returns {Number}
         */
        getLayer: function(object) {
            if (object.getLayer) return Number(object.getLayer());
            if (object.nodeType == Ojay.HTML.ELEMENT_NODE || typeof object == 'string') object = Ojay(object);
            if (object.getStyle) return Number(object.getStyle('zIndex')) || 0;
            return 0;
        }
    },
    
    /**
     * @param {Object} options
     */
    initialize: function(options) {
        this._elements = {};
        options = this._options = options || {};
        Ojay(document.body).insert(this.getHTML().node, 'top');
        this.setState('INVISIBLE');
        this.setSize(options.width, options.height);
        this.setPosition(options.left, options.top);
        this.setLayer(options.layer);
        this.setOpacity(options.opacity);
    },
    
    /**
     * <tp>Returns a <tt>DomCollection</tt> wrapping the HTML elements for the overlay.</p>
     * @returns {DomCollection}
     */
    getHTML: function() {
        var self = this, elements = self._elements;
        if (elements._container) return elements._container;
        var container = Ojay( Ojay.HTML.div({className: this.klass.CONTAINER_CLASS}) );
        container.setStyle({position: 'absolute', overflow: 'hidden'}).hide();
        container.setStyle({padding: '0 0 0 0', border: 'none'});
        (this._options.className || '').trim().split(/\s+/).forEach(container.method('addClass'));
        return elements._container = container;
    },
    
    /**
     * <p>Returns a <tt>DomCollection</tt> wrapping the overlay's container element.
     * Effectively an alias for <tt>getHTML()</tt>.</p>
     * @returns {DomCollection}
     */
    getContainer: function() {
        return this._elements._container;
    },
    
    /**
     * <p>Sets the position of the overlay, measured in pixels from the top-left corner
     * of the document. Positioning is absolute rather than fixed.</p>
     * @param {Number|String} left
     * @param {Number|String} top
     * @returns {Overlay}
     */
    setPosition: function(left, top) {
        if (this.inState('CLOSED')) return this;
        var defaults = this.klass.DEFAULT_POSITION;
        left = this._addUnits(left === undefined ? defaults.left : left);
        top = this._addUnits(top === undefined ? defaults.top : top);
        this._position = {left: left, top: top};
        if (this.inState('VISIBLE'))
            this._elements._container.setStyle(this._position);
        return this;
    },
    
    /**
     * <p>Returns the current position of the overlay as an object with <tt>left</tt> and
     * <tt>top</tt> fields. If the <tt>strings</tt> flag is passed <tt>true</tt>, the positions
     * are returned as strings containing units, otherwise they are returned as numbers with
     * the units implcitly being pixels.</p>
     * @param {Boolean} strings
     * @returns {Object}
     */
    getPosition: function(strings) {
        var pos = this._position, left = pos.left, top = pos.top;
        return strings
                ? {left: left, top: top}
                : {left: parseInt(left), top: parseInt(top)};
    },
    
    /**
     * <p>Sets the size of the overlay element in pixels. You may also use strings to specify
     * the dimensions if you want to use units other than pixels, e.g. '67em'.</p>
     * @param {Number|String} width
     * @param {Number|String} height
     * @returns {Overlay}
     */
    setSize: function(width, height) {
        if (this.inState('CLOSED')) return this;
        var defaults = this.klass.DEFAULT_SIZE;
        width = this._addUnits(width === undefined ? defaults.width : width);
        height = this._addUnits(height === undefined ? defaults.height : height);
        this._dimensions = {width: width, height: height};
        if (this.inState('VISIBLE'))
            this._elements._container.setStyle(this._dimensions);
        return this;
    },
    
    /**
     * <p>Returns the current size of the overlay as an object with <tt>width</tt> and
     * <tt>height</tt> fields. If the <tt>strings</tt> flag is passed <tt>true</tt>, the dimensions
     * are returned as strings containing units, otherwise they are returned as numbers with
     * the units implcitly being pixels.</p>
     * @param {Boolean} strings
     * @returns {Object}
     */
    getSize: function(strings) {
        var size = this._dimensions, width = size.width, height = size.height;
        return strings
                ? {width: width, height: height}
                : {width: parseInt(width), height: parseInt(height)};
    },
    
    /**
     * <p>Returns an <tt>Ojay.Region</tt> instance representing the area occupied by the overlay.</p>
     * @returns {Region}
     */
    getRegion: function() {
        return !this.inState('INVISIBLE', 'CLOSED')
                ? this._elements._container.getRegion()
                : undefined;
    },
    
    /**
     * <p>Sets the opacity of the overlay as a number from 0 to 1 inclusive.</p>
     * @param {Number} opacity
     * @returns {PageMask}
     */
    setOpacity: function(opacity) {
        this._opacity = (opacity === undefined)
                ? this.klass.DEFAULT_OPACITY
                : Number(opacity);
        if (this._opacity > 1) this._opacity /= 100;
        if (this.inState('VISIBLE'))
            this._elements._container.setStyle({opacity: this._opacity});
        return this;
    },
    
    /**
     * <p>Returns the current opacity of the overlay, a number between 0 and 1 inclusive.</p>
     * @returns {Number}
     */
    getOpacity: function() {
        return this._opacity;
    },
    
    /**
     * <p>Positions the receiving overlay behind the passed parameter by setting the receiving
     * overlay's z-index.</p>
     * @param {Overlay} overlay
     * @returns {Overlay}
     */
    positionBehind: function(overlay) {
        return this.setLayer(this.klass.getLayer(overlay) - 1);
    },
    
    /**
     * <p>Positions the receiving overlay in front of the passed parameter by setting the receiving
     * overlay's z-index.</p>
     * @param {Overlay} overlay
     * @returns {Overlay}
     */
    positionInFront: function(overlay) {
        return this.setLayer(this.klass.getLayer(overlay) + 1);
    },
    
    /**
     * <p>Sets the layer (z-index) of the overlay to the given value.</p>
     * @param {Number} index
     * @returns {Overlay}
     */
    setLayer: function(index) {
        if (this.inState('CLOSED')) return this;
        this._layer = (index === undefined) ? this.klass.BASE_LAYER : Number(index);
        this._elements._container.setStyle({zIndex: this._layer});
        return this;
    },
    
    /**
     * <p>Returns the current layer (z-index) of the overlay.</p>
     * @returns {Number}
     */
    getLayer: function() {
        return this._layer;
    },
    
    states: /** @scope Ojay.Overlay.prototype */{
        
        /**
         * <p>An overlay is in the INVISIBLE state when it is present in the document
         * but is not visible.</p>
         */
        INVISIBLE: /** @scope Ojay.Overlay.prototype */{
            /**
             * <p>Centers the overlay within the viewport.</p>
             * @returns {Overlay}
             */
            center: whileHidden('center'),
            
            /**
             * <p>Shows the overlay using the given transition. Returns a <tt>MethodChain</tt>
             * object so you can chain code to run after the transition finishes. The root of
             * this chain is the receiving overlay instance.</p>
             * @param {String} transition
             * @param {Object} options
             * @returns {Overlay|MethodChain}
             */
            show: function(transition, options) {
                this.setState('SHOWING');
                transition = this.klass.Transitions.get(transition || 'none');
                var chain = new JS.MethodChain()._(this).setState('VISIBLE');
                if ((options||{}).silent !== true) chain._(this).notifyObservers('show');
                chain._(this);
                return transition.show(this, chain);
            },
            
            /**
             * <p>'Closes' the overlay by removing it from the document.</p>
             * @param {Object} options
             * @returns {Overlay}
             */
            close: function(options) {
                this._elements._container.remove();
                this.setState('CLOSED');
                if ((options||{}).silent !== true) this.notifyObservers('close');
                return this;
            }
        },
        
        /**
         * <p>An overlay is in the SHOWING state when it is transitioning between
         * INVISIBLE and VISIBLE.</p>
         */
        SHOWING: /** @scope Ojay.Overlay.prototype */{},
        
        /**
         * <p>An overlay is in the VISIBLE state when it is present in the document
         * and visible.</p>
         */
        VISIBLE: /** @scope Ojay.Overlay.prototype */{
            /**
             * <p>Centers the overlay within the viewport.</p>
             * @returns {Overlay}
             */
            center: function() {
                var region = this.getRegion(), screen = Ojay.getVisibleRegion(),
                    left = screen.left + (screen.getWidth() - region.getWidth()) / 2,
                    top = screen.top + (screen.getHeight() - region.getHeight()) / 2;
                if (left < this.klass.MINIMUM_OFFSET) left = this.klass.MINIMUM_OFFSET;
                if (top < this.klass.MINIMUM_OFFSET) top = this.klass.MINIMUM_OFFSET;
                return this.setPosition(left, top);
            },
            
            /**
             * <p>Hides the overlay using the named transition. Does not remove the overlay from
             * the document. Returns a <tt>MethodChain</tt> that will fire on the receiving
             * overlay instance on completion of the transition effect.</p>
             * @param {String} transition
             * @param {Object} options
             * @returns {Overlay|MethodChain}
             */
            hide: function(transition, options) {
                this.setState('HIDING');
                transition = this.klass.Transitions.get(transition || 'none');
                var chain = new JS.MethodChain()._(this).setState('INVISIBLE');
                if((options||{}).silent !== true) chain._(this).notifyObservers('hide');
                chain._(this);
                return transition.hide(this, chain);
            },
            
            /**
             * <p>Closes the overlay by hiding it using the named transition and removing it
             * from the document. Returns a <tt>MethodChain</tt> that will fire on the receiving
             * overlay instance on completion of the transition effect.</p>
             * @param {String} transition
             * @param {Object} options
             * @returns {MethodChain}
             */
            close: function(transition, options) {
                return this.hide(transition, options)._(this).close(options);
            },
            
            /**
             * <p>Resizes the overlay using an animation that can be controlled via an options
             * hash. You can specify the area to resize to using left, top, width, height params
             * individually, or using a region object. The method returns a <tt>MethodChain</tt>
             * that will fire on the receiving overlay once the animation has finished.</p>
             *
             * <p>Some examples:</p>
             *
             *      overlay.resize(50, 80, 100, 500);
             *      
             * <pre><code>    overlay.resize(Ojay.getVisibleRegion(), {
             *         duration:   4,
             *         easing:     'easeBoth'
             *     });</code></pre>
             *
             * @param {Number} left
             * @param {Number} top
             * @param {Number} width
             * @param {Number} height
             * @param {Object} options
             * @returns {MethodChain}
             */
            resize: function(left, top, width, height, options) {
                var region = left, options = options || {};
                if (typeof region == 'object') {
                    options = top || {};
                    left    = region.left;
                    top     = region.top;
                    width   = region.getWidth();
                    height  = region.getHeight();
                }
                this.setState('RESIZING');
                return this._elements._container.animate({
                    left:   {to:    left},
                    top:    {to:    top},
                    width:  {to:    width},
                    height: {to:    height}
                }, options.duration || this.klass.TRANSITION_TIME, {easing: options.easing || this.klass.EASING})
                ._(this).setSize(width, height)
                ._(this).setPosition(left, top)
                ._(this).setState('VISIBLE')._(this);
            }
        },
        
        /**
         * <p>An overlay is in the HIDING state when it is transitioning between
         * VISIBLE and INVISIBLE.</p>
         */
        HIDING: /** @scope Ojay.Overlay.prototype */{},
        
        /**
         * <p>An overlay is in the RESIZING state when it is in the process of being resized.</p>
         */
        RESIZING: /** @scope Ojay.Overlay.prototype */{},
        
        /**
         * <p>An overlay is in the CLOSED state when it has been removed from the document.
         * No further work can be done with the overlay once it is in this state.</p>
         */
        CLOSED: /** @scope Ojay.Overlay.prototype */{}
    },
    
    _addUnits: function(x) {
        return String(x).replace(/^(-?\d+(?:\.\d+)?)$/g, '$1px');
    }
});
