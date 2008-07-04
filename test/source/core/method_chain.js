JS.MethodChain.addMethods(Ojay);
JS.MethodChain.addMethods(Ojay.HTML);

// Modify MethodChain to allow CSS selectors
JS.MethodChain.prototype._ = JS.MethodChain.prototype._.wrap(function() {
    var args = Array.from(arguments), _ = args.shift();
    if (typeof args[0] == 'string') return _(Ojay, args[0]);
    else return _.apply(this, args);
});
