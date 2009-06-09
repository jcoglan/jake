Basic = {
  VERSION:  "0.5.0-src",
  
  function(something) {
    var myVar = 4;
    return myVar + this._foo + something;
  }
};


Basic.Ext = "SRC";
