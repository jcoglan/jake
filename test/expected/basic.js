/**
 * Jake test files should all include this
 * even if they have been minified.
 * 0.5.0-src
 **/


Basic = {
  VERSION:  "0.5.0-src",
  
  function(something) {
    var myVar = 4;
    return myVar + this._foo + something;
  }
};