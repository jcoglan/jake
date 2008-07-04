/**
 * <p>The <tt>Forms.Select</tt> class can be used to 'hijack' drop-down menu inputs in HTML forms to
 * make them easier to style using CSS. The select inputs themselves become hidden (they are positioned
 * off-screen rather than hidden using <tt>display</tt> or <tt>visibility</tt>) and their labels
 * have their class names changed to mirror changes to the inputs as the user interacts with the form.</p>
 *
 * <p>This class is designed as a light-weight and unobtrusive replacement for <tt>YAHOO.widget.Button</tt>
 * for the simple case where you want to style your form inputs and retain programmatic access to them.
 * It encourages accessible markup through use of <tt>label</tt> elements, and does not alter the HTML
 * structure of your form in any way.</p>
 *
 * @constructor
 * @class Forms.Select
 */
Ojay.Forms.Select = new JS.Class(/** @scope Forms.Select.prototype */{
    include: [JS.State, Inputable],
    _inputType: 'select',
    
    extend: /** @scope Forms.Select */{
        CONTAINER_CLASS:    'select-container',
        DISPLAY_CLASS:      'select-display',
        BUTTON_CLASS:       'select-button',
        LIST_CLASS:         'select-list',
        
        /**
         * @constructor
         * @class Forms.Select.Option
         */
        Option: new JS.Class(/** @scope Forms.Select.Option.prototype */{
            /**
             * @param {Forms.Select} select
             * @param {HTMLElement} option
             */
            initialize: function(select, option) {
                this._select = select;
                this._option = Ojay(option);
                this.value = option.value || '';
                this._label = option.text.stripTags();
                this.hovered = false;
                
                var element = this.getHTML();
                [element.on('mouseover'), element.on('mousemove')]
                        .forEach(it()._(this).setHovered(true));
            },
            
            /**
             * <p>Returns an Ojay collection wrapping the list item used to display the option.</p>
             * @returns {DomCollection}
             */
            getHTML: function() {
                if (this._html) return this._html;
                return this._html = Ojay( Ojay.HTML.li(this._label) );
            },
            
            /**
             * <p>Sets the option to be hovered, and notified its parent <tt>Select</tt> instance
             * so it can un-hover the currently hovered option.</p>
             * @param {Boolean} state
             * @returns {Forms.Select.Option}
             */
            setHovered: function(state) {
                this.hovered = (state !== false);
                if (this.hovered) {
                    this._select._setHoveredOption(this);
                    this._nudgeIntoView();
                }
                this.getHTML()[state === false ? 'removeClass' : 'addClass']('hovered');
                return this;
            },
            
            /**
             * <p>Makes sure the option is in view if the list container has a fixed height
             * and is using <tt>overflow: scroll</tt>.</p>
             */
            _nudgeIntoView: function() {
                var list = this._select._elements._listContainer;
                var listRegion = list.getRegion(), myRegion = this.getHTML().getRegion();
                if (listRegion.contains(myRegion)) return;
                var scroll = list.node.scrollTop || 0, edge = (myRegion.top > listRegion.top) ? 'bottom' : 'top';
                list.node.scrollTop = scroll + myRegion[edge] - listRegion[edge];
            }
        })
    },
    
    /**
     * @param {String|HTMLElement|DomCollection} select
     */
    initialize: function(select) {
        styledInputs.push(this);
        this._input = Ojay(select);
        if (!this._input || this._input.node.tagName.toLowerCase() != 'select')
            throw new TypeError('Attempt to create a Select object with non-select element');
        var elements = this._elements = {};
        this._input.insert(this.getHTML().node, 'after');
        this._setupInput();
        this.updateOptions();
        
        this.setState('LIST_OPEN');
        this.hideList(false);
        
        this._input.on('blur')._(this).hideList(true);
        
        // Wait a little bit because 'keydown' fires before the value changes
        [this._input.on('keydown'), this._input.on('change')]
                .forEach(it().wait(0.001)._(this)._updateDisplayFromSelect(false));
        
        this._input.on('keydown', function(element, evnt) {
            var code = evnt.keyCode || 0;
            if (code.between(48,57) || code.between(65,90) || code.between(37,40))
                this.wait(0.001).showList();
        }, this);
        
        elements._container.setStyle({position: 'relative', cursor: 'default'});
        [elements._display, elements._button].forEach(it().on('click')._(this).toggleList());
        
        var KeyListener = YAHOO.util.KeyListener;
        new KeyListener(this._input.node, {keys: KeyListener.KEY.ESCAPE}, {
            fn: this.method('hideList').partial(false)
        }).enable();
        new KeyListener(this._input.node, {keys: KeyListener.KEY.ENTER}, {
            fn: this.method('hideList').partial(true)
        }).enable();
        
        elements._listContainer.setStyle({position: 'absolute'});
    },
    
    /**
     * <p>Returns an Ojay collection wrapping the HTML used as a stand-in for the
     * <tt>select</tt> input.</p>
     * @returns {DomCollection}
     */
    getHTML: function() {
        var elements = this._elements, klass = this.klass;
        if (elements._container) return elements._container;
        return elements._container = Ojay( Ojay.HTML.div({className: this.klass.CONTAINER_CLASS}, function(HTML) {
            elements._display = Ojay( HTML.div({className: klass.DISPLAY_CLASS}) );
            elements._button = Ojay( HTML.div({className: klass.BUTTON_CLASS}) );
            elements._listContainer = Ojay( HTML.div({className: klass.LIST_CLASS}, function(HTML) {
                elements._list = Ojay( HTML.ul() );
            }) );
        }) );
    },
    
    /**
     * @returns {DomCollection}
     */
    getInput: function() {
        return this._input;
    },
    
    /**
     * @returns {DomCollection}
     */
    getLabel: function() {
        return this._label;
    },
    
    /**
     * <p>Focuses the <tt>select</tt> element.</p>
     * @returns {Forms.Select}
     */
    _focusInput: function() {
        this._input.node.focus();
    },
    
    /**
     * <p>Refreshes the list of displayed options. Use this method if you change the
     * contents of the <tt>select</tt> element.</p>
     * @returns {Forms.Select}
     */
    updateOptions: function() {
        this._elements._list.setContent('');
        this._options = Array.from(this._input.node.options).map(function(option) {
            option = new this.klass.Option(this, option);
            this._elements._list.insert(option.getHTML().node);
            return option;
        }, this);
        this._updateDisplayFromSelect();
        return this;
    },
    
    /**
     * <p>Updates the UI of the instance in response to the current state of the
     * underlying <tt>select</tt> input.</p>
     * @param {Boolean} notify
     */
    _updateDisplayFromSelect: function(notify) {
        var oldValue = this._currentValue;
        var selected = this.getSelectedOption();
        if (!selected) return;
        this._elements._display.setContent(selected.text.stripTags());
        this._getOption(selected.value).setHovered(true);
        if (this.inState('LIST_OPEN') || notify === false) return;
        this._currentValue = selected.value;
        if (oldValue !== undefined && oldValue != this._currentValue)
            this.notifyObservers('change');
    },
    
    /**
     * <p>Returns the <tt>Select.Option</tt> instance with the given value.</p>
     * @param {String} value
     * @returns {Forms.Select.Option}
     */
    _getOption: function(value) {
        return this._options.filter({value: value})[0] || null;
    },
    
    /**
     * <p>Sets the given <tt>Select.Option</tt> to be hovered, and removes hover state from
     * all other options.</p>
     * @param {Forms.Select.Option}
     */
    _setHoveredOption: function(option) {
        if (this._currentOption) this._currentOption.setHovered(false);
        this._currentOption = option;
    },
    
    /**
     * <p>Returns an array of references to <tt>option</tt> elements.</p>
     * @returns {Array}
     */
    _getOptions: function() {
        return Array.from(this._input.node.options);
    },
    
    /**
     * <p>Returns a reference to the currently selected <tt>option</tt> element, or a
     * reference to the first element if none is selected.</p>
     * @returns {HTMLElement}
     */
    getSelectedOption: function() {
        return this._getOptions().filter('selected')[0] || this._input.node.options[0] || null;
    },
    
    /**
     * <p>Returns all the <tt>option</tt> elements in the <tt>select</tt> whose value equals
     * the supplied <tt>value</tt>.</p>
     * @param {String|Number} value
     * @returns {Array}
     */
    getOptionsByValue: function(value) {
        return this._getOptions().filter({value: value});
    },
    
    /**
     * <p>Returns the current value of the <tt>select</tt> element.</p>
     * @returns {String}
     */
    getValue: function() {
        return this.getSelectedOption().value;
    },
    
    /**
     * <p>Sets the value of the <tt>select</tt> element to the given <tt>value</tt>, triggering
     * a <tt>change</tt> event unless you pass <tt>false</tt> as the second parameter.</p>
     * @param {String|Number} value
     * @param {Boolean} notify
     * @returns {Forms.Select}
     */
    setValue: function(value, notify) {
        Ojay.Forms.setValue(this._input, value);
        this._updateDisplayFromSelect(notify);
        return this;
    },
    
    /**
     * <p>Sets the position of the list relative to the container so the two are properly aligned.</p>
     * @returns {Forms.Select}
     */
    updateListPosition: function() {
        var region = this._elements._container.getRegion();
        if (!region) return this;
        var list = this._elements._listContainer;
        list.setStyle({width: region.getWidth() + 'px', left: 0, top: region.getHeight() + 'px'});
        return this;
    },
    
    states: {
        LIST_CLOSED: /** @scope Forms.Select.prototype */{
            /**
             * <p>Displays the drop-down list.</p>
             * @returns {Forms.Select}
             */
            showList: function() {
                if (this.disabled) return this;
                this.updateListPosition();
                this._elements._listContainer.show();
                this.setState('LIST_OPEN');
                this._focusInput();
                var selected = this.getSelectedOption();
                if (selected) this._getOption(selected.value).setHovered(true);
                return this;
            },
            
            /**
             * <p>Displays the drop-down list.</p>
             * @returns {Forms.Select}
             */
            toggleList: function() {
                return this.showList();
            }
        },
        
        LIST_OPEN: /** @scope Forms.Select.prototype */{
            /**
             * <p>Hides the drop-down list.</p>
             * @param {Boolean} update
             * @returns {Forms.Select}
             */
            hideList: function(update) {
                this._elements._listContainer.hide();
                this.setState('LIST_CLOSED');
                if (update !== false) {
                    this.setValue(this._currentOption.value);
                    this._focusInput();
                }
                return this;
            },
            
            /**
             * <p>Hides the drop-down list.</p>
             * @param {Boolean} update
             * @returns {Forms.Select}
             */
            toggleList: function(update) {
                return this.hideList(update);
            }
        }
    }
});
