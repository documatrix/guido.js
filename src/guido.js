var Guido = Guido || {};
var Gui = { do: {} };

/**
 * Bind a context to a function to use this inside the function with the correct scope.
 * @param  {[type]} ctx  [description]
 * @param  {[type]} func [description]
 * @param  {[type]} args [description]
 * @return {[type]}      [description]
 */
window._b = function( ctx, func ) {
  args = _.drop( arguments, 2 );
  args = _.pull( args, undefined, null );
  // args = _.pick( args, function( arg ) {
  //   return arg !== undefined || arg !== null;
  // });
  // args = _.compact( args );
  if( _.isEmpty( args ) ) {
    args = undefined;
  }

  if( _.isFunction( func ) ) {
//    return args ? func.apply( ctx, args ) : func.apply( ctx );
    return args ? func.bind( ctx, args ) : func.bind( ctx );
  }
  if( _.isFunction( ctx[func] ) ) {
    return args ? ctx[ func ].bind( ctx, args ) : ctx[ func ].bind( ctx );
  }
};

/**
 * Entry point to the Guido App
 */
var app = (function ($) {

  var module = {

    ENV: 'development',

    /**
     * Return the view corresponding to the passed id.
     * @param {string} id the unique reference to the view instance
     * @returns {object} the view instance
     */
    get: function(id) {
      return Guido.views[id];
    },

    t: function(key, interpolation) {
      var captions      = Guido.captions || {},
          tr            = captions[key],
          interpolation = interpolation || {};

      if(_.isUndefined(tr)) {
        console.log('ERROR: translation key ' + key + ' could not be found.');
        return new Handlebars.SafeString('<b class="text-danger" contenteditable="true">?' + key + '?</b>');
      }

      return new Handlebars.SafeString(Handlebars.compile(tr)(interpolation));
    },

    _navigation: {},
    _breadcrumbs: {},

    /**
     * Start the Guido Application
     */
    start: function ( callback ) {
      this.bootstrap();

      Guido.View.instanceFromUrl().load();

      if( _.isFunction( callback ) ) {
        callback( this );
      }
    },

    /**
     * Handle the inital get_user_settings request and call Guido.setup afterwards.
     *
     * @param {object} response the response object of the get_user_settings request.
     */
    bootstrap: function(response) {
      this.routes = new Guido.Router();
      Guido.View.init();
      Guido.Event.listen();
    },

    isProduction: function() {
      return Guido.ENV === 'production';
    }
  };

  return module;
})(jQuery);

_.assign(Guido, app);
window.t = Guido.t;