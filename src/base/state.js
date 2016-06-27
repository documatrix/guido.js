/* istanbul ignore if */
if( typeof Guido === 'undefined' ) {
  Guido = {};
}

/* istanbul ignore if */
if( typeof Guido.Base === 'undefined' ) {
  Guido.Base = {};
}

Guido.Base.State = {

  changeState: function (state, toHistory) {
    this.state = state;

    /* istanbul ignore else  */
    if(toHistory === false || !this.toHistory) {
      // if toHistory is explicitly set to false (may be undefined)
      return;
    } else if(toHistory === true || this.toHistory) {
      // if toHistory is set to true or if toHistory is not set (undefined)
      // check if this.toHistory is true
      Guido.Request.toHistory(this.state);
    }
  },

  applyHistoryState: function(state) {
    if(this.name !== state.name) { return; }

    _.extend(this, state);

    /* istanbul ignore else  */
    if(this.table && state.tableParams) {
      this.table.setParams(state.tableParams);
    }
  },

  saveLastState: function() {
    Guido.lastState = {
      name: this.name,
      state: this.state,
      id: this.getId( this.record )
    };
    //Guido.Notification.debug('LAST STATE: ' + Guido.lastState.name + "#" + Guido.lastState.state);
    return this;
  },

  stateChanged: function() {
    var last = Guido.lastState;

    if ( !last ) { return true ; }

    decision = !( this.state === last.state &&
                  this.name === last.name &&
                  this.getId( this.record ) === last.id );
    return decision;
  },

  /**
   * Call a function without pushing a state to history
   * ATTENTION: if an async request is fired during the function call, ALWAYS return
   * the request object (xhr) otherwise the toHistory is changed back BEFORE the request
   * is finished.
   * @param  {Function} func The function to be called.
   * @return {void}     nothing
   */
  withoutHistory: function(func) {
    this.toHistory = false;

//      var result = this[func](_.drop(arguments));
    var result = this[func].apply(this, _.drop(arguments));

    // handle async func calls
    if(_.isObject(result) && _.isFunction(result.done)) {
      var self = this;
      result.done(function() {
        self.toHistory = true;
      });
    } else {
      this.toHistory = true;
    }

    return result;
  },

  /**
   * Return the default view template name.
   */
  defaultStateTemplateName: function() {
    return ( Guido.config.defaults.fallback + this.state ).toLowerCase();
  },

  /**
   * Return the module's state template name.
   */
  stateTemplateName: function() {
    return _.snakeCase(this.name + '_' + this.state);
  },

  defaultStateComponentName: function( component ) {
    return 'cmp-' + this.defaultStateTemplateName() + '_' + component;
  },

  defaultComponentName: function( component ) {
    return 'cmp-' + ( Guido.config.defaults.fallback + '_' + component ).toLowerCase();
  },

  stateComponentName: function( component ) {
    return 'cmp-' + this.stateTemplateName() + '_' + component;
  },

  formTemplateName: function() {
    return _.snakeCase(this.name + '_form');
  },

  stateTitleName: function() {
    var title = 'CAP_TITLE_' + this.name + '_' + this.state;
    return title.toUpperCase();
  },

  defaultViewComponentName: function( component ) {
    return 'cmp-' + _.snakeCase(this.name) + '_' + component;
  },

  stateMessage: function() {
    var message = 'CAP_MSG_' + this.name + '_' + this.state;
    return message.toUpperCase();
  },

  stateBlankSlate: function() {
    var message = 'CAP_BS_' + this.name + '_' + this.state;
    return message.toUpperCase();
  },

  stateAction: function(action){
    return 'Guido.' + Guido.View.modulize(this.name) + '.' + action;
  },

  stateActions: function() {
    return this.ACTIONS[ this.state ] || [];
  },

  /**
   * Generate request parameter func.
   * @returns {string} the value for request parameter func
   */
  stateFunc: function( state ) {
    var action = state || this.state;
    if( _.isObject( this.routes ) ) {
      action = this.routes[ action ];
    }

    var func = _.snakeCase(this.name) + '/' + action;
    return func.toLowerCase();
  },

  stateTableOptions: function() {
    return this.tableOptions[this.state.toLowerCase()] || undefined;
  },

  stateTableRequest: function() {
    var options = this.stateTableOptions();
    if(_.isObject(options) && options.request) {
      return options.request;
    }
  },

  stateTableFields: function() {
    var options = this.stateTableOptions();

    /* istanbul ignore else  */
    if(_.isObject(options) && options.fields) {
      return options.fields;
    }
    return {};
  },

  moduleFunc: function(state) {
    var func = _.camelCase((state || '').toLowerCase());
    return _.isFunction(this[func]) ? func : undefined;
  },

  tplFile: function() {
    return 'tpl/' + _.snakeCase(this.name) + '.html';
  },
};
