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
      if( !_.isObject( json ) || !json.session_id || !json.user_id ) {
        throw new Error( "no session object passed" );
      }

      Guido.user = {
        session_id: json.session_id,
        user_id: json.user_id
      };
      this.store( Guido.user );
      // this.ajaxSetup();
    },

    destroy: function() {
      Guido.user = {};
      this.store( {} );
    },

    store: function( user ) {
      if (typeof(Storage) === "undefined") {
        return;
      }

      localStorage.setItem( "user", JSON.stringify( user ) );
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
      Guido.user = JSON.parse( localStorage.user || "" );
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