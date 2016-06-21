Guido.Router = function () {

  for( var module in Gui.do ) {
    if ( Gui.do.hasOwnProperty( module ) ) {
      this.register( module );
    }
  }
};

Guido.Router.prototype  = (function ($, _) {


  var module = {

    routes: {},

    resolve: function( url ) {
      var params = {},
          module = null,
          lastModule = null,
          options = [],
          routes = this.routes || {},
          action = null,
          qs,
          path;

      if( url ) {
        qs = url.split( "?" )[ 1 ];
        path = url;
      } else {
        qs = window.location.search;
        path = window.location.toString();
      }

      path = path
        .replace( Guido.config.basePath, '' )
        .replace( qs, '' )
        .split( '/' )
        .reverse();

      for( var i = 0; i < path.length; i++ ) {
        part = path[ i ];
        if( routes[ part ] ) {

          if( module == null ) {
            // module = routes[ part ];
            module = part;
          }

          lastModule = routes[ part ];
          this.assignParamsFromModule( lastModule, options, params );

          if( params._action_ ) {
            action = params._action_;
          }

          if( options.length > 0) {
            throw new Error( "Cannot determine which action to call in " + part + ": " + options.toString() );
          }

          options = [];
        } else {
          options.push( part );
        }
      }

      this.extractQueryParams( qs, params );

      return [ module, action, params ];

      // return module[ action ]( params );
    },

    makeRoute: function( module ) {
      var url = Guido.config.basePath + '#/',  options = [];

      url += _.snakeCase( module.name );

      for( var i = 0; i < module.params.length; i++ ) {
        v = module.object[ module.params[ i ] ];
        if( v ) {
          options.push( v );
        }
      }

      if( options.length > 0 ) {
        url += '/' + options.join( '/' );
      }

      url += '/' + ( module.state || '' );

      return url;
    },

    module: function( url ) {
      return this.resolve( url )[ 0 ];
    },

    action: function( url ) {
      return this.resolve( url )[ 1 ];
    },

    params: function( url ) {
      return this.resolve( url )[ 2 ];
    },

    register: function( module ) {
      var m, name;

      if( _.isString( module ) && Gui.do[ module ] ) {
        m = Gui.do[ module ];
        name = _.snakeCase( module );
        m.params = m.params || [];
      } else if( _.isObject( module ) ) {
        m = module;
        name = module.name;
      } else {
        return;
      }

      this.routes[ name ] = m;
      // this.routes[ name ] = Gui.do[ module ];
    },

    setRoutes: function( routes ) {
      this.routes = routes;
    },

    assignParamsFromModule: function( module, options, params ) {
      var mp,
          params = params || {};

      if( typeof module.params === 'undefined' ) {
        return params;
      }

      if( module.params.constructor === Array ) {
        mp = module.params;
      }

      if( module.params.constructor === String ) {
        mp = module.params.split( "/" );
      }

      // the first option may be the module action to call.
      action = options[ 0 ];
      if( this.hasAction( module, action ) ) {
        params._action_ = options.shift();
      }

      // while( ( option = options.pop() ) != null ) {
      //   params[ mp[ i ] ] = option;
      // }

      for( var i = 0; i < mp.length; i++ ) {
        params[ mp[ i ] ] = options.pop();
      }


      return params;
    },

    hasAction: function( module, action ) {
      return _.isFunction( module[ action ] ) || _.isFunction( Guido.Base.Actions[ action ] );
    },

    extractQueryParams: function ( url, params ) {
      var url = url || window.location.search,
          params = params || {},
          query = url.match(/\?(.+)/);

      if( query && query.constructor === Array && query.length == 2) {
        query = query[1];
      } else {
        return params;
      }

      var vars = query.split("&");
      var arr;

      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (typeof params[pair[0]] === "undefined") {
          params[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof params[pair[0]] === "string") {
          arr = [params[pair[0]], decodeURIComponent(pair[1])];
          params[pair[0]] = arr;
        } else {
          params[pair[0]].push(decodeURIComponent(pair[1]));
        }
      }

      return params;
    }
  };

  return module;

})( jQuery, _ );