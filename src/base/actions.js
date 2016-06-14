/* istanbul ignore if */
if( typeof Guido === 'undefined' ) {
  Guido = {}
}

/* istanbul ignore next */
if( typeof Guido.Base === 'undefined' ) {
  Guido.Base = {};
}

Guido.Base.Actions = {

  // DEFAULT STATE ACTIONS

  index: function() {
    this.changeState(Guido.View.STATE.INDEX);
    return this.render(this.records);
  },

  show: function( record ) {

    // this.changeState(Guido.View.STATE.SHOW);
    // return this.render(this.object);

    if( _.isObject( record ) ) {
      this.object = record;
      this.changeState( Guido.View.STATE.SHOW );
      this.render( this.object );
    } else {
      return this.getRecord(record, _b( this, this.show ) );
    }
  },

  'new': function() {
    this.changeState(Guido.View.STATE.NEW);
    this.object = _.cloneDeep(this.defaultObject);
    return this.openForm( this.object );
  },

  /**
   * Edit action: this.object is filled on history popstate or reload.
   * Otherwise it is better to call openForm directly and pass an id
   * @return {[type]} [description]
   */
  edit: function( record ) {

    if( _.isObject( record ) ) {
      this.object = record;
      this.changeState(Guido.View.STATE.EDIT);
      this.openForm( this.object );
    } else {
      return this.getRecord(record, _b( this, this.edit ) );
    }
  },

  load: function( action ) {
    var func, state, historyState;

    if( action )
    {
      state = action;
    }
    else if( !_.isEmpty( history.state ) )
    {
      state = history.state.state;
      this.applyHistoryState( history.state );
    }
    else if( state = Guido.Request.getURLParameter().state )
    {
      this.generateObjectFromUrl();
    }
    else
    {
      state = Guido.View.STATE.INDEX;
    }

    if( func = this.moduleFunc( state ) ) {
      this.withoutHistory( func );
    }
  },

  save: function( id, args, event ) {
    var self = this,
        state = '';

    // a button with data-action save was clicked
    if( event ) {
      this.$form = $(event.currentTarget).closest('form');
      this.formObject = this.serializeForm();
    }

    if(this.state === Guido.View.STATE.NEW) {
      state = Guido.View.STATE.CREATE;
    } else {
      state = Guido.View.STATE.UPDATE;
    }
    this.changeState(state, false);

    // TODO: always return the object from save requests!!
    return Guido.Request.save(this.stateFunc(),
                                this.formObject,
                                _b( this, "saveSuccessCallback" ),
                                _b( this, "saveErrorCallback" ));
  },

  /**
   * Display a success notification and call the index action.
   */
  saveSuccessCallback: function( json, status, xhr ) {
    this.setRecord( undefined, json, status, xhr );

    this.notifications.clear();

    this.notifications.addAll( json.notifications );
    if ( this.notifications.notifications.successes.length == 0 ) {
      this.notifications.success( Guido.t(this.stateMessage(), this.object ) );
    }

    if( this.isSaveOnly ) {
      this.edit( this.object );
    } else {
      this.closeForm();
    }
    this.isSaveOnly = false;
  },

  /**
   * Open a modal window and ask for confirmation.
   * @param id {
   */
  confirmDestroy: function(id) {
    this.changeState(Guido.View.STATE.CONFIRM_DESTROY, false);

    this.openModal('confirm_destroy', _.extend( this.getRecord( id ), {
      id: id,
      action: "@destroy"
    }) );
  },

  destroy: function(ids) {
    var self = this;

    this.changeState(Guido.View.STATE.DESTROY, false);

    return Guido.Request.destroy(this.stateFunc(), ids, _b( this, 'destroySuccessCallback' ) );
  },

  /**
   * Display a success notification, reload the table and close the modal.
   */
  destroySuccessCallback: function() {

    // we have to get object's context
    // because at callback time the context is probably window.
    //var self = Guido.View.currentView;

    this.notifications.clear();
    this.notifications.success(Guido.t(this.stateMessage()));
    this.notifications.render();
    this.changeState(Guido.View.STATE.INDEX, false);
    //this.reloadTable();

    this.changeState(Guido.View.STATE.INDEX, false);
    this.closeModal();
    this.index();
  },

  openForm: function( record ) {
    this.formObject = record;

    this.mergeSelectOptionsInto( this.formObject );

    this.render( this.formObject );

    Guido.View.$template(this.formTemplateName(), this.formObject).replaceAll('#form-wrapper');

    this.setupDateInputs( record );
  },

  closeForm: function() {
    this.formObject = undefined;
    this.object = undefined;
    this.index();
  },

  preview: function( id, args, event ) {
    var options = {};

    options[ this.getIdCol() ] = id;

    if ( args.rangeDisabled === "undefined" || !args.rangeDisabled ) {
      options.range = "1-10";
      options.view_type = "page";
    }

    if( !this.modal ) {
      this.openModal( _.snakeCase( this.name ) + '_preview', options );
    } else {
      this.$form = $(event.currentTarget).closest('form');
      options = this.serializeForm();
    }

    var url = Guido.Request.funcUrl( args.url || 'view_document', options );

    this.prepareModal( url );
  },

  prepareModal: function( url ) {
    var iFrameWidth = $(window).outerWidth() * 0.9;
    var iFrameHeight = $(window).outerHeight() * 0.8;
    //
    var $modalBody = this.modal.find('.modal-body');
    var $paddingSides = parseInt($modalBody.css('padding-left')) + parseInt($modalBody.css('padding-right'));

    //
    this.modal
    .find('iframe')
    // to hide the old preview iframe
    .attr('src', "")
    .attr('src', url)
    .attr('width', iFrameWidth)
    .attr('height', iFrameHeight);


    this.modal.find('.modal-dialog').css({
      width: iFrameWidth + $paddingSides
    });

    /** IE needs this */
    this.modal.modal('show');
  },

  openModal: function(modal, options) {
    if(this.modal) {
      this.modal.remove();
    }

    if(!modal.match(/^modal[_-]/)) {
      modal = 'modal_' + modal;
    }

    this.modal = Guido.View.$template(modal, this.modalOptions(options));
    this.modal.appendTo('body');
    this.modal.modal('toggle');
  },

  closeModal: function() {
    if( !this.modal ) { return; }

    var self = this;

    this.modal.modal('hide');
    this.modal.on( 'hidden.bs.modal', function() {
      self.modal.remove.bind(this);
      self.modal.remove();
      self.modal = null;
    });
    /*this.modal.on( 'hidden.bs.modal', function( e ) {
      $( e.currentTarget ).remove( );
    } );*/
  },

  modalOptions: function(optional) {
    return _.extend({}, this.defaults.modal, {
      title: Guido.t(this.stateTitleName(), optional ),
      message: Guido.t(this.stateMessage(), optional )
    }, optional);
  },


  setupDateInputs: function( record ) {
    $('input[data-type="date"]').each( function( idx, input ) {
      var $df, date;

      $df = $( input );
      date = record[ $df.attr( 'name' ) ];

      date = moment( date ).format( 'YYYY-MM-DD' );
      $df.val( date );

      $df.datepicker({
        dateFormat: 'yy-mm-dd',
        defaultDate: date
      });
    });
  },

  /**
   * User clicks on a save button without closing the form.
   */
  saveOnly: function( id, args, event ) {
    this.isSaveOnly = true;
    this.save( id, args, event );
  },

  /**
   * Reset the current state to EDIT or NEW
   * ATTENTION: Error notifications are rendered in Guido.Request#done already!
   */
  saveErrorCallback: function() {
    var formState;

    if(this.state === Guido.View.STATE.CREATE) {
      formState = Guido.View.STATE.NEW;
    } else {
      formState = Guido.View.STATE.EDIT;
    }
    this.changeState(formState, false);
    this.isSaveOnly = false;
  },

  /**
   * Call this method if the url i.e. in edit/show state does not return
   * a valid record.
   */
  malformedUrlFallback: function( msg ) {
    var url = Guido.Request.formUrl(this.tplFile(), this.toParams() );
    this.notifications.error( msg || Guido.t('CAP_ERR_MALFORMED_URL' ) );
    this.index();
    history.replaceState( this.serialize(), '', url );
  }
};
