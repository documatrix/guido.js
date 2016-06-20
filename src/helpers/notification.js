window.Guido = window.Guido || {};

/**
 * A notification instance without any messages yet.
 * Notification messages can be added and then rendered into the
 * #notifications dom element.
 * @param {boolean} append if true append notifications to currently displayed ones,
 *                         otherwise clear notifications.
 * @constructor
 */
Guido.Notification = function() {
  this.notifications = _.cloneDeep(this._notifications);
};

/**
 * Shorthand method for showing a success notification
 * @param {string} message the notification message
 * @param {boolean} append if true append notifications to currently displayed ones,
 *                         otherwise clear notifications.
 * @returns {void}
 */
Guido.Notification.success = function(message) {
  new Guido.Notification().success(message).render();
};

/**
 * Shorthand method for showing a error notification
 * @param {string} message the notification message
 * @returns {void}
 */
Guido.Notification.error = function(message) {
  new Guido.Notification().error(message).render();
};

Guido.Notification.debug = function(message) {
  new Guido.Notification().debug(message).append();
};

Guido.Notification.renderAll = function(notifications) {
  var instance = new Guido.Notification();
  instance.notifications = _.extend({}, this._notifications, notifications);
  instance.render();
}

Guido.Notification.empty = function() {
  $("#notifications").empty();
}

/**
 * Notification module:
 * Notifications can be added by type with its corresponding function:
 * <ul>
 *   <li>infos</li>
 *   <li>successes</li>
 *   <li>warnings</li>
 *   <li>errors</li>
 *   <li>debugs</li>
 * They are stored in the notifications hash that is rendered in the
 * notifications template -> Guido.View.templates.notification
 * Adding a notification to the hash does not automatically trigger
 * the rendering. You have to explicitly call the render function or
 * call a shorthand method (e.g. Guido.Notification.success(msg))
 * for rendering one notification.
 */
Guido.Notification.prototype = (function ($, _, Handlebars) {

  var module = {

    /**
     * internal notification store
     * one for all plural!
     */
    _notifications: {
      infos: [],
      successes: [],
      warnings: [],
      errors: [],
      debugs: []
    },

    /**
     * Add a notification for rendering. Adding does not render the template!
     * @param {string} type One of the notification types: info, success, warning, error or debug.
     * @param {string} message The notification message.
     * @returns {module|Object} Returns the Notification instance to chain several method calls
     * or the modules context if not instanciated.
     */
    add: function(type, message) {
      this.notifications[type].push(message);
      return this;
    },

    /**
     * Add all notifications from a notification Object like _notifications.
     * @param {Object} notifications Notification hash from a server response with a
     * structure of _notifications.
     */
    addAll: function(notifications) {
      if( _.isObject(notifications) ) {
        _.each( notifications, this.addType.bind( this ) );
      }
    },

    /**
     * Add notification messages of a type
     * @param {Array} messages Notification messages to be added.
     * @param {String} type    One of the keys of _notifications, i.e. infos, successes
     * warnings, errors, debugs.
     */
    addType: function( messages, type ) {
      if( _.isArray( messages ) && messages.length > 0 && this.validType( type ) ) {
        _.each( messages, this.add.bind( this, type ) );
      }
    },

    /**
     * Check if notification type is one of _notifications keys.
     * @param  {String} type The type to be checked
     * @return {Boolean}      Returns true if valid, otherwise false.
     */
    validType: function( type ) {
      return _( this._notifications ).keys().includes( type );
    },

    /**
     * Add a info notification.
     * @param {string} message The info message.
     * @returns {module|Object} Returns the Notification instance to chain several method calls
     * or the modules context if not instanciated.
     */
    info: function(message) {
      return this.add('infos', message);
    },

    /**
     * Add a success notification.
     * @param {string} message The success message.
     * @returns {module|Object} Returns the Notification instance to chain several method calls
     * or the modules context if not instanciated.
     */
    success: function(message) {
      return this.add('successes', message);
    },

    /**
     * Add a warning notification.
     * @param {string} message The warning message.
     * @returns {module|Object} Returns the Notification instance to chain several method calls
     * or the modules context if not instanciated.
     */
    warning: function(message) {
      return this.add('warnings', message);
    },

    /**
     * Add a error notification.
     * @param {string} message The error message.
     * @returns {module|Object} Returns the Notification instance to chain several method calls
     * or the modules context if not instanciated.
     */
    error: function(message) {
      return this.add('errors', message);
    },

    /**
     * Add a debug notification.
     * @param {string} message The debug message.
     * @returns {module|Object} Returns the Notification instance to chain several method calls
     * or the modules context if not instanciated.
     */
    debug: function(message) {
      if(_.isObject(message)) {
        message = new Handlebars.SafeString(message.message + '<pre>' + message.stack + '</pre>');
      }
      return this.add('debugs', message);
    },

    /**
     * Render all notifications previously added to the instance.
     * Debug messages are additionally printed to the console.
     */
    render: function() {

      Guido.View.replaceTemplate( '#notifications', 'notifications', this.notifications );
      _.each(this.notifications.debugs, function(message) {
        console.log("[DEBUG] " + message);
      });

      Guido.Event.fire( "guido:notified", {
        target: document.getElementById( 'notifications' ),
        notifications: this.notifications
      });

      this.clear();
    },

    append: function() {
      var $el = Guido.View.$template('notifications', this.notifications);
      $('#notifications').append($el.children());
       _.each(this.notifications.debugs, function(message) {
        console.log("[DEBUG] " + message);
      });
    },

    /**
     * Clear the stored notifications.
     */
    clear: function() {
      this.notifications = _.cloneDeep(this._notifications);
    }
  };

  return module;

})(jQuery, _, Handlebars);
