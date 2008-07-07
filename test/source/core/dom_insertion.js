/**
 * <p>The <tt>DomInsertion</tt> class is used to insert new strings and elements into the DOM.
 * It should not be used as a public API; you should use <tt>DomCollection</tt>'s <tt>insert</tt>
 * method instead. Its implementation is based on <a href="http://prototypejs.org/api/element/insert">that
 * used by Prototype</a>.</p>
 *
 * Document insertion code: Copyright (c) 2005-2008 Sam Stephenson / the Prototype team,
 * released under an MIT-style license.
 *
 * @contructor
 * @class DomInsertion
 */
Ojay.DomInsertion = new JS.Class(/** @scope Ojay.DomInsertion.prototype */{
    
    /**
     * @param {Array|HTMLElement} elements
     * @param {String|HTMLElement} html
     * @param {String} position
     */
    initialize: function(elements, html, position) {
        if (!(elements instanceof Array)) elements = [elements];
        if (!(/^(?:top|bottom|before|after)$/i.test(position))) position = 'bottom';
        
        this._elements = elements.filter(function(el) { return el && el.nodeType === Ojay.HTML.ELEMENT_NODE; });
        this._html = html;
        this._position = position.toLowerCase();
        
        if (this._elements.length === 0) return;
        if (this._html && this._html.nodeType) this._insertElement();
        if (typeof this._html == 'string') this._insertString();
    },
    
    /**
     * <p>Performs insertion of <tt>HTMLElement</tt>s.</p>
     */
    _insertElement: function() {
        var insert = this.klass._TRANSLATIONS[this._position];
        this._elements.forEach(function(element) {
            insert(element, this._html);
        }, this);
    },
    
    /**
     * <p>Performs insertion of <tt>String</tt>s.</p>
     */
    _insertString: function() {
        var insert = this.klass._TRANSLATIONS[this._position];
        this._elements.forEach(function(element) {
            var tagName = (/^(?:before|after)$/.test(this._position) ? element.parentNode : element).tagName.toUpperCase();
            var childNodes = this._getContentFromElement(tagName);
            if (/^(?:top|after)$/.test(this._position)) childNodes.reverse();
            childNodes.forEach(insert.partial(element));
        }, this);
    },
    
    /**
     * <p>Returns a collection of nodes by creating a new DIV and using <tt>innerHTML</tt>
     * to create the elements. Used when inserting into table elements and SELECT boxes,
     * which don't allow <tt>innerHTML</tt>modifications quite like everything else.</p>
     * @param {String} tagName
     * @returns {Array}
     */
    _getContentFromElement: function(tagName) {
        var tag = this.klass._TAGS[tagName];
        var div = Ojay.HTML.div();
        if (tag) {
            div.innerHTML = tag[0] + this._html + tag[1];
            for (var i = 0, n = tag[2]; i < n; i++)
                div = div.firstChild;
        } else div.innerHTML = this._html;
        return Array.from(div.childNodes);
    },
    
    extend: /** @scope Ojay.DomInsertion */{
        
        /**
         * <p>Collection of definitions for how to perform insertions of strings and elements at
         * various positions.</p>
         */
        _TRANSLATIONS: {
            
            top: function(element, html) {
                element.insertBefore(html, element.firstChild);
            },
            
            bottom: function(element, html) {
                element.appendChild(html);
            },
            
            before: function(element, html) {
                element.parentNode.insertBefore(html, element);
            },
            
            after: function(element, html) {
                element.parentNode.insertBefore(html, element.nextSibling);
            }
        },
        
        /**
         * <p>Tags that need special treatment when trying to use <tt>innerHTML</tt>.</p>
         */
        _TAGS: {
            TABLE:  ['<table>',                '</table>',                   1],
            THEAD:  ['<table><tbody>',         '</tbody></table>',           2],
            TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
            TFOOT:  ['<table><tbody>',         '</tbody></table>',           2],
            TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
            TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
            TH:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
            SELECT: ['<select>',               '</select>',                  1]
        }
    }
});
