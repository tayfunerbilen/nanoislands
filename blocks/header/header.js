nb.define('header', {
    events: {
        'click .nb-header-button': 'togglePress'
    },

    /**
     * Toggles pressed state of button
     */

    togglePress: function(e) {
        var $target = $(e.target);
        $target.closest('.nb-header-button').toggleClass('is-pressed');

        if ($target.hasClass('nb-icon_services')) {
            nb.trigger('services-click');
        }

        if ($target.hasClass('nb-icon_settings')) {
            nb.trigger('settings-click');
        }
    }
}, 'base');
