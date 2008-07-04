(function(Region) {
    /**
     * <p>The <tt>Region</tt> class wraps YUI's <tt>Region</tt> class and extends its API. This
     * class is mostly for internal consumption: methods should exist on <tt>DomCollection</tt>
     * for getting the geometric properties of DOM elements.</p>
     * @constructor
     * @class Region
     */
    Ojay.Region = new JS.Class(/** @scope Ojay.Region.prototype */{
        
        contains:   Region.prototype.contains,
        getArea:    Region.prototype.getArea,
        _intersect: Region.prototype.intersect,
        _union:     Region.prototype.union,
        
        /**
         * @param {YAHOO.util.Region} region
         */
        initialize: function(region) {
            ['top', 'right', 'bottom', 'left'].forEach(function(property) {
                this[property] = region[property] || 0;
            }, this);
        },
        
        /**
         * @returns {Number}
         */
        getWidth: function() {
            return this.right - this.left;
        },
        
        /**
         * @returns {Number}
         */
        getHeight: function() {
            return this.bottom - this.top;
        },
        
        /**
         * @returns {Number}
         */
        getDiagonal: function() {
            return (this.getWidth().pow(2) + this.getHeight().pow(2)).sqrt();
        },
        
        /**
         * @returns {Object}
         */
        getCenter: function() {
            return {
                left: (this.left + this.right) / 2,
                top: (this.top + this.bottom) / 2
            };
        },
        
        /**
         * @param {Number} x
         * @param {Number} y
         * @returns {Region}
         */
        shift: function(x,y) {
            this.left += x;     this.right += x;
            this.top += y;      this.bottom += y;
            return this;
        },
        
        /**
         * @param {Number} factor
         * @returns {Region}
         */
        scale: function(factor) {
            var w = this.getWidth(), h = this.getHeight();
            if (w <= 0 || h <= 0) return this;
            var dx = (factor - 1) * w, dy = (factor - 1) * h;
            this.left -= dx/2;      this.right += dx/2;
            this.top -= dy/2;       this.bottom += dy/2;
            return this;
        },
        
        /**
         * @param {Region} region
         * @returns {Region}
         */
        intersection: function(region) {
            var intersection = this._intersect(region);
            return new Ojay.Region(intersection);
        },
        
        /**
         * <p>Returns <tt>true</tt> iff this region intersects the given region.</p>
         * @param {Region} region
         * @returns {Boolean}
         */
        intersects: function(region) {
            var top = Math.max(this.top, region.top),
                bottom = Math.min(this.bottom, region.bottom),
                left = Math.max(this.left, region.left),
                right = Math.min(this.right, region.right);
            return (top < bottom) && (left < right);
        },
        
        /**
         * @param {Region} region
         * @returns {Region}
         */
        union: function(region) {
            var union = this._union(region);
            return new Ojay.Region(union);
        },
        
        /**
         * @returns {String}
         */
        toString: function() {
            return '(' + this.left + ',' + this.top + ') [' + this.getWidth() + 'x' + this.getHeight() + ']';
        },
        
        extend: /** @scope Ojay.Region */{
            convert: function(object) {
                if (object instanceof Region) return new this(object);
                if (!(object instanceof this)) object = Ojay(object).getRegion();
                if (!object) return undefined;
                else return object;
            }
        }
    });
})(YAHOO.util.Region);
