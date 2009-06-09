Foo = (function(my, vars) {
  var another = true;
  
  return {
    _priv:  null,
    field:  another,
    global: foo
  };
})(window, something);

