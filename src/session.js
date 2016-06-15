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

    /**
     * Destroy current session.
     */
    destroySession: function() {
      this.setSession(null);
    }
  };

  return module;

})( jQuery, _ );