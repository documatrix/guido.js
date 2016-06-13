/* istanbul ignore if */
if( typeof Guido === 'undefined' ) {
  Guido = {};
}

/* istanbul ignore if */
if( typeof Guido.Base === 'undefined' ) {
  Guido.Base = {};
}

Guido.Base.Record = {

  getRecords: function(options) {
    var self = this,
        options = options || {},
        url = this.stateTableRequest();

    if(!url) {
      this.records = {};
      return {};
    }

    /* istanbul ignore next */ // check callback in integration test
    return Guido.Request.load(url, options, function(json) {
      self.setRecords(json);
    });
  },

  setRecords: function(json) {
    this.records = _.isArray(json.Records) ? json.Records : this.records;
    this.selectOptions = _.isObject(json.selectOptions) ? json.selectOptions : this.selectOptions;
    this.filterOptions = _.isObject(json.filterOptions) ? json.filterOptions : this.filterOptions;
    return this.records;
  },

  loadRecords: function (postData, jtParams) {
    return this.getRecords(this.serializeTableOptions(jtParams));
  },

  getRecord: function( id, callback ) {
    if( _.isFunction( callback ) ) {
      return this.getRecordRemote( id, callback );
    } else {
      return this.getRecordFrom( this.records, id );
    }
  },

  setRecord: function( callback, json, status, xhr ) {
    if( _.isObject( json ) && _.isObject( json.record ) ) {
      this.object = json.record;
      this.object.selectOptions = json.selectOptions;
    }
    if( _.isArray( callback ) ) {
      callback = callback[ 0 ];
    }
    if( _.isFunction( callback ) ) {
      callback( this.object, status, xhr );
    }
  },

  getRecordRemote: function( id, callback ) {
    var options = {}, url;

    id = id || Guido.Request.getURLParameter( this.idCol );

    if( !id ) {
      return this.malformedUrlFallback( Guido.t( 'CAP_ERR_MALFORMED_URL', { url: window.location.href } ) );
    }

    options[ this.idCol ] = id;

    url = _.snakeCase(this.name) + '_get';

    return Guido.Request.load( url,
      options,
      _b( this, this.setRecord, callback ),
      _b( this, this.getRecordErrorCallback, id )
    );
  },

  getRecordErrorCallback: function( id ) {
    var capEntry, entry, msg;

    capEntry = 'CAP_NFE_' + this.name.toUpperCase();
    entry = Guido.t( capEntry, { id: id } );
    msg = Guido.t( 'CAP_ERR_RECORD_NOT_FOUND', { what: entry } );

    this.notifications.error( msg );
    this.index();
  },

  getRecordFrom: function( collection, id ) {
    var query = {};
    query[ this.getIdCol() ] = (id || '').toString();
    return _.find( collection, query );
  },

  mergeSelectOptionsInto: function( obj ) {
    console.log( "base merge " + this + " " + obj );

    obj.selectOptions = obj.selectOptions || {};
    var options = _.extend( {}, this.selectOptions, obj.selectOptions );
    _.reduce(options, function(result, values, key) {
      // normalize keys to strings
      console.log( "reduce " + result + " " + values + " " + key );
      _.each( values, function( e ) {
        if( !_.isNumber( e.key ) && !_.isString( e.key ) ) {
          e.key = '';
        }
        e.key = e.key.toString();
      } );
      result[key] = {
        key: key,
        values: values,
        selected: ( !_.isNumber( obj[key] ) && !_.isString( obj[key] ) ) ? '' : obj[key].toString()
      };
      return result;
    }, obj.selectOptions);

    return obj;
  },

  serializeForm: function() {
    this.$form = this.$form || $('#form');
    return this.$form.serializeObject();
    //var data = $('#form').serializeObject();
    //_.extend(this.formObject, data);
    //return this.formObject;
  },

  serializeTableOptions: function(jtParams) {
    jtParams = _.isObject(jtParams) ? jtParams : {};
    this.filterOptions = jtParams.jtFilters || {};

    var options = {
      sorting: jtParams.jtSorting || '',
      startIndex: jtParams.jtStartIndex || 0,
      page_size: jtParams.jtPageSize || 100,
      filters: jtParams.jtFilters || '',
      elem_id: '#data-table'
    };
    return options;
  },

  serialize: function() {
    var fo = this.serializeForm();
    return {
      name: this.name,
      state: this.state,
      //object: _.isEmpty( fo ) ? this.object : fo,
      object: this.object,
      formObject: this.formObject,
      records: this.records,
      cart: this.cart ? this.cart.items : {},
      selectOptions: this.selectOptions,
      filterOptions: this.filterOptions
      // table options commented, as sometimes a jQuery object is returned
      // which cannot be serialized.
      // TODO: make this work
//        tableParams: this.getTableParams()
      // TODO: keep track of notification messages?
    };
  },

  getIdCol: function() {
    //return this.idCol || this.setIdFromTableOptions();
    return _.findKey(this.stateTableFields(), { 'key': true });
  },

  getId: function( object ) {
    if( object = object || this.object ) {
      return object[this.idCol];
    }
  },

  /**
   * set the idCol from the index table fields
   */
  setIdFromTableOptions: function() {
    var fields = _.get(this, 'tableOptions.index.fields', {});
    this.idCol = _.findKey(fields, { 'key': true }) || 'id';
    return this.idCol;
  },

  isRecordSelected: function( id ) {
    return this.getRecordFrom( this.table.getSelectedRecords(), id ) ? true : false;
  },

  generateObjectFromUrl: function() {
    var params = _.omit(Guido.Request.getURLParameter(), 'form', 'func', 'session_id', 'state');
    this.object = _.extend({}, this.defaultObject, params);
  },

  /**
   * Abstract -> has to be overwritten in each module!
   * Return all information required to generate a state url.
   * @returns {Object} instance information to generate a state url
   */
  toParams: function() {
    var params = {};
    params[ 'state' ] = this.state;

    if( this.object &&
        ( this.state === Guido.View.STATE.SHOW ||
          this.state === Guido.View.STATE.EDIT ||
          this.state === Guido.View.STATE.FORM ) ) {
      params[ this.idCol ] = this.getId( this.object );
    }
    return params;
  },

  withoutEmpty: function(params) {
    return _.reduce(params, function(params, val, key) {
      if(val && (_.isNumber(val) || !_.isEmpty(val))) {
        params[key] = val;
      }
      return params;
    }, {});
  }
};
