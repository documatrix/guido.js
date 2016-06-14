var Guido = Guido || {};

/**
 * Request parameter:
 * {
 *   func: <server side route>,
 *   session_id: <session string of current session>,
 *   type: <GET|POST>
 *   data: {
 *     data: {
 *
 *     }
 *   }
 * }
 */

Guido.Request = (function ($, _) {

  var BASE_PATH = Guido.BASE_PATH || '/',
      MODULE_PATH = Guido.MODULE_PATH || '/js/modules',
      TEMPLATE_PATH = Guido.TEMPLATE_PATH || '/tpl',
      HOME = null;

  // TODO: unifiy session passing to server -> top level or in data {}
  var defaults = {
    url: BASE_PATH,
    dataType: 'text',
    contentType: 'application/json',
    type: 'POST',
    data: {
      session_id: null
    }
  };

  var defaultData = {
    session_id: null,
    data: {}
  };

  var module = {

    updatePaths: function() {
      BASE_PATH = Guido.BASE_PATH;
      MODULE_PATH = Guido.MODULE_PATH;
      TEMPLATE_PATH = Guido.TEMPLATE_PATH;
    },

    base: function() {
      return BASE_PATH;
    },

    home: function() {
      if(!_.isString(Guido.Request.HOME)) {
        HOME = BASE_PATH + Guido.Request.getSessionString();
      }
      return HOME;
    },

    /**
     * Extract the value of a url parameter from the passed url.
     * If url is omitted, window.location.search is used instead.
     * @param {string} param the parameter key to be searched for
     * @param {string} url the url to be searched
     * @returns {string} the decoded value of the searched parameter or undefined if not found.
     */
    getURLParameter: function (url) {

      var params;

      if( ! url ) return false;

      params = url.replace(document.querySelector('base').href, '').replace('#', '');

      if( params[0] == '/' ) {
        params = params.substr(1);
      }

      if( params.indexOf('index.html') >= 0 ) {
        return params;
      }
      
      params = params.split('/');

      return {
        name: params.shift(),
        state: params.shift() || 'index',
        params: params
      }
    },

    /**
     * Push a action event to the history.
     * @returns {boolean} True if the action was pushed to the history, false otherwise.
     */
    toHistory: function() {
      if($.support.pjax) {
        var view = Guido.View.currentView,
            entry = Guido.Request.formUrl(view.tplFile(), view.toParams());

        // only push to history if the module/state changed
        if( view.stateChanged() ) {
          history.pushState(view.serialize(), '', entry);
          Guido.Notification.debug('PUSH TO HISTORY: ' + entry);
        }

        return true;
      }
      return false;
    },

    /**
     * Fire a func request to the server.
     * The data argument can be neglected and the callback can be passed as the second argument instead.
     * @param {string} func the route (sub) on the server.
     * @param {object} data data for the request payload.
     * @param {function} callback success callback function.
     * @returns {jQuery promise} the jQuery XHR promise.
     */
    load: function(func, data, callback, error_callback) {
      var params;

      if(_.isFunction(data)) {
        params   = this.buildParams(func, {});
        callback = data;
      } else {
        params = this.buildParams(func, data);
      }

      return this.ajax(params, callback, error_callback);
    },

    /**
     * Use this method to submit create or update actions.
     * @param {string} func the route (sub) on the server.
     * @param {object} data the serialized form data.
     * @param {function} callback success callback function.
     * @param {function} error_callback error callback function.
     * @returns {jQuery promise} the jQuery XHR promise.
     */
    save: function(func, data, callback, error_callback) {
      return this.ajax(this.buildPostParams(func, data), callback, error_callback);
    },

    /**
     * Use this method for delete/destroy request.
     * @param {string} func the route (sub) on the server.
     * @param {array|number} ids a id or array of ids to be deleted.
     * @param {function} callback success callback function.
     * @returns {jQuery promise} the jQuery XHR promise.
     */
    destroy: function(func, ids, callback, error_callback) {
      var data   = _.isArray(ids) ? ids : [ ids],
          params = this.buildPostParams(func, data);

      return this.ajax(params, callback, error_callback);
    },

    /**
     * Request the js and template file from the server
     * @param  {String} module The name of the module to load.
     * @return {Deffered}      Holds the xhr objects. When resolved the module can be initialized.
     */
    module: function( module ) {
      var d = [], promise, jsXHR, tplXHR, url;
      module = Guido.View.modulize( module );

      if( !Guido[module] ) {
        url = MODULE_PATH + '/' + _.snakeCase(module) + '.js';
        jsXHR = this.ajax({
          url: url,
          dataType: 'script',
          cache: Guido.isProduction() === true,
        });
      }

      if ( !Guido.View.tplModulesLoaded[ module ] ) {
        // url = this.formUrl( 'tpl/' + _.snakeCase(module) + '.html' )
        url = TEMPLATE_PATH + '/' + _.snakeCase(module) + '.html';
        tplXHR = this.ajax({
          url: url,
          cache: Guido.isProduction()
        });
        tplXHR.then( function( data, status, xhr ) {
          Guido.View.compileTemplates( data );
          Guido.View.tplModulesLoaded[ module ] = true;
        });
      }

      promise = $.when( jsXHR, tplXHR );

      promise.fail( function() {
        Guido.Notification.error('module not present');
      });

      return promise;
    },

    /**
     * DEPRECATED!
     * Recommended short function to make request.
     * If you need to change ajax params (like type, content...),
     * use Guido.ajax method.
     */
    request: function(options, callback) {
      Guido.Notification.debug("DEPRECATION WARNING: Guido.Request.request function is deprecated. Use load, save or destroy functions instead.")
      return Guido.Request.load(options.func, options, callback);
    },

    /*
     Only recommended, when you need to change ajax params (like type, content...).
     Otherwise use request method.
     */
    ajax: function (options, callback, error_callback) {

      // return the ajax function to provide promise functionality ($.when) for jQuery
      return $.ajax(options).done(function(data, status, response) {
        Guido.Request.done(data, status, response, callback, error_callback);
      })
      .fail( function(response, error, message) {
        Guido.Notification.error(message);
      });
    },

    done: function(data, status, response, callback, error_callback) {
      var json = {},
          contentType = response.getResponseHeader('content-type');

      if(contentType === 'text/json') {
        try {
          json = JSON.parse(data);
          data = json;
        } catch(SyntaxError) {
          Guido.Notification.error(Guido.t('CAP_ERR_JSON_SYNTAX_ERROR', { data: data }));
          return;
        }
      } else if(contentType === 'application/javascript') {
        json = { success: true };
      } else {
        if( contentType !== 'text/html' ) {
          Guido.Notification.error(Guido.t('CAP_ERR_RESPONSE_NOT_JSON'));
        }
        if(_.isFunction(callback)) {
          return callback(data, status,response);
        }
      }

      if(json.success) {
        if ( _.isObject( json.notifications ) ) {
          Guido.Notification.renderAll(json.notifications);
        }

        if(_.isFunction(callback)) {
          return callback(json, status, response);
        }
      } else {
        Guido.Notification.renderAll(json.notifications);
        if ( _.isFunction( error_callback ) )
        {
          error_callback( json, status, response );
        }
      }
    },

    /**
     * Build the request params for the ajax call.
     * @param {string} func the route to be called.
     * @param {object} data the data object that is passed to the jQuery data parameter which results in
     * these jQuery ajax options: { data: { data: <passed-data> }
     * @returns {Object} the parameters for the ajax call.
     */
    buildParams: function(func, data) {
      var out = _.extend({}, defaults);
      out.url = BASE_PATH + func;
      out.data = JSON.stringify(Guido.Request.buildData(data));
      return out;
    },


    buildPostParams: function(func, data) {
      var params = this.buildParams(func, data);
      params.type = 'POST';
      return params;
    },

    /**
     * Build the jQuery data parameter from the passed data. The passed data can be data from a form, jTable, etc.
     * ATTENTION: This data object is located inside another data object, the jQuery data option.
     * That's why we have this function!
     * @param {object} data the passed data.
     * @returns {Object} return the jQuery data parameter.
     */
    buildData: function(data) {
      var out = _.extend({}, defaultData);

      if(!data || _.isFunction(data)) {
        out.data = {};
      } else {
        out.data = data;
      }

      out.session_id = Guido.Request.getSession();
      return out;
    },
  };

  _.assign(module, {
    defaults: defaults
  });

  return module;

})(jQuery, _);

// TODO: remove when refactored!
// for compatibility reasons assign request module to Guido root module
_.assign(Guido, Guido.Request);
