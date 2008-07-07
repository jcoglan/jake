JS.MethodChain = function(base) {
  var queue = [], baseObject = base || {};
  
  this.____ = function(method, args) {
    queue.push({func: method, args: args});
  };
  
  this.fire = function(base) {
    return JS.MethodChain.fire(queue, base || baseObject);
  };
};

JS.MethodChain.fire = function(queue, object) {
  var method, property, i, n;
  loop: for (i = 0, n = queue.length; i < n; i++) {
    method = queue[i];
    if (object instanceof JS.MethodChain) {
      object.____(method.func, method.args);
      continue;
    }
    switch (typeof method.func) {
      case 'string':    property = object[method.func];       break;
      case 'function':  property = method.func;               break;
      case 'object':    object = method.func; continue loop;  break;
    }
    object = (typeof property == 'function')
        ? property.apply(object, method.args)
        : property;
  }
  return object;
};

JS.MethodChain.prototype = {
  _: function() {
    var base = arguments[0], args, i, n;
    switch (typeof base) {
      case 'object': case 'function':
        args = [];
        for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
        this.____(base, args);
    }
    return this;
  },
  
  toFunction: function() {
    var chain = this;
    return function(object) { return chain.fire(object); };
  }
};

JS.MethodChain.reserved = (function() {
  var names = [], key;
  for (key in new JS.MethodChain) names.push(key);
  return new RegExp('^(?:' + names.join('|') + ')$');
})();

JS.MethodChain.addMethod = function(name) {
  if (this.reserved.test(name)) return;
  this.prototype[name] = function() {
    this.____(name, arguments);
    return this;
  };
};

JS.MethodChain.addMethods = function(object) {
  var methods = [], property, i, n;
  
  for (property in object)
    Number(property) != property && methods.push(property);
  
  if (object instanceof Array) {
    for (i = 0, n = object.length; i < n; i++)
      typeof object[i] == 'string' && methods.push(object[i]);
  }
  for (i = 0, n = methods.length; i < n; i++)
    this.addMethod(methods[i]);
  
  object.prototype &&
    this.addMethods(object.prototype);
};

it = its = function() { return new JS.MethodChain; };

JS.Class.addMethod = (function(wrapped) {
  return function() {
    JS.MethodChain.addMethods([arguments[2]]);
    return wrapped.apply(JS.Class, arguments);
  };
})(JS.Class.addMethod);

(function(methods) {
  JS.extend(JS.Class.INSTANCE_METHODS, methods);
  JS.extend(JS.Class.CLASS_METHODS, methods);
})({
  wait: function(time) {
    var chain = new JS.MethodChain;
    
    typeof time == 'number' &&
      setTimeout(chain.fire.bind(chain, this), time * 1000);
    
    this.forEach && typeof time == 'function' &&
      this.forEach(function() {
        setTimeout(chain.fire.bind(chain, arguments[0]), time.apply(this, arguments) * 1000);
      });
    
    return chain;
  },
  
  _: function() {
    var base = arguments[0], args = [], i, n;
    for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
    return  (typeof base == 'object' && base) ||
            (typeof base == 'function' && base.apply(this, args)) ||
            this;
  }
});
