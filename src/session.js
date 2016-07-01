Guido.Session = (function ($, _) {

  var _session = null;

  var module = {
    /**
     * Return the session query parameter
     * @param {string} session optional session
     * @returns {string} the session query parameter
     */
    getSessionString: function(session) {
      session = session || this.getSession();
      return session ? ( "&session_id=" + session ) : "";
    },

    /**
     * Return the current session
     * @returns {string} the current session.
     */
    getSession: function() {
      return Guido.sessionId || _session;
    },

    /**
     * Set the session. Several values are set atm because of compatibility.
     * Current code uses Guido.Request.getSession() or Guido.sessionId
     * @param {string} session the session string to be set.
     */
    setSession: function(session) {
      _session = session;
      Guido.session_id = session;

      Guido.Request.defaults.session_id = session;
      Guido.Request.defaults.data.session_id = session;
    },

    user: function() {
      return Guido.user || this.userFromStore();
    },

    save: function( json ) {
      Guido.Event.fire( 'Guido.Session.save', json );
      Guido.user = this.appendTo( 'user', json );
    },

    destroy: function() {
      Guido.user = {};
      this.store( {} );
    },

    store: function( user ) {
      this.setItem( 'user', JSON.stringify( user ) );
    },

    setItem: function( key, val ) {
      if ( (typeof Storage) === 'undefined' ) {
        return;
      }

      localStorage.setItem(key, val);
    },

    getItem: function( key ) {
      if( (typeof Storage) === 'undefined' ) {
        return;
      }

      return localStorage.getItem(key) || '{}';
    },

    appendTo: function( key, childObject ) {
      var parentObject = JSON.parse( this.getItem( key ) );

      if( ! _.isObject( parentObject ) ) {
        throw new Error('Can\'t append to non-object session item');
      }

      this.setItem( key, JSON.stringify( _.extend( parentObject, childObject ) ) );

      return parentObject;
    },


    // ajaxSetup: function() {
    //   $.ajaxSetup({
    //     beforeSend: function( jqXHR, settings ) {
    //       settings.data = $.extend( settings.data, Guido.user );
    //       return true;
    //     }
    //   });
    // },

    userFromStore: function() {
      Guido.user = JSON.parse( this.getItem('user') || "{}" );
      // this.ajaxSetup();
      return Guido.user;
    },

    /**
     * Destroy current session.
     */
    destroySession: function() {
      this.setSession(null);
    }
  };

  return module;

})( jQuery, _ );