/**
 * <p><tt>Tooltip</tt> is a subclass of <tt>ContentOverlay</tt> that provides overlays that
 * automatically follow the mouse pointer when visible. This class is very small and most
 * of its API comes from <tt>ContentOverlay</tt> and <tt>Overlay</tt> before it.</p>
 * @constructor
 * @class Tooltip
 */
Ojay.Tooltip = new JS.Class(Ojay.ContentOverlay, /** @scope Ojay.Tooltip.prototype */{
    /**
     * <p>Initializes the tooltip. The constructor differs from that of its parent classes
     * in that you must pass in the text for the tooltip as the first argument, followed
     * by the options hash.</p>
     * @param {String} text
     * @param {Object} options
     */
    initialize: function(text, options) {
        this.callSuper(options);
        this._elements._container.addClass('tooltip');
        this.setContent(text);
        this.klass._instances.push(this);
    },
    
    extend: /** @scope Ojay.Tooltip */{
        /**
         * <p>Updates the position of all tooltips.</p>
         * @param {Document} doc
         * @param {Event} evnt
         */
        update: function(doc, evnt) {
            var xy = YAHOO.util.Event.getXY(evnt);
            this._instances.forEach(function(tooltip) {
                var region = tooltip.getRegion();
                width = region ? region.getWidth() : this.DEFAULT_WIDTH;
                tooltip.setPosition(xy[0] + this.MOUSE_OFFSET - width / 2, xy[1] + this.MOUSE_OFFSET);
            }, this);
        },
        
        /**
         * <p><tt>Tooltip</tt> maintains a list of all its instances in order to update
         * their positions.</p>
         */
        _instances: [],
        
        DEFAULT_WIDTH:      100,
        MOUSE_OFFSET:       20
    }
});

Ojay(document).on('mousemove', Ojay.Tooltip.method('update'));
