var /**
     * @param {String} string
     * @returns {Array}
     */
    w = function(string) {
        string = string.trim();
        return string ? string.split(/\s+/) : [];
    },
    
    /**
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     */
    compareNumbers = function(a, b) {
        return a - b;
    },
    
    /**
     * @param {String} key
     * @returns {Number}
     */
    codeFor = function(key) {
        return key && String(key).toUpperCase().charCodeAt(0);
    },
    
    /**
     * @param {String|Array} keylist
     * @returns {Array}
     */
    codesFromKeys = function(keylist) {
        if (typeof keylist == 'string') keylist = w(keylist);
        return keylist.map(function(key) {
            var value = null;
            if (value = KEYS[String(key).toUpperCase()]) key = value;
            if (typeof key == 'string') key = codeFor(key);
            return key;
        }).sort(compareNumbers);
    },
    
    /**
     * @param {Array} codes
     * @returns {Object}
     */
    hashFromCodes = function(codes) {
        return codes.reduce(function(hash, code) {
            switch (code) {
                case KEYS.CONTROL:  hash.ctrl = true;   break;
                case KEYS.SHIFT:    hash.shift = true;  break;
                case KEYS.ALT:      hash.alt = true;    break;
                default:
                    hash.keys.push(code);
            }
            return hash;
        }, {keys: []});
    },
    
    /**
     * @param {Array} codes
     * @returns {String}
     */
    signature = function(codes) {
        return codes.sort(compareNumbers).join(':');
    };
