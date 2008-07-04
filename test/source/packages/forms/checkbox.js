/**
 * <p>The <tt>Forms.Checkbox</tt> class can be used to 'hijack' checkbox inputs in HTML forms to
 * make them easier to style using CSS. The checkbox inputs themselves become hidden (they are positioned
 * off-screen rather than hidden using <tt>display</tt> or <tt>visibility</tt>) and their labels
 * have their class names changed to mirror changes to the inputs as the user interacts with the form.</p>
 *
 * <p>This class is designed as a light-weight and unobtrusive replacement for <tt>YAHOO.widget.Button</tt>
 * for the simple case where you want to style your form inputs and retain programmatic access to them.
 * It encourages accessible markup through use of <tt>label</tt> elements, and does not alter the HTML
 * structure of your form in any way.</p>
 *
 * @constructor
 * @class Forms.Checkbox
 */
Ojay.Forms.Checkbox = new JS.Class(/* @scope Forms.Checkbox.prototype */{
    include: Checkable,
    _inputType: 'checkbox',
    
    /**
     * @param {String|HTMLElement|DomCollection} input
     */
    initialize: function(input) {
        styledInputs.push(this);
        this._input = Ojay(input);
        if (!this._input || !this._input.node || this._input.node.type != 'checkbox')
            throw new TypeError('Attempt to create a Checkbox object with non-checkbox element');
        this._setupButton();
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
    }
});

Ojay.Forms.Checkbox.include({
    getValue:   Ojay.Forms.Checkbox.prototype.isChecked,
    setValue:   Ojay.Forms.Checkbox.prototype.setChecked
});
