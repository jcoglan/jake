/**
 * <p>The <tt>Checkable</tt> module extends <tt>Inputable</tt> by providing methods to
 * handle checking and unchecking of form elements. It is used by the <tt>Forms.Checkbox</tt>
 * and <tt>Forms.RadioButtons.Item</tt> classes to add and remove class names from their
 * associated <tt>label</tt> tags.</p>
 * @private
 * @module Checkable
 */
var Checkable = new JS.Module(/** @scope Checkable */{
    include: Inputable,
    
    /**
     * <p>Called inside class constructors to set up the behaviour of a form input and its label.
     * Causes the input and its label to add/remove the 'checked' class name to indicate the state
     * of the input.</p>
     */
    _setupButton: function() {
        this._setupInput();
        this._input.on('click')._(this).setChecked()._(this._input.node).focus();
        this.setChecked();
    },
    
    /**
     * <p>Adds or removes the class name 'checked' from the input and its label depending on whether the
     * input is checked. If the input is part of a <tt>RadioButtons</tt> group, notifies the group in
     * order to change the state of the currently checked input.</p>
     * @param {Boolean} state
     * @param {Boolean} notify
     * @returns {Checkable}
     */
    setChecked: function(state, notify) {
        var oldChecked = !!this.checked;
        this.checked = (state === undefined) ? this._input.node.checked : !!state;
        if (this._group) {
            if (this.checked) {
                this._input.node.checked = true;
                this._group._check(this, notify);
            }
        } else {
            this._input.node.checked = this.checked;
            if (notify !== false && oldChecked != this.checked)
                this.notifyObservers('change');
        }
        this._setClass(this.checked, 'checked');
        return this;
    },
    
    /**
     * <p>Returns <tt>true</tt> iff the element is checked.</p>
     * @returns {Boolean}
     */
    isChecked: function() {
        return !!this.checked;
    }
});

JS.MethodChain.addMethod('focus');
