/**
 * <p>On keydown events, add the new key to the <tt>Monitor</tt> and decide whether
 * to stop the event in IE browsers.</p>
 */
Event.on(doc, 'keydown', function(evnt) {
    Monitor._addKey(evnt.keyCode);
    if (YAHOO.env.ua.ie)
        Disabler._processEvent(evnt, Monitor.getSignature());
});

/**
 * <p>On keypress events, decide whether to stop the event in non-IE browsers.</p>
 */
if (!YAHOO.env.ua.ie) {
    Event.on(doc, 'keypress', function(evnt) {
        Disabler._processEvent(evnt, Monitor.getSignature());
    });
}

/**
 * <p>On keyup events, remove the key from the <tt>Monitor</tt>.</p>
 */
Event.on(doc, 'keyup', function(evnt) {
    Monitor._removeKey(evnt.keyCode);
});
