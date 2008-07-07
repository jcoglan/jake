/**
 * <p>The <tt>Inputable</tt> module is mixed into <tt>Forms.Select</tt>, and indirectly into
 * <tt>Forms.Checkbox</tt> and <tt>Forms.RadioButtons.Item</tt> through <tt>Checkable</tt>.
 * It provides methods for setting class names on form elements to indicate the hovered, focused
 * and disabled states of form inputs.</p>
 * @module Inputable
 * @private
 */
var Inputable = new JS.Module(/** @scope Inputable */{
    include: Ojay.Observable,
    
    /**
     * <p>Called inside class constructors to set up the behaviour of the form input and
     * its associated label. Hides the input off the page, and sets up a set of events to
     * enable class names to be changed.</p>
     */
    _setupInput: function() {
        var wrapper = Ojay( Ojay.HTML.span() ).setStyle({position: 'relative'});
        this._input.insert(wrapper.node, 'before');
        wrapper.insert(this._input.node, 'bottom');
        this._input.setStyle({position: 'absolute', left: '-5000px', top: 0});
        
        this._input.on('focus')._(this).setFocused(true);
        this._input.on('blur')._(this).setFocused(false);
        
        this._label = Ojay.Forms.getLabel(this._input);
        if (this._label.node) this._label.addClass(this._inputType);
        
        this._interface = [this._input, this._label];
        if (this.getHTML) this._interface.push(this.getHTML());
        this._interface.forEach(it().on('mouseover')._(this).setHovered(true));
        this._interface.forEach(it().on('mouseout')._(this).setHovered(false));
        this._interface.forEach(it().addClass('js'));
        
        this.setDisabled();
    },
    
    /**
     * <p>Adds or removes the class name 'focused' from the input and its label depending on <tt>state</tt>.</p>
     * @param {Boolean} state
     * @returns {Inputable}
     */
    setFocused: function(state) {
        if (this._input.node.checked) this.setChecked();
        this._setClass(state, 'focused');
        return this;
    },
    
    /**
     * <p>Adds or removes the class name 'focused' from the input and its label depending on <tt>state</tt>.</p>
     * @param {Boolean} state
     * @returns {Inputable}
     */
    setHovered: function(state) {
        this._setClass(state, 'hovered');
        return this;
    },
    
    /**
     * <p>Adds or removes the class name 'disabled' from the input and its label depending on <tt>state</tt>.</p>
     * @param {Boolean} state
     * @returns {Inputable}
     */
    setDisabled: function(state) {
        this.disabled = (state === undefined) ? this._input.node.disabled : !!state;
        this._input.node.disabled = this.disabled;
        this._setClass(this.disabled, 'disabled');
        return this;
    },
    
    /**
     * <p>Adds or removes a class name from the input's elements according to its state.</p>
     * @param {Boolean} state
     * @param {String} name
     */
    _setClass: function(state, name) {
        this._stateClasses = this._stateClasses || [];
        if (state) {
            if (this._stateClasses.indexOf(name) == -1) this._stateClasses.push(name);
            this._stateClasses.sort();
        } else {
            this._stateClasses = this._stateClasses.filter(function(s) { return s != name });
        }
        
        this._interface.forEach(it()[state ? 'addClass' : 'removeClass'](name));
        var classes = this._interface[0].node.className.split(/\s+/);
        
        var type = this._inputType, pattern = new RegExp('^' + type + '-');
        
        var stateClass = classes.filter({match: pattern})[0];
        if (stateClass) this._interface.forEach({removeClass: stateClass});
        if (this._stateClasses.length) this._interface.forEach({addClass: type + '-' + this._stateClasses.join('-')});
    }
});
