/**
 * <p>The <tt>PageMask</tt> class is a subtype of <tt>Overlay</tt> that represents elements used
 * to obscure the rest of the document while an overlay is visible. This allows easy creation of
 * 'modal' windows and lightbox-style interfaces. The HTML generated is the same as for <tt>Overlay</tt>.
 * The main features added by <tt>PageMask</tt> are automatic sizing to fill the viewport, and
 * color control.</p>
 * @constructor
 * @class PageMask
 */
Ojay.PageMask = new JS.Class(Ojay.Overlay, /** @scope Ojay.PageMask.prototype */{
    extend: /** @scope Ojay.PageMask */{
        DEFAULT_COLOR:  '000000',
        DEFAULT_OPACITY:    0.5,
        
        _instances: [],
        
        /**
         *
         */
        resizeAll: function() {
            this._instances.forEach('setSize');
        }
    },
    
    /**
     * <p>Initializes the mask. Options are the same as for <tt>Overlay</tt>, with a single
     * addition: <tt>color</tt> sets the background color of the mask.</p>
     * @param {Object} options
     */
    initialize: function(options) {
        this.klass._instances.push(this);
        this.callSuper();
        this.setColor(this._options.color);
        if (!YAHOO.env.ua.ie)
            this._elements._container.setStyle({position: 'fixed'});
    },
    
    /**
     * <p><tt>PageMask</tt> overrides <tt>setPosition()</tt> so that the mask is always positioned
     * at the top-left corner of the screen. The overlay is position 'fixed' in supporting
     * user agents.</p>
     * @returns {PageMask}
     */
    setPosition: function() {
        return this.callSuper(0, 0);
    },
    
    /**
     * <p><tt>PageMask</tt> overrides <tt>setSize()</tt> so that the mask always completely covers
     * the visible area of the document.</p>
     * @returns {PageMask}
     */
    setSize: function() {
        if (!YAHOO.env.ua.ie) return this.callSuper('100%', '100%');
        var doc = Ojay(document.body).getRegion(), win = Ojay.getViewportSize();
        return this.callSuper(Math.max(doc.getWidth(), win.width), Math.max(doc.getHeight(), win.height));
    },
    
    /**
     * <p>Sets the background color of the mask. Can be three separate numbers from 0 to 255
     * (representing red, green and blue) or a single string representing all three as a hex
     * value.</p>
     * @param {String} color
     * @returns {PageMask}
     */
    setColor: function(color) {
        this._color = (arguments.length == 3)
                ?   Array.from(arguments).map(function(x) {
                        var part = Math.round(x % 256).toString(16);
                        return (part.length == 1 ? '0' : '') + part;
                    }).join('')
                : (color ? String(color).replace(/[^0-9a-f]/ig, '') : this.klass.DEFAULT_COLOR);
        this._elements._container.setStyle({backgroundColor: '#' + this._color});
        return this;
    },
    
    states: /** @scope Ojay.PageMask.prototype */{
        /**
         * <p>An overlay is in the INVISIBLE state when it is present in the document
         * but is not visible.</p>
         */
        INVISIBLE: /** @scope Ojay.PageMask.prototype */{
            /**
             * <p><tt>PageMask</tt> overrides <tt>INVISIBLE#show()</tt> to make sure the mask
             * is sized correctly before being made visible.</p>
             * @returns {MethodChain}
             */
            show: function() {
                this.setSize();
                return this.callSuper();
    }   }   }
});

if (YAHOO.env.ua.ie)
    Ojay(window).on('resize', Ojay.PageMask.method('resizeAll'));
