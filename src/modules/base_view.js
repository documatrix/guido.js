/**
 * Create a new view instance from the passed view module.
 * @param {string} module the name of the view module.
 * @param {Object} promise (optional argument) the promise returned from Guido.Request.module.
 *                         We know that the module js and partials are not loaded yet.
 * @constructor
 */
Guido.BaseView = function( module ) {

  this.promise = arguments[1];

  if( !this.promise && _.isUndefined(Guido[module])) {
    throw new Error("Module not present");
  }

  this.name = module;

  Guido.View.register( module, this );

  this.mixinActions();

  this.resolveModule();
  //this.defer = $.when( this.resolveModule() );
};

/**
 * BaseView holds the default view functionality for all modules (views).
 * A BaseView keeps track of:
 * <ul>
 *   <li>The state of the view and what should be displayed at this state</li>
 *   <li>The records and the table where the records are displayed in</li>
 *   <li>The state of the object, i.e. the selected record</li>
 * </ul>
 * A action is called on state change that renders the the new state's content.
 * ATTENTION: The new content data must be present before render is called!
 * Internally the render function does the following:
 * <ul>
 *   <li>change the state and optionally keep track of it in the history</li>
 *   <li>render the top navigation section</li>
 *   <li>render the notification section</li>
 *   <li>render the content section</li>
 *   <li>render the data table</li>
 * </ul>
 */
Guido.BaseView.prototype = (function ($, _) {

  module = {

    /**
     * The promise object for the module requests (js, html).
     * @type {Promise}
     */
    promise: null,

    /**
     * If true the module requests (js,html) have been resolved,
     * otherwise not.
     * @type {Boolean}
     */
    resolved: false,

    /**
     * Keep track of all function in Guido.BaseView.prototype
     * to prevent overwriting them.
     * @type {Array}
     */
    reserved: [],

    /**
     * The current state of the view.
     */
    state: 'INDEX',

    /**
     * Top nav actions corresponding to view state.
     */
    ACTIONS: {
      INDEX: [],
      SHOW: [],
      NEW: [],
      EDIT: [],
      CONFIRM_DESTROY: [],
      DESTROY: []
    },

    /**
     * The current object of the view
     */
    object: null,

    formObject: null,

    $form: null,

    selectOptions: {},

    filterOptions: {},

    idCol: 'ID',

    /**
     * Default object values
     */
    defaultObject: {},

    /**
     * Current records for the data table
     */
    records: {},

    /**
     * TableView instance
     */
    table: null,

    /**
     * Options for the TableView. Each state can have its own table options, e.g.:
     * {
     *   index: { ... },
     *   show:  { ... },
     *   ...
     * }
     */
    tableOptions: {
      index: {
        request: ''
      }
    },

    /**
     * defaults
     */
    defaults: {
      modal: {
        close: 'closeModal'//this.stateAction('closeModal')
      }
    },

    /**
     * Flag to decide if a state change is pushed to the history
     */
    toHistory: true,

    init: function() {

      if(Guido[this.name].withCart) {
        this.mixinModule('CartView');
        this.cart = new Guido.Cart();
      }

      this.mixinModule( this.name );

      this.setIdFromTableOptions();

      this.notifications = new Guido.Notification();

      this.deferredActions.resolve();
    },

    reserveBaseActions: function() {
      this.reserved = _( this ).map( function( value, key ) {
        if( _.isFunction( value ) ) {
          return key;
        }
      } ).compact().value();
    },

    resolveModule: function() {
      this.deferredActions = $.Deferred();

      if( this.isResolved() ) {
        this.init();
      } else {
        this.promise.then( _b( this, 'init' ) );
        this.promise.fail( _b( this, 'moduleError' ) );
      }
    },

    mixinActions: function() {

      _.reduce( Guido.Base.Actions, function( self, val, key ) {
        if( !_.includes( self.reserved, key ) ) {
          self[ key ] = _b( self, function() {
            return self.r( val, arguments );
          });
        }
        return self;
      }, this ); // last argument of _.reduce is not context but initial value!!!
    },

    r: function( f ) {

      // we want arguments without the action parameter
      args = _.drop( arguments )[0];
      // args = _.compact( args );
      args = ( args && args.length && args.length > 0 ) ? args : undefined;

      if( this.isResolved() ) {
        return args ? f.apply( this, args ) : f.apply( this );
        //_b( this, func, args );
      } else {
        return this.deferredActions.then( _b( this, f, args ) );
      }
    },

    moduleError: function() {
      Guido.Notification.error(Guido.t('CAP_NFE_VIEW_INSTANCIATE'));
    },

    /**
     * Mix in the module functions.
     * If the module overwrites a function of the BaseView,
     * keep the BaseView function by renaming it with a leading "_".
     * @param {string} module The view module to mix in.
     */
    mixinModule: function( module ) {

      // extend actions with module actions
      this.ACTIONS = _.extend({}, this.ACTIONS, Guido[module]['ACTIONS']);

      _.reduce(_.omit(Guido[module], 'ACTIONS', 'resolve'), function(self, val, key) {
        // keep overwritten functions with a leading dash.
        if(_.isFunction(self[key])) {
          self['_' + key] = self[key];
        }
        self[key] = val;
        return self;
      }, this); // last argument of _.reduce is not context but initial value!!!
    },

    isResolved: function() {

      if( this.resolved ) {
        return true;
      }

      if( _.isObject( this.promise ) && _.isFunction( this.promise.state ) ) {
        this.resolved = this.promise.state() === 'resolved';
      } else {
        this.resolved = true;
      }

      return this.resolved;
    }
  };

  module.reserveBaseActions();

  _.extend( module, Guido.Base.State );
  _.extend( module, Guido.Base.Record );
  _.extend( module, Guido.Base.Render );

  return module;
})(jQuery, _);
