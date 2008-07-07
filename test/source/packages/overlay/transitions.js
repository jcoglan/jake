/**
 * @overview
 * <p>This file defines a set of transition effects for hiding and showing overlay elements.
 * follow the pattern outlined below to implement your own custom transitions.</p>
 */
Ojay.Overlay.Transitions

.add('none', {
    hide: function(overlay, chain) {
        overlay.getContainer().hide();
        chain.fire();
        return overlay;
    },
    
    show: function(overlay, chain) {
        overlay.getContainer()
            .setStyle({opacity: overlay.getOpacity()})
            .setStyle(overlay.getSize(true))
            .setStyle(overlay.getPosition(true))
            .show();
        chain.fire();
        return overlay;
    }
})

.add('fade', {
    hide: function(overlay, chain) {
        overlay.getContainer()
            .animate({opacity: {to: 0}}, Ojay.Overlay.TRANSITION_TIME)
            .hide()
            ._(chain.toFunction());
        return chain;
    },
    
    show: function(overlay, chain) {
        overlay.getContainer()
            .setStyle({opacity: 0})
            .setStyle(overlay.getSize(true))
            .setStyle(overlay.getPosition(true))
            .show()
            .animate({opacity: {to: overlay.getOpacity()}}, Ojay.Overlay.TRANSITION_TIME)
            ._(chain.toFunction());
        return chain;
    }
})

.add('zoom', {
    hide: function(overlay, chain) {
        var region = overlay.getRegion().scale(0.5), center = region.getCenter();
        overlay.getContainer()
            .animate({
                opacity: {to: 0},
                left:   {to: region.left},      width:  {to: region.getWidth()},
                top:    {to: region.top},       height: {to: region.getHeight()}
            }, Ojay.Overlay.TRANSITION_TIME, {easing: Ojay.Overlay.EASING})
            .hide()
            ._(chain.toFunction());
        return chain;
    },
    
    show: function(overlay, chain) {
        var position = overlay.getPosition(), size = overlay.getSize();
        overlay.getContainer()
            .setStyle({
                opacity: 0,
                left: (position.left + size.width/4) + 'px',
                top: (position.top + size.height/4) + 'px',
                width: (size.width / 2) + 'px', height: (size.height / 2) + 'px'
            })
            .show()
            .animate({
                opacity: {to: overlay.getOpacity()},
                left:   {to: position.left},    width:  {to: size.width},
                top:    {to: position.top},     height: {to: size.height}
            }, Ojay.Overlay.TRANSITION_TIME, {easing: Ojay.Overlay.EASING})
            ._(chain.toFunction());
        return chain;
    }
});
