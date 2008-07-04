/**
 * <p>Sane DOM node creation API, inspired by
 * <a href="http://api.rubyonrails.org/classes/Builder/XmlMarkup.html"><tt>Builder::XmlMarkup</tt></a>
 * in Ruby on Rails.</p>
 *
 * <p>This class lets you use a much nicer syntax for creating DOM nodes, without resorting to
 * <tt>document.createElement</tt> and friends. Essentially, you write JavaScript that mirrors
 * the HTML you're creating. The methods in the class return <tt>HTMLElement</tt> objects rather
 * than strings of HTML.</p>
 *
 * <p>To begin, you create a new <tt>HtmlBuilder</tt>:</p>
 *
 * <pre><code>    var html = new Ojay.HtmlBuilder();</code></pre>
 *
 * <p>Then write your HTML. Use hashes for tag attributes, strings for text nodes, and functions
 * to nest further tags inside the current node. The beauty of this is that you can easily add
 * whatever logic you want inside the functions to customize the HTML generated. A simple example:</p>
 *
 * <pre><code>    var div = html.div({id: 'container'}, function(html) {
 *         html.h1('This is the title');
 *         html.p({className: 'para'}, 'Lorem ipsum dolor sit amet...');
 *         html.ul(function(html) {
 *             ['One', 'Two', 'Three'].forEach(html.method('li'));
 *         });
 *     });</code></pre>
 *
 * <p>Now <tt>div</tt> is an <tt>HTMLElement</tt> object with the following structure:</p>
 *
 * <pre><code>    &lt;div id="container"&gt;
 *         &lt;h1&gt;This is the title&lt;/h1&gt;
 *         &lt;p class="para"&gt;Lorem ipsum dolor sit amet...&lt;/p&gt;
 *         &lt;ul&gt;
 *             &lt;li&gt;One&lt;/li&gt;
 *             &lt;li&gt;Two&lt;/li&gt;
 *             &lt;li&gt;Three&lt;/li&gt;
 *         &lt;/ul&gt;
 *     &lt;/div&gt;</code></pre>
 *
 * <p>If you prefer, there is a pre-initialized instance of <tt>HtmlBuilder</tt> named
 * <tt>Ojay.HTML</tt>. So, you can call <tt>Ojay.HTML.div('DIV content')</tt> and the like.</p>
 *
 * <p>One key advantage of writing HTML out using JavaScript is that you can assign references
 * to elements as they are being created, without needing to add IDs or class names to them for
 * later reference. For example:</p>
 *
 * <pre><code>    var FormController = new JS.Class({
 *         
 *         initialize: function(element) {
 *             element = Ojay(element);
 *             var self = this;
 *             var form = Ojay.HTML.form(function(html) {
 *                 html.h3('Enter your email address');
 *                 html.label('Email:');
 *                 self.emailField = html.input({type: 'text'});
 *                 self.button = html.input({type: 'submit', value: 'Go!'});
 *             });
 *             this.form = Ojay(form);
 *             element.setContent(form);
 *             this.registerEventHandlers();
 *         },
 *         
 *         registerEventHandlers: function() {
 *             this.form.on('submit', function(e) {
 *                 alert(this.emailField.value);
 *             }, this);
 *         }
 *     });</code></pre>
 *
 * <p>Note how the <tt>emailField</tt> property is set at the same time that the element is
 * being created. Storing this reference means you don't have to crawl the DOM for the right
 * node later on, so performance is improved. Also, the fact that you don't need to add IDs
 * or class names to the new elements means you've less chance of causing a naming collision
 * with existing page elements, or unintentionally inheriting stylesheet rules.</p>
 *
 * <p>All the tags defined in the HTML 4.01 spec are available in <tt>HtmlBuilder</tt>. You can
 * see which tags are implemented by inspecting the array <tt>Ojay.HtmlBuilder.TAG_NAMES</tt>.</p>
 *
 * @constructor
 * @class HtmlBuilder
 */
Ojay.HtmlBuilder = new JS.Class(/* @scope Ojay.HtmlBuilder.prototype */{
    
    /**
     * @param {HTMLElement} node
     */
    initialize: function(node) {
        this._rootNode = node || null;
    },
    
    /**
     * @param {HTMLElement} node
     */
    concat: function(node) {
        if (this._rootNode) this._rootNode.appendChild(node);
        return node;
    },
    
    extend: {
        addTagNames: function() {
            var args = (arguments[0] instanceof Array) ? arguments[0] : arguments;
            for (var i = 0, n = args.length; i < n; i++)
                this.addTagName(args[i]);
        },
        
        addTagName: function(name) {
            this.prototype[name] = function() {
                var node = document.createElement(name), arg, attr, style, appendable;
                loop: for (var j = 0, m = arguments.length; j < m; j++) {
                    arg = arguments[j];
                    
                    switch (typeof arg) {
                    case 'object':
                        appendable = arg.node || arg;
                        if (appendable.nodeType === Ojay.HTML.ELEMENT_NODE) {
                            node.appendChild(appendable);
                        } else {
                            for (attr in arg) {
                                if (Number(attr) == attr) continue;
                                if (attr == 'style')
                                    for (style in arg[attr]) node.style[style] = arg[attr][style];
                                else
                                    node[attr] = arg[attr];
                            }
                        }
                        break;
                        
                    case 'function': arg(new Ojay.HtmlBuilder(node));
                        break;
                        
                    case 'string': node.appendChild(document.createTextNode(arg));
                        break;
                    }
                }
                if (this._rootNode) this._rootNode.appendChild(node);
                return node;
            };
        },
        
        /**
         * List of all HTML 4.01 tag names, culled from the <a
         * href="http://www.w3.org/TR/REC-html40/index/elements.html">W3C spec</a>.
         */
        TAG_NAMES: (
            "a abbr acronym address applet area b base basefont bdo big blockquote body " +
            "br button caption center cite code col colgroup dd del dfn dir div dl dt em " +
            "embed fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i " +
            "iframe img input ins isindex kbd label legend li link map menu meta noframes " +
            "noscript object ol optgroup option p param pre q s samp script select small " +
            "span strike strong style sub sup table tbody td textarea tfoot th thead title " +
            "tr tt u ul var"
        ).split(/\s+/)
    }
});

Ojay.HtmlBuilder.addTagNames(Ojay.HtmlBuilder.TAG_NAMES);

/**
 * <p>A pre-initialized instance of <tt>HtmlBuilder</tt>.</p>
 */
Ojay.HTML = new Ojay.HtmlBuilder();

/**
 *<p>Named references to all types of DOM node -- these are defined in Mozilla but not in IE.</p>
 */
JS.extend(Ojay.HTML, /** @scope Ojay.HTML */{
    ELEMENT_NODE:                   1,
    ATTRIBUTE_NODE:                 2,
    TEXT_NODE:                      3,
    CDATA_SECTION_NODE:             4,
    ENTITY_REFERENCE_NODE:          5,
    ENTITY_NODE:                    6,
    PROCESSING_INSTRUCTION_NODE:    7,
    COMMENT_NODE:                   8,
    DOCUMENT_NODE:                  9,
    DOCUMENT_TYPE_NODE:             10,
    DOCUMENT_FRAGMENT_NODE:         11,
    NOTATION_NODE:                  12
});
