Basic = {
  VERSION:  "<%= version %>-<%= build %>",
  
  function(something) {
    var myVar = 4;
    return myVar + this._foo + something;
  }
};

