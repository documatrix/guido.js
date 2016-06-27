var Guido = Guido || {};

/**
 * This Module compiles and renders Handlebars templates.
 */
Guido.View = (function ($, _) {


  var module = {

    /**
     * Default view states
     */
    STATE: {
      INDEX: 'index',
      SHOW: 'show',
      FORM: 'form',
      NEW: 'new',
      EDIT: 'edit',
      CREATE: 'create',
      UPDATE: 'update',
      CONFIRM_DESTROY: 'confirm_destroy',
      DESTROY: 'destroy',
    },

    ICON: {
      EDIT: 'glyphicon glyphicon-pencil',
      Monitor: 'fa fa-eye-open',
      Spooler: ''
    },

    DEFAULT_MODULE: 'INDEX',

    /**
     * Initialized views
     * TODO: not used yet
     */
    views: {},

    /**
     * Contains all already compiled (loaded) module html templates.
     */
    tplModulesLoaded: {},

    /**
     * The current view
     */
    currentView: null,

    /**
     * This hash holds key/value pairs of Handlebar template ids and compiled Handlebars templates.
     */
    templates: {},

    instance: function(module) {
      var module   = this.modulize(module),
          nextView = this.get(module),
          promise  = undefined;

      if( this.currentView ) {
        this.currentView.saveLastState();
      }

      // module already loaded from server and registered
      if( nextView ) {
        this.currentView = nextView;
        return this.currentView;
      }

      // TODO: add some fancy loading spinner until initialization is done.

      // ATTENTION: this request is syncron.
      promise = Guido.Request.module(module);

      promise.fail( function() {
        Guido.Notification.error(Guido.t('CAP_NFE_VIEW_INSTANCIATE'));
        if( Guido.lastState ) {
          Guido.View.currentView = Guido.View.get( Guido.lastState.name );
        } else {
          Guido.View.currentView = Guido.View.instance( Guido.View.DEFAULT_MODULE );
        }
      });

      Guido.View.currentView = new Guido.BaseView( module, promise );

      return Guido.View.currentView;
    },

    instanceFromUrl: function() {
      module = Guido.View.getModuleFromURL( window.location.href );
      if( module ) {
        return Guido.View.instance( module );
      } else {
        return Guido.View.instance( Guido.config.defaults.module );
      }
    },

    modulize: function(module) {
      // @lodash4
      return _.upperFirst(_.camelCase(module));
    },

    get: function(module) {
      return this.views[this.modulize(module)];
    },

    /**
     * Registers a view to the views object
     * TODO: register views: new Guido.Token()
     * then fetch the view and do something with it
     * makes only sense if we instanciate views!
     * @param {object) view the view instance
     */
    register: function(module, view) {
      this.views[this.modulize(module)] = view;
    },

    /**
     * Initialize this module:
     * <ul>
     *   <li>Initialize Handlebars helper</li>
     *   <li>Compile components templates</li>
     *   <li>Compile content template(s)</li>
     * </ul>
     */
    init: function() {
      // handlebars (mustache) interpolation for _.template
      _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

      Guido.View.initHandlebarsHelper();

      // compile components
      Guido.View.compileTemplates(Guido.components);

      // compile all x-handlebars-templates from the template content
      Guido.View.compileTemplates(Guido.templateContent);

      // compile all templates that are present in the (index.)html file
      Guido.View.compile($('script[type="text/x-handlebars-template"]'));
    },

    /**
     * Register all Handlebars helper defined at Guido.View.handlebarsHelper.
     */
    initHandlebarsHelper: function() {
      _.each(Guido.View.handlebarsHelper, function(func, key) {
        Handlebars.registerHelper(key, func);
      });
    },

    /**
     * Compile the passed Handlebars templates and register them as Handlebars partials.
     * @param {jQuery} $templates A jQuery object of script[type="text/x-handlebars-template"] elements
     * @returns {void}
     */
    compile: function($templates) {
      if(!($templates instanceof $) || $templates.length == 0) { return; }

      var templatesArray = $templates;

      if($templates.length == 1) {
        templatesArray = [ $templates ];
      }

      _.each(templatesArray, function(template) {
        var $template = $(template),
            key = Guido.View.formatKey($template.attr('id'));

        // allow overriding of templates ( without if condition )
        //if( !_.has(Handlebars.partials, key) || !_.has(this.templates, key)) {
          Handlebars.registerPartial(key, $template.html());
          Guido.View.templates[key] = Handlebars.compile($template.html());
        //}
      });
    },

    /**
     * Compile raw strings to Handlebars callable templates and store them
     * to the Guido.View.templates hash.
     * The key is the templates id parameter without the optional leading 'tpl-'.
     * The value is the compiled Handlebars template.
     * @param {string} raw a string of the Handlebars templates to compile
     */
    compileTemplates: function(raw) {
      var div = $( "<div></div>" );
      var $templates = div.append(raw).find('script[type="text/x-handlebars-template"]');
      Guido.View.compile($templates);
    },

    /**
     * If existing, remove the leading 'tpl-' from the passed key.
     * @param {string} key
     * @returns {string} The key witout the leading 'tpl-'
     */
    formatKey: function(key) {
      return key.replace(/^tpl[-_]/, '');
    },

    replaceTemplate: function( id, key, data )
    {
      var tpl = this.template( key, data );
      if ( tpl )
      {
        $( id ).replaceWith( tpl );
      }
      else
      {
        $( id ).html( this.templateNotFound( key ) );
      }
    },

    /**
     * Call the template refering to key with the passed data.
     * @param {string} key The key (id) of the template without any 'tpl-' in front
     * @param {string} data The interpolation data for the template
     * @returns {string} The rendered template or undefined if the template could not be found.
     */
    template: function(key, data) {
      var tpl = Guido.View.templates[key];
      return _.isFunction(tpl) ?  tpl(data) : undefined;
    },

    /**
     * Render a template and return it as a jQuery object.
     * @param {string} key the id of the template
     * @param {object} dynamic view content.
     * @returns {jQuery} A jQuery object of the rendered view or templateNotFound if the
     * template is not present.
     */
    $template: function(key, data) {
      var tpl = Guido.View.templates[key];
      return _.isFunction(tpl) ?  $(tpl(data)) : Guido.View.templateNotFound(key);
    },

    /**
     * Display a empty panel with the template key to show that the template is not present
     * @param {string} key the unique identifier of the template
     * @returns {HTMLElement} A div with the info that the template could not be found
     */
    templateNotFound: function(key) {
      return $('<div class="panel panel-default text-danger">TEMPLATE NOT FOUND: ' + key + '</div>');
    },

    /**
     * Render the top navigation
     * TODO: this would be nice to mix into the actual module. Makes function easier.
     *
     * @param {object} view the view module
     * @param {object} interpolation dynamic values for the title
     */
//    renderTopNav: function(view, interpolation) {
//      var title = 'CAP_TITLE_' + view.name.toUpperCase() + '_' + view.state.toUpperCase();
//
//      //var actions = Guido.View.ACTIONS[view.state];
//      var actions = view.ACTIONS[view.state];
//      if(view.ACTIONS !== undefined && view.ACTIONS[view.state] !== undefined) {
//        actions = view.ACTIONS[view.state];
//      }
//
//      var data = {
//        title: Guido.t(title, interpolation),
//        actions: actions,
//      };
//
//      Guido.View.$template('top_nav', data).replaceAll('#top-nav');
//    },

    /**
     * Extract the module from the form url parameter of window.location.search.
     * @returns {string} the modulized module name or the default module if it cannot be found in the url.
     */
    getModuleFromURL: function( url ) {
      return Guido.routes.module( url );
   },

    handlebarsHelper: {
      /**
       * Translation helper that uses Guido.translate (shorthand Guido.t).
       * @param {string} caption the translation key, i.e. the caption name in the db.
       * @returns {string} the translated text.
       */
      t: function (caption, interpolation) {
        return Guido.t(caption, interpolation.hash);
      },

      ago: function( caption, date ) {
        t = moment( date );
        t.locale( Guido.lang.toLowerCase() );

        if( _.isNaN( t.date() ) ) {
          return Guido.t( caption + '_INV' );
        }

        return Guido.t( caption, {
          duration: t.fromNow(),
          time: t.format('DD.MM.YYYY HH:MM')
        });
      },

      /**
       * Handlebars debug functionality. You can write {{> debug }} in the template and it
       * logs the value of this to the console.
       * @param {string} optionalValue the key of this
       */
      debug: function (optionalValue) {
        console.log("Current Context");
        console.log("====================");
        console.log(this);

        if (optionalValue) {
          console.log("Value");
          console.log("====================");
          console.log(optionalValue);
        }
      },
      htmlSafe: function(text) {
        return new Handlebars.SafeString(text);
      },
      /**
       * Compares the passed values.
       *
       * @param { string } first compare value
       * @param { string } operator
       * @param { string } second compare value
       */
      is: function (v1, operator, v2) {
        var options = _.last( arguments );
        switch (operator) {
          case '==':
              return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
              return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '<':
              return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
              return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
              return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
              return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
              return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
              return (v1 || v2) ? options.fn(this) : options.inverse(this);
          case 'empty':
              return _.isEmpty(v1)  ? options.fn(this) : options.inverse(this);
          case '!empty':
              return _.isEmpty(v1)  ? options.inverse(this) : options.fn(this);
          case 'number':
              return _.isNaN(parseInt(v1)) ? options.inverse(this) : options.fn(this);
          default:
              return options.inverse(this);
        }
      },
      /**
       * Sidebar navigation sub menu
       * @param {object} info data of the sub menu
       * @returns {object} the generated sub menu
       */
      accordionSubMenu: function (info) {
        return Guido.View.template('accordionSubMenu', info);
      }
    }
  };

  return module;

})(jQuery, _);
